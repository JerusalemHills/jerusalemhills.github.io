// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('service-worker.js').then((registration) => {
            console.log('Service Worker registered with scope:', registration.scope);
        }).catch((error) => {
            console.log('Service Worker registration failed:', error);
        });
    });
}

// Load items from JSON file
async function loadItems() {
    const response = await fetch('data/items.json');
    const items = await response.json();
    const itemsList = document.getElementById('items-list');
    itemsList.innerHTML = '';

    items.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.classList.add('item');
        itemElement.innerHTML = `
            <h3>${item.title}</h3>
            <p><strong>Category:</strong> ${item.category}</p>
            <p><strong>Price:</strong> ${item.price} BTC</p>
            <p><strong>Description:</strong> ${item.description}</p>
            <p><strong>Contact:</strong> ${item.contact}</p>
        `;
        itemsList.appendChild(itemElement);
    });
}

// Filter items based on category and search
document.getElementById('categoryFilter').addEventListener('change', loadItems);
document.getElementById('searchBar').addEventListener('input', loadItems);

// Form submission handler to add new listings
document.getElementById('itemForm').addEventListener('submit', (e) => {
    e.preventDefault();

    const title = document.getElementById('title').value;
    const category = document.getElementById('category').value;
    const price = document.getElementById('price').value;
    const description = document.getElementById('description').value;
    const contact = document.getElementById('contact').value;

    const newItem = {
        title,
        category,
        price,
        description,
        contact
    };

    // Send new item data to admin via email (or other mechanism)
    console.log('New item submitted:', newItem);

    // Optionally update the data file (this will need to be handled by an admin)
});

// Load items initially
loadItems();
