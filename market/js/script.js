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

// Initialize Hebrew Date Display
function updateHebrewDate() {
    if (typeof hebcal !== 'undefined' && typeof moment !== 'undefined') {
        const now = new Date();
        const hebDate = new hebcal.HDate(now);
        const hebrewDateText = hebDate.toString('h');
        const gregDate = moment(now).format('MMMM D, YYYY');
        const jerusalemTime = moment(now).utcOffset(180).format('HH:mm');

        document.getElementById('hebrew-date').innerHTML = `
            <p class="hebrew-date-text">${hebrewDateText}</p>
            <p class="greg-date">${gregDate}</p>
            <p class="jerusalem-time">Jerusalem Time: ${jerusalemTime}</p>
        `;
    }
}

// Update Hebrew date every minute
setInterval(updateHebrewDate, 60000);
updateHebrewDate();

// Cart functionality
let cart = JSON.parse(localStorage.getItem('marketplace_cart')) || [];

function updateCartDisplay() {
    const cartButton = document.querySelector('.cart-button');
    if (cart.length > 0) {
        if (!cartButton.querySelector('.cart-count')) {
            const count = document.createElement('span');
            count.className = 'cart-count';
            cartButton.appendChild(count);
        }
        cartButton.querySelector('.cart-count').textContent = cart.length;
    } else {
        const count = cartButton.querySelector('.cart-count');
        if (count) count.remove();
    }
}

// Load items from JSON file with enhanced filtering
async function loadItems() {
    try {
        const response = await fetch('data/items.json');
        const items = await response.json();
        const itemsList = document.getElementById('items-list');
        const categoryFilter = document.getElementById('categoryFilter').value;
        const searchQuery = document.getElementById('searchBar').value.toLowerCase();

        itemsList.innerHTML = '';

        const filteredItems = items.filter(item => {
            const matchesCategory = !categoryFilter || item.category === categoryFilter;
            const matchesSearch = !searchQuery || 
                item.title.toLowerCase().includes(searchQuery) || 
                item.description.toLowerCase().includes(searchQuery);
            return matchesCategory && matchesSearch;
        });

        if (filteredItems.length === 0) {
            itemsList.innerHTML = '<p class="no-results">No items found matching your criteria</p>';
            return;
        }

        filteredItems.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.classList.add('item');
            itemElement.innerHTML = `
                <h3>${item.title}</h3>
                <p class="category"><strong>Category:</strong> ${item.category}</p>
                <p class="price"><strong>Price:</strong> ₿${Number(item.price).toFixed(8)}</p>
                <p class="description"><strong>Description:</strong> ${item.description}</p>
                <p class="contact"><strong>Contact:</strong> ${item.contact}</p>
                <button class="add-to-cart" data-item='${JSON.stringify(item)}'>
                    Add to Cart
                </button>
            `;
            itemsList.appendChild(itemElement);
        });

        // Add event listeners to new Add to Cart buttons
        document.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', (e) => {
                const item = JSON.parse(e.target.dataset.item);
                cart.push(item);
                localStorage.setItem('marketplace_cart', JSON.stringify(cart));
                updateCartDisplay();
                
                // Show feedback
                const feedback = document.createElement('div');
                feedback.className = 'add-to-cart-feedback';
                feedback.textContent = 'Added to cart!';
                e.target.parentNode.appendChild(feedback);
                setTimeout(() => feedback.remove(), 2000);
            });
        });
    } catch (error) {
        console.error('Error loading items:', error);
        document.getElementById('items-list').innerHTML = 
            '<p class="error">Error loading marketplace items. Please try again later.</p>';
    }
}

// Filter items based on category and search
let searchTimeout;
document.getElementById('categoryFilter').addEventListener('change', loadItems);
document.getElementById('searchBar').addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(loadItems, 300); // Debounce search
});

// Form submission handler with validation
document.getElementById('itemForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const form = e.target;
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = 'Submitting...';

    try {
        const formData = {
            title: form.title.value.trim(),
            category: form.category.value,
            price: parseFloat(form.price.value),
            description: form.description.value.trim(),
            contact: form.contact.value.trim(),
            timestamp: new Date().toISOString()
        };

        // Here you would typically send this to your backend
        // For now, we'll just show a success message
        form.reset();
        const successMessage = document.createElement('div');
        successMessage.className = 'submission-success';
        successMessage.textContent = 'Listing submitted successfully! It will be reviewed by our team.';
        form.parentNode.insertBefore(successMessage, form);
        setTimeout(() => successMessage.remove(), 5000);

    } catch (error) {
        console.error('Error submitting form:', error);
        const errorMessage = document.createElement('div');
        errorMessage.className = 'submission-error';
        errorMessage.textContent = 'Error submitting listing. Please try again.';
        form.parentNode.insertBefore(errorMessage, form);
        setTimeout(() => errorMessage.remove(), 5000);

    } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Submit Listing';
    }
});

// Cart button click handler
document.querySelector('.cart-button').addEventListener('click', () => {
    // Here you would typically show a cart modal or navigate to cart page
    alert(`Cart contains ${cart.length} items`);
});

// Initialize page
loadItems();
updateCartDisplay();
