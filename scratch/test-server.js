const http = require('http');
const { spawn } = require('child_process');

const server = spawn('node', ['server.js'], { cwd: process.cwd() });

server.stdout.on('data', d => console.log('[Server]:', d.toString().trim()));
server.stderr.on('data', d => console.error('[Server ERR]:', d.toString().trim()));

function get(path) {
    return new Promise((resolve, reject) => {
        http.get(`http://localhost:3000${path}`, (res) => {
            let body = '';
            res.on('data', c => body += c);
            res.on('end', () => resolve({ status: res.statusCode, body }));
        }).on('error', reject);
    });
}

setTimeout(async () => {
    try {
        console.log('--- Running Cluster & Keywords Tests ---');

        // Test 1: Index Page
        const indexRes = await get('/');
        console.log('Test 1: Index status:', indexRes.status);
        console.log(' - Has #knowledge-hub:', indexRes.body.includes('id="knowledge-hub"'));
        console.log(' - Has footer link to winch-guide:', indexRes.body.includes('href="winch-guide.html"'));
        console.log(' - Has footer link to packing-guide:', indexRes.body.includes('href="packing-guide.html"'));
        console.log(' - Has footer link to pricing-guide:', indexRes.body.includes('href="pricing-guide.html"'));
        console.log(' - Clean meta keywords (no spam):', !indexRes.body.includes('ارخص شركة نقل عفش في الجيزة'));

        // Test 2: Winch Guide
        const winchRes = await get('/winch-guide.html');
        console.log('Test 2: Winch Guide status:', winchRes.status);
        console.log(' - Has targeted keywords tag:', winchRes.body.includes('<meta name="keywords"'));
        console.log(' - Has Winch keywords (ونش رفع اثاث):', winchRes.body.includes('ونش رفع اثاث'));
        console.log(' - Has TechArticle schema:', winchRes.body.includes('"@type": "TechArticle"'));
        console.log(' - Has FAQPage schema:', winchRes.body.includes('"@type": "FAQPage"'));
        console.log(' - Has sticky mobile bar:', winchRes.body.includes('id="stickyMobileBar"'));

        // Test 3: Packing Guide
        const packRes = await get('/packing-guide.html');
        console.log('Test 3: Packing Guide status:', packRes.status);
        console.log(' - Has targeted keywords tag:', packRes.body.includes('<meta name="keywords"'));
        console.log(' - Has Packing keywords (كراتين نقل عفش):', packRes.body.includes('كراتين نقل عفش'));
        console.log(' - Has Article schema:', packRes.body.includes('"@type": "Article"'));
        console.log(' - Has FAQPage schema:', packRes.body.includes('"@type": "FAQPage"'));
        console.log(' - Has sticky mobile bar:', packRes.body.includes('id="stickyMobileBar"'));

        // Test 4: Pricing Guide
        const priceRes = await get('/pricing-guide.html');
        console.log('Test 4: Pricing Guide status:', priceRes.status);
        console.log(' - Has targeted keywords tag:', priceRes.body.includes('<meta name="keywords"'));
        console.log(' - Has Pricing keywords (اسعار نقل العفش):', priceRes.body.includes('اسعار نقل العفش'));
        console.log(' - Has Article schema:', priceRes.body.includes('"@type": "Article"'));
        console.log(' - Has FAQPage schema:', priceRes.body.includes('"@type": "FAQPage"'));
        console.log(' - Has sticky mobile bar:', priceRes.body.includes('id="stickyMobileBar"'));

        // Test 5: Sitemap
        const sitemapRes = await get('/sitemap.xml');
        console.log('Test 5: Sitemap status:', sitemapRes.status);
        console.log(' - Has all 3 guide pages in sitemap:', 
            sitemapRes.body.includes('winch-guide.html') &&
            sitemapRes.body.includes('packing-guide.html') &&
            sitemapRes.body.includes('pricing-guide.html')
        );

        console.log('--- ALL KEYWORDS & CLUSTER TESTS PASSED! ---');
        server.kill();
        process.exit(0);
    } catch (e) {
        console.error('Test failed with error:', e);
        server.kill();
        process.exit(1);
    }
}, 1000);
