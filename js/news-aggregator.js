// News Aggregator - Multi-source RSS news for Middle East & World
(function () {
  'use strict';

  const PROXY = 'https://api.allorigins.win/raw?url=';
  const TIMEOUT = 5000; // 5s max per feed - fail fast
  const REFRESH_MS = 10 * 60 * 1000; // 10 min

  // Feed sources with categories
  const FEEDS = [
    { url: 'https://www.jpost.com/rss/rssfeedsjerusalem.aspx', source: 'Jerusalem Post', category: 'israel' },
    { url: 'https://www.jpost.com/rss/rssfeedsheadlines.aspx', source: 'Jerusalem Post', category: 'israel' },
    { url: 'https://www.timesofisrael.com/feed/', source: 'Times of Israel', category: 'israel' },
    { url: 'https://feeds.bbci.co.uk/news/world/middle_east/rss.xml', source: 'BBC', category: 'mideast' },
    { url: 'https://feeds.bbci.co.uk/news/world/rss.xml', source: 'BBC', category: 'world' },
    { url: 'https://rss.nytimes.com/services/xml/rss/nyt/MiddleEast.xml', source: 'NY Times', category: 'mideast' },
    { url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml', source: 'NY Times', category: 'world' },
    { url: 'https://www.aljazeera.com/xml/rss/all.xml', source: 'Al Jazeera', category: 'mideast' },
  ];

  let allArticles = [];
  let activeCategory = 'all';

  // Fetch a single feed - fast, no retries
  async function fetchFeed(feed) {
    try {
      const resp = await fetch(PROXY + encodeURIComponent(feed.url), {
        signal: AbortSignal.timeout(TIMEOUT)
      });
      if (!resp.ok) return [];
      const text = await resp.text();
      const xml = new DOMParser().parseFromString(text, 'text/xml');
      if (xml.querySelector('parsererror')) return [];

      const items = [];
      xml.querySelectorAll('item').forEach(item => {
        const title = item.querySelector('title')?.textContent?.trim();
        const link = item.querySelector('link')?.textContent?.trim();
        if (!title || !link) return;

        const desc = (item.querySelector('description')?.textContent || '').replace(/<[^>]*>/g, '').trim();
        const pubDate = item.querySelector('pubDate')?.textContent?.trim();

        // Try to extract image
        let img = '';
        const mediaContent = item.querySelector('content');
        if (mediaContent) img = mediaContent.getAttribute('url') || '';
        if (!img) {
          const thumb = item.querySelector('thumbnail');
          if (thumb) img = thumb.getAttribute('url') || '';
        }
        if (!img) {
          const enc = item.querySelector('enclosure');
          if (enc && (enc.getAttribute('type') || '').startsWith('image'))
            img = enc.getAttribute('url') || '';
        }
        if (!img) {
          const imgMatch = (item.querySelector('description')?.textContent || '').match(/<img[^>]+src="([^"]+)"/);
          if (imgMatch) img = imgMatch[1];
        }

        items.push({
          title,
          link,
          desc: desc.substring(0, 180),
          pubDate: pubDate ? new Date(pubDate) : new Date(),
          img,
          source: feed.source,
          category: feed.category
        });
      });
      return items;
    } catch (e) {
      return []; // Silently fail - other feeds will fill in
    }
  }

  function timeAgo(date) {
    const secs = Math.floor((Date.now() - date.getTime()) / 1000);
    if (secs < 60) return 'Just now';
    if (secs < 3600) return Math.floor(secs / 60) + 'm ago';
    if (secs < 86400) return Math.floor(secs / 3600) + 'h ago';
    return Math.floor(secs / 86400) + 'd ago';
  }

  function dedup(items) {
    const seen = new Set();
    return items.filter(a => {
      const key = a.title.toLowerCase().substring(0, 60);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  // Render the featured hero story
  function renderFeatured(article) {
    const el = document.getElementById('news-featured');
    if (!el) return;
    el.style.cursor = 'pointer';
    el.onclick = () => window.open(article.link, '_blank', 'noopener');

    const imgEl = document.getElementById('news-featured-img');
    const titleEl = document.getElementById('news-featured-title');
    const descEl = document.getElementById('news-featured-desc');
    const timeEl = document.getElementById('news-featured-time');
    const srcEl = document.getElementById('news-featured-source');

    if (titleEl) titleEl.textContent = article.title;
    if (descEl) descEl.textContent = article.desc || 'Click to read full article...';
    if (timeEl) timeEl.textContent = timeAgo(article.pubDate);
    if (srcEl) srcEl.textContent = article.source;
    if (imgEl) {
      if (article.img) {
        imgEl.src = article.img;
        imgEl.onerror = () => { imgEl.src = 'img/Jerusalem_Old_City_market.jpg'; };
      } else {
        imgEl.src = 'img/Jerusalem_Old_City_market.jpg';
      }
      imgEl.alt = article.title;
    }
  }

  // Render top stories sidebar
  function renderTopStories(articles) {
    const list = document.getElementById('news-top-list');
    if (!list) return;
    list.innerHTML = articles.map(a =>
      `<a href="${a.link}" target="_blank" rel="noopener" class="news-top-item">
        <span class="news-top-title">${a.title}</span>
        <span class="news-top-meta"><span class="news-src">${a.source}</span> &middot; ${timeAgo(a.pubDate)}</span>
      </a>`
    ).join('');
  }

  // Render category columns
  function renderColumns(articles) {
    const cats = { mideast: [], israel: [], world: [] };
    articles.forEach(a => {
      if (cats[a.category]) cats[a.category].push(a);
    });

    Object.keys(cats).forEach(cat => {
      const ul = document.getElementById('news-col-' + cat);
      if (!ul) return;
      const items = cats[cat].slice(0, 8);
      if (items.length === 0) {
        ul.innerHTML = '<li class="news-col-empty">No stories available</li>';
        return;
      }
      ul.innerHTML = items.map(a =>
        `<li><a href="${a.link}" target="_blank" rel="noopener">
          <span class="col-title">${a.title}</span>
          <span class="col-meta"><span class="news-src">${a.source}</span> &middot; ${timeAgo(a.pubDate)}</span>
        </a></li>`
      ).join('');
    });
  }

  // Filter and render based on active category tab
  function renderAll() {
    let filtered = activeCategory === 'all'
      ? allArticles
      : allArticles.filter(a => a.category === activeCategory);

    // Sort by date
    filtered.sort((a, b) => b.pubDate - a.pubDate);

    if (filtered.length === 0) return;

    // Featured = first article
    renderFeatured(filtered[0]);

    // Top stories = next 6
    renderTopStories(filtered.slice(1, 7));

    // Columns use ALL articles (not filtered) to fill each category
    renderColumns(allArticles);

    // Update time
    const timeEl = document.getElementById('news-update-time');
    if (timeEl) {
      const now = new Date();
      timeEl.textContent = 'Updated ' + now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    }

    // Show/hide columns based on tab
    document.querySelectorAll('.news-column').forEach(col => {
      if (activeCategory === 'all') {
        col.style.display = '';
      } else {
        col.style.display = col.dataset.col === activeCategory ? '' : 'none';
      }
    });
  }

  // Main fetch - all feeds in parallel for speed
  async function fetchAllNews() {
    const results = await Promise.allSettled(FEEDS.map(fetchFeed));
    let items = [];
    results.forEach(r => {
      if (r.status === 'fulfilled') items.push(...r.value);
    });

    items.sort((a, b) => b.pubDate - a.pubDate);
    allArticles = dedup(items);
    renderAll();
  }

  // Progressive loading: fetch fastest feeds first, render as they arrive
  async function fetchProgressive() {
    // Group 1: Fast feeds (BBC, JPost) - usually respond in <1s
    const fast = FEEDS.filter(f => f.source === 'BBC' || f.source === 'Jerusalem Post');
    const slow = FEEDS.filter(f => f.source !== 'BBC' && f.source !== 'Jerusalem Post');

    // Fire all at once but render fast feeds as soon as they're ready
    const fastPromise = Promise.allSettled(fast.map(fetchFeed));
    const slowPromise = Promise.allSettled(slow.map(fetchFeed));

    // Render fast feeds ASAP
    const fastResults = await fastPromise;
    let items = [];
    fastResults.forEach(r => {
      if (r.status === 'fulfilled') items.push(...r.value);
    });
    items.sort((a, b) => b.pubDate - a.pubDate);
    allArticles = dedup(items);
    if (allArticles.length > 0) renderAll();

    // Then merge in slow feeds
    const slowResults = await slowPromise;
    slowResults.forEach(r => {
      if (r.status === 'fulfilled') items.push(...r.value);
    });
    items.sort((a, b) => b.pubDate - a.pubDate);
    allArticles = dedup(items);
    renderAll();
  }

  // Tab switching
  document.querySelectorAll('.news-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.news-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeCategory = tab.dataset.category;
      renderAll();
    });
  });

  // Init
  fetchProgressive();
  setInterval(fetchAllNews, REFRESH_MS);
})();
