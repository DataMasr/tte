// ==============================================================================
// Na2la Pro - Client Application Logic (Ultra-Luxury Cyber Edition)
// ==============================================================================

document.addEventListener("DOMContentLoaded", () => {
    initAreaDropdowns();
    initBookingForm();
    initFaqAccordion();
    initContactLinks();
    initScrollReveal();
    initAnimatedCounters();
    initInteractiveTilt();
    initCursorSpotlight();
    initFleetShowcaseTabs();
    initCopyVoucherCode();
});

// تهيئة القوائم المنسدلة للمناطق
function initAreaDropdowns() {
    const formFrom = document.getElementById("bookFromArea");
    const formTo = document.getElementById("bookToArea");
    const areas = CONFIG.areas;

    function populate(selectEl) {
        if (!selectEl) return;
        selectEl.innerHTML = '<option value="" disabled selected>اختر الموقع من القائمة...</option>';
        areas.forEach(area => {
            const opt = document.createElement("option");
            opt.value = area;
            opt.textContent = area;
            selectEl.appendChild(opt);
        });
    }

    populate(formFrom);
    populate(formTo);

    if (formFrom && areas.length > 1) formFrom.value = areas[1]; // التجمع الخامس
    if (formTo && areas.length > 6) formTo.value = areas[6]; // الشيخ زايد
}

// نموذج الحجز وتخزينه في Supabase
function initBookingForm() {
    const form = document.getElementById("mainBookingForm");
    if (!form) return;

    // وضع تاريخ افتراضي هو الغد
    const dateInput = document.getElementById("moveDate");
    if (dateInput) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        dateInput.value = tomorrow.toISOString().split("T")[0];
        dateInput.min = new Date().toISOString().split("T")[0];
    }

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;

        const clientName = document.getElementById("clientName")?.value.trim();
        const phone = document.getElementById("clientPhone")?.value.trim();
        const whatsapp = phone;
        const fromArea = document.getElementById("bookFromArea")?.value;
        const toArea = document.getElementById("bookToArea")?.value;
        const hasWinch = document.getElementById("bookWinch")?.checked || false;
        const hasPackaging = document.getElementById("bookPackaging")?.checked || false;
        const hasCarpentry = document.getElementById("bookCarpentry")?.checked || false;
        const hasAc = document.getElementById("bookAc")?.checked || false;
        const moveDate = document.getElementById("moveDate")?.value;
        const notes = document.getElementById("clientNotes")?.value.trim() || "";
        const roomsCount = "حسب المعاينة الفورية";
        const floorFrom = 0;
        const floorTo = 0;
        const estimatedPrice = 0;

        if (!clientName || !phone || !fromArea || !toArea) {
            showToast("يرجى ملء الحقول الإلزامية المطلوبة.");
            return;
        }

        submitBtn.disabled = true;
        submitBtn.innerHTML = `
            <span>جاري حجز وتأمين موعدك سحابياً...</span>
            <div class="pulse-indicator"></div>
        `;

        try {
            const payload = {
                client_name: clientName,
                phone: phone,
                whatsapp: whatsapp,
                from_area: fromArea,
                to_area: toArea,
                rooms_count: roomsCount,
                floor_from: floorFrom,
                floor_to: floorTo,
                has_winch: hasWinch,
                has_packaging: hasPackaging,
                has_carpentry: hasCarpentry,
                has_ac: hasAc,
                move_date: moveDate,
                estimated_price: estimatedPrice,
                notes: notes
            };

            const response = await Na2laDB.createOrder(payload);

            if (response.success) {
                showSuccessModal(response.bookingCode, payload);
                form.reset();
                initAreaDropdowns();
            } else {
                showToast("حدث خطأ أثناء الإرسال. يمكنك التواصل فوراً عبر الواتساب.");
            }
        } catch (err) {
            console.error("Booking error:", err);
            showToast("حدث خطأ غير متوقع. يرجى الضغط على زر الواتساب للتواصل المباشر.");
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
        }
    });
}

