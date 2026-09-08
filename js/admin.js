// ==============================================================================
// Na2la Pro - Admin Dashboard Controller (with Supabase Authentication)
// ==============================================================================

document.addEventListener("DOMContentLoaded", async () => {
    let allOrders = [];
    let currentFilter = "all";
    let searchQuery = "";
    let authMode = "signin"; // 'signin' or 'signup'

    // Auth Elements
    const authGate = document.getElementById("authGate");
    const authForm = document.getElementById("authForm");
    const authEmail = document.getElementById("authEmail");
    const authPassword = document.getElementById("authPassword");
    const authErrorMsg = document.getElementById("authErrorMsg");
    const authSubmitText = document.getElementById("authSubmitText");
    const tabSignIn = document.getElementById("tabSignIn");
    const tabSignUp = document.getElementById("tabSignUp");
    const btnAdminLogout = document.getElementById("btnAdminLogout");
    const adminUserEmail = document.getElementById("adminUserEmail");

    // Dashboard Elements
    const ordersTableBody = document.getElementById("adminOrdersTableBody");
    const searchInput = document.getElementById("adminSearchInput");
    const filterButtons = document.querySelectorAll(".filter-btn");
    const exportBtn = document.getElementById("adminExportCsvBtn");
    const copySqlBtn = document.getElementById("btnCopySqlCode");
    const dbStatusPill = document.getElementById("adminDbStatus");
    const sqlBanner = document.getElementById("adminSqlBanner");

    // ==========================================
    // 1. إدارة المصادقة (Supabase Auth Gate)
    // ==========================================

    // إرسال نموذج المصادقة (تسجيل دخول حصري)
    if (authForm) {
        authForm.onsubmit = async (e) => {
            e.preventDefault();
            const email = authEmail.value.trim();
            const password = authPassword.value;

            if (!email || !password) return;

            const submitBtn = document.getElementById("authSubmitBtn");
            const originalText = authSubmitText.textContent;
            submitBtn.disabled = true;
            authSubmitText.textContent = "جاري التحقق عبر Supabase...";

            if (authErrorMsg) authErrorMsg.style.display = "none";

            try {
                const res = await Na2laDB.signIn(email, password);

                if (res.success) {
                    const user = res.user;
                    handleAuthSuccess(user || { email: email });
                } else {
                    if (authErrorMsg) {
                        authErrorMsg.textContent = res.error || "خطأ في بيانات الدخول، تأكد من صحة البريد وكلمة المرور.";
                        authErrorMsg.style.display = "block";
                    }
                }
            } catch (err) {
                if (authErrorMsg) {
                    authErrorMsg.textContent = "تعذر الاتصال بـ Supabase: " + err.message;
                    authErrorMsg.style.display = "block";
                }
            } finally {
                submitBtn.disabled = false;
                authSubmitText.textContent = originalText;
            }
        };
    }

    // تسجيل الخروج
    if (btnAdminLogout) {
        btnAdminLogout.onclick = async () => {
            if (confirm("هل تريد تسجيل الخروج من لوحة التحكم؟")) {
                await Na2laDB.signOut();
                if (authGate) authGate.classList.remove("hidden");
                if (adminUserEmail) adminUserEmail.textContent = "غير مسجل";
            }
        };
    }

    function handleAuthSuccess(user) {
        if (authGate) authGate.classList.add("hidden");
        if (adminUserEmail) adminUserEmail.textContent = user.email || "مسؤول معتمد";
        // تحميل بيانات الداشبورد فور التحقق
        initDashboard();
    }

    // فحص الجلسة الحالية
    async function checkAuthSession() {
        const currentUser = await Na2laDB.getCurrentUser();
        if (currentUser) {
            handleAuthSuccess(currentUser);
        } else {
            if (authGate) authGate.classList.remove("hidden");
        }
    }

    // ==========================================
    // 2. منطق الداشبورد والطلبات
    // ==========================================

    let isDashboardInitialized = false;

    async function initDashboard() {
        if (isDashboardInitialized) return;
        isDashboardInitialized = true;

        await checkDatabase();
        await refreshOrders();

        // تحديث دوري كل 15 ثانية لجلب أي طلبات جديدة
        setInterval(async () => {
            const result = await Na2laDB.getAllOrders();
            if (result.orders && result.orders.length !== allOrders.length) {
                allOrders = result.orders;
                updateKPIs(allOrders);
                renderTable();
            }
        }, 15000);
    }

    // فحص حالة قاعدة بيانات Supabase
    async function checkDatabase() {
        if (!dbStatusPill) return;
        const status = await Na2laDB.checkSupabaseStatus();
        if (status.connected && status.tableExists) {
            dbStatusPill.className = "db-status-pill online";
            dbStatusPill.innerHTML = `
                <span class="pulse-indicator"></span>
                <span>Supabase متصل</span>
            `;
        } else {
            dbStatusPill.className = "db-status-pill offline";
            dbStatusPill.innerHTML = `
                <svg class="svg-icon" viewBox="0 0 24 24" style="width:14px; height:14px; color:#f59e0b;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                <span>الوضع المحلي (Offline)</span>
            `;
        }
    }

    // جلب وتحديث الطلبات
    async function refreshOrders() {
        const result = await Na2laDB.getAllOrders();
        allOrders = result.orders || [];
        updateKPIs(allOrders);
        renderTable();
    }

    // تحديث بطاقات الـ KPI
    function updateKPIs(orders) {
        const total = orders.length;
        const newCount = orders.filter(o => o.status === "جديد").length;
        const activeCount = orders.filter(o => o.status === "جاري التواصل" || o.status === "مؤكد").length;
        const completedCount = orders.filter(o => o.status === "مكتمل").length;

        const revenue = orders
            .filter(o => o.status === "مكتمل" || o.status === "مؤكد")
            .reduce((sum, o) => sum + (parseFloat(o.estimated_price) || 0), 0);

        const elTotal = document.getElementById("kpiTotalOrders");
        const elNew = document.getElementById("kpiNewOrders");
        const elActive = document.getElementById("kpiActiveOrders");
        const elCompleted = document.getElementById("kpiCompletedOrders");
        const elRevenue = document.getElementById("kpiRevenueEstimate");

        if (elTotal) elTotal.textContent = total;
        if (elNew) elNew.textContent = newCount;
        if (elActive) elActive.textContent = activeCount;
        if (elCompleted) elCompleted.textContent = completedCount;
        if (elRevenue) elRevenue.textContent = revenue.toLocaleString("ar-EG") + " ج.م";
    }

    // رسم الجدول باستخدام SVG بالكامل
    function renderTable() {
        if (!ordersTableBody) return;

        let filtered = allOrders.filter(o => {
            if (currentFilter !== "all" && o.status !== currentFilter) return false;
            if (!searchQuery) return true;

            const q = searchQuery.toLowerCase();
            return (
                (o.booking_code && o.booking_code.toLowerCase().includes(q)) ||
                (o.client_name && o.client_name.toLowerCase().includes(q)) ||
                (o.phone && o.phone.includes(q)) ||
                (o.from_area && o.from_area.toLowerCase().includes(q)) ||
                (o.to_area && o.to_area.toLowerCase().includes(q))
            );
        });

        if (filtered.length === 0) {
            ordersTableBody.innerHTML = `
                <tr>
                    <td colspan="7">
                        <div class="empty-table-state">
                            <div class="empty-icon">
                                <svg class="svg-icon svg-icon-xl" viewBox="0 0 24 24"><polyline points="21 8 21 21 3 21 3 8"></polyline><rect x="1" y="3" width="22" height="5"></rect><line x1="10" y1="12" x2="14" y2="12"></line></svg>
                            </div>
                            <h3>لا توجد طلبات مسجلة في هذا القسم</h3>
                            <p>جميع الطلبات الجديدة تظهر هنا فور تسجيلها من الواجهة أو إدخالها يدوياً.</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        ordersTableBody.innerHTML = filtered.map(order => {
            const dateFormatted = order.created_at
                ? new Date(order.created_at).toLocaleDateString("ar-EG", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
                : "الآن";

            const waClientLink = `https://wa.me/2${order.phone.replace(/^0/, '')}?text=${encodeURIComponent(
                `مرحباً أستاذ ${order.client_name}، بخصوص طلب نقل الأثاث (${order.booking_code}) من ${order.from_area} إلى ${order.to_area}. فريق NAQLX | نَقْلِكس جاهز للمعاينة والتنفيذ.`
            )}`;

            return `
                <tr id="row-${order.booking_code}">
                    <td class="td-code">
                        <span class="booking-tag">${order.booking_code}</span>
                        <div class="order-date-text">${dateFormatted}</div>
                    </td>
                    <td class="td-client">
                        <span class="client-name">${escapeHtml(order.client_name)}</span>
                        <a href="tel:${order.phone}" class="client-phone">
                            <svg class="svg-icon" viewBox="0 0 24 24" style="width:13px; height:13px;"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                            <span>${order.phone}</span>
                        </a>
                    </td>
                    <td class="td-route">
                        <div class="route-info">
                            <span>${escapeHtml(order.from_area)}</span>
                            <span class="route-arrow">
                                <svg class="svg-icon" viewBox="0 0 24 24" style="width:12px; height:12px;"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                            </span>
                            <span>${escapeHtml(order.to_area)}</span>
                        </div>
                        <div class="route-floor-text">
                            الدور: من ${order.floor_from || 1} إلى ${order.floor_to || 1}
                        </div>
                    </td>
                    <td class="td-services">
                        <div class="service-badges-list">
                            ${(() => {
                    const s = Array.isArray(order.services) ? order.services : [];
                    const hasWinch = Boolean(order.has_winch || s.some(x => x.includes("ونش")));
                    const hasPkg = Boolean(order.has_packaging || s.some(x => x.includes("تغليف")));
                    const hasCarp = Boolean(order.has_carpentry || s.some(x => x.includes("فك وتركيب") && !x.includes("تكييف")));
                    const hasAc = Boolean(order.has_ac || s.some(x => x.includes("تكييف")));
                    const rooms = order.rooms_count || s.find(x => x.includes("غرف") || x.includes("شقة") || x.includes("فيلا") || x.includes("مكتب")) || "2 غرف";
                    return `
                                    <span class="badge-micro">${escapeHtml(rooms)}</span>
                                    ${hasWinch ? '<span class="badge-micro badge-winch">ونش هيدروليكي</span>' : ''}
                                    ${hasPkg ? '<span class="badge-micro">تغليف شامل</span>' : ''}
                                    ${hasCarp ? '<span class="badge-micro">فك وتركيب</span>' : ''}
                                    ${hasAc ? '<span class="badge-micro">تكييف</span>' : ''}
                                `;
                })()}
                        </div>
                        <div class="order-move-date-text">
                            تاريخ النقل: <strong style="color:#fff;">${order.move_date || 'غير محدد'}</strong>
                        </div>
                    </td>
                    <td class="td-price">
                        <div class="price-box-admin">
                            <strong class="price-val">
                                ${(order.estimated_price || 0).toLocaleString("ar-EG")}
                            </strong>
                            <span class="price-cur">ج.م</span>
                        </div>
                    </td>
                    <td class="td-status">
                        <select class="status-select status-${(order.status || 'جديد').replace(/\s+/g, '-')}" data-code="${order.booking_code}">
                            <option value="جديد" ${order.status === 'جديد' ? 'selected' : ''}>جديد</option>
                            <option value="جاري التواصل" ${order.status === 'جاري التواصل' ? 'selected' : ''}>جاري التواصل</option>
                            <option value="مؤكد" ${order.status === 'مؤكد' ? 'selected' : ''}>مؤكد</option>
                            <option value="مكتمل" ${order.status === 'مكتمل' ? 'selected' : ''}>مكتمل</option>
                            <option value="ملغي" ${order.status === 'ملغي' ? 'selected' : ''}>ملغي</option>
                        </select>
                    </td>
                    <td class="td-actions">
                        <div class="action-btns">
                            <a href="${waClientLink}" target="_blank" class="act-btn act-whatsapp" title="محادثة واتساب">
                                <svg class="svg-icon" viewBox="0 0 24 24" style="width:16px; height:16px;"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                                <span class="act-btn-label">واتساب</span>
                            </a>
                            <a href="tel:${order.phone}" class="act-btn act-call" title="اتصال هاتفي">
                                <svg class="svg-icon" viewBox="0 0 24 24" style="width:15px; height:15px;"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                                <span class="act-btn-label">اتصال</span>
                            </a>
                            <button class="act-btn act-print" data-code="${order.booking_code}" title="طباعة أمر التشغيل">
                                <svg class="svg-icon" viewBox="0 0 24 24" style="width:15px; height:15px;"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                            </button>
                            <button class="act-btn act-delete" data-code="${order.booking_code}" title="حذف الطلب">
                                <svg class="svg-icon" viewBox="0 0 24 24" style="width:15px; height:15px;"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join("");

        bindTableEvents();
    }

    function bindTableEvents() {
        // تغيير الحالة فوراً
        document.querySelectorAll(".status-select").forEach(select => {
            select.addEventListener("change", async (e) => {
                const code = e.target.getAttribute("data-code");
                const newStatus = e.target.value;
                e.target.className = `status-select status-${newStatus.replace(/\s+/g, '-')}`;
                await Na2laDB.updateStatus(code, newStatus);
                const order = allOrders.find(o => o.booking_code === code);
                if (order) order.status = newStatus;
                updateKPIs(allOrders);
            });
        });

        // حذف طلب
        document.querySelectorAll(".act-delete").forEach(btn => {
            btn.addEventListener("click", async () => {
                const code = btn.getAttribute("data-code");
                if (confirm(`هل أنت متأكد من رغبتك في حذف الطلب ${code} نهائياً؟`)) {
                    await Na2laDB.deleteOrder(code);
                    allOrders = allOrders.filter(o => o.booking_code !== code);
                    updateKPIs(allOrders);
                    renderTable();
                }
            });
        });

        // طباعة أمر الشغل
        document.querySelectorAll(".act-print").forEach(btn => {
            btn.addEventListener("click", () => {
                const code = btn.getAttribute("data-code");
                const order = allOrders.find(o => o.booking_code === code);
                if (order) printOrderVoucher(order);
            });
        });
    }

    // طباعة وثيقة أمر التشغيل
    function printOrderVoucher(order) {
        const printWindow = window.open("", "_blank");
        printWindow.document.write(`
            <!DOCTYPE html>
            <html dir="rtl" lang="ar">
            <head>
                <meta charset="utf-8">
                <title>أمر تشغيل نقل أثاث - ${order.booking_code}</title>
                <style>
                    body { font-family: 'Cairo', Arial, sans-serif; padding: 40px; color: #111; }
                    .header { border-bottom: 2px solid #000; padding-bottom: 16px; display: flex; justify-content: space-between; align-items: center; }
                    .logo { font-size: 24px; font-weight: bold; }
                    .badge { font-size: 18px; border: 2px dashed #000; padding: 6px 14px; font-weight: bold; }
                    .section { margin: 25px 0; }
                    .table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                    .table th, .table td { border: 1px solid #ccc; padding: 10px; text-align: right; }
                    .table th { background: #f8f9fa; }
                    .footer { margin-top: 50px; display: flex; justify-content: space-between; }
                    .sign-box { border-top: 1px solid #000; width: 200px; text-align: center; padding-top: 10px; font-size: 13px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <div>
                        <div class="logo">منظومة NAQLX | نَقْلِكس اللوجستية</div>
                        <div>الخط الساخن: 01007245515 - واتساب العمليات: 01006672783</div>
                    </div>
                    <div class="badge">أمر تشغيل رقم: ${order.booking_code}</div>
                </div>

                <div class="section">
                    <h3>بيانات أمر النقل والعميل</h3>
                    <table class="table">
                        <tr><th>اسم العميل</th><td>${order.client_name}</td><th>رقم الهاتف</th><td>${order.phone}</td></tr>
                        <tr><th>موقع التحميل</th><td>${order.from_area} (الدور ${order.floor_from || 1})</td><th>موقع التنزيل</th><td>${order.to_area} (الدور ${order.floor_to || 1})</td></tr>
                        <tr><th>حجم المنقولات</th><td>${order.rooms_count}</td><th>تاريخ التنفيذ</th><td>${order.move_date}</td></tr>
                        <tr><th>خدمة الونش</th><td>${order.has_winch ? 'مطلوب ونش هيدروليكي' : 'بدون ونش'}</td><th>تغليف وفك</th><td>${order.has_packaging ? 'تغليف شامل ' : ''}${order.has_carpentry ? '+ فك وتركيب' : ''}</td></tr>
                        <tr><th>الميزانية المتفق عليها</th><td colspan="3"><strong style="font-size: 17px;">${order.estimated_price || 0} ج.م</strong></td></tr>
                        <tr><th>ملاحظات خاصة</th><td colspan="3">${order.notes || 'لا توجد ملاحظات إضافية'}</td></tr>
                    </table>
                </div>

                <div class="footer">
                    <div class="sign-box">مسؤول التشغيل واللوجستيات</div>
                    <div class="sign-box">مشرف طاقم الشاحنة</div>
                    <div class="sign-box">توقيع العميل بالاستلام الكامل</div>
                </div>
                <script>window.onload = function() { window.print(); }<\/script>
            </body>
            </html>
        `);
        printWindow.document.close();
    }

    // البحث اللحظي
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            searchQuery = e.target.value.trim();
            renderTable();
        });
    }

    // أزرار الفلترة
    filterButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            filterButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            currentFilter = btn.getAttribute("data-filter");
            renderTable();
        });
    });

    // تصدير CSV
    if (exportBtn) {
        exportBtn.addEventListener("click", () => {
            Na2laDB.exportToCSV(allOrders);
        });
    }

    // زر نسخ كود SQL
    if (copySqlBtn) {
        copySqlBtn.addEventListener("click", async () => {
            const sql = `-- كود إنشاء جدول الطلبات في Supabase
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_code TEXT UNIQUE NOT NULL,
    client_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    whatsapp TEXT,
    from_area TEXT NOT NULL,
    to_area TEXT NOT NULL,
    rooms_count TEXT DEFAULT '2 غرف',
    floor_from INTEGER DEFAULT 1,
    floor_to INTEGER DEFAULT 1,
    has_winch BOOLEAN DEFAULT false,
    has_packaging BOOLEAN DEFAULT true,
    has_carpentry BOOLEAN DEFAULT true,
    has_ac BOOLEAN DEFAULT false,
    move_date DATE DEFAULT CURRENT_DATE,
    estimated_price NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'جديد' CHECK (status IN ('جديد', 'جاري التواصل', 'مؤكد', 'مكتمل', 'ملغي')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous insert orders" ON public.orders FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow full access for service_role and anon reading" ON public.orders FOR ALL TO anon, authenticated, service_role USING (true) WITH CHECK (true);
`;
            try {
                await navigator.clipboard.writeText(sql);
                const orig = copySqlBtn.innerHTML;
                copySqlBtn.innerHTML = "<span>✓ تم نسخ الكود بنجاح</span>";
                copySqlBtn.style.background = "#10b981";
                setTimeout(() => {
                    copySqlBtn.innerHTML = orig;
                    copySqlBtn.style.background = "";
                }, 2500);
            } catch (err) {
                alert("يرجى فتح الملف supabase_schema.sql ونسخ الكود ولصقه في Supabase SQL Editor.");
            }
        });
    }

    function escapeHtml(text) {
        if (!text) return "";
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // بدء فحص تسجيل الدخول
    await checkAuthSession();
});
