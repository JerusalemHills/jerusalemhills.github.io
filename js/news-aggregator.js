// News Aggregator - Multi-source RSS news with breaking bar, hero, categories
(function () {
  'use strict';

  const PROXY = 'https://api.allorigins.win/raw?url=';
  const PROXY_BACKUP = 'https://corsproxy.io/?';
  const TIMEOUT = 4000;
  const REFRESH_MS = 10 * 60 * 1000;
  const BREAKING_INTERVAL = 8000;

  // 16 feeds across 4 categories
  const FEEDS = [
    // Israel (4)
    { url: 'https://www.jpost.com/rss/rssfeedsjerusalem.aspx', source: 'Jerusalem Post', category: 'israel', tier: 1 },
    { url: 'https://www.jpost.com/rss/rssfeedsheadlines.aspx', source: 'Jerusalem Post', category: 'israel', tier: 1 },
    { url: 'https://www.timesofisrael.com/feed/', source: 'Times of Israel', category: 'israel', tier: 1 },
    { url: 'https://www.haaretz.com/cmlink/1.4482031', source: 'Haaretz', category: 'israel', tier: 3 },
    // Middle East (4)
    { url: 'https://feeds.bbci.co.uk/news/world/middle_east/rss.xml', source: 'BBC', category: 'mideast', tier: 1 },
    { url: 'https://rss.nytimes.com/services/xml/rss/nyt/MiddleEast.xml', source: 'NY Times', category: 'mideast', tier: 2 },
    { url: 'https://www.aljazeera.com/xml/rss/all.xml', source: 'Al Jazeera', category: 'mideast', tier: 2 },
    { url: 'https://www.france24.com/en/middle-east/rss', source: 'France 24', category: 'mideast', tier: 3 },
    // World (6)
    { url: 'https://feeds.bbci.co.uk/news/world/rss.xml', source: 'BBC', category: 'world', tier: 1 },
    { url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml', source: 'NY Times', category: 'world', tier: 2 },
    { url: 'https://feeds.reuters.com/Reuters/worldNews', source: 'Reuters', category: 'world', tier: 2 },
    { url: 'https://www.theguardian.com/world/rss', source: 'Guardian', category: 'world', tier: 3 },
    { url: 'http://rss.cnn.com/rss/edition_world.rss', source: 'CNN', category: 'world', tier: 3 },
    { url: 'https://rss.dw.com/xml/rss-en-world', source: 'DW News', category: 'world', tier: 3 },
    // Business (2)
    { url: 'https://feeds.reuters.com/reuters/businessNews', source: 'Reuters', category: 'business', tier: 2 },
    { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Business.xml', source: 'NY Times', category: 'business', tier: 3 },
  ];

  let allArticles = [];
  let activeCategory = 'all';
  let breakingItems = [];
  let breakingIndex = 0;
  let breakingTimer = null;

  // Fetch a single feed
  async function fetchFeed(feed, useBackup) {
    try {
      const proxy = useBackup ? PROXY_BACKUP : PROXY;
      const resp = await fetch(proxy + encodeURIComponent(feed.url), {
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
          desc: desc.substring(0, 200),
          pubDate: pubDate ? new Date(pubDate) : new Date(),
          img,
          source: feed.source,
          category: feed.category
        });
      });
      return items;
    } catch (e) {
      return [];
    }
  }

  // Fetch with fallback proxy
  async function fetchFeedWithFallback(feed) {
    const items = await fetchFeed(feed, false);
    if (items.length > 0) return items;
    return fetchFeed(feed, true);
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

  function escHtml(str) {
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  // --- Breaking News Bar ---
  function renderBreakingBar() {
    const textEl = document.getElementById('breaking-text');
    const counterEl = document.getElementById('breaking-counter');
    if (!textEl || breakingItems.length === 0) return;

    const item = breakingItems[breakingIndex];
    textEl.innerHTML = `<a href="${escHtml(item.link)}" target="_blank" rel="noopener">${escHtml(item.title)}</a>`;
    if (counterEl) counterEl.textContent = (breakingIndex + 1) + '/' + breakingItems.length;
  }

  function rotateBreaking(dir) {
    if (breakingItems.length === 0) return;
    breakingIndex = (breakingIndex + dir + breakingItems.length) % breakingItems.length;
    renderBreakingBar();
  }

  function startBreakingRotation() {
    if (breakingTimer) clearInterval(breakingTimer);
    breakingTimer = setInterval(() => rotateBreaking(1), BREAKING_INTERVAL);
  }

  function initBreakingBar() {
    const prevBtn = document.getElementById('breaking-prev');
    const nextBtn = document.getElementById('breaking-next');
    const bar = document.getElementById('breaking-bar');

    prevBtn?.addEventListener('click', () => { rotateBreaking(-1); startBreakingRotation(); });
    nextBtn?.addEventListener('click', () => { rotateBreaking(1); startBreakingRotation(); });

    bar?.addEventListener('mouseenter', () => { if (breakingTimer) clearInterval(breakingTimer); });
    bar?.addEventListener('mouseleave', startBreakingRotation);
  }

  // --- Hero: Lead story (60% left) ---
  function renderLead(article) {
    const el = document.getElementById('news-lead');
    if (!el) return;
    el.style.cursor = 'pointer';
    el.onclick = () => window.open(article.link, '_blank', 'noopener');

    const imgEl = document.getElementById('news-lead-img');
    const titleEl = document.getElementById('news-lead-title');
    const descEl = document.getElementById('news-lead-desc');
    const timeEl = document.getElementById('news-lead-time');
    const srcEl = document.getElementById('news-lead-source');

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

  // --- Sidebar: 7 dense headlines (40% right) ---
  function renderSidebar(articles) {
    const list = document.getElementById('news-sidebar-list');
    if (!list) return;
    list.innerHTML = articles.map(a =>
      `<a href="${escHtml(a.link)}" target="_blank" rel="noopener" class="news-sidebar-item">
        <span class="news-sidebar-title">${escHtml(a.title)}</span>
        <span class="news-sidebar-meta"><span class="news-src">${escHtml(a.source)}</span> &middot; ${timeAgo(a.pubDate)}</span>
      </a>`
    ).join('');
  }

  // --- Category columns (4 columns, 8 headlines each) ---
  function renderColumns(articles) {
    const cats = { mideast: [], israel: [], world: [], business: [] };
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
        `<li><a href="${escHtml(a.link)}" target="_blank" rel="noopener">
          <span class="col-title">${escHtml(a.title)}</span>
          <span class="col-meta"><span class="news-src">${escHtml(a.source)}</span> &middot; ${timeAgo(a.pubDate)}</span>
        </a></li>`
      ).join('');
    });
  }

  // --- More Stories (overflow cards with thumbnails) ---
  function renderMoreStories(articles) {
    const container = document.getElementById('more-stories');
    if (!container || articles.length === 0) return;

    container.innerHTML = '<h4 class="more-stories-title">More Stories</h4><div class="more-stories-grid">' +
      articles.map(a =>
        `<a href="${escHtml(a.link)}" target="_blank" rel="noopener" class="more-story-card">
          <div class="more-story-img" style="background-image:url('${a.img || 'img/Jerusalem_Old_City_market.jpg'}')"></div>
          <div class="more-story-body">
            <span class="more-story-title">${escHtml(a.title)}</span>
            <span class="more-story-meta"><span class="news-src">${escHtml(a.source)}</span> &middot; ${timeAgo(a.pubDate)}</span>
          </div>
        </a>`
      ).join('') + '</div>';
  }

  // --- Master render ---
  function renderAll() {
    let filtered = activeCategory === 'all'
      ? allArticles
      : allArticles.filter(a => a.category === activeCategory);

    filtered.sort((a, b) => b.pubDate - a.pubDate);
    if (filtered.length === 0) return;

    // Breaking bar: top 5 across all feeds
    breakingItems = allArticles.slice(0, 5);
    breakingIndex = 0;
    renderBreakingBar();
    startBreakingRotation();

    // Lead = first article
    renderLead(filtered[0]);

    // Sidebar = next 7
    renderSidebar(filtered.slice(1, 8));

    // Category columns use ALL articles
    renderColumns(allArticles);

    // More stories: articles 8-19 that have images
    const morePool = filtered.slice(8, 24).filter(a => a.img);
    renderMoreStories(morePool.slice(0, 8));

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

  // --- 3-tier progressive loading ---
  async function fetchProgressive() {
    const tier1 = FEEDS.filter(f => f.tier === 1);
    const tier2 = FEEDS.filter(f => f.tier === 2);
    const tier3 = FEEDS.filter(f => f.tier === 3);

    // Fire all tiers at once but render progressively
    const t1Promise = Promise.allSettled(tier1.map(fetchFeedWithFallback));
    const t2Promise = Promise.allSettled(tier2.map(fetchFeedWithFallback));
    const t3Promise = Promise.allSettled(tier3.map(fetchFeedWithFallback));

    // Tier 1: render immediately
    let items = [];
    const t1Results = await t1Promise;
    t1Results.forEach(r => { if (r.status === 'fulfilled') items.push(...r.value); });
    items.sort((a, b) => b.pubDate - a.pubDate);
    allArticles = dedup(items);
    if (allArticles.length > 0) renderAll();

    // Tier 2: merge and re-render
    const t2Results = await t2Promise;
    t2Results.forEach(r => { if (r.status === 'fulfilled') items.push(...r.value); });
    items.sort((a, b) => b.pubDate - a.pubDate);
    allArticles = dedup(items);
    renderAll();

    // Tier 3: merge and final render
    const t3Results = await t3Promise;
    t3Results.forEach(r => { if (r.status === 'fulfilled') items.push(...r.value); });
    items.sort((a, b) => b.pubDate - a.pubDate);
    allArticles = dedup(items);
    renderAll();
  }

  // Full refresh (for interval)
  async function fetchAllNews() {
    const results = await Promise.allSettled(FEEDS.map(fetchFeedWithFallback));
    let items = [];
    results.forEach(r => { if (r.status === 'fulfilled') items.push(...r.value); });
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
  initBreakingBar();
  fetchProgressive();
  setInterval(fetchAllNews, REFRESH_MS);
})();
