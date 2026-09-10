const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const navStart = html.indexOf('<header class="main-nav-wrapper">');
const navEnd = html.indexOf('</header>');
console.log(html.substring(navStart, navEnd + 9));
