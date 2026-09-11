const fs = require('fs');

const style = fs.readFileSync('css/style.css', 'utf8');
const resp = fs.readFileSync('css/responsive.css', 'utf8');
const raw = style + '\n' + resp;

// Safe minification
let min = raw
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/\r?\n/g, ' ')
  .replace(/\s+/g, ' ')
  .replace(/\s*([\{\}\:\;\,])\s*/g, '$1')
  .replace(/;\}/g, '}')
  .trim();

fs.writeFileSync('css/bundle.min.css', min, 'utf8');
console.log('Successfully recompiled bundle.min.css');
console.log('Length:', min.length);
console.log('Sample:', min.substring(0, 120));
console.log('Opens { count:', min.split('{').length - 1);
console.log('Closes } count:', min.split('}').length - 1);
