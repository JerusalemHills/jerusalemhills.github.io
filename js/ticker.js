const feedUrls = [
    "https://www.jpost.com/rss/rssfeedsjerusalem.aspx",
    "https://www.jpost.com/rss/rssfeedsheadlines.aspx",
    "https://www.jpost.com/rss/rssfeedsinternational",
    "https://www.jpost.com/rss/rssfeedschristiannews",
    "http://feeds.bbci.co.uk/news/rss.xml", // BBC News - General News
    "http://feeds.bbci.co.uk/news/technology/rss.xml", // BBC News - Technology
    "http://feeds.bbci.co.uk/news/world/rss.xml", // BBC News - World News
    "http://rss.cnn.com/rss/cnn_topstories.rss", // CNN - Top Stories
    "http://rss.cnn.com/rss/cnn_world.rss", // CNN - World
    "https://finance.yahoo.com/news/rssindex" // Yahoo Finance
];

const apiUrl = "https://api.rss2json.com/v1/api.json?rss_url=";

async function fetchFeedWithRetry(url, retries = 3) {
    let attempt = 0;
    while (attempt < retries) {
        try {
            const response = await fetch(apiUrl + encodeURIComponent(url));
            if (!response.ok) {
                console.warn(`Failed to fetch URL: ${url}`);
                break; // Exit the loop on a non-2xx status
            }
            return await response.json();
        } catch (error) {
            console.error(`Error fetching URL: ${url}`, error);
            if (attempt === retries - 1) throw error; // Re-throw after max retries
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

// Reload the ticker regularly to get fresh content
function reloadTicker() {
    setInterval(() => {
        const tickerContent = document.getElementById('ticker-content');
        if (tickerContent) {
            tickerContent.innerHTML = '';
            fetchFeeds();
        }
    }, 30 * 60 * 1000); // Reload every 30 minutes
}

document.addEventListener("DOMContentLoaded", () => {
    fetchFeeds();
    reloadTicker();
});
