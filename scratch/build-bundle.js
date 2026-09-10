const fs = require('fs');

function minifyCSS(css) {
    return css
        // Remove comments
        .replace(/\/\*[\s\S]*?\*\//g, '')
        // Normalize whitespace
        .replace(/\s+/g, ' ')
        // Remove spaces around special chars
        .replace(/\s*([{}:;,>+~])\s*/g, '$1')
        // Remove spaces before !important
        .replace(/\s*(!important)/g, '$1')
        // Remove trailing semicolons before closing brace
        .replace(/;}/g, '}')
        // Trim leading/trailing whitespace
        .trim();
}

const styleCSS = fs.readFileSync('css/style.css', 'utf8');
const responsiveCSS = fs.readFileSync('css/responsive.css', 'utf8');

const combined = styleCSS + '\n' + responsiveCSS;
const minified = minifyCSS(combined);

fs.writeFileSync('css/bundle.min.css', minified, 'utf8');
console.log('Successfully built css/bundle.min.css! Length:', minified.length);
