/**
 * Shared checkout module for personalized products.
 * Handles Stripe payment flow for digital and physical orders.
 */

const PersonalizedCheckout = (function () {
  const CHECKOUT_URL = 'https://jerusalemhills.netlify.app/.netlify/functions/create-checkout-session';

  /**
   * Start a Stripe checkout session for a personalized product.
   * @param {Object} opts
   * @param {string} opts.productType - e.g. 'star-map', 'bible-code', 'hebrew-name'
   * @param {string} opts.productName - Display name for Stripe
   * @param {number} opts.amount - Price in cents
   * @param {string} opts.fulfillmentMethod - 'digital' or 'physical'
   * @param {Object} opts.customization - All user inputs (date, location, name, style, etc.)
   * @param {string} [opts.size] - Physical size, e.g. '8x10', '12x16'
   * @returns {Promise<void>} Redirects to Stripe Checkout on success.
   */
  async function startCheckout(opts) {
    const btn = document.querySelector('.btn-buy');
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Processing...';
    }

    try {
      const res = await fetch(CHECKOUT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: opts.productName,
          amount: opts.amount,
          metadata: {
            productType: opts.productType,
            fulfillmentMethod: opts.fulfillmentMethod,
            size: opts.size || null,
            customization: JSON.stringify(opts.customization)
          }
        })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Checkout failed');
      }

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      if (btn) {
        btn.disabled = false;
        btn.textContent = 'Buy Now';
      }
      alert('Sorry, checkout failed. Please try again.\n' + err.message);
    }
  }

  /**
   * Bind purchase option selectors (digital/physical radio buttons).
   * Call from product page init.
   */
  function bindPurchaseOptions() {
    document.querySelectorAll('.purchase-option').forEach(function (opt) {
      opt.addEventListener('click', function () {
        document.querySelectorAll('.purchase-option').forEach(function (o) {
          o.classList.remove('selected');
        });
        opt.classList.add('selected');
        var radio = opt.querySelector('input[type="radio"]');
        if (radio) radio.checked = true;
      });
    });
  }

  return { startCheckout, bindPurchaseOptions };
})();

if (typeof module !== 'undefined') module.exports = PersonalizedCheckout;
