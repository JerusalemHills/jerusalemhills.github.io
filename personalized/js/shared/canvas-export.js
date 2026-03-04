/**
 * Shared canvas export module for personalized products.
 * Handles high-res PNG export for digital delivery and print fulfillment.
 */

const CanvasExport = (function () {
  /**
   * Re-render the product at a specific DPI and return as a data URL.
   * @param {Function} renderFn - Called with (canvas, ctx) to draw the product.
   * @param {Object} opts
   * @param {number} opts.widthInches - Output width in inches (default 8).
   * @param {number} opts.heightInches - Output height in inches (default 10).
   * @param {number} opts.dpi - Dots per inch (300 for print, 150 for digital).
   * @param {string} [opts.format] - 'image/png' (default) or 'image/jpeg'.
   * @param {number} [opts.quality] - JPEG quality 0-1 (ignored for PNG).
   * @returns {string} Data URL of the rendered image.
   */
  function exportToDataURL(renderFn, opts) {
    const dpi = opts.dpi || 150;
    const w = (opts.widthInches || 8) * dpi;
    const h = (opts.heightInches || 10) * dpi;
    const format = opts.format || 'image/png';

    const offscreen = document.createElement('canvas');
    offscreen.width = w;
    offscreen.height = h;
    const ctx = offscreen.getContext('2d');
    renderFn(offscreen, ctx);
    return offscreen.toDataURL(format, opts.quality);
  }

  /**
   * Trigger a browser download of the rendered image.
   * @param {Function} renderFn - Render function.
   * @param {Object} opts - Same as exportToDataURL.
   * @param {string} filename - Download filename.
   */
  function download(renderFn, opts, filename) {
    const dataURL = exportToDataURL(renderFn, opts);
    const a = document.createElement('a');
    a.href = dataURL;
    a.download = filename || 'jerusalem-hills-product.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  /**
   * Convert a data URL to a Blob for upload.
   * @param {string} dataURL
   * @returns {Blob}
   */
  function dataURLtoBlob(dataURL) {
    const parts = dataURL.split(',');
    const mime = parts[0].match(/:(.*?);/)[1];
    const raw = atob(parts[1]);
    const arr = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
    return new Blob([arr], { type: mime });
  }

  return { exportToDataURL, download, dataURLtoBlob };
})();

if (typeof module !== 'undefined') module.exports = CanvasExport;
