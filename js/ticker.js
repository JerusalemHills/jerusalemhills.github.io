const feedUrls = [
    "https://www.jpost.com/rss/rssfeedsjerusalem.aspx",
    "https://www.jpost.com/rss/rssfeedsheadlines.aspx",
    "https://www.jpost.com/rss/rssfeedsinternational",
    "https://www.jpost.com/rss/rssfeedschristiannews"
];

// Using multiple CORS proxies for redundancy
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
            // Show loading state
            const tickerContent = document.getElementById('ticker-content');
            if (attempt === 0) {
                tickerContent.innerHTML = "<span class='ticker-item'>Loading news...</span>";
            }

            const proxyUrl = corsProxies[currentProxyIndex] + encodeURIComponent(url);
            const response = await fetch(proxyUrl);
            
            if (!response.ok) {
                console.warn(`Failed to fetch URL with proxy ${currentProxyIndex}: ${url}`);
                // Try next proxy
                currentProxyIndex = (currentProxyIndex + 1) % corsProxies.length;
                throw new Error('Fetch failed');
            }
            
            const text = await response.text();
            // Parse the XML manually since we're getting raw RSS feed
            const parser = new DOMParser();
            const xml = parser.parseFromString(text, "text/xml");
            
            // Check if we got valid XML
            if (xml.getElementsByTagName("parsererror").length > 0) {
                throw new Error('Invalid XML');
            }
            
            const items = Array.from(xml.querySelectorAll("item")).map(item => ({
                title: item.querySelector("title")?.textContent || "",
                link: item.querySelector("link")?.textContent || "",
                pubDate: item.querySelector("pubDate")?.textContent || ""
            }));
            
            return { items };
        } catch (error) {
            console.error(`Error fetching URL: ${url}`, error);
            if (attempt === retries - 1) {
                // If all retries failed, try next proxy
                currentProxyIndex = (currentProxyIndex + 1) % corsProxies.length;
                if (currentProxyIndex === 0) {
                    // If we've tried all proxies, show error
                    const tickerContent = document.getElementById('ticker-content');
                    tickerContent.innerHTML = "<span class='ticker-item'>Unable to load news feed. Please check back later.</span>";
                    throw error;
                }
            }
            attempt++;
        }
    }
}

async function fetchFeeds() {
    let allItems = [];

    for (const url of feedUrls) {
        try {
            const feed = await fetchFeedWithRetry(url);
            if (feed && feed.items) {
                allItems.push(...feed.items);
            }
        } catch (error) {
            console.error(`Error fetching URL: ${url}`, error);
        }
    }

    // Sort by publication date
    allItems.sort((a, b) => {
        const dateA = new Date(a.pubDate);
        const dateB = new Date(b.pubDate);
        return isNaN(dateB) - isNaN(dateA) || dateB - dateA;
    });

    // Generate ticker items
    const tickerContent = document.getElementById('ticker-content');
    if (allItems.length === 0) {
        tickerContent.innerHTML = "<span class='ticker-item'>No recent news available.</span>";
    } else {
        const fragment = document.createDocumentFragment();
        allItems.forEach(item => {
            const span = document.createElement('span');
            span.className = 'ticker-item';
            span.innerHTML = `<a href="${item.link}" target="_blank">${item.title}</a>`;
            fragment.appendChild(span);
        });
        tickerContent.appendChild(fragment);
        // Initialize the controlled scrolling after adding items
        initTickerScroll();
    }
}

// Variables for controlling the ticker scroll
let tickerPosition = 0;
let currentItemIndex = 0;
let itemPositions = [];
let animationPaused = false;
let tickerInterval;

// Function to initialize controlled scrolling
function initTickerScroll() {
    const tickerContent = document.getElementById('ticker-content');
    const items = document.querySelectorAll('.ticker-item');
    
    // Calculate positions of each item
    itemPositions = [];
    let currentPosition = 0;
    
    items.forEach((item, index) => {
        itemPositions.push(currentPosition);
        currentPosition += item.offsetWidth;
    });
    
    // Add pause event on hover
    const tickerTape = document.querySelector('.ticker-tape');
    tickerTape.addEventListener('mouseenter', () => {
        animationPaused = true;
    });
    
    tickerTape.addEventListener('mouseleave', () => {
        animationPaused = false;
    });
    
    // Start the controlled scrolling
    startScrolling();
}

// Function to handle controlled scrolling with pauses
function startScrolling() {
    const tickerContent = document.getElementById('ticker-content');
    const items = document.querySelectorAll('.ticker-item');
    
    // Clear any existing interval
    if (tickerInterval) {
        clearInterval(tickerInterval);
    }
    
    tickerInterval = setInterval(() => {
        if (animationPaused) return;
        
        // Move the ticker
        tickerPosition++;
        tickerContent.style.transform = `translateX(-${tickerPosition}px)`;
        
        // When current item has scrolled completely out of view
        if (tickerPosition >= itemPositions[currentItemIndex] + items[currentItemIndex].offsetWidth) {
            currentItemIndex++;
            
            // If we've reached the end, reset to the beginning
            if (currentItemIndex >= items.length) {
                tickerPosition = 0;
                currentItemIndex = 0;
                tickerContent.style.transform = `translateX(0)`;
                
                // Pause briefly at the restart
                animationPaused = true;
                setTimeout(() => {
                    animationPaused = false;
                }, 1000);
            } else {
                // Pause briefly between items
                animationPaused = true;
                setTimeout(() => {
                    animationPaused = false;
                }, 1000); // 1 second pause between items
            }
        }
    }, 30); // Controls the speed - higher number = slower scrolling
}

// Update reloadTicker to handle errors better
function reloadTicker() {
    setInterval(async () => {
        try {
            const tickerContent = document.getElementById('ticker-content');
            if (tickerContent) {
                tickerContent.innerHTML = '';
                await fetchFeeds();
            }
        } catch (error) {
            console.error('Error reloading ticker:', error);
            // Will show error message from fetchFeedWithRetry
        }
    }, 20 * 60 * 1000); // Reload every 20 minutes
}

// Initialize immediately and set up reload interval
document.addEventListener("DOMContentLoaded", () => {
    // Add loading state immediately
    const tickerContent = document.getElementById('ticker-content');
    if (tickerContent) {
        tickerContent.innerHTML = "<span class='ticker-item'>Loading news...</span>";
    }
    
    fetchFeeds().catch(error => {
        console.error('Initial ticker load failed:', error);
        // Error message will be shown by fetchFeedWithRetry
    });
    
    reloadTicker();
});
