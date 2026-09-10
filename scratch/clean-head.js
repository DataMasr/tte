const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// 1. Clean Meta description & keywords
const targetStart = html.indexOf('<meta name="description"');
const targetEnd = html.indexOf('<meta name="author"');

if (targetStart !== -1 && targetEnd !== -1) {
    const cleanHead = `<meta name="description"
        content="شركة NAQLX (نَقْلِكس): المنظومة الهندسية المعتمدة لنقل وتأمين الأثاث في مصر والقاهرة والجيزة. أحدث ونش رفع هيدروليكي حتى الدور 25، شاحنات مغلقة مجهزة، فك وتركيب وتغليف فندقي بضمان شامل.">
    <meta name="keywords" content="نقل عفش, نقل اثاث, ونش رفع اثاث هيدروليكي, شركات نقل اثاث في مصر, NAQLX, نَقْلِكس">
    `;
    html = html.substring(0, targetStart) + cleanHead + html.substring(targetEnd);
}

// 2. Fix Logo name row
const oldLogo = `<span class="logo-name">NAQLX <span class="text-gold"></span></span>`;
const newLogo = `<span class="logo-name">NAQLX</span>
                        <span class="logo-name-ar">نَقْلِكس</span>`;
if (html.includes(oldLogo)) {
    html = html.replace(oldLogo, newLogo);
}

// 3. Fix Tracking Search Bar input (remove dir="ltr", clean placeholder)
const oldSearchInput = `<input type="text" id="trackingCodeInput" class="tracking-search-input" placeholder="اكتب كود الحجز مثل: NQ-8421" dir="ltr" required>`;
const newSearchInput = `<input type="text" id="trackingCodeInput" class="tracking-search-input" placeholder="اكتب كود الحجز السحابي (مثال: NQ-8421)" required autocomplete="off">`;
if (html.includes(oldSearchInput)) {
    html = html.replace(oldSearchInput, newSearchInput);
}

// 4. Add Stepper progress track & fill
const oldStepperStart = `<div class="tracking-stepper">
                        <div class="tracking-step done" id="step1">`;
const newStepperStart = `<div class="tracking-stepper">
                        <div class="tracking-stepper-track" aria-hidden="true">
                            <div class="tracking-stepper-fill" id="trackingProgressFill"></div>
                        </div>
                        <div class="tracking-step done" id="step1">`;
if (html.includes(oldStepperStart)) {
    html = html.replace(oldStepperStart, newStepperStart);
}

fs.writeFileSync('index.html', html, 'utf8');
console.log('Successfully applied index.html fixes!');
