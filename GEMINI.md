# GEMINI.md: AI Assistant Guide

This document provides context and instructions for the Gemini AI assistant to effectively understand and assist with the Jerusalem Hills project.

## Project Overview

This is a static e-commerce website for "Jerusalem Hills," a marketplace for authentic Jerusalem crafts. The site is built with vanilla HTML, CSS, and JavaScript, and it is hosted on GitHub Pages. The e-commerce functionality is powered by Stripe, with serverless Netlify Functions handling the backend logic for payment processing.

### Key Technologies

*   **Frontend:** HTML, CSS, vanilla JavaScript
*   **Backend:** Node.js-based serverless functions on Netlify
*   **Payments:** Stripe
*   **Hosting:** GitHub Pages (static site) and Netlify (serverless functions)

### Architecture

The project follows a JAMstack architecture:

1.  **Static Site:** The main website is a collection of static HTML, CSS, and JS files. This ensures fast loading times and easy hosting.
2.  **Serverless Functions:** Dynamic backend operations, such as creating a Stripe checkout session, are handled by serverless functions deployed on Netlify.
3.  **Third-Party Services:** Stripe is used for all payment processing, ensuring security and PCI compliance.

## Building and Running

### Local Development

There are two ways to run the project locally:

1.  **Simple HTTP Server (for frontend work):**
    ```bash
    python3 -m http.server 8000
    ```
    This will serve the static files. Access the site at `http://localhost:8000`.

2.  **Netlify Dev (for frontend and backend work):**
    ```bash
    netlify dev
    ```
    This will run the static site and the serverless functions. Access the site at `http://localhost:8888`. This is the recommended method for testing the full functionality, including the checkout process.

### Building for Production

The project includes scripts for minifying CSS and JavaScript assets.

*   **Minify all assets:**
    ```bash
    npm run minify
    ```

*   **Minify JavaScript:**
    ```bash
    npm run minify:js
    ```

*   **Minify CSS:**
    ```bash
    npm run minify:css
    ```

### Testing

There are no automated tests in this project. Testing is performed manually:

*   **Cross-browser testing:** Chrome, Firefox, Safari, Edge.
*   **Performance testing:** Using Google PageSpeed Insights.
*   **Payment testing:** Using Stripe's test mode.

## Development Conventions

### Code Style

*   The codebase uses vanilla JavaScript (ES6+), standard HTML5, and CSS.
*   There is no linter or formatter configured. Please maintain the existing code style.

### File Structure

*   `/`: Root directory contains the main HTML files.
*   `/css/`: Contains the CSS files.
*   `/js/`: Contains the JavaScript files.
*   `/img/`: Contains images.
*   `/market/`: Contains marketplace-specific assets.
*   `/netlify/functions/`: Contains the serverless functions.

### Key Files

*   `index.html`: The main landing page.
*   `marketplace.html`: The main e-commerce page. This file contains the product grid and the client-side logic for handling the checkout process.
*   `netlify/functions/create-checkout-session.js`: The serverless function that creates a Stripe checkout session.
*   `package.json`: Defines the project's dependencies and scripts.
*   `netlify.toml`: The configuration file for Netlify deployments.
*   `README.md`: The main project documentation.