// عرض نافذة النجاح الفاخرة (VIP Dispatch Voucher)
function showSuccessModal(bookingCode, order) {
    const modal = document.getElementById("successModal");
    if (!modal) return;

    const codeEl = document.getElementById("modalBookingCode");
    const summaryEl = document.getElementById("modalOrderSummary");
    const waBtn = document.getElementById("modalWhatsAppBtn");

    if (codeEl) codeEl.textContent = bookingCode;

    if (summaryEl) {
        const services = [];
        if (order.has_winch) services.push("ونش هيدروليكي");
        if (order.has_packaging) services.push("تغليف فندقي");
        if (order.has_carpentry) services.push("فك وتركيب غرف");
        if (order.has_ac) services.push("فك وتجهيز تكييف");

        summaryEl.innerHTML = `
            <p><strong>العميل:</strong> ${order.client_name}</p>
            <p><strong>خط السير:</strong> من <span style="color:#2563EB; font-weight:700;">${order.from_area}</span> إلى <span style="color:#0284C7; font-weight:700;">${order.to_area}</span></p>
            <p><strong>الموعد المحدد:</strong> ${order.move_date}</p>
            <p><strong>التجهيزات المطلوبة:</strong> ${services.length ? services.join(" • ") : "نقل قياسي بدون إضافات"}</p>
        `;
    }

    if (waBtn) {
        const text = encodeURIComponent(
            `مرحباً فريق NAQLX | نَقْلِكس 🚛\n` +
            `تم تسجيل طلب نقل أثاث جديد عبر المنظومة السحابية.\n` +
            `📌 كود الحجز المرجعي: *${bookingCode}*\n` +
            `👤 العميل: ${order.client_name}\n` +
            `📍 من: ${order.from_area}\n` +
            `🏁 إلى: ${order.to_area}\n` +
            `📅 الميعاد المطلوب: ${order.move_date}\n` +
            `برجاء مراجعة الطلب وتأكيد موعد الشاحنة والمعدات مع مسؤول العمليات.`
        );
        waBtn.href = `https://wa.me/${CONFIG.contact.whatsapp}?text=${text}`;
    }

    modal.classList.add("show");

    const closeBtn = document.getElementById("modalCloseBtn");
    if (closeBtn) closeBtn.onclick = () => modal.classList.remove("show");
    modal.onclick = (e) => { if (e.target === modal) modal.classList.remove("show"); };
}

// نسخ كود الحجز مع الإشعار
function initCopyVoucherCode() {
    const copyBtn = document.getElementById("modalCopyBtn");
    if (!copyBtn) return;

    copyBtn.addEventListener("click", () => {
        const codeText = document.getElementById("modalBookingCode")?.textContent.trim();
        if (codeText) {
            navigator.clipboard.writeText(codeText).then(() => {
                showToast("تم نسخ كود الحجز بنجاح: " + codeText);
            }).catch(() => {
                showToast("كود الحجز: " + codeText);
            });
        }
    });
}

// عرض الإشعار الزجاجي الفاخر
function showToast(msg) {
    const toast = document.getElementById("luxToast");
    const msgEl = document.getElementById("luxToastMsg");
    if (!toast || !msgEl) return;

    msgEl.textContent = msg;
    toast.classList.add("show");
    setTimeout(() => {
        toast.classList.remove("show");
    }, 3800);
}

