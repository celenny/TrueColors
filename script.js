// Helper functions to convert between color spaces
function rgbToCmyk(r, g, b) {
  const rP = r / 255;
  const gP = g / 255;
  const bP = b / 255;

  const k = 1 - Math.max(rP, gP, bP);
  const c = (1 - rP - k) / (1 - k) || 0;
  const m = (1 - gP - k) / (1 - k) || 0;
  const y = (1 - bP - k) / (1 - k) || 0;

  return [c.toFixed(2), m.toFixed(2), y.toFixed(2), k.toFixed(2)];
}

function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) {
      h = s = 0; // achromatic
  } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function rgbToHsv(r, g, b) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const v = max;
  const delta = max - min;
  const s = max === 0 ? 0 : delta / max;
  let h;
  if (max === min) {
      h = 0;
  } else {
      switch (max) {
          case r: h = (g - b) / delta + (g < b ? 6 : 0); break;
          case g: h = (b - r) / delta + 2; break;
          case b: h = (r - g) / delta + 4; break;
      }
      h /= 6;
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(v / 255 * 100)];
}

function hexToRgb(hex) {
  const bigint = parseInt(hex.replace('#', ''), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return [r, g, b];
}

function cmykToRgb(c, m, y, k) {
  const r = 255 * (1 - c) * (1 - k);
  const g = 255 * (1 - m) * (1 - k);
  const b = 255 * (1 - y) * (1 - k);
  return [Math.round(r), Math.round(g), Math.round(b)];
}

function hslToRgb(h, s, l) {
  h /= 360;
  s /= 100;
  l /= 100;
  let r, g, b;

  if (s === 0) {
      r = g = b = l; // achromatic
  } else {
      const hue2rgb = (p, q, t) => {
          if (t < 0) t += 1;
          if (t > 1) t -= 1;
          if (t < 1 / 6) return p + (q - p) * 6 * t;
          if (t < 1 / 2) return q;
          if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
          return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function hsvToRgb(h, s, v) {
  h /= 360;
  s /= 100;
  v /= 100;
  let r, g, b;

  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);

  switch (i % 6) {
      case 0: r = v; g = t; b = p; break;
      case 1: r = q; g = v; b = p; break;
      case 2: r = p; g = v; b = t; break;
      case 3: r = p; g = q; b = v; break;
      case 4: r = t; g = p; b = v; break;
      case 5: r = v; g = p; b = q; break;
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function updateUI(rgb) {
  const [r, g, b] = rgb;
  document.getElementById('rgb').value = `${r}, ${g}, ${b}`;
  const [c, m, y, k] = rgbToCmyk(r, g, b);
  document.getElementById('cmyk').value = `${c}, ${m}, ${y}, ${k}`;
  const [hHsl, sHsl, lHsl] = rgbToHsl(r, g, b);
  document.getElementById('hsl').value = `${hHsl}, ${sHsl}%, ${lHsl}%`;
  const [hHsv, sHsv, vHsv] = rgbToHsv(r, g, b);
  document.getElementById('hsv').value = `${hHsv}, ${sHsv}%, ${vHsv}%`;
  document.getElementById('hex').value = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  document.getElementById('pageBody').style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
}

document.getElementById('rgb').addEventListener('input', function (e) {
  const rgb = e.target.value.split(',').map(Number);
  if (rgb.length === 3) updateUI(rgb);
});

document.getElementById('hex').addEventListener('input', function (e) {
  const hex = e.target.value;
  if (hex.length === 7) updateUI(hexToRgb(hex));
});

document.getElementById('cmyk').addEventListener('input', function (e) {
  const cmyk = e.target.value.split(',').map(Number);
  if (cmyk.length === 4) updateUI(cmykToRgb(...cmyk));
});

document.getElementById('hsl').addEventListener('input', function (e) {
  const hsl = e.target.value.split(',').map(value => value.trim().replace('%', '')).map(Number);
  if (hsl.length === 3) updateUI(hslToRgb(...hsl));
});

document.getElementById('hsv').addEventListener('input', function (e) {
  const hsv = e.target.value.split(',').map(value => value.trim().replace('%', '')).map(Number);
  if (hsv.length === 3) updateUI(hsvToRgb(...hsv));
});