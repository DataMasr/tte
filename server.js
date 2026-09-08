const http = require('http');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const PORT = process.env.PORT || 3000;

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.sql': 'text/plain; charset=utf-8'
};

const COMPRESSIBLE = new Set(['.html', '.css', '.js', '.json', '.svg', '.sql']);

const server = http.createServer((req, res) => {
    let cleanUrl = req.url.split('?')[0];
    if (cleanUrl === '/') cleanUrl = '/index.html';

    let filePath = path.join(__dirname, cleanUrl);

    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
            res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end('404 Not Found');
            return;
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';
        const headers = {
            'Content-Type': contentType,
            'Access-Control-Allow-Origin': '*'
        };

        if (['.webp', '.png', '.jpg', '.jpeg', '.svg'].includes(ext)) {
            headers['Cache-Control'] = 'public, max-age=31536000, immutable';
        } else if (['.css', '.js'].includes(ext)) {
            headers['Cache-Control'] = 'public, max-age=86400';
        }

        const acceptEncoding = req.headers['accept-encoding'] || '';
        const shouldGzip = COMPRESSIBLE.has(ext) && acceptEncoding.includes('gzip');

        if (shouldGzip) {
            headers['Content-Encoding'] = 'gzip';
            res.writeHead(200, headers);
            fs.createReadStream(filePath).pipe(zlib.createGzip()).pipe(res);
        } else {
            res.writeHead(200, headers);
            fs.createReadStream(filePath).pipe(res);
        }
    });
});

server.listen(PORT, () => {
    console.log(`🚀 Na2la Pro server running at http://localhost:${PORT}`);
    console.log(`👉 Admin Dashboard available at http://localhost:${PORT}/admin.html`);
});