// مستعرض الأسطول والتجهيزات التفاعلي (Interactive Fleet Showcase)
function initFleetShowcaseTabs() {
    const tabs = document.querySelectorAll(".fleet-tab-btn");
    const imgEl = document.getElementById("fleetDisplayImg");
    const badgeTextEl = document.getElementById("fleetBadgeText");
    const catTagEl = document.getElementById("fleetCategoryTag");
    const titleEl = document.getElementById("fleetTitle");
    const descEl = document.getElementById("fleetDesc");
    const spec1El = document.getElementById("fleetSpec1");
    const spec2El = document.getElementById("fleetSpec2");
    const spec3El = document.getElementById("fleetSpec3");
    const spec4El = document.getElementById("fleetSpec4");

    const data = {
        winch: {
            img: "assets/hero-lift.jpg",
            badge: "جاهزية تشغيل فورية",
            tag: "أحدث جيل هيدروليكي ألماني",
            title: "أوناش هيدروليكية عملاقة تصل حتى الدور 25",
            desc: "أوناش مصفحة مخصصة للواجهات الضيقة والشوارع الحيوية، مزودة بحساسات أمان هيدروليكية وقواعد تثبيت فولاذية لمنع أي ميل أو احتكاك أثناء رفع وتنزيل أثمن المقتنيات.",
            s1: "75 متر (25 طابق)",
            s2: "450 كجم بالرحلة",
            s3: "حساسات هيدروليك + فرامل طوارئ",
            s4: "توفير 70% من وقت النقل"
        },
        trucks: {
            img: "assets/fleet.jpg",
            badge: "أسطول مغلق مصفح ومبطن",
            tag: "شاحنات مصممة لحماية الفلل والشركات",
            title: "شاحنات الصندوق المقفل المعزول ضد الأتربة والأمطار",
            desc: "أسطول سيارات جامبو مجهزة خصيصاً بنظام عزل حراري ورطوبة كامل، ومبطنة داخلياً بالفوم عالي الكثافة مع أحزمة تثبيت هوائية تمنع أي تحرك للأثاث أثناء السير.",
            s1: "أطوال من 4.5 إلى 6 أمتار",
            s2: "عزل حراري ورطوبة 100%",
            s3: "تتبع GPS لحظي 24 ساعة",
            s4: "تعقيم دوري ضد الحشرات"
        },
        packaging: {
            img: "assets/packing.jpg",
            badge: "خامات تغليف فندقية معتمدة",
            tag: "أعلى معايير الحماية الأوروبية",
            title: "تغليف فندقي خماسي الطبقات مع ترقيم الصناديق",
            desc: "نظام تغليف وحماية متقدم باستخدام رولات البابلز الهوائية السميكة، الفوم المقاوم للصدمات، والكرتون المضلع المخصص للتحف، النجف الكريستال، والرخام.",
            s1: "رولات بابلز هوائية 5 طبقات",
            s2: "كراتين مقواة للملابس والأجهزة",
            s3: "فوم حراري ممتص للصدمات",
            s4: "باركود وترقيم لتسهيل الفرز"
        },
        crew: {
            img: "assets/packing.jpg",
            badge: "كادر فني معتمد بخبرة +12 عاماً",
            tag: "مهندسون وفنيو فك وتركيب محترفون",
            title: "فنيون معتمدون لفك وتركيب الغرف المعقدة والتكييف",
            desc: "طاقم عمل متخصص في التعامل مع غرف النوم الإيطالية والمودرن، مطابخ الألمونيوم والخشب، وستائر البلتكانات، مع فنيي تكييف معتمدين للفك والشحن والتركيب.",
            s1: "نجارون موبيليا متمرسون",
            s2: "فنيو تكييف وكهرباء معتمدون",
            s3: "أدوات وزن ليزرية دقيقة",
            s4: "محضر فحص وتسليم شامل"
        }
    };

    tabs.forEach(btn => {
        btn.addEventListener("click", () => {
            const target = btn.getAttribute("data-fleet-target");
            if (!data[target]) return;

            tabs.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            const item = data[target];
            const panel = document.getElementById("fleetStagePanel");
            if (panel) {
                panel.style.opacity = "0.7";
                panel.style.transform = "scale(0.99)";
                setTimeout(() => {
                    if (imgEl) imgEl.src = item.img;
                    if (badgeTextEl) badgeTextEl.textContent = item.badge;
                    if (catTagEl) catTagEl.textContent = item.tag;
                    if (titleEl) titleEl.textContent = item.title;
                    if (descEl) descEl.textContent = item.desc;
                    if (spec1El) spec1El.textContent = item.s1;
                    if (spec2El) spec2El.textContent = item.s2;
                    if (spec3El) spec3El.textContent = item.s3;
                    if (spec4El) spec4El.textContent = item.s4;

                    panel.style.opacity = "1";
                    panel.style.transform = "scale(1)";
                }, 150);
            }
        });
    });
}



// متابعة حركة الماوس للإضاءة التفاعلية (Cursor Spotlight Follower)
function initCursorSpotlight() {
    window.addEventListener("mousemove", (e) => {
        document.documentElement.style.setProperty("--mouse-x", `${e.clientX}px`);
        document.documentElement.style.setProperty("--mouse-y", `${e.clientY}px`);
    });
}

// تفاعل الـ FAQ
function initFaqAccordion() {
    const items = document.querySelectorAll(".faq-row");
    items.forEach(item => {
        const trigger = item.querySelector(".faq-trigger");
        if (trigger) {
            trigger.addEventListener("click", () => {
                const wasActive = item.classList.contains("active");
                items.forEach(i => i.classList.remove("active"));
                if (!wasActive) item.classList.add("active");
            });
        }
    });
}

