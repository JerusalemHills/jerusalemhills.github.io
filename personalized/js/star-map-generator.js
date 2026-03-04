/**
 * Star Map Generator — Astronomical calculation pipeline + canvas rendering.
 *
 * Pipeline: Date → Julian Date → Sidereal Time → Equatorial-to-Horizontal
 *           → Stereographic Projection → Canvas render
 *
 * Uses Yale Bright Star Catalog (magnitude ≤ 6.5, ~9000 stars).
 */

const StarMapGenerator = (function () {
  let _catalog = null;

  // ── Constants ──────────────────────────────────────────────
  const DEG = Math.PI / 180;
  const RAD = 180 / Math.PI;

  // Constellation lines — pairs of HR catalog numbers (Bright Star Catalog)
  // Simplified set of major constellations
  const CONSTELLATION_LINES = {
    'Ursa Major': [[4301,4295],[4295,4554],[4554,4660],[4660,4905],[4905,5054],[5054,5191]],
    'Orion': [[1790,1903],[1903,2004],[2004,2061],[2061,1948],[1948,1790],[1903,1852],[2004,2159],[1713,1790],[2061,2135]],
    'Cassiopeia': [[21,168],[168,264],[264,403],[403,542]],
    'Leo': [[3982,4057],[4057,4357],[4357,4534],[4534,3982],[3982,3905],[3905,3773],[3773,3731]],
    'Scorpius': [[6134,6165],[6165,6247],[6247,6553],[6553,6580],[6580,6615],[6615,6553]],
    'Crux': [[4730,4853],[4763,4700]]
  };

  // Style presets
  const STYLES = {
    dark: { bg: '#0d1b2a', star: '#ffffff', text: '#c0c8d4', accent: '#4a7fb5', grid: 'rgba(255,255,255,0.06)' },
    'navy-gold': { bg: '#0a1628', star: '#ffd700', text: '#c9a84c', accent: '#c9a84c', grid: 'rgba(201,168,76,0.08)' },
    light: { bg: '#f5f0e8', star: '#1a1a2e', text: '#555', accent: '#8b7355', grid: 'rgba(0,0,0,0.06)' },
    minimal: { bg: '#ffffff', star: '#333333', text: '#888', accent: '#666', grid: 'rgba(0,0,0,0.04)' }
  };

  // ── Astronomical Calculations ──────────────────────────────

  /** Convert calendar date to Julian Date number. */
  function toJulianDate(year, month, day, hour) {
    if (month <= 2) { year--; month += 12; }
    var A = Math.floor(year / 100);
    var B = 2 - A + Math.floor(A / 4);
    return Math.floor(365.25 * (year + 4716)) +
           Math.floor(30.6001 * (month + 1)) +
           day + (hour || 0) / 24 + B - 1524.5;
  }

  /** Julian Date → Greenwich Mean Sidereal Time (degrees). */
  function greenwichSiderealTime(jd) {
    var T = (jd - 2451545.0) / 36525.0;
    var gmst = 280.46061837 + 360.98564736629 * (jd - 2451545.0) +
               0.000387933 * T * T - T * T * T / 38710000.0;
    return ((gmst % 360) + 360) % 360;
  }

  /** GMST + longitude → Local Sidereal Time (degrees). */
  function localSiderealTime(gmst, longitude) {
    return ((gmst + longitude) % 360 + 360) % 360;
  }

  /**
   * Equatorial (RA/Dec) to Horizontal (Alt/Az) coordinates.
   * @param {number} ra - Right ascension in degrees.
   * @param {number} dec - Declination in degrees.
   * @param {number} lst - Local sidereal time in degrees.
   * @param {number} lat - Observer latitude in degrees.
   * @returns {{alt: number, az: number}} Altitude and azimuth in degrees.
   */
  function equatorialToHorizontal(ra, dec, lst, lat) {
    var ha = (lst - ra) * DEG;
    var decRad = dec * DEG;
    var latRad = lat * DEG;

    var sinAlt = Math.sin(decRad) * Math.sin(latRad) +
                 Math.cos(decRad) * Math.cos(latRad) * Math.cos(ha);
    var alt = Math.asin(sinAlt);

    var cosAz = (Math.sin(decRad) - Math.sin(alt) * Math.sin(latRad)) /
                (Math.cos(alt) * Math.cos(latRad));
    cosAz = Math.max(-1, Math.min(1, cosAz)); // clamp for floating point
    var az = Math.acos(cosAz);

    if (Math.sin(ha) > 0) az = 2 * Math.PI - az;

    return { alt: alt * RAD, az: az * RAD };
  }

  /**
   * Stereographic projection: Alt/Az → 2D canvas coordinates.
   * Projects visible hemisphere onto a circle.
   * @param {number} alt - Altitude in degrees.
   * @param {number} az - Azimuth in degrees.
   * @param {number} cx - Canvas center X.
   * @param {number} cy - Canvas center Y.
   * @param {number} radius - Projection circle radius in pixels.
   * @returns {{x: number, y: number}|null} Canvas coords, or null if below horizon.
   */
  function stereographicProject(alt, az, cx, cy, radius) {
    if (alt < 0) return null; // below horizon
    var r = radius * Math.cos(alt * DEG) / (1 + Math.sin(alt * DEG));
    var x = cx + r * Math.sin(az * DEG);
    var y = cy - r * Math.cos(az * DEG);
    return { x: x, y: y };
  }

  // ── Catalog Loading ────────────────────────────────────────

  /**
   * Load the star catalog JSON.
   * @returns {Promise<Array>}
   */
  async function loadCatalog() {
    if (_catalog) return _catalog;
    var res = await fetch('/personalized/data/star-catalog.json');
    _catalog = await res.json();
    return _catalog;
  }

  // ── Rendering ──────────────────────────────────────────────

  /**
   * Render a star map onto a canvas.
   * @param {HTMLCanvasElement} canvas
   * @param {CanvasRenderingContext2D} ctx
   * @param {Object} opts
   * @param {Date} opts.date - The date/time to render.
   * @param {number} opts.lat - Observer latitude.
   * @param {number} opts.lon - Observer longitude.
   * @param {string} [opts.title] - Title text.
   * @param {string} [opts.subtitle] - Subtitle text.
   * @param {string} [opts.style] - Style preset name.
   * @param {string} [opts.shape] - 'circular' or 'rectangular'.
   * @param {boolean} [opts.showConstellations] - Draw constellation lines.
   * @param {boolean} [opts.showMilkyWay] - Draw Milky Way band.
   */
  function render(canvas, ctx, opts) {
    var W = canvas.width;
    var H = canvas.height;
    var style = STYLES[opts.style] || STYLES.dark;
    var shape = opts.shape || 'circular';

    // Background
    ctx.fillStyle = style.bg;
    ctx.fillRect(0, 0, W, H);

    if (!_catalog || !_catalog.length) {
      ctx.fillStyle = style.text;
      ctx.font = (W * 0.03) + 'px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Loading star catalog...', W / 2, H / 2);
      return;
    }

    var d = opts.date || new Date();
    var year = d.getFullYear(), month = d.getMonth() + 1, day = d.getDate();
    var hour = d.getHours() + d.getMinutes() / 60 + d.getSeconds() / 3600;
    var jd = toJulianDate(year, month, day, hour);
    var gmst = greenwichSiderealTime(jd);
    var lst = localSiderealTime(gmst, opts.lon || 0);
    var lat = opts.lat || 31.78; // default Jerusalem

    // Projection area
    var margin = W * 0.08;
    var textArea = H * 0.12;
    var cx = W / 2;
    var cy = (H - textArea) / 2;
    var radius = Math.min(cx - margin, cy - margin);

    // Clip to shape
    ctx.save();
    if (shape === 'circular') {
      ctx.beginPath();
      ctx.arc(cx, cy, radius + 2, 0, Math.PI * 2);
      ctx.clip();
    }

    // Milky Way (simplified band)
    if (opts.showMilkyWay) {
      var grd = ctx.createLinearGradient(0, cy - radius, W, cy + radius);
      grd.addColorStop(0, 'transparent');
      grd.addColorStop(0.35, style.grid);
      grd.addColorStop(0.5, 'rgba(200,200,255,0.05)');
      grd.addColorStop(0.65, style.grid);
      grd.addColorStop(1, 'transparent');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, W, H);
    }

    // Build HR lookup for constellation lines
    var hrLookup = {};
    for (var i = 0; i < _catalog.length; i++) {
      var s = _catalog[i];
      var pos = equatorialToHorizontal(s.ra, s.dec, lst, lat);
      var proj = pos.alt >= 0 ? stereographicProject(pos.alt, pos.az, cx, cy, radius) : null;
      s._proj = proj;
      if (s.hr) hrLookup[s.hr] = s;
    }

    // Constellation lines
    if (opts.showConstellations) {
      ctx.strokeStyle = 'rgba(255,255,255,0.12)';
      ctx.lineWidth = W * 0.001;
      var constellations = Object.keys(CONSTELLATION_LINES);
      for (var ci = 0; ci < constellations.length; ci++) {
        var lines = CONSTELLATION_LINES[constellations[ci]];
        for (var li = 0; li < lines.length; li++) {
          var a = hrLookup[lines[li][0]];
          var b = hrLookup[lines[li][1]];
          if (a && b && a._proj && b._proj) {
            ctx.beginPath();
            ctx.moveTo(a._proj.x, a._proj.y);
            ctx.lineTo(b._proj.x, b._proj.y);
            ctx.stroke();
          }
        }
      }
    }

    // Stars
    for (var i = 0; i < _catalog.length; i++) {
      var s = _catalog[i];
      if (!s._proj) continue;
      var mag = s.mag;
      var size = Math.max(0.5, (6.5 - mag) / 6.5 * (W * 0.005));
      ctx.beginPath();
      ctx.arc(s._proj.x, s._proj.y, size, 0, Math.PI * 2);
      var alpha = Math.max(0.3, (6.5 - mag) / 6.5);
      ctx.fillStyle = style.star === '#ffffff'
        ? 'rgba(255,255,255,' + alpha + ')'
        : style.star;
      ctx.fill();
    }

    ctx.restore();

    // Circular border
    if (shape === 'circular') {
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.strokeStyle = style.accent;
      ctx.lineWidth = W * 0.002;
      ctx.stroke();
    }

    // Title & subtitle
    var titleY = H - textArea + textArea * 0.4;
    if (opts.title) {
      ctx.fillStyle = style.text;
      ctx.font = '600 ' + (W * 0.035) + 'px "Playfair Display", serif';
      ctx.textAlign = 'center';
      ctx.fillText(opts.title, cx, titleY);
    }
    if (opts.subtitle) {
      ctx.fillStyle = style.accent;
      ctx.font = (W * 0.018) + 'px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(opts.subtitle, cx, titleY + W * 0.04);
    }
  }

  return {
    loadCatalog: loadCatalog,
    render: render,
    toJulianDate: toJulianDate,
    greenwichSiderealTime: greenwichSiderealTime,
    localSiderealTime: localSiderealTime,
    equatorialToHorizontal: equatorialToHorizontal,
    stereographicProject: stereographicProject,
    STYLES: STYLES
  };
})();

if (typeof module !== 'undefined') module.exports = StarMapGenerator;
