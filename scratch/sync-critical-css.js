const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// Find critical css
const match = html.match(/<style id="critical-css">([\s\S]*?)<\/style>/);
if (!match) {
    console.error('critical-css not found!');
    process.exit(1);
}

let crit = match[1];

// Update navbar in critical css
crit = crit.replace(
    /padding:10px 24px;display:flex;align-items:center;justify-content:space-between;gap:20px;/g,
    'padding:8px 18px;display:flex;align-items:center;justify-content:space-between;gap:12px;'
);

crit = crit.replace(
    /\.logo-name\{font-family:var\(--font-heading\);font-size:21px;font-weight:900;color:var\(--text-pure\);letter-spacing:-0\.5px\}/g,
    '.logo-name{font-family:var(--font-heading);font-size:20px;font-weight:900;color:var(--text-pure);letter-spacing:-0.5px}.logo-name-ar{font-family:var(--font-heading);font-size:14px;font-weight:800;color:#1D4ED8}'
);

crit = crit.replace(
    /\.nav-menu\{display:flex;align-items:center;gap:4px;list-style:none;padding:0;margin:0\}\.nav-menu a\{color:var\(--text-secondary\);text-decoration:none !important;font-size:14\.5px;font-weight:600;transition:var\(--transition\);padding:8px 16px;/g,
    '.nav-menu{display:flex;align-items:center;gap:2px;list-style:none;padding:0;margin:0}.nav-menu a{color:var(--text-secondary);text-decoration:none !important;font-size:13.5px;font-weight:700;transition:var(--transition);padding:6px 11px;'
);

crit = crit.replace(
    /\.nav-cta-group\{display:flex;align-items:center;gap:12px;flex-shrink:0\}/g,
    '.nav-cta-group{display:flex;align-items:center;gap:8px;flex-shrink:0}'
);

crit = crit.replace(
    /\.btn-nav-call\{display:flex;align-items:center;gap:8px;background:#ECFDF5;border:1px solid #A7F3D0;color:#059669;padding:8px 16px;border-radius:999px;font-size:13\.5px;/g,
    '.btn-nav-call{display:flex;align-items:center;gap:6px;background:#ECFDF5;border:1px solid #A7F3D0;color:#059669;padding:7px 12px;border-radius:999px;font-size:12.5px;'
);

crit = crit.replace(
    /\.btn-nav-book\{display:flex;align-items:center;gap:8px;background:linear-gradient\(135deg,#2563EB 0%,#1D4ED8 100%\);color:#FFFFFF;padding:9px 20px;border-radius:999px;font-size:13\.5px;/g,
    '.btn-nav-book{display:flex;align-items:center;gap:6px;background:linear-gradient(135deg,#2563EB 0%,#1D4ED8 100%);color:#FFFFFF;padding:8px 16px;border-radius:999px;font-size:13px;'
);

html = html.replace(/<style id="critical-css">[\s\S]*?<\/style>/, `<style id="critical-css">${crit}</style>`);

fs.writeFileSync('index.html', html, 'utf8');
console.log('critical-css updated successfully! has logo-name-ar:', crit.includes('logo-name-ar'));
