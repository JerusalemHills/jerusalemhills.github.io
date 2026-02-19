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

  // News fetching is handled by js/news-aggregator.js

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

  // News interactions now handled by js/news-aggregator.js

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

