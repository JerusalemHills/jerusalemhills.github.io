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
    "https://www.reutersagency.com/feed/?best-topics=business", // Reuters - Business
    "https://www.reutersagency.com/feed/?best-topics=technology", // Reuters - Technology
    "https://techcrunch.com/feed/", // TechCrunch
    "https://finance.yahoo.com/news/rssindex", // Yahoo Finance
    "https://www.marketwatch.com/rss", // MarketWatch
    "https://medium.com/feed/@username" // Medium - Example User Feed
];

const apiUrl = "https://api.rss2json.com/v1/api.json?rss_url=";

async function fetchFeeds() {
    let allItems = [];

    for (const url of feedUrls) {
        try {
            const response = await fetch(apiUrl + encodeURIComponent(url));
            if (!response.ok) {
                console.warn(`Failed to fetch URL: ${url}`);
                continue;
            }
            const feed = await response.json();
            if (feed && feed.items) {
                allItems.push(...feed.items);
            }
        } catch (error) {
            console.error(`Error fetching URL: ${url}`, error);
        }
    }

    // Sort by publication date
    allItems.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

    // Generate ticker items
    const tickerContent = document.getElementById('ticker-content');
    tickerContent.innerHTML = allItems.map(item =>
        `<span class="ticker-item"><a href="${item.link}" target="_blank">${item.title}</a></span>`
    ).join('');
}

window.onload = fetchFeeds;
