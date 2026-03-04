/**
 * Hebrew Name Art Generator
 *
 * Transliterates English names to Hebrew and renders stylized calligraphy
 * with decorative elements.
 */

const HebrewNameGenerator = (function () {
  let _transliteration = null;

  // Style presets
  var STYLES = {
    classic: {
      name: 'Classic',
      bg: '#0a1628',
      textColor: '#c9a84c',
      subtitleColor: 'rgba(201,168,76,0.7)',
      decorColor: 'rgba(201,168,76,0.3)',
      font: '"Frank Ruhl Libre", serif'
    },
    modern: {
      name: 'Modern',
      bg: '#ffffff',
      textColor: '#1a1a2e',
      subtitleColor: '#888',
      decorColor: 'rgba(0,0,0,0.08)',
      font: '"Noto Serif Hebrew", serif'
    },
    watercolor: {
      name: 'Watercolor',
      bg: '#fdf6f0',
      textColor: '#5b4a6b',
      subtitleColor: '#8b7a9b',
      decorColor: 'rgba(180,140,200,0.2)',
      font: '"Amatic SC", cursive'
    },
    jerusalem: {
      name: 'Jerusalem Stone',
      bg: '#f5ebe0',
      textColor: '#6b4e37',
      subtitleColor: '#8b7355',
      decorColor: 'rgba(107,78,55,0.15)',
      font: '"Frank Ruhl Libre", serif'
    }
  };

  // ── Data Loading ───────────────────────────────────────────

  async function loadTransliteration() {
    if (_transliteration) return _transliteration;
    var res = await fetch('/personalized/data/transliteration.json');
    _transliteration = await res.json();
    return _transliteration;
  }

  async function init() {
    await loadTransliteration();
  }

  // ── Transliteration (reuses BibleCodeGenerator's logic) ───

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

  function transliterate(name) {
    if (!name) return '';
    if (_transliteration) {
      var key = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
      if (_transliteration[key]) return _transliteration[key];
      var keys = Object.keys(_transliteration);
      for (var i = 0; i < keys.length; i++) {
        if (keys[i].toLowerCase() === name.toLowerCase()) return _transliteration[keys[i]];
      }
    }
    var lower = name.toLowerCase().replace(/[^a-z]/g, '');
    var result = '';
    var pos = 0;
    while (pos < lower.length) {
      var matched = false;
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

  // ── Decorative Drawing ─────────────────────────────────────

  function drawPomegranate(ctx, x, y, size, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
    // Crown
    for (var i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(x + i * size * 0.3, y - size);
      ctx.lineTo(x + i * size * 0.15, y - size * 1.5);
      ctx.lineWidth = size * 0.1;
      ctx.strokeStyle = color;
      ctx.stroke();
    }
  }

  function drawOliveBranch(ctx, x, y, length, angle, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    // Stem
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(length * 0.3, -length * 0.1, length, 0);
    ctx.stroke();
    // Leaves
    ctx.fillStyle = color;
    for (var i = 0; i < 5; i++) {
      var lx = length * (0.2 + i * 0.15);
      var ly = (i % 2 === 0 ? -1 : 1) * 8;
      ctx.beginPath();
      ctx.ellipse(lx, ly, 8, 4, (i % 2 === 0 ? -0.3 : 0.3), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // ── Rendering ──────────────────────────────────────────────

  function render(canvas, ctx, opts) {
    var W = canvas.width;
    var H = canvas.height;
    var styleName = opts.style || 'classic';
    var style = STYLES[styleName] || STYLES.classic;
    var name = opts.name || '';
    var isHebrew = /[\u0590-\u05FF]/.test(name);
    var hebrewName = isHebrew ? name : transliterate(name);

    // Background
    ctx.fillStyle = style.bg;
    ctx.fillRect(0, 0, W, H);

    if (!hebrewName) {
      ctx.fillStyle = style.subtitleColor;
      ctx.font = (W * 0.03) + 'px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Enter a name to preview', W / 2, H / 2);
      return;
    }

    // Decorative elements
    var decorSize = W * 0.015;

    // Top olive branches
    drawOliveBranch(ctx, W * 0.15, H * 0.2, W * 0.15, -0.2, style.decorColor);
    drawOliveBranch(ctx, W * 0.85, H * 0.2, -W * 0.15, 0.2, style.decorColor);

    // Bottom pomegranates
    drawPomegranate(ctx, W * 0.35, H * 0.78, decorSize, style.decorColor);
    drawPomegranate(ctx, W * 0.5, H * 0.8, decorSize * 1.2, style.decorColor);
    drawPomegranate(ctx, W * 0.65, H * 0.78, decorSize, style.decorColor);

    // Decorative line
    ctx.strokeStyle = style.decorColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(W * 0.2, H * 0.35);
    ctx.lineTo(W * 0.8, H * 0.35);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(W * 0.2, H * 0.65);
    ctx.lineTo(W * 0.8, H * 0.65);
    ctx.stroke();

    // Hebrew name — large centered
    var fontSize = W * 0.12;
    // Adjust for long names
    if (hebrewName.length > 5) fontSize = W * 0.09;
    if (hebrewName.length > 8) fontSize = W * 0.07;

    ctx.fillStyle = style.textColor;
    ctx.font = 'bold ' + fontSize + 'px ' + style.font;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(hebrewName, W / 2, H * 0.5);

    // English name below
    if (!isHebrew && name) {
      ctx.fillStyle = style.subtitleColor;
      ctx.font = (W * 0.028) + 'px sans-serif';
      ctx.fillText(name, W / 2, H * 0.58);
    }

    // Bottom attribution
    ctx.fillStyle = style.decorColor;
    ctx.font = (W * 0.015) + 'px sans-serif';
    ctx.fillText('jerusalemhills.com', W / 2, H * 0.93);
  }

  return {
    init: init,
    render: render,
    transliterate: transliterate,
    STYLES: STYLES
  };
})();

if (typeof module !== 'undefined') module.exports = HebrewNameGenerator;
