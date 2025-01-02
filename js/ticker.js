const feedUrls = [
    "https://www.jpost.com/rss/rssfeedsjerusalem.aspx",
    "https://www.jpost.com/rss/rssfeedsheadlines.aspx",
    "https://www.jpost.com/rss/rssfeedsinternational",
    "https://www.jpost.com/rss/rssfeedschristiannews"
];

const apiUrl = "https://api.rss2json.com/v1/api.json?rss_url=";

function fetchFeeds() {
    const promises = feedUrls.map(url => fetch(apiUrl + encodeURIComponent(url)).then(res => res.json()));
    Promise.all(promises).then(feeds => {
        let allItems = [];
        feeds.forEach(feed => allItems.push(...feed.items));

        // Sort by publication date
        allItems.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

        // Generate ticker items
        const tickerContent = document.getElementById('ticker-content');
        tickerContent.innerHTML = allItems.map(item =>
            `<span class="ticker-item"><a href="${item.link}" target="_blank">${item.title}</a></span>`
        ).join('');
    }).catch(error => console.error("Failed to load feeds:", error));
}

window.onload = fetchFeeds;
