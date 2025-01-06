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
    }
}

document.addEventListener("DOMContentLoaded", fetchFeeds);
