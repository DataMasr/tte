const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const knowledgeSection = `
    <!-- ==========================================
         Knowledge Hub & Topic Cluster Section
         ========================================== -->
    <section class="knowledge-section" id="knowledge-hub" style="padding: 100px 0; position: relative; z-index: 1;">
        <div class="container">
            <div class="section-head">
                <div class="section-tagline">
                    <svg class="svg-icon" viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                    <span>مركز المعرفة والخبرة الهندسية المعتمدة (E-E-A-T)</span>
                </div>
                <h2 class="section-title">أدلة نقل وتأمين الأثاث <span class="text-gold">التخصصية في مصر</span></h2>
                <p class="section-caption">محتوى هندسي وفني شامل موجه للعملاء، يشرح بالتفصيل جداول أمان الأوناش الهيدروليكية، بروتوكولات التغليف الفندقي، ودليل حماية المستهلك والأسعار العادلة.</p>
            </div>

            <div class="knowledge-grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 26px;">
                <!-- Guide 1: Hydraulic Winch -->
                <article class="knowledge-card" style="background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: 24px; overflow: hidden; box-shadow: var(--shadow-card); display: flex; flex-direction: column; transition: var(--transition);">
                    <div style="height: 190px; overflow: hidden; position: relative;">
                        <img src="assets/hero-lift.webp" alt="دليل الأوناش الهيدروليكية حتى الدور 25" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease;" loading="lazy">
                        <span style="position: absolute; top: 14px; right: 14px; background: rgba(37,99,235,0.9); backdrop-filter: blur(10px); color: #fff; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 999px;">دليل هندسي • 5 دقائق قراءة</span>
                    </div>
                    <div style="padding: 24px; display: flex; flex-direction: column; gap: 12px; flex: 1;">
                        <h3 style="font-size: 18px; font-weight: 800; color: var(--text-pure); line-height: 1.4;">
                            <a href="winch-guide.html" style="color: inherit; text-decoration: none;">دليل الأوناش الهيدروليكية وحساب أحمال الواجهات حتى الدور 25</a>
                        </h3>
                        <p style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7; margin: 0;">
                            كيف تحسب زاوية الميل الآمنة (65°-75°)؟ جدول ارتفاعات الأوناش، شروط عرض الشارع، ومقارنة الونش الهيدروليكي بأوناش الواير العشوائية.
                        </p>
                        <a href="winch-guide.html" style="margin-top: auto; display: inline-flex; align-items: center; gap: 6px; color: #1D4ED8; font-size: 13.5px; font-weight: 800; text-decoration: none;">
                            <span>قراءة الدليل بالكامل</span>
                            <svg class="svg-icon" viewBox="0 0 24 24" style="width:14px; height:14px;"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                        </a>
                    </div>
                </article>

                <!-- Guide 2: Luxury Packaging -->
                <article class="knowledge-card" style="background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: 24px; overflow: hidden; box-shadow: var(--shadow-card); display: flex; flex-direction: column; transition: var(--transition);">
                    <div style="height: 190px; overflow: hidden; position: relative;">
                        <img src="assets/packing.webp" alt="دليل التغليف الفندقي 5 طبقات" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease;" loading="lazy">
                        <span style="position: absolute; top: 14px; right: 14px; background: rgba(5,150,105,0.9); backdrop-filter: blur(10px); color: #fff; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 999px;">معايير الجودة • 4 دقائق قراءة</span>
                    </div>
                    <div style="padding: 24px; display: flex; flex-direction: column; gap: 12px; flex: 1;">
                        <h3 style="font-size: 18px; font-weight: 800; color: var(--text-pure); line-height: 1.4;">
                            <a href="packing-guide.html" style="color: inherit; text-decoration: none;">دليل التغليف الفندقي خماسي الطبقات وحماية التحف والأجهزة</a>
                        </h3>
                        <p style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7; margin: 0;">
                            بروتوكول حماية الشاشات الذكية، الرخام الطبيعي، والنجف الكريستال، ونظام الترقيم اللوني الذكي لتسهيل الفرز والترتيب في الموقع الجديد.
                        </p>
                        <a href="packing-guide.html" style="margin-top: auto; display: inline-flex; align-items: center; gap: 6px; color: #059669; font-size: 13.5px; font-weight: 800; text-decoration: none;">
                            <span>قراءة الدليل بالكامل</span>
                            <svg class="svg-icon" viewBox="0 0 24 24" style="width:14px; height:14px;"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                        </a>
                    </div>
                </article>

                <!-- Guide 3: Pricing & Anti-Fraud -->
                <article class="knowledge-card" style="background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: 24px; overflow: hidden; box-shadow: var(--shadow-card); display: flex; flex-direction: column; transition: var(--transition);">
                    <div style="height: 190px; overflow: hidden; position: relative;">
                        <img src="assets/fleet.webp" alt="دليل أسعار ومقايسات نقل العفش 2026" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease;" loading="lazy">
                        <span style="position: absolute; top: 14px; right: 14px; background: rgba(2,132,199,0.9); backdrop-filter: blur(10px); color: #fff; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 999px;">حماية المستهلك • 6 دقائق قراءة</span>
                    </div>
                    <div style="padding: 24px; display: flex; flex-direction: column; gap: 12px; flex: 1;">
                        <h3 style="font-size: 18px; font-weight: 800; color: var(--text-pure); line-height: 1.4;">
                            <a href="pricing-guide.html" style="color: inherit; text-decoration: none;">دليل أسعار ومقايسات نقل العفش في مصر 2026 وكشف حيل السماسرة</a>
                        </h3>
                        <p style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7; margin: 0;">
                            كيف تُحسب التكلفة الحقيقية؟ أشهر 3 حيل لسماسرة الشارع (السعر الوهمي والإكراميات الإجبارية)، وجدول الأسعار الاسترشادية الشفافة.
                        </p>
                        <a href="pricing-guide.html" style="margin-top: auto; display: inline-flex; align-items: center; gap: 6px; color: #0284C7; font-size: 13.5px; font-weight: 800; text-decoration: none;">
                            <span>قراءة الدليل بالكامل</span>
                            <svg class="svg-icon" viewBox="0 0 24 24" style="width:14px; height:14px;"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                        </a>
                    </div>
                </article>
            </div>
        </div>
    </section>
`;

// Insert before FAQ section
const faqIdx = html.indexOf('<section class="faq-section" id="faq"');
if (faqIdx !== -1 && !html.includes('id="knowledge-hub"')) {
    html = html.substring(0, faqIdx) + knowledgeSection + '\n' + html.substring(faqIdx);
}

// Add Knowledge Hub link to Nav
const navItem = `<li><a href="#knowledge-hub">مركز المعرفة</a></li>`;
if (!html.includes('href="#knowledge-hub"')) {
    html = html.replace('<li><a href="#faq">الأسئلة الشائعة</a></li>', `${navItem}\n                    <li><a href="#faq">الأسئلة الشائعة</a></li>`);
    html = html.replace('<li><a href="#faq">الأسئلة الشائعة</a></li>', `${navItem}\n                <li><a href="#faq">الأسئلة الشائعة</a></li>`);
}

fs.writeFileSync('index.html', html, 'utf8');
console.log('Knowledge Hub successfully added to index.html!');
