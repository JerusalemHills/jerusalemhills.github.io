/**
 * Shared live preview module for personalized products.
 * Handles debounced re-rendering and responsive canvas sizing.
 */

const PreviewManager = (function () {
  let _canvas = null;
  let _renderFn = null;
  let _debounceTimer = null;
  const DEBOUNCE_MS = 300;

  /**
   * Initialize the preview manager.
   * @param {HTMLCanvasElement} canvas - The preview canvas element.
   * @param {Function} renderFn - Called with (canvas, ctx) to draw the preview.
   */
  function init(canvas, renderFn) {
    _canvas = canvas;
    _renderFn = renderFn;
    _sizeCanvas();
    window.addEventListener('resize', _onResize);
    render();
  }

  /** Immediately render the preview. */
  function render() {
    if (!_canvas || !_renderFn) return;
    const ctx = _canvas.getContext('2d');
    _renderFn(_canvas, ctx);
  }

  /** Schedule a debounced render (call from input event listeners). */
  function scheduleRender() {
    clearTimeout(_debounceTimer);
    _debounceTimer = setTimeout(render, DEBOUNCE_MS);
  }

  /** Size canvas to container width while keeping a fixed aspect ratio. */
  function _sizeCanvas() {
    if (!_canvas) return;
    const wrap = _canvas.parentElement;
    if (!wrap) return;
    const w = wrap.clientWidth;
    // Default aspect ratio 1:1; products can override via canvas attributes
    const ratio = parseFloat(_canvas.dataset.aspectRatio) || 1;
    _canvas.width = w * window.devicePixelRatio;
    _canvas.height = (w / ratio) * window.devicePixelRatio;
    _canvas.style.width = w + 'px';
    _canvas.style.height = (w / ratio) + 'px';
  }

  function _onResize() {
    _sizeCanvas();
    render();
  }

  /** Clean up event listeners. */
  function destroy() {
    window.removeEventListener('resize', _onResize);
    clearTimeout(_debounceTimer);
    _canvas = null;
    _renderFn = null;
  }

  return { init, render, scheduleRender, destroy };
})();

if (typeof module !== 'undefined') module.exports = PreviewManager;
