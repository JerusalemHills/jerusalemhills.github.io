// Jerusalem Hills - Proposed Site Interactivity
// Placeholder for dynamic content and features

document.addEventListener('DOMContentLoaded', () => {
  console.log('Jerusalem Hills site loaded.');

  // Initialize Lucide icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // Hebrew Date Update Function - Using Jerusalem timezone
  function updateHebrewDate() {
    try {
      if (typeof HebrewCalendar !== 'undefined') {
        const hebrewDate = HebrewCalendar.getHebrewDate();
        const hebrewDateElements = document.querySelectorAll('.hebrew-date, .mobile-hebrew-date');

        hebrewDateElements.forEach(el => {
          el.textContent = hebrewDate;
        });

        // Add Gregorian date in Jerusalem timezone
        const now = new Date();
        const jlmDate = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Jerusalem' }));
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const gregDateStr = jlmDate.toLocaleDateString('en-US', options);
        const gregDateElements = document.querySelectorAll('.gregorian-date, .mobile-gregorian-date');

        gregDateElements.forEach(el => {
          el.textContent = gregDateStr;
        });
      }
    } catch (e) {
      console.warn("Error updating Hebrew date:", e);
    }
  }

  // Update Hebrew Date on page load and every minute
  updateHebrewDate();
  setInterval(updateHebrewDate, 60000);

  // Update dashboard Hebrew date
  function updateDashboardHebrewDate() {
    try {
      if (typeof HebrewCalendar !== 'undefined') {
        const hebrewDate = HebrewCalendar.getHebrewDate();
        const dashboardDate = document.querySelector('.hebrew-date-display');
        if (dashboardDate) {
          dashboardDate.textContent = hebrewDate;
        }
      }
    } catch (e) {
      console.warn("Error updating dashboard Hebrew date:", e);
    }
  }

  updateDashboardHebrewDate();

  // Weather data and icons
  const weatherIcons = {
    sunny: '☼',
    cloudy: '☁',
    rainy: '☂',
    snowy: '❆',
    windy: '≋'
  };

  const weatherData = {
    jlm: { temp: null, icon: '☼' },
    nyc: { temp: null, icon: '☼' },
    lon: { temp: null, icon: '☼' },
    tok: { temp: null, icon: '☼' },
    mos: { temp: null, icon: '☼' }
  };

  // Fetch weather data from Open-Meteo API (free, no API key needed)
  async function fetchWeather() {
    const cities = {
      jlm: { lat: 31.7683, lon: 35.2137 },
      nyc: { lat: 40.7128, lon: -74.0060 },
      lon: { lat: 51.5074, lon: -0.1278 },
      tok: { lat: 35.6762, lon: 139.6503 },
      mos: { lat: 55.7558, lon: 37.6173 }
    };

    for (const [city, coords] of Object.entries(cities)) {
      try {
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current_weather=true&temperature_unit=celsius`);
        const data = await response.json();

        if (data.current_weather) {
          const temp = Math.round(data.current_weather.temperature);
          const weatherCode = data.current_weather.weathercode;

          // Determine icon based on weather code
          let icon = '☼';
          if (weatherCode === 0 || weatherCode === 1) icon = '☼'; // Clear/mainly clear
          else if (weatherCode >= 2 && weatherCode <= 3) icon = '☁'; // Partly cloudy/overcast
          else if (weatherCode >= 51 && weatherCode <= 67) icon = '☂'; // Rain
          else if (weatherCode >= 71 && weatherCode <= 77) icon = '❆'; // Snow
          else if (weatherCode >= 80) icon = '☂'; // Showers

          weatherData[city] = { temp, icon };
        }
      } catch (error) {
        console.warn(`Weather fetch failed for ${city}:`, error);
      }
    }
  }

  // Update world clocks and weather in header and mobile menu
  function updateWorldClocks() {
    const timezones = {
      jlm: 'Asia/Jerusalem',
      nyc: 'America/New_York',
      lon: 'Europe/London',
      tok: 'Asia/Tokyo',
      mos: 'Europe/Moscow'
    };

    const now = new Date();
    const jlmDate = new Date(now.toLocaleString('en-US', { timeZone: timezones.jlm }));
    const jlmDay = jlmDate.getDate();

    Object.keys(timezones).forEach(city => {
      // Update desktop header times
      const timeElement = document.getElementById(`time-${city}`);
      const weatherElement = document.getElementById(`weather-${city}`);
      // Update mobile menu times
      const mobileTimeElement = document.getElementById(`mobile-time-${city}`);
      const mobileWeatherElement = document.getElementById(`mobile-weather-${city}`);

      const cityDate = new Date(now.toLocaleString('en-US', { timeZone: timezones[city] }));
      const hours = cityDate.getHours().toString().padStart(2, '0');
      const minutes = cityDate.getMinutes().toString().padStart(2, '0');

      // Check if it's a different day than Jerusalem
      const cityDay = cityDate.getDate();
      const dayDiff = cityDay - jlmDay;

      // Function to update time element
      const updateTimeElement = (element, indicatorId) => {
        if (!element) return;

        const baseText = `${hours}:${minutes}`;
        const plusIndicator = document.getElementById(indicatorId);

        // Update base text
        const textNode = Array.from(element.childNodes).find(node => node.nodeType === 3);
        if (textNode) {
          textNode.textContent = baseText;
        } else {
          const newText = document.createTextNode(baseText);
          element.insertBefore(newText, element.firstChild);
        }

        // Update day indicator
        if (plusIndicator) {
          plusIndicator.textContent = dayDiff > 0 ? '+1' : (dayDiff < 0 ? '-1' : '');
        }
      };

      // Update both desktop and mobile times
      updateTimeElement(timeElement, `${city}-plus`);
      updateTimeElement(mobileTimeElement, `mobile-${city}-plus`);

      // Update weather
      if (weatherElement && weatherData[city].temp !== null) {
        weatherElement.textContent = `${weatherData[city].temp}° ${weatherData[city].icon}`;
      }
      if (mobileWeatherElement && weatherData[city].temp !== null) {
        mobileWeatherElement.textContent = `${weatherData[city].temp}° ${weatherData[city].icon}`;
      }
    });
  }

  // Initial weather fetch
  fetchWeather();
  // Refresh weather every 10 minutes
  setInterval(fetchWeather, 10 * 60 * 1000);

  updateWorldClocks();
  setInterval(updateWorldClocks, 1000);

  // Update Jerusalem time
  function updateJerusalemTime() {
    const timeElement = document.getElementById('jerusalem-time');
    if (timeElement) {
      const now = new Date();
      const jerusalemTime = now.toLocaleTimeString('en-US', {
        timeZone: 'Asia/Jerusalem',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
      timeElement.textContent = jerusalemTime;
    }
  }

  updateJerusalemTime();
  setInterval(updateJerusalemTime, 1000);

  // Update market time
  function updateMarketTime() {
    const marketTimeElement = document.getElementById('market-time');
    if (marketTimeElement) {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
      marketTimeElement.textContent = timeStr;
    }
  }

  updateMarketTime();
  setInterval(updateMarketTime, 60000);

  // Fetch RSS feeds for Headlines card
  const feedUrls = [
    "https://www.jpost.com/rss/rssfeedsjerusalem.aspx",
    "https://www.jpost.com/rss/rssfeedsheadlines.aspx"
  ];

  const corsProxies = [
    "https://api.allorigins.win/raw?url=",
    "https://corsproxy.io/?",
    "https://cors.eu.org/"
  ];

  let currentProxyIndex = 0;

  async function fetchFeedWithRetry(url, retries = 3) {
    let attempt = 0;
    while (attempt < retries) {
      try {
        const proxyUrl = corsProxies[currentProxyIndex] + encodeURIComponent(url);
        const response = await fetch(proxyUrl);

        if (!response.ok) {
          currentProxyIndex = (currentProxyIndex + 1) % corsProxies.length;
          throw new Error('Fetch failed');
        }

        const text = await response.text();
        const parser = new DOMParser();
        const xml = parser.parseFromString(text, "text/xml");

        if (xml.getElementsByTagName("parsererror").length > 0) {
          throw new Error('Invalid XML');
        }

        const items = Array.from(xml.querySelectorAll("item")).map(item => {
          // Try to get image from various RSS namespaces
          let imageUrl = '';

          // Try media:content (common in RSS feeds)
          const mediaContent = item.querySelector("content");
          if (mediaContent) {
            imageUrl = mediaContent.getAttribute('url') || '';
          }

          // Try media:thumbnail
          if (!imageUrl) {
            const mediaThumbnail = item.querySelector("thumbnail");
            if (mediaThumbnail) {
              imageUrl = mediaThumbnail.getAttribute('url') || '';
            }
          }

          // Try enclosure tag
          if (!imageUrl) {
            const enclosure = item.querySelector("enclosure");
            if (enclosure && enclosure.getAttribute('type')?.startsWith('image')) {
              imageUrl = enclosure.getAttribute('url') || '';
            }
          }

          // Try description for embedded images
          if (!imageUrl) {
            const description = item.querySelector("description")?.textContent || "";
            const imgMatch = description.match(/<img[^>]+src="([^">]+)"/);
            if (imgMatch) {
              imageUrl = imgMatch[1];
            }
          }

          return {
            title: item.querySelector("title")?.textContent || "",
            link: item.querySelector("link")?.textContent || "",
            pubDate: item.querySelector("pubDate")?.textContent || "",
            description: item.querySelector("description")?.textContent?.replace(/<[^>]*>/g, '').substring(0, 150) || "",
            imageUrl: imageUrl
          };
        });

        return { items };
      } catch (error) {
        console.error(`Error fetching RSS feed: ${url}`, error);
        if (attempt === retries - 1) {
          currentProxyIndex = (currentProxyIndex + 1) % corsProxies.length;
          if (currentProxyIndex === 0) {
            throw error;
          }
        }
        attempt++;
      }
    }
  }

  function getTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  }

  function categorizeFeed(url) {
    if (url.includes('jerusalem')) return 'Local';
    if (url.includes('headlines')) return 'Breaking';
    if (url.includes('international')) return 'World';
    if (url.includes('christian')) return 'Community';
    return 'News';
  }

  // Carousel state - Simplified horizontal scroll
  let carouselPosition = 0;
  let carouselInterval;
  let carouselPaused = false;

  async function fetchHeadlines() {
    const headlinesCard = document.querySelector('.headlines-card .card-content');

    if (!headlinesCard) return;

    // Show loading state
    headlinesCard.innerHTML = '<div style="text-align: center; padding: 2rem; color: #9ca3af;">Loading headlines...</div>';

    try {
      let allItems = [];

      for (const url of feedUrls) {
        try {
          const feed = await fetchFeedWithRetry(url);
          if (feed && feed.items) {
            const category = categorizeFeed(url);
            feed.items.forEach(item => {
              item.category = category;
            });
            allItems.push(...feed.items);
          }
        } catch (error) {
          console.error(`Error fetching feed: ${url}`, error);
        }
      }

      // Sort by publication date (most recent first)
      allItems.sort((a, b) => {
        const dateA = new Date(a.pubDate);
        const dateB = new Date(b.pubDate);
        return dateB - dateA;
      });

      // Take top 12 items for carousel
      const topItems = allItems.slice(0, 12);

      if (topItems.length === 0) {
        headlinesCard.innerHTML = '<div style="text-align: center; padding: 2rem; color: #9ca3af;">No headlines available</div>';
        return;
      }

      // Create simplified carousel structure
      headlinesCard.innerHTML = `
        <div class="headlines-carousel">
          <div class="headlines-track"></div>
        </div>
      `;

      const track = headlinesCard.querySelector('.headlines-track');

      // Duplicate items for seamless loop
      const duplicatedItems = [...topItems, ...topItems];

      // Populate carousel items
      duplicatedItems.forEach((item) => {
        const headlineDiv = document.createElement('div');
        headlineDiv.className = 'headline-item';

        const badge = document.createElement('span');
        badge.className = 'headline-badge';
        badge.textContent = item.category;

        const link = document.createElement('a');
        link.className = 'headline-link';
        link.href = item.link;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = item.title;

        const time = document.createElement('span');
        time.className = 'headline-time';
        time.textContent = getTimeAgo(item.pubDate);

        headlineDiv.appendChild(badge);
        headlineDiv.appendChild(link);
        headlineDiv.appendChild(time);
        track.appendChild(headlineDiv);
      });

      // Pause on hover
      const carousel = headlinesCard.querySelector('.headlines-carousel');
      carousel.addEventListener('mouseenter', () => carouselPaused = true);
      carousel.addEventListener('mouseleave', () => carouselPaused = false);

      // Start auto-scroll
      startCarousel();

    } catch (error) {
      console.error('Error loading headlines:', error);
      headlinesCard.innerHTML = '<div style="text-align: center; padding: 2rem; color: #ef4444;">Unable to load headlines</div>';
    }
  }

  function startCarousel() {
    // Clear any existing interval
    if (carouselInterval) {
      clearInterval(carouselInterval);
    }

    const track = document.querySelector('.headlines-track');
    if (!track) return;

    // Auto-scroll horizontally - smooth continuous movement
    carouselInterval = setInterval(() => {
      if (!carouselPaused) {
        carouselPosition -= 1; // Move 1px left every interval

        // Reset position for seamless loop (when first set of items is fully scrolled)
        const firstItem = track.querySelector('.headline-item');
        if (firstItem) {
          const itemWidth = firstItem.offsetWidth + 48; // item width + gap
          const totalWidth = itemWidth * (track.children.length / 2);

          if (Math.abs(carouselPosition) >= totalWidth) {
            carouselPosition = 0;
          }
        }

        track.style.transform = `translateX(${carouselPosition}px)`;
      }
    }, 30); // Run every 30ms for smooth animation
  }

  // Fetch headlines on load
  fetchHeadlines();

  // Refresh headlines every 10 minutes
  setInterval(fetchHeadlines, 10 * 60 * 1000);

  // Fetch Open Graph image from article URL
  async function fetchArticleImage(articleUrl) {
    try {
      const proxyUrl = corsProxies[currentProxyIndex] + encodeURIComponent(articleUrl);
      const response = await fetch(proxyUrl);

      if (!response.ok) {
        throw new Error('Failed to fetch article page');
      }

      const html = await response.text();

      // Try multiple image meta tags
      const ogImageMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i);
      if (ogImageMatch && ogImageMatch[1]) {
        return ogImageMatch[1];
      }

      // Try twitter:image
      const twitterImageMatch = html.match(/<meta\s+name=["']twitter:image["']\s+content=["']([^"']+)["']/i);
      if (twitterImageMatch && twitterImageMatch[1]) {
        return twitterImageMatch[1];
      }

      // Try article:image
      const articleImageMatch = html.match(/<meta\s+property=["']article:image["']\s+content=["']([^"']+)["']/i);
      if (articleImageMatch && articleImageMatch[1]) {
        return articleImageMatch[1];
      }

      return null;
    } catch (error) {
      console.error('Error fetching article image:', error);
      return null;
    }
  }

  // Populate News Section with RSS feeds
  async function populateNewsSection() {
    try {
      let allItems = [];

      for (const url of feedUrls) {
        try {
          const feed = await fetchFeedWithRetry(url);
          if (feed && feed.items) {
            allItems.push(...feed.items);
          }
        } catch (error) {
          console.error(`Error fetching feed for news section: ${url}`, error);
        }
      }

      // Sort by publication date (most recent first)
      allItems.sort((a, b) => {
        const dateA = new Date(a.pubDate);
        const dateB = new Date(b.pubDate);
        return dateB - dateA;
      });

      if (allItems.length === 0) {
        return; // Keep placeholder content
      }

      // Featured article (top story with image)
      const featuredStory = allItems[0];
      const featuredNewsDiv = document.getElementById('featured-news');
      const featuredImage = document.getElementById('featured-image');
      const featuredTitle = document.getElementById('featured-title');
      const featuredDescription = document.getElementById('featured-description');

      if (featuredNewsDiv && featuredImage && featuredTitle && featuredDescription) {
        // Make featured div clickable
        featuredNewsDiv.style.cursor = 'pointer';
        featuredNewsDiv.onclick = () => window.open(featuredStory.link, '_blank');

        // Update title and description first
        featuredTitle.textContent = featuredStory.title;
        featuredDescription.textContent = featuredStory.description || 'Click to read more...';

        // Show loading indicator on image
        featuredImage.style.opacity = '0.5';
        featuredImage.alt = 'Loading image...';

        // Try to fetch image from article page
        let imageUrl = featuredStory.imageUrl;

        if (!imageUrl && featuredStory.link) {
          console.log('Attempting to fetch image from article:', featuredStory.link);
          // Try to fetch Open Graph image from article page
          imageUrl = await fetchArticleImage(featuredStory.link);
          console.log('Fetched image URL:', imageUrl);
        }

        // Set image or use fallback
        if (imageUrl) {
          featuredImage.src = imageUrl;
          featuredImage.alt = featuredStory.title;
          featuredImage.style.opacity = '1';
          featuredImage.onerror = () => {
            console.log('Image failed to load, using fallback');
            featuredImage.src = 'img/Jerusalem_Old_City_market.jpg';
            featuredImage.style.opacity = '1';
          };
        } else {
          console.log('No image found, using fallback');
          featuredImage.src = 'img/Jerusalem_Old_City_market.jpg';
          featuredImage.style.opacity = '1';
        }
      }

      // News list (next 3 stories)
      const newsListDiv = document.getElementById('news-list');
      if (newsListDiv) {
        newsListDiv.innerHTML = '';
        const listStories = allItems.slice(1, 4);

        listStories.forEach(story => {
          const newsItem = document.createElement('div');
          newsItem.className = 'news-item';
          newsItem.style.cursor = 'pointer';
          newsItem.onclick = () => window.open(story.link, '_blank');

          const title = document.createElement('h5');
          title.textContent = story.title;

          const description = document.createElement('p');
          description.textContent = story.description || getTimeAgo(story.pubDate);

          newsItem.appendChild(title);
          newsItem.appendChild(description);
          newsListDiv.appendChild(newsItem);
        });
      }

    } catch (error) {
      console.error('Error populating news section:', error);
    }
  }

  // Populate news section on load
  populateNewsSection();

  // Refresh news section every 15 minutes
  setInterval(populateNewsSection, 15 * 60 * 1000);

  // Mobile menu toggle
  const menuButton = document.querySelector('.menu-button');
  const mobileMenu = document.querySelector('.mobile-menu');

  console.log('Menu button:', menuButton);
  console.log('Mobile menu:', mobileMenu);

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', (e) => {
      e.preventDefault();
      console.log('Menu button clicked');

      const isOpen = mobileMenu.classList.toggle('open');
      console.log('Menu is now:', isOpen ? 'open' : 'closed');

      // Change icon between menu and X
      const icon = menuButton.querySelector('i');
      if (icon) {
        if (isOpen) {
          icon.setAttribute('data-lucide', 'x');
        } else {
          icon.setAttribute('data-lucide', 'menu');
        }
        if (typeof lucide !== 'undefined') {
          lucide.createIcons();
        }
      }
    });

    // Close mobile menu when clicking on a link
    const mobileLinks = document.querySelectorAll('.mobile-link');
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        const icon = menuButton.querySelector('i');
        if (icon) {
          icon.setAttribute('data-lucide', 'menu');
          if (typeof lucide !== 'undefined') {
            lucide.createIcons();
          }
        }
      });
    });
  } else {
    console.error('Menu button or mobile menu not found!');
  }

  // Smooth scrolling for navigation links
  const navLinks = document.querySelectorAll('nav a');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href');
      const targetSection = document.querySelector(targetId);

      if (targetSection) {
        targetSection.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // Hero button interaction
  const heroButton = document.querySelector('.hero button');
  if (heroButton) {
    heroButton.addEventListener('click', () => {
      const marketplace = document.querySelector('#marketplace');
      if (marketplace) {
        marketplace.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  }

  // Card hover effects data
  const cards = document.querySelectorAll('.card');
  cards.forEach(card => {
    card.addEventListener('click', () => {
      console.log('Card clicked:', card.querySelector('h4')?.textContent);
      // Future: Navigate to detail page or open modal
    });
  });

  // Forum post interactions
  const posts = document.querySelectorAll('.post');
  posts.forEach(post => {
    post.addEventListener('click', () => {
      console.log('Post clicked:', post.querySelector('.post-content')?.textContent);
      // Future: Open forum post detail view
    });
  });

  // News item interactions
  const newsItems = document.querySelectorAll('.news-item, .featured');
  newsItems.forEach(item => {
    item.addEventListener('click', () => {
      console.log('News item clicked:', item.querySelector('h4, h5')?.textContent);
      // Future: Open full article
    });
  });

  // Search functionality placeholder
  const searchInput = document.querySelector('input[type="search"]');
  if (searchInput) {
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const query = searchInput.value.trim();
        if (query) {
          console.log('Search query:', query);
          // Future: Implement search functionality
          alert(`Search functionality coming soon! Query: "${query}"`);
        }
      }
    });
  }

  // Add active state to current section in navigation
  const sections = document.querySelectorAll('section[id]');
  const observerOptions = {
    threshold: 0.3
  };

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => {
          link.style.color = '';
          if (link.getAttribute('href') === `#${entry.target.id}`) {
            link.style.color = 'var(--accent)';
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach(section => {
    sectionObserver.observe(section);
  });

  // Lazy load images (for future optimization)
  const images = document.querySelectorAll('img[src]');
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.classList.add('loaded');
          imageObserver.unobserve(img);
        }
      });
    });

    images.forEach(img => imageObserver.observe(img));
  }

  console.log('✅ All interactive features initialized');
});

// Example function for future API integration
async function fetchMarketplaceItems() {
  // Placeholder for fetching dynamic marketplace data
  console.log('Marketplace items would be fetched here');
  // Example:
  // const response = await fetch('/api/marketplace');
  // const items = await response.json();
  // return items;
}

async function fetchForumPosts() {
  // Placeholder for fetching dynamic forum posts
  console.log('Forum posts would be fetched here');
}

async function fetchNews() {
  // Placeholder for fetching news articles
  console.log('News articles would be fetched here');
}

// Export functions for potential module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    fetchMarketplaceItems,
    fetchForumPosts,
    fetchNews
  };
}
