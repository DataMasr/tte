// ==============================================================================
// Na2la Pro - Client Application Logic (Ultra-Luxury Cyber Edition)
// ==============================================================================

document.addEventListener("DOMContentLoaded", () => {
    // 1. Core Interactive Suite (Executes Immediately)
    initAreaDropdowns();
    initCostCalculator();
    initOrderTracker();
    initBookingForm();
    initFaqAccordion();
    initContactLinks();
    initFleetShowcaseTabs();
    initCopyVoucherCode();
    initStickyMobileBar();

    // 2. Secondary Visual & Physics FX (Deferred to Idle Callback for 0ms Total Blocking Time)
    const runIdle = window.requestIdleCallback || ((cb) => setTimeout(cb, 80));
    runIdle(() => {
        initScrollReveal();
        initAnimatedCounters();
        initInteractiveTilt();
        initCursorSpotlight();
    });
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
        
        let roomsCount = "حسب المعاينة الفورية";
        let floorFrom = 1;
        let floorTo = 1;
        let estimatedPrice = 0;

        if (window.naqlxCalcData) {
            roomsCount = window.naqlxCalcData.rooms || roomsCount;
            floorFrom = window.naqlxCalcData.floorFrom || floorFrom;
            floorTo = window.naqlxCalcData.floorTo || floorTo;
            estimatedPrice = window.naqlxCalcData.total || estimatedPrice;
        }

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
                services: [
                    roomsCount,
                    hasWinch ? "ونش هيدروليكي" : null,
                    hasPackaging ? "تغليف فندقي" : null,
                    hasCarpentry ? "فك وتركيب غرف" : null,
                    hasAc ? "فك وتجهيز تكييف" : null
                ].filter(Boolean),
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

        let priceHtml = "";
        if (order.estimated_price && order.estimated_price > 0) {
            priceHtml = `<p><strong>التكلفة التقديرية:</strong> <span style="color:#059669; font-weight:800;">${order.estimated_price.toLocaleString()} جنيه مصري</span></p>`;
        }

        summaryEl.innerHTML = `
            <p><strong>العميل:</strong> ${order.client_name}</p>
            <p><strong>خط السير:</strong> من <span style="color:#2563EB; font-weight:700;">${order.from_area}</span> إلى <span style="color:#0284C7; font-weight:700;">${order.to_area}</span></p>
            <p><strong>الموعد المحدد:</strong> ${order.move_date}</p>
            <p><strong>التجهيزات المطلوبة:</strong> ${services.length ? services.join(" • ") : "نقل قياسي بدون إضافات"}</p>
            ${priceHtml}
        `;
    }

    if (waBtn) {
        let priceLine = "";
        if (order.estimated_price && order.estimated_price > 0) {
            priceLine = `💰 التكلفة التقديرية: *${order.estimated_price.toLocaleString()} ج.م*\n`;
        }

        const text = encodeURIComponent(
            `مرحباً فريق NAQLX | نَقْلِكس 🚛\n` +
            `تم تسجيل طلب نقل أثاث جديد عبر المنظومة السحابية.\n` +
            `📌 كود الحجز المرجعي: *${bookingCode}*\n` +
            `👤 العميل: ${order.client_name}\n` +
            `📍 من: ${order.from_area}\n` +
            `🏁 إلى: ${order.to_area}\n` +
            `📅 الميعاد المطلوب: ${order.move_date}\n` +
            priceLine +
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
            img: "assets/hero-lift.webp",
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
            img: "assets/fleet.webp",
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
            img: "assets/packing.webp",
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
            img: "assets/packing.webp",
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
        ".process-card, .service-card, .area-box, .booking-panel, .section-head, .faq-row, .luxury-kpi-grid, .fleet-stage-panel, .calc-panel, .calc-voucher-card, .tracking-panel, .comparison-wrapper, .hub-card"
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
    const cards = document.querySelectorAll(".hero-media-card, .service-card, .luxury-kpi-card, .fleet-stage-panel, .hub-card, .calc-voucher-card");

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

// ==============================================================================
// Interactive Instant Moving Cost Calculator (Authority Conversion Tool)
// ==============================================================================
function initCostCalculator() {
    const calcSection = document.getElementById("calculator");
    if (!calcSection) return;

    const roomInputs = document.querySelectorAll('input[name="calcRooms"]');
    const floorFromInput = document.getElementById("calcFloorFrom");
    const floorToInput = document.getElementById("calcFloorTo");
    const floorFromVal = document.getElementById("calcFloorFromVal");
    const floorToVal = document.getElementById("calcFloorToVal");
    const winchCheck = document.getElementById("calcWinch");
    const packagingCheck = document.getElementById("calcPackaging");
    const carpentryCheck = document.getElementById("calcCarpentry");
    const acCheck = document.getElementById("calcAc");

    const totalDisplay = document.getElementById("calcPriceTotal");
    const baseDisplay = document.getElementById("calcBreakdownBase");
    const winchDisplay = document.getElementById("calcBreakdownWinch");
    const packagingDisplay = document.getElementById("calcBreakdownPackaging");
    const crewDisplay = document.getElementById("calcBreakdownCrew");

    const applyBtn = document.getElementById("calcApplyToBookingBtn");
    const waQuoteBtn = document.getElementById("calcWhatsAppQuoteBtn");

    const pricing = CONFIG.pricing || {
        baseRate: 900,
        roomRates: {
            "استوديو / غرفة واحدة": 400,
            "2 غرف": 700,
            "3 غرف": 1100,
            "4 غرف فأكثر": 1600,
            "فيلا أو دوبلكس كامل": 2500,
            "مكتب أو شركة": 1800
        },
        winchRatePerFloor: 90,
        winchBaseFee: 650,
        packagingFee: 450,
        carpentryFee: 500,
        acTechnicianFee: 350
    };

    let currentGrandTotal = 0;
    let selectedRoomText = "2 غرف";

    function calculatePrice() {
        // 1. حساب حجم السكن
        let selectedRoomRate = 700;
        roomInputs.forEach(r => {
            if (r.checked) {
                selectedRoomText = r.value;
                selectedRoomRate = parseInt(r.getAttribute("data-rate") || pricing.roomRates[r.value] || 700, 10);
            }
        });

        const baseTotal = (pricing.baseRate || 900) + selectedRoomRate;

        // 2. طوابق التحميل والتنزيل
        const floorFrom = parseInt(floorFromInput ? floorFromInput.value : 2, 10);
        const floorTo = parseInt(floorToInput ? floorToInput.value : 4, 10);
        if (floorFromVal) floorFromVal.textContent = `الدور ${floorFrom}`;
        if (floorToVal) floorToVal.textContent = `الدور ${floorTo}`;

        const maxFloor = Math.max(floorFrom, floorTo);

        // 3. ونش الرفع الهيدروليكي
        let winchTotal = 0;
        if (winchCheck && winchCheck.checked) {
            const extraFloors = Math.max(0, maxFloor - 2);
            winchTotal = (pricing.winchBaseFee || 650) + (extraFloors * (pricing.winchRatePerFloor || 90));
        }

        // 4. التغليف الفندقي
        let packagingTotal = 0;
        if (packagingCheck && packagingCheck.checked) {
            packagingTotal = pricing.packagingFee || 450;
            if (selectedRoomText.includes("فيلا")) packagingTotal *= 2;
        }

        // 5. طاقم الفنيين (نجارة وتكييف)
        let crewTotal = 0;
        if (carpentryCheck && carpentryCheck.checked) {
            crewTotal += (pricing.carpentryFee || 500);
        }
        if (acCheck && acCheck.checked) {
            crewTotal += (pricing.acTechnicianFee || 350);
        }

        const grandTotal = baseTotal + winchTotal + packagingTotal + crewTotal;
        currentGrandTotal = grandTotal;

        // حفظ البيانات للاستمارة
        window.naqlxCalcData = {
            rooms: selectedRoomText,
            floorFrom: floorFrom,
            floorTo: floorTo,
            hasWinch: winchCheck ? winchCheck.checked : true,
            hasPackaging: packagingCheck ? packagingCheck.checked : true,
            hasCarpentry: carpentryCheck ? carpentryCheck.checked : true,
            hasAc: acCheck ? acCheck.checked : false,
            total: grandTotal
        };

        // تحديث البنود التفصيلية
        if (baseDisplay) baseDisplay.textContent = `${baseTotal.toLocaleString()} ج.م`;
        if (winchDisplay) winchDisplay.textContent = winchTotal > 0 ? `${winchTotal.toLocaleString()} ج.م` : "غير محدد";
        if (packagingDisplay) packagingDisplay.textContent = packagingTotal > 0 ? `${packagingTotal.toLocaleString()} ج.م` : "بدون";
        if (crewDisplay) crewDisplay.textContent = crewTotal > 0 ? `${crewTotal.toLocaleString()} ج.م` : "بدون";

        // تحديث الإجمالي التراكمي بانتقال سلس
        animateCalcTotal(totalDisplay, grandTotal);

        // تحديث زر الواتساب التفاعلي
        if (waQuoteBtn) {
            const services = [];
            if (winchCheck && winchCheck.checked) services.push("ونش هيدروليكي");
            if (packagingCheck && packagingCheck.checked) services.push("تغليف فندقي 5 طبقات");
            if (carpentryCheck && carpentryCheck.checked) services.push("فك وتركيب الغرف");
            if (acCheck && acCheck.checked) services.push("فك وتجهيز تكييف");

            const waMsg = `مرحباً فريق NAQLX، قمت بحساب تسعيرة تقديرية فورية عبر موقعكم:
📦 حجم المنقولات: ${selectedRoomText}
🏢 خط السير: من الدور (${floorFrom}) إلى الدور (${floorTo})
🛠️ التجهيزات: ${services.length > 0 ? services.join(" + ") : "نقل سيارة وطاقم فقط"}
💰 التكلفة التقديرية المعتمدة: ${grandTotal.toLocaleString()} جنيه مصري

أود تأكيد الحجز وتحديد موعد للمعاينة الفورية والانطلاق.`;
            waQuoteBtn.href = `https://wa.me/${CONFIG.contact.whatsapp}?text=${encodeURIComponent(waMsg)}`;
        }
    }

    let calcAnimFrame = null;
    function animateCalcTotal(el, target) {
        if (!el) return;
        const currentText = el.textContent.replace(/[^0-9]/g, "") || "0";
        const start = parseInt(currentText, 10);
        if (start === target) return;

        const duration = 350;
        const startTime = performance.now();

        if (calcAnimFrame) cancelAnimationFrame(calcAnimFrame);

        function step(now) {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(start + (target - start) * ease);
            el.textContent = current.toLocaleString();
            if (progress < 1) {
                calcAnimFrame = requestAnimationFrame(step);
            } else {
                el.textContent = target.toLocaleString();
            }
        }
        calcAnimFrame = requestAnimationFrame(step);
    }

    // ربط مستمعي التغيير
    roomInputs.forEach(r => r.addEventListener("change", calculatePrice));
    if (floorFromInput) floorFromInput.addEventListener("input", calculatePrice);
    if (floorToInput) floorToInput.addEventListener("input", calculatePrice);
    if (winchCheck) winchCheck.addEventListener("change", calculatePrice);
    if (packagingCheck) packagingCheck.addEventListener("change", calculatePrice);
    if (carpentryCheck) carpentryCheck.addEventListener("change", calculatePrice);
    if (acCheck) acCheck.addEventListener("change", calculatePrice);

    // تطبيق التسعيرة ونقلها إلى استمارة الحجز الرئيسية
    if (applyBtn) {
        applyBtn.addEventListener("click", () => {
            const bookingSection = document.getElementById("booking");
            const bookWinch = document.getElementById("bookWinch");
            const bookPackaging = document.getElementById("bookPackaging");
            const bookCarpentry = document.getElementById("bookCarpentry");
            const bookAc = document.getElementById("bookAc");
            const notesField = document.getElementById("clientNotes");
            const nameField = document.getElementById("clientName");

            if (bookWinch && winchCheck) bookWinch.checked = winchCheck.checked;
            if (bookPackaging && packagingCheck) bookPackaging.checked = packagingCheck.checked;
            if (bookCarpentry && carpentryCheck) bookCarpentry.checked = carpentryCheck.checked;
            if (bookAc && acCheck) bookAc.checked = acCheck.checked;

            if (notesField) {
                const floorFrom = floorFromInput ? floorFromInput.value : 2;
                const floorTo = floorToInput ? floorToInput.value : 4;
                const quoteText = `[تسعيرة معتمدة بالحاسبة: ${currentGrandTotal.toLocaleString()} ج.م - ${selectedRoomText} - تحميل دور ${floorFrom} وتنزيل دور ${floorTo}]`;
                if (!notesField.value.includes("[تسعيرة معتمدة بالحاسبة:")) {
                    notesField.value = quoteText + (notesField.value ? "\n" + notesField.value : "");
                }
            }

            if (bookingSection) {
                bookingSection.scrollIntoView({ behavior: "smooth", block: "start" });
            }

            setTimeout(() => {
                if (nameField) nameField.focus();
                showToast(`تم تثبيت تسعيرة (${currentGrandTotal.toLocaleString()} ج.م) بنجاح! أكمل بيانات التواصل لتأكيد الموعد.`);
            }, 600);
        });
    }

    // الحساب المبدئي الفوري
    calculatePrice();
}

// ==============================================================================
// Live Order Tracking Lookup Widget (Connected to Supabase)
// ==============================================================================
function initOrderTracker() {
    const form = document.getElementById("trackingForm");
    const input = document.getElementById("trackingCodeInput");
    const submitBtn = document.getElementById("trackingSubmitBtn");
    const resultBox = document.getElementById("trackingResultBox");
    const demoChips = document.querySelectorAll(".tracking-demo-chip");

    if (!form || !input) return;

    // تفعيل النماذج السريعة
    demoChips.forEach(chip => {
        chip.addEventListener("click", () => {
            const code = chip.getAttribute("data-demo");
            if (code) {
                input.value = code;
                lookupOrder(code);
            }
        });
    });

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const code = input.value.trim();
        if (code) lookupOrder(code);
    });

    async function lookupOrder(code) {
        const originalBtnHtml = submitBtn ? submitBtn.innerHTML : "";
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = `<span>جاري فحص السجلات...</span>`;
        }

        try {
            const res = await Na2laDB.getOrderByCode(code);

            if (res.success && res.order) {
                renderOrder(res.order);
            } else {
                showToast(res.error || "لم يتم العثور على طلب بهذا الكود. تحقق من الكود وحاول مجدداً.");
            }
        } catch (err) {
            console.error("Tracking lookup error:", err);
            showToast("حدث خطأ أثناء فحص السجلات، يرجى المحاولة لاحقاً.");
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnHtml;
            }
        }
    }

    function renderOrder(order) {
        if (!resultBox) return;

        const codePill = document.getElementById("trackResCode");
        const statusBadge = document.getElementById("trackResStatusBadge");
        const statusText = document.getElementById("trackResStatusText");

        const clientEl = document.getElementById("trackResClient");
        const routeEl = document.getElementById("trackResRoute");
        const dateEl = document.getElementById("trackResDate");
        const roomsEl = document.getElementById("trackResRooms");
        const equipEl = document.getElementById("trackResEquipment");

        if (codePill) codePill.textContent = order.booking_code || "NQ-0000";

        const status = order.status || "جديد";
        if (statusText) statusText.textContent = status;

        if (statusBadge) {
            statusBadge.className = "tracking-status-badge";
            if (status === "مؤكد") statusBadge.classList.add("confirmed");
            else if (status === "مكتمل") statusBadge.classList.add("done");
            else statusBadge.classList.add("pending");
        }

        // تفاصيل الميتا
        if (clientEl) clientEl.textContent = order.client_name || "عميل مميز";
        if (routeEl) routeEl.textContent = `${order.from_area || "موقع التحميل"} ⬅️ ${order.to_area || "موقع التنزيل"}`;
        if (dateEl) dateEl.textContent = order.move_date || "قيد التنسيق";
        if (roomsEl) roomsEl.textContent = order.rooms_count || (order.services && order.services[0]) || "سكن متكامل";

        if (equipEl) {
            const eqList = [];
            if (order.has_winch) eqList.push("ونش هيدروليكي");
            if (order.has_packaging) eqList.push("تغليف بابلز 5 طبقات");
            if (order.has_carpentry) eqList.push("فك وتركيب نجارين");
            if (order.has_ac) eqList.push("فني تكييف");
            equipEl.textContent = eqList.length > 0 ? eqList.join(" • ") : "شاحنة مغلقة + طاقم فنيين";
        }

        // مراحل التنفيذ في الـ Stepper:
        // Step 1: تسجيل الطلب سحابياً
        // Step 2: المعاينة وتأكيد الخطة
        // Step 3: انطلاق الشاحنة والونش
        // Step 4: الرفع والتركيب
        // Step 5: التسليم والضمان
        let currentStepNum = 2;
        let progressPercent = 25;

        if (status === "جديد") {
            currentStepNum = 2;
            progressPercent = 25;
        } else if (status === "جاري التواصل") {
            currentStepNum = 2;
            progressPercent = 35;
        } else if (status === "مؤكد") {
            currentStepNum = 3;
            progressPercent = 60;
        } else if (status === "مكتمل") {
            currentStepNum = 5;
            progressPercent = 100;
        }

        const progressFill = document.getElementById("trackingProgressFill");
        if (progressFill) {
            progressFill.style.width = `${progressPercent}%`;
        }

        const stepIcons = {
            1: `<svg class="svg-icon" viewBox="0 0 24 24" style="width:18px; height:18px;"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
            2: `<svg class="svg-icon" viewBox="0 0 24 24" style="width:18px; height:18px;"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`,
            3: `<svg class="svg-icon" viewBox="0 0 24 24" style="width:18px; height:18px;"><path d="M10 17h4V5H2v12h3m9 0h2.5a2.5 2.5 0 0 0 2.5-2.5V11l-3-4h-2v10z"></path></svg>`,
            4: `<svg class="svg-icon" viewBox="0 0 24 24" style="width:18px; height:18px;"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon></svg>`,
            5: `<svg class="svg-icon" viewBox="0 0 24 24" style="width:18px; height:18px;"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`
        };
        const checkIcon = `<svg class="svg-icon" viewBox="0 0 24 24" style="width:18px; height:18px;"><polyline points="20 6 9 17 4 12"></polyline></svg>`;

        for (let i = 1; i <= 5; i++) {
            const stepEl = document.getElementById(`step${i}`);
            if (stepEl) {
                const dotEl = stepEl.querySelector(".tracking-step-dot");
                stepEl.classList.remove("done", "active");
                if (status === "مكتمل" || i < currentStepNum) {
                    stepEl.classList.add("done");
                    if (dotEl) dotEl.innerHTML = checkIcon;
                } else if (i === currentStepNum) {
                    stepEl.classList.add("active");
                    if (dotEl) dotEl.innerHTML = stepIcons[i];
                } else {
                    if (dotEl) dotEl.innerHTML = stepIcons[i];
                }
            }
        }

        resultBox.style.display = "block";
        resultBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
}

// ==============================================================================
// Sticky Mobile Conversion Action Bar (Bottom Fixed)
// ==============================================================================
function initStickyMobileBar() {
    const bar = document.getElementById("stickyMobileBar");
    if (!bar) return;

    let ticking = false;
    window.addEventListener("scroll", () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                if (window.scrollY > 380) {
                    bar.classList.add("active");
                } else {
                    bar.classList.remove("active");
                }
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });
}