// روابط الاتصال
function initContactLinks() {
    const waLinks = document.querySelectorAll(".link-whatsapp");
    waLinks.forEach(link => {
        const defaultText = encodeURIComponent("مرحباً فريق NAQLX | نَقْلِكس، أود الاستفسار عن خدمات نقل العفش والونش الهيدروليكي.");
        link.href = `https://wa.me/${CONFIG.contact.whatsapp}?text=${defaultText}`;
    });

    const callLinks = document.querySelectorAll(".link-call-main");
    callLinks.forEach(link => {
        link.href = `tel:${CONFIG.contact.phones[0].number}`;
    });

    initMobileNav();
}

// تفاعلات شريط التنقل العائم والموبايل
function initMobileNav() {
    const navWrapper = document.querySelector(".main-nav-wrapper");
    const toggleBtn = document.getElementById("navMobileToggle");
    const drawer = document.getElementById("navMobileDrawer");

    // تأثير الفروستد جلاس عند التمرير
    window.addEventListener("scroll", () => {
        if (navWrapper) {
            if (window.scrollY > 30) {
                navWrapper.classList.add("scrolled");
            } else {
                navWrapper.classList.remove("scrolled");
            }
        }
    });

    // فتح وإغلاق القائمة في الموبايل
    if (toggleBtn && drawer) {
        toggleBtn.addEventListener("click", () => {
            drawer.classList.toggle("active");
        });

        // إغلاق القائمة عند النقر على أي رابط داخلها
        drawer.querySelectorAll("a").forEach(a => {
            a.addEventListener("click", () => {
                drawer.classList.remove("active");
            });
        });
    }
}

// ==============================================================================
// Luxury Scroll Reveal Observer (Staggered Entrance)
// ==============================================================================
function initScrollReveal() {
    const targets = document.querySelectorAll(
        ".process-card, .service-card, .area-box, .booking-panel, .section-head, .faq-row, .luxury-kpi-grid, .fleet-stage-panel"
    );

    targets.forEach((el, idx) => {
        el.classList.add("reveal-init");
        el.style.transitionDelay = `${(idx % 4) * 80}ms`;
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("revealed");
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.12,
        rootMargin: "0px 0px -40px 0px"
    });

    targets.forEach(el => observer.observe(el));
}

// ==============================================================================
// High-Impact Animated Counters for Luxury KPI Cards
// ==============================================================================
function initAnimatedCounters() {
    const kpiGrid = document.querySelector(".luxury-kpi-grid");
    if (!kpiGrid) return;

    let hasCounted = false;

    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !hasCounted) {
                hasCounted = true;
                animateNumbers();
                counterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.25 });

    counterObserver.observe(kpiGrid);

    function animateNumbers() {
        const counterCards = document.querySelectorAll(".luxury-kpi-card .kpi-value[data-counter]");
        counterCards.forEach(el => {
            const targetVal = parseInt(el.getAttribute("data-counter"), 10);
            const prefix = el.getAttribute("data-prefix") || "";
            const suffix = el.getAttribute("data-suffix") || "";
            animateSingle(el, 0, targetVal, 1600, prefix, suffix);
        });
    }

    function animateSingle(el, start, target, duration, prefix = "", suffix = "") {
        if (!el) return;
        const startTime = performance.now();

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic curve
            const ease = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(start + (target - start) * ease);

            el.textContent = prefix + current.toLocaleString() + suffix;

            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                el.textContent = prefix + target.toLocaleString() + suffix;
            }
        }

        requestAnimationFrame(update);
    }
}

// ==============================================================================
// Interactive 3D Perspective Tilt Physics
// ==============================================================================
function initInteractiveTilt() {
    const cards = document.querySelectorAll(".hero-media-card, .service-card, .luxury-kpi-card, .fleet-stage-panel");

    cards.forEach(card => {
        card.addEventListener("mousemove", (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -4.5;
            const rotateY = ((x - centerX) / centerX) * 4.5;

            card.style.transform = `perspective(1100px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
        });

        card.addEventListener("mouseleave", () => {
            card.style.transform = "";
        });
    });
}
