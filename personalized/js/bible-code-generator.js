/**
 * Bible Code Name Art Generator
 *
 * Simplified ELS search + matrix rendering, ported from bible-codes.github.io.
 * Single-term search, fixed skip range ±500.
 */

const BibleCodeGenerator = (function () {
  let _torah = null;
  let _transliteration = null;

  // ── Data Loading ───────────────────────────────────────────

  async function loadTorah() {
    if (_torah) return _torah;
    var res = await fetch('/personalized/data/torahNoSpaces.txt');
    _torah = await res.text();
    _torah = _torah.trim();
    return _torah;
  }

  async function loadTransliteration() {
    if (_transliteration) return _transliteration;
    var res = await fetch('/personalized/data/transliteration.json');
    _transliteration = await res.json();
    return _transliteration;
  }

  async function init() {
    await Promise.all([loadTorah(), loadTransliteration()]);
  }

  // ── Transliteration ───────────────────────────────────────

  /** Map of English phonemes to Hebrew characters. */
  var PHONEME_MAP = [
    ['sh', 'ש'], ['ch', 'כ'], ['kh', 'כ'], ['tz', 'צ'], ['ts', 'צ'],
    ['th', 'ת'], ['ph', 'פ'], ['zh', 'ז'],
    ['a', 'א'], ['b', 'ב'], ['c', 'כ'], ['d', 'ד'], ['e', 'א'],
    ['f', 'פ'], ['g', 'ג'], ['h', 'ה'], ['i', 'י'], ['j', 'ג'],
    ['k', 'כ'], ['l', 'ל'], ['m', 'מ'], ['n', 'נ'], ['o', 'א'],
    ['p', 'פ'], ['q', 'ק'], ['r', 'ר'], ['s', 'ס'], ['t', 'ת'],
    ['u', 'א'], ['v', 'ו'], ['w', 'ו'], ['x', 'קס'], ['y', 'י'],
    ['z', 'ז']
  ];

  /**
   * Transliterate an English name to Hebrew.
   * First checks the lookup table, then falls back to phoneme mapping.
   */
  function transliterate(name) {
    if (!name) return '';

    // Check dictionary first
    if (_transliteration) {
      // Try exact match
      var key = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
      if (_transliteration[key]) return _transliteration[key];
      // Try case-insensitive
      var keys = Object.keys(_transliteration);
      for (var i = 0; i < keys.length; i++) {
        if (keys[i].toLowerCase() === name.toLowerCase()) return _transliteration[keys[i]];
      }
    }

    // Phoneme-based fallback
    var lower = name.toLowerCase().replace(/[^a-z]/g, '');
    var result = '';
    var pos = 0;
    while (pos < lower.length) {
      var matched = false;
      // Try 2-char phonemes first
      if (pos + 1 < lower.length) {
        var digraph = lower.substring(pos, pos + 2);
        for (var j = 0; j < PHONEME_MAP.length; j++) {
          if (PHONEME_MAP[j][0] === digraph) {
            result += PHONEME_MAP[j][1];
            pos += 2;
            matched = true;
            break;
          }
        }
      }
      if (!matched) {
        var ch = lower[pos];
        for (var j = 0; j < PHONEME_MAP.length; j++) {
          if (PHONEME_MAP[j][0] === ch) {
            result += PHONEME_MAP[j][1];
            matched = true;
            break;
          }
        }
        pos++;
      }
    }
    return result;
  }

  /**
   * Generate alternate transliterations to try if first search fails.
   */
  function getAlternates(name) {
    var alts = [];
    var base = name.toLowerCase();
    // Common English name alternate spellings
    var subs = [
      [/^j/, 'y'], [/ph/, 'f'], [/ck/, 'k'], [/ee/, 'i'],
      [/oo/, 'u'], [/th$/, 't'], [/ah$/, 'a'], [/ey$/, 'i'],
      [/ie$/, 'i'], [/y$/, 'i']
    ];
    subs.forEach(function (sub) {
      var alt = base.replace(sub[0], sub[1]);
      if (alt !== base) alts.push(alt);
    });
    // Shortened form
    if (base.length > 3) alts.push(base.substring(0, Math.ceil(base.length * 0.7)));
    return alts;
  }

  // ── ELS Search ─────────────────────────────────────────────

  /**
   * Search for a Hebrew term in the Torah using ELS.
   * @param {string} term - Hebrew search term.
   * @param {number} maxSkip - Maximum absolute skip value (default 500).
   * @returns {{position: number, skip: number}|null} Best result or null.
   */
  function searchELS(term, maxSkip) {
    if (!_torah || !term) return null;
    maxSkip = maxSkip || 500;
    var textLen = _torah.length;
    var termLen = term.length;
    if (termLen < 2) return null;

    var bestResult = null;
    var bestAbsSkip = Infinity;

    // Search both directions: positive and negative skips
    for (var skip = -maxSkip; skip <= maxSkip; skip++) {
      if (skip === 0) continue;

      var absSkip = Math.abs(skip);
      // If we already found a better (smaller) skip, don't bother with larger ones
      // But keep searching all skips to find the smallest
      var span = (termLen - 1) * absSkip;

      for (var start = 0; start < textLen; start++) {
        // Check if the sequence fits within text bounds
        var end = start + (termLen - 1) * skip;
        if (end < 0 || end >= textLen) continue;

        // Check each character
        var found = true;
        for (var c = 0; c < termLen; c++) {
          var pos = start + c * skip;
          if (pos < 0 || pos >= textLen || _torah[pos] !== term[c]) {
            found = false;
            break;
          }
        }

        if (found && absSkip < bestAbsSkip) {
          bestResult = { position: start, skip: skip };
          bestAbsSkip = absSkip;
          // If we found skip ±1 (open text), that's the best possible
          if (absSkip === 1) return bestResult;
        }
      }
    }

    return bestResult;
  }

  // ── Matrix Generation ──────────────────────────────────────

  /**
   * Generate a matrix grid around a found ELS result.
   * @param {{position: number, skip: number}} result - ELS search result.
   * @param {string} term - The search term.
   * @param {number} [contextCols] - Context columns on each side (default 5).
   * @returns {{grid: string[][], highlights: {row:number, col:number}[], width: number, height: number}}
   */
  function generateMatrix(result, term, contextCols) {
    contextCols = contextCols || 5;
    var skip = result.skip;
    var absSkip = Math.abs(skip);
    var termLen = term.length;

    // Matrix width = |skip| (so the term reads vertically)
    // But if skip is very large, cap the width
    var width = Math.min(absSkip, 30);
    if (absSkip <= 1) width = termLen + contextCols * 2; // For open text, show horizontal

    var height = termLen + contextCols * 2;

    // Find start of matrix region
    var firstTermPos = result.position;
    var lastTermPos = result.position + (termLen - 1) * skip;
    var minPos = Math.min(firstTermPos, lastTermPos);

    // Offset to center the term
    var matrixStart;
    if (absSkip <= 1) {
      // Open text: term reads horizontally
      matrixStart = firstTermPos - contextCols;
      height = 1 + contextCols * 2;
    } else if (absSkip <= 30) {
      // Term reads vertically when width = |skip|
      width = absSkip;
      var termCol = firstTermPos % width;
      var termRowStart = Math.floor(firstTermPos / width) - contextCols;
      matrixStart = termRowStart * width;
    } else {
      // Large skip: use skip as width, fewer context rows
      width = absSkip;
      matrixStart = minPos - contextCols * width;
      height = termLen + contextCols * 2;
    }

    if (matrixStart < 0) matrixStart = 0;

    // Build grid
    var grid = [];
    var highlights = [];
    for (var r = 0; r < height; r++) {
      var row = [];
      for (var c = 0; c < width; c++) {
        var pos = matrixStart + r * width + c;
        if (pos >= 0 && pos < _torah.length) {
          row.push(_torah[pos]);
        } else {
          row.push(' ');
        }
      }
      grid.push(row);
    }

    // Mark term positions as highlights
    for (var t = 0; t < termLen; t++) {
      var pos = result.position + t * skip;
      var relPos = pos - matrixStart;
      var r = Math.floor(relPos / width);
      var c = relPos % width;
      if (r >= 0 && r < height && c >= 0 && c < width) {
        highlights.push({ row: r, col: c });
      }
    }

    return { grid: grid, highlights: highlights, width: width, height: height };
  }

  // ── Canvas Rendering ───────────────────────────────────────

  /**
   * Render the ELS matrix onto a canvas.
   * @param {HTMLCanvasElement} canvas
   * @param {CanvasRenderingContext2D} ctx
   * @param {Object} opts
   * @param {string} opts.name - The original name searched.
   * @param {string} opts.hebrewName - The Hebrew form of the name.
   * @param {{position:number, skip:number}} opts.result - ELS result.
   * @param {string} [opts.bgColor] - Background color.
   */
  function render(canvas, ctx, opts) {
    var W = canvas.width;
    var H = canvas.height;
    var bgColor = opts.bgColor || '#1a1a2e';

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, W, H);

    if (!opts.result) {
      // "Not found" state
      ctx.fillStyle = '#c0c8d4';
      ctx.font = (W * 0.03) + 'px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Enter a name to search', W / 2, H / 2);
      return;
    }

    var matrix = generateMatrix(opts.result, opts.hebrewName);
    var grid = matrix.grid;
    var highlights = matrix.highlights;
    var cols = matrix.width;
    var rows = matrix.height;

    // Calculate cell size to fit canvas
    var padding = W * 0.06;
    var headerH = H * 0.1;
    var footerH = H * 0.08;
    var availW = W - padding * 2;
    var availH = H - headerH - footerH - padding;
    var cellW = Math.min(availW / cols, availH / rows, W * 0.04);
    var cellH = cellW;

    // Center the grid
    var gridW = cols * cellW;
    var gridH = rows * cellH;
    var startX = (W - gridW) / 2;
    var startY = headerH + (availH - gridH) / 2;

    // Build highlight lookup
    var hlSet = {};
    highlights.forEach(function (h) { hlSet[h.row + ',' + h.col] = true; });

    // Draw cells
    var fontSize = cellW * 0.6;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        var x = startX + c * cellW;
        var y = startY + r * cellH;
        var isHL = hlSet[r + ',' + c];

        if (isHL) {
          ctx.fillStyle = 'rgba(255, 193, 7, 0.25)';
          ctx.fillRect(x, y, cellW, cellH);
        }

        // Grid lines
        ctx.strokeStyle = 'rgba(255,255,255,0.06)';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(x, y, cellW, cellH);

        // Character
        ctx.fillStyle = isHL ? '#ffc107' : 'rgba(200,200,220,0.6)';
        ctx.font = (isHL ? 'bold ' : '') + fontSize + 'px serif';
        ctx.fillText(grid[r][c], x + cellW / 2, y + cellH / 2);
      }
    }

    // Header: name
    ctx.fillStyle = '#ffc107';
    ctx.font = 'bold ' + (W * 0.04) + 'px "Playfair Display", serif';
    ctx.textAlign = 'center';
    ctx.fillText(opts.hebrewName + '  —  ' + opts.name, W / 2, headerH * 0.5);

    // Footer: skip info
    ctx.fillStyle = 'rgba(200,200,220,0.5)';
    ctx.font = (W * 0.018) + 'px sans-serif';
    ctx.fillText(
      'ELS skip: ' + opts.result.skip + '  |  Position: ' + opts.result.position +
      '  |  jerusalemhills.com',
      W / 2, H - footerH * 0.4
    );
  }

  // ── Public API ─────────────────────────────────────────────

  /**
   * Full search pipeline: name → transliterate → search → result.
   * @param {string} name - English or Hebrew name.
   * @returns {{result: Object|null, hebrewName: string, tried: string[]}}
   */
  function search(name) {
    var isHebrew = /[\u0590-\u05FF]/.test(name);
    var hebrewName = isHebrew ? name : transliterate(name);
    var tried = [hebrewName];

    // Try primary transliteration
    var result = searchELS(hebrewName);
    if (result) return { result: result, hebrewName: hebrewName, tried: tried };

    // Try alternates if English input
    if (!isHebrew) {
      var alts = getAlternates(name);
      for (var i = 0; i < alts.length; i++) {
        var altHebrew = transliterate(alts[i]);
        if (altHebrew === hebrewName) continue;
        tried.push(altHebrew);
        result = searchELS(altHebrew);
        if (result) return { result: result, hebrewName: altHebrew, tried: tried };
      }
    }

    return { result: null, hebrewName: hebrewName, tried: tried };
  }

  return {
    init: init,
    transliterate: transliterate,
    search: search,
    searchELS: searchELS,
    generateMatrix: generateMatrix,
    render: render
  };
})();

if (typeof module !== 'undefined') module.exports = BibleCodeGenerator;
