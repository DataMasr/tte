// ==============================================================================
// Na2la Pro - Supabase Data & Authentication Layer
// يدعم تسجيل الدخول والحسابات عبر Supabase Auth وتخزين الطلبات السحابي والمحلي
// ==============================================================================

const Na2laDB = (function () {
    const SUPABASE_URL = CONFIG.supabase.url;
    const SUPABASE_ANON = CONFIG.supabase.anonKey;
    const LOCAL_STORAGE_KEY = "na2la_local_orders";

    // تهيئة عميل Supabase الرسمي إذا كانت المكتبة محملة
    let supabaseClient = null;
    if (typeof window !== "undefined" && window.supabase && window.supabase.createClient) {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON);
    }

    // جلب الطلبات المخزنة محلياً
    function getLocalOrders() {
        try {
            const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (raw) return JSON.parse(raw);

            // طلبات نموذجية أولية لضمان عمل اللوحة فورياً واكتمال التجربة
            const initialSeed = [
                {
                    id: "seed-NQ-8421",
                    booking_code: "NQ-8421",
                    client_name: "م. كريم عبد الرحمن",
                    phone: "01098765432",
                    whatsapp: "01098765432",
                    from_area: "التجمع الخامس",
                    to_area: "الشيخ زايد",
                    rooms_count: "شقة 3 غرف",
                    floor_from: 4,
                    floor_to: 2,
                    has_winch: true,
                    has_packaging: true,
                    has_carpentry: true,
                    has_ac: true,
                    services: ["شقة 3 غرف", "ونش هيدروليكي", "تغليف بابلز وكرتون", "فك وتركيب الغرف", "فك وتركيب تكييف"],
                    move_date: new Date().toISOString().split("T")[0],
                    estimated_price: 5200,
                    status: "جديد",
                    notes: "يوجد أثاث زجاجي وتحف بحاجة لعناية وتغليف فقاعي مزدوج",
                    created_at: new Date(Date.now() - 3600000 * 2).toISOString()
                },
                {
                    id: "seed-NQ-7619",
                    booking_code: "NQ-7619",
                    client_name: "د. إبراهيم السعدني",
                    phone: "01123456789",
                    whatsapp: "01123456789",
                    from_area: "المعادي",
                    to_area: "مصر الجديدة",
                    rooms_count: "فيلا كاملة / دوبلكس",
                    floor_from: 1,
                    floor_to: 3,
                    has_winch: true,
                    has_packaging: true,
                    has_carpentry: true,
                    has_ac: false,
                    services: ["فيلا كاملة / دوبلكس", "ونش هيدروليكي", "تغليف بابلز وكرتون", "فك وتركيب الغرف"],
                    move_date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
                    estimated_price: 7800,
                    status: "مؤكد",
                    notes: "تم تأكيد موعد وصول ونش الهيدروليك وفريق الفنيين الساعة 9 صباحاً",
                    created_at: new Date(Date.now() - 3600000 * 8).toISOString()
                },
                {
                    id: "seed-NQ-6194",
                    booking_code: "NQ-6194",
                    client_name: "أ. منى زهران",
                    phone: "01234567890",
                    whatsapp: "01234567890",
                    from_area: "مدينة نصر",
                    to_area: "الشروق",
                    rooms_count: "شقة 2 غرف",
                    floor_from: 3,
                    floor_to: 5,
                    has_winch: true,
                    has_packaging: true,
                    has_carpentry: false,
                    has_ac: false,
                    services: ["شقة 2 غرف", "ونش هيدروليكي", "تغليف بابلز وكرتون"],
                    move_date: new Date(Date.now() - 86400000).toISOString().split("T")[0],
                    estimated_price: 3600,
                    status: "مكتمل",
                    notes: "تم التسليم بنجاح وتوقيع وثيقة الاستلام مع العميل",
                    created_at: new Date(Date.now() - 86400000 * 2).toISOString()
                }
            ];
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initialSeed));
            return initialSeed;
        } catch (e) {
            console.error("Local storage read error", e);
            return [];
        }
    }

    // حفظ طلب في التخزين المحلي بدقة تمنع استبدال الطلبات المختلفة
    function saveLocalOrder(order) {
        try {
            if (!order) return;
            if (!order.id) {
                order.id = "local-" + Date.now() + "-" + Math.random().toString(36).substring(2, 8);
            }
            const list = getLocalOrders();
            // مقارنة دقيقة: لا تطابق إذا كانت الخانات فارغة أو undefined
            const existingIndex = list.findIndex(o => {
                if (order.booking_code && o.booking_code && o.booking_code === order.booking_code) return true;
                if (order.id && o.id && o.id === order.id) return true;
                return false;
            });

            if (existingIndex >= 0) {
                list[existingIndex] = { ...list[existingIndex], ...order };
            } else {
                list.unshift(order);
            }
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
        } catch (e) {
            console.error("Local storage save error", e);
        }
    }

    // توليد كود حجز مميز وفريد
    function generateBookingCode() {
        const rand = Math.floor(1000 + Math.random() * 9000);
        return `NQ-${rand}`;
    }

    // ترويسات الطلب لـ Supabase REST API (استخدام مفتاح ANON المعتمد للمتصفحات لمنع حظر Supabase للـ Secret)
    function getHeaders(useSecret = false) {
        // مفتاح ANON هو المفتاح الشرعي للمتصفحات والمصرح له بالقراءة والكتابة
        const key = SUPABASE_ANON;
        return {
            "apikey": key,
            "Authorization": `Bearer ${key}`,
            "Content-Type": "application/json",
            "Prefer": "return=representation"
        };
    }

    return {
        // العميل المباشر لـ Supabase
        getClient() {
            if (!supabaseClient && typeof window !== "undefined" && window.supabase && window.supabase.createClient) {
                supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON);
            }
            return supabaseClient;
        },

        // ==========================================
        // إدارة المصادقة والمستخدمين (Supabase Auth)
        // ==========================================

        // تسجيل الدخول بالبريد وكلمة المرور
        async signIn(email, password) {
            const client = this.getClient();
            if (client) {
                try {
                    const { data, error } = await client.auth.signInWithPassword({ email, password });
                    if (error) return { success: false, error: error.message };
                    return { success: true, user: data.user, session: data.session };
                } catch (err) {
                    return { success: false, error: err.message };
                }
            } else {
                // Fallback عبر Auth REST API المباشر
                try {
                    const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
                        method: "POST",
                        headers: {
                            "apikey": SUPABASE_ANON,
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({ email, password })
                    });
                    const json = await res.json();
                    if (!res.ok) return { success: false, error: json.error_description || json.msg || "فشل تسجيل الدخول" };
                    localStorage.setItem("na2la_admin_auth", JSON.stringify(json));
                    return { success: true, user: json.user, session: json };
                } catch (err) {
                    return { success: false, error: err.message };
                }
            }
        },

        // إنشاء حساب مسؤول جديد
        async signUp(email, password) {
            const client = this.getClient();
            if (client) {
                try {
                    const { data, error } = await client.auth.signUp({ email, password });
                    if (error) return { success: false, error: error.message };
                    return { success: true, user: data.user, session: data.session };
                } catch (err) {
                    return { success: false, error: err.message };
                }
            } else {
                try {
                    const res = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
                        method: "POST",
                        headers: {
                            "apikey": SUPABASE_ANON,
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({ email, password })
                    });
                    const json = await res.json();
                    if (!res.ok) return { success: false, error: json.msg || json.error_description || "فشل إنشاء الحساب" };
                    return { success: true, user: json.user || json };
                } catch (err) {
                    return { success: false, error: err.message };
                }
            }
        },

        // التحقق من الجلسة الحالية
        async getCurrentUser() {
            const client = this.getClient();
            if (client) {
                try {
                    const { data: { session } } = await client.auth.getSession();
                    if (session && session.user) return session.user;
                } catch (e) {
                    console.warn("Session check error", e);
                }
            }

            // Fallback محلي
            const raw = localStorage.getItem("na2la_admin_auth");
            if (raw) {
                try {
                    const parsed = JSON.parse(raw);
                    return parsed.user || parsed;
                } catch (e) { }
            }
            return null;
        },

        // تسجيل الخروج
        async signOut() {
            const client = this.getClient();
            if (client) {
                await client.auth.signOut();
            }
            localStorage.removeItem("na2la_admin_auth");
        },

        // مراقبة تغيرات حالة الدخول
        onAuthStateChange(callback) {
            const client = this.getClient();
            if (client) {
                client.auth.onAuthStateChange((event, session) => {
                    callback(event, session ? session.user : null);
                });
            }
        },

        // ==========================================
        // إدارة بيانات الطلبات (Orders API)
        // ==========================================

        // فحص الاتصال بـ Supabase
        async checkSupabaseStatus() {
            try {
                const response = await fetch(`${SUPABASE_URL}/rest/v1/orders?select=id&limit=1`, {
                    method: "GET",
                    headers: getHeaders(true)
                });
                if (response.ok) {
                    return { connected: true, tableExists: true };
                } else if (response.status === 404) {
                    return { connected: true, tableExists: false, message: "يحتاج تشغيل كود SQL في Supabase" };
                } else {
                    return { connected: false, error: response.statusText };
                }
            } catch (err) {
                return { connected: false, error: err.message };
            }
        },

        // إرسال وحفظ طلب جديد
        async createOrder(orderPayload) {
            const bookingCode = generateBookingCode();
            const orderId = "local-" + Date.now() + "-" + Math.floor(1000 + Math.random() * 9000);

            // تجهيز مصفوفة الخدمات المتوافقة مع Supabase
            const servicesList = [];
            if (orderPayload.rooms_count) servicesList.push(orderPayload.rooms_count);
            if (orderPayload.has_winch) servicesList.push("ونش هيدروليكي");
            if (orderPayload.has_packaging) servicesList.push("تغليف بابلز وكرتون");
            if (orderPayload.has_carpentry) servicesList.push("فك وتركيب الغرف");
            if (orderPayload.has_ac) servicesList.push("فك وتركيب تكييف");

            const orderData = {
                id: orderId,
                booking_code: bookingCode,
                client_name: orderPayload.client_name,
                phone: orderPayload.phone,
                whatsapp: orderPayload.whatsapp || orderPayload.phone,
                from_area: orderPayload.from_area,
                to_area: orderPayload.to_area,
                rooms_count: orderPayload.rooms_count || "2 غرف",
                floor_from: parseInt(orderPayload.floor_from) || 1,
                floor_to: parseInt(orderPayload.floor_to) || 1,
                has_winch: Boolean(orderPayload.has_winch),
                has_packaging: Boolean(orderPayload.has_packaging),
                has_carpentry: Boolean(orderPayload.has_carpentry),
                has_ac: Boolean(orderPayload.has_ac),
                services: servicesList,
                move_date: orderPayload.move_date || new Date().toISOString().split("T")[0],
                estimated_price: parseFloat(orderPayload.estimated_price) || 0,
                status: "جديد",
                notes: orderPayload.notes || "",
                created_at: new Date().toISOString()
            };

            // حفظ محلياً بشكل مستقل وآمن
            saveLocalOrder(orderData);

            try {
                // إرسال البيانات المعتمدة لجدول Supabase
                const supabasePayload = {
                    booking_code: bookingCode,
                    client_name: orderData.client_name,
                    phone: orderData.phone,
                    whatsapp: orderData.whatsapp,
                    from_area: orderData.from_area,
                    to_area: orderData.to_area,
                    floor_from: orderData.floor_from,
                    floor_to: orderData.floor_to,
                    has_winch: orderData.has_winch,
                    services: servicesList,
                    move_date: orderData.move_date,
                    estimated_price: orderData.estimated_price,
                    status: "جديد",
                    notes: orderData.notes
                };

                const response = await fetch(`${SUPABASE_URL}/rest/v1/orders`, {
                    method: "POST",
                    headers: getHeaders(true),
                    body: JSON.stringify(supabasePayload)
                });

                if (response.ok) {
                    const result = await response.json();
                    const savedRemote = Array.isArray(result) && result.length > 0 ? { ...orderData, ...result[0] } : orderData;
                    saveLocalOrder(savedRemote);
                    return {
                        success: true,
                        bookingCode: bookingCode,
                        order: savedRemote,
                        source: "supabase"
                    };
                } else {
                    const errorText = await response.text();
                    console.error("Supabase insert error (Status " + response.status + "):", errorText);
                }
            } catch (err) {
                console.warn("Supabase insert network error, saved to local cache:", err);
            }

            return {
                success: true,
                bookingCode: bookingCode,
                order: orderData,
                source: "local"
            };
        },

        // جلب جميع الطلبات مع مزامنة سحابية تلقائية
        async getAllOrders() {
            try {
                const response = await fetch(`${SUPABASE_URL}/rest/v1/orders?select=*&order=created_at.desc`, {
                    method: "GET",
                    headers: getHeaders(true)
                });

                if (response.ok) {
                    const remoteOrders = await response.json();
                    const remoteCodes = new Set((remoteOrders || []).map(o => o.booking_code));
                    const localOrders = getLocalOrders();

                    // فحص ومزامنة أي طلب محلي غير مسجل في قاعدة البيانات
                    for (const loc of localOrders) {
                        if (loc.booking_code && !remoteCodes.has(loc.booking_code) && !String(loc.id).startsWith("seed-")) {
                            try {
                                const pushPayload = {
                                    booking_code: loc.booking_code,
                                    client_name: loc.client_name,
                                    phone: loc.phone,
                                    whatsapp: loc.whatsapp || loc.phone,
                                    from_area: loc.from_area,
                                    to_area: loc.to_area,
                                    floor_from: parseInt(loc.floor_from) || 1,
                                    floor_to: parseInt(loc.floor_to) || 1,
                                    has_winch: Boolean(loc.has_winch),
                                    services: loc.services || [],
                                    move_date: loc.move_date || new Date().toISOString().split("T")[0],
                                    estimated_price: parseFloat(loc.estimated_price) || 0,
                                    status: loc.status || "جديد",
                                    notes: loc.notes || ""
                                };

                                const pushRes = await fetch(`${SUPABASE_URL}/rest/v1/orders`, {
                                    method: "POST",
                                    headers: getHeaders(true),
                                    body: JSON.stringify(pushPayload)
                                });

                                if (pushRes.ok) {
                                    const pushed = await pushRes.json();
                                    if (Array.isArray(pushed) && pushed[0]) {
                                        remoteOrders.unshift(pushed[0]);
                                        remoteCodes.add(loc.booking_code);
                                        console.log("Synced local order to Supabase:", loc.booking_code);
                                    }
                                }
                            } catch (syncErr) {
                                console.warn("Failed to auto-sync order:", loc.booking_code, syncErr);
                            }
                        }
                    }

                    // تحديث الكاش المحلي بالبيانات السحابية المعتمدة
                    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(remoteOrders));
                    return { success: true, orders: remoteOrders, source: "supabase" };
                }
            } catch (err) {
                console.warn("Fetch fallback to local cache:", err);
            }

            const localOrders = getLocalOrders();
            return { success: true, orders: localOrders, source: "local" };
        },

        // تحديث حالة الطلب
        async updateStatus(orderId, newStatus) {
            const local = getLocalOrders();
            const idx = local.findIndex(o => (orderId && o.id === orderId) || (orderId && o.booking_code === orderId));
            if (idx >= 0) {
                local[idx].status = newStatus;
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(local));
            }

            try {
                const filter = orderId.toString().includes("-") && orderId.length > 20
                    ? `id=eq.${orderId}`
                    : `booking_code=eq.${orderId}`;

                await fetch(`${SUPABASE_URL}/rest/v1/orders?${filter}`, {
                    method: "PATCH",
                    headers: getHeaders(true),
                    body: JSON.stringify({ status: newStatus })
                });
                return { success: true };
            } catch (e) {
                return { success: true, warning: "تم التحديث محلياً" };
            }
        },

        // حذف طلب
        async deleteOrder(orderId) {
            let local = getLocalOrders();
            local = local.filter(o => !orderId || (o.id !== orderId && o.booking_code !== orderId));
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(local));

            try {
                const filter = orderId.toString().includes("-") && orderId.length > 20
                    ? `id=eq.${orderId}`
                    : `booking_code=eq.${orderId}`;

                await fetch(`${SUPABASE_URL}/rest/v1/orders?${filter}`, {
                    method: "DELETE",
                    headers: getHeaders(true)
                });
                return { success: true };
            } catch (e) {
                return { success: true };
            }
        },

        // تصدير CSV عربي بترميز UTF-8 مع BOM
        exportToCSV(orders) {
            if (!orders || !orders.length) return;
            const headers = [
                "كود الحجز", "اسم العميل", "رقم الهاتف", "رقم الواتساب",
                "من منطقة", "إلى منطقة", "حجم الأثاث", "الدور (من)", "الدور (إلى)",
                "ونش هيدروليكي", "تغليف شامل", "فك وتركيب", "فك تكييف",
                "تاريخ النقل", "السعر التقديري (ج.م)", "الحالة", "تاريخ الطلب", "ملاحظات"
            ];

            const rows = orders.map(o => [
                `"${o.booking_code || ''}"`,
                `"${(o.client_name || '').replace(/"/g, '""')}"`,
                `"${o.phone || ''}"`,
                `"${o.whatsapp || ''}"`,
                `"${(o.from_area || '').replace(/"/g, '""')}"`,
                `"${(o.to_area || '').replace(/"/g, '""')}"`,
                `"${o.rooms_count || ''}"`,
                o.floor_from || 1,
                o.floor_to || 1,
                o.has_winch ? "نعم" : "لا",
                o.has_packaging ? "نعم" : "لا",
                o.has_carpentry ? "نعم" : "لا",
                o.has_ac ? "نعم" : "لا",
                o.move_date || "",
                o.estimated_price || 0,
                `"${o.status || 'جديد'}"`,
                `"${o.created_at ? new Date(o.created_at).toLocaleString('ar-EG') : ''}"`,
                `"${(o.notes || '').replace(/"/g, '""')}"`
            ]);

            const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(r => r.join(","))].join("\r\n");
            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `طلبات_NAQLX_نَقْلِكس_${new Date().toISOString().split("T")[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    };
})();

if (typeof window !== "undefined") {
    window.Na2laDB = Na2laDB;
}
