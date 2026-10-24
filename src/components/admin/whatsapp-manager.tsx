"use client";

import { useEffect, useState, useCallback } from "react";
import {
  CircleCheck,
  Inbox,
  LoaderCircle,
  LogOut,
  MessageSquare,
  QrCode,
  Radio,
  RefreshCw,
  Send,
  Settings as SettingsIcon,
  X,
} from "lucide-react";
import { WhatsAppIcon } from "@/components/icons";
import { buttonClasses } from "@/components/ui/button";
import {
  connectWhatsApp,
  disconnectWhatsApp,
  getWhatsAppLogs,
  getWhatsAppStatus,
  resetWhatsAppTemplate,
  saveWhatsAppSettings,
  sendTestWhatsApp,
  type WhatsAppLog,
  type WhatsAppStatus,
} from "@/lib/whatsapp-client";
import { cn } from "@/lib/utils";

export function WhatsAppManagerModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [data, setData] = useState<WhatsAppStatus | null>(null);
  const [logs, setLogs] = useState<WhatsAppLog[]>([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"qr" | "settings" | "test" | "logs">("qr");

  // Form states
  const [testPhone, setTestPhone] = useState("");
  const [testMsg, setTestMsg] = useState("");
  const [testNotice, setTestNotice] = useState<{ ok: boolean; text: string } | null>(null);

  const [template, setTemplate] = useState("");
  const [autoReply, setAutoReply] = useState(true);
  const [autoMessageNewOrders, setAutoMessageNewOrders] = useState(true);
  const [settingsSaved, setSettingsSaved] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const statusRes = await getWhatsAppStatus();
      setData(statusRes);
      if (statusRes.settings) {
        setTemplate(statusRes.settings.template);
        setAutoReply(statusRes.settings.autoReply);
        setAutoMessageNewOrders(statusRes.settings.autoMessageNewOrders);
      }
    } catch {
      // offline / not connected
    }
  }, []);

  const loadLogs = useCallback(async () => {
    try {
      const res = await getWhatsAppLogs();
      if (res && res.logs) setLogs(res.logs);
    } catch {}
  }, []);

  // Poll status while open
  useEffect(() => {
    if (!isOpen) return;
    const initialLoad = () => {
      void refresh();
      void loadLogs();
    };
    const loadTimer = setTimeout(initialLoad, 0);

    const interval = setInterval(() => {
      void refresh();
      void loadLogs();
    }, 4000);

    return () => {
      clearTimeout(loadTimer);
      clearInterval(interval);
    };
  }, [isOpen, refresh, loadLogs]);

  if (!isOpen) return null;

  async function handleConnect(forceFresh = false) {
    setActionLoading(true);
    try {
      await connectWhatsApp(forceFresh);
      await refresh();
    } catch (e: unknown) {
      alert("خطأ أثناء الاتصال: " + (e instanceof Error ? e.message : String(e)));
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDisconnect() {
    if (!confirm("هل أنت متأكد من تسجيل الخروج وفصل ربط الواتساب؟ ستحتاج لمسح الـ QR مرة أخرى.")) return;
    setActionLoading(true);
    try {
      await disconnectWhatsApp();
      await refresh();
    } catch (e: unknown) {
      alert("خطأ أثناء فصل الحساب: " + (e instanceof Error ? e.message : String(e)));
    } finally {
      setActionLoading(false);
    }
  }

  async function handleSendTest(e: React.FormEvent) {
    e.preventDefault();
    if (!testPhone.trim() || !testMsg.trim()) return;
    setActionLoading(true);
    setTestNotice(null);
    try {
      const res = await sendTestWhatsApp(testPhone.trim(), testMsg.trim());
      if (res.ok) {
        setTestNotice({ ok: true, text: "تم إرسال الرسالة التجريبية بنجاح!" });
        setTestMsg("");
        void loadLogs();
      } else {
        setTestNotice({ ok: false, text: res.error || "تعذّر الإرسال" });
      }
    } catch (err: unknown) {
      setTestNotice({ ok: false, text: err instanceof Error ? err.message : "حدث خطأ أثناء الإرسال" });
    } finally {
      setActionLoading(false);
    }
  }

  async function handleSaveSettings() {
    setActionLoading(true);
    try {
      await saveWhatsAppSettings({
        autoReply,
        autoMessageNewOrders,
        template,
      });
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 3000);
      await refresh();
    } catch (err: unknown) {
      alert("تعذّر حفظ الإعدادات: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setActionLoading(false);
    }
  }

  async function handleResetTemplate() {
    if (!confirm("استعادة نص الرسالة الافتراضي؟")) return;
    setActionLoading(true);
    try {
      await resetWhatsAppTemplate();
      await refresh();
    } catch (err: unknown) {
      alert("خطأ: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setActionLoading(false);
    }
  }

  const isConnected = data?.status === "connected";
  const isQr = data?.status === "qr";
  const isConnecting = data?.status === "connecting";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-slate-900/10">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-2xl bg-emerald-500 text-white shadow-sm shadow-emerald-500/20">
              <WhatsAppIcon className="size-6" />
            </span>
            <div>
              <h2 className="font-display text-lg font-bold text-slate-900">إدارة بوت الواتساب الآلي</h2>
              <p className="text-xs text-slate-500">إرسال وتأكيد الطلبات للعملاء على مدار الساعة</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Live Status Pill */}
            <div
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ring-1 ring-inset",
                isConnected && "bg-emerald-50 text-emerald-700 ring-emerald-200",
                isQr && "bg-amber-50 text-amber-700 ring-amber-200 animate-pulse",
                isConnecting && "bg-sky-50 text-sky-700 ring-sky-200",
                (!data || data.status === "disconnected" || data.status === "error") &&
                  "bg-rose-50 text-rose-700 ring-rose-200",
              )}
            >
              <span
                className={cn(
                  "size-2 rounded-full",
                  isConnected && "bg-emerald-500",
                  isQr && "bg-amber-500",
                  isConnecting && "bg-sky-500",
                  (!data || data.status === "disconnected" || data.status === "error") && "bg-rose-500",
                )}
              />
              {isConnected && `متصل (${data.user ? `+${data.user}` : "نشط"})`}
              {isQr && "بانتظار مسح الـ QR"}
              {isConnecting && "جاري الاتصال..."}
              {(!data || data.status === "disconnected") && "غير متصل"}
              {data?.status === "error" && "خطأ في الاتصال"}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="grid size-9 place-items-center rounded-xl text-slate-400 transition hover:bg-slate-200 hover:text-slate-700"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-100 px-6 text-sm font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab("qr")}
            className={cn(
              "relative flex items-center gap-2 py-3.5 pe-4 transition",
              activeTab === "qr" ? "text-emerald-700" : "text-slate-500 hover:text-slate-800",
            )}
          >
            <QrCode className="size-4" />
            <span>ربط الجهاز والـ QR</span>
            {activeTab === "qr" && (
              <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-emerald-600" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("settings")}
            className={cn(
              "relative flex items-center gap-2 px-4 py-3.5 transition",
              activeTab === "settings" ? "text-emerald-700" : "text-slate-500 hover:text-slate-800",
            )}
          >
            <SettingsIcon className="size-4" />
            <span>رسائل الطلبات الآلية</span>
            {activeTab === "settings" && (
              <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-emerald-600" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("test")}
            className={cn(
              "relative flex items-center gap-2 px-4 py-3.5 transition",
              activeTab === "test" ? "text-emerald-700" : "text-slate-500 hover:text-slate-800",
            )}
          >
            <Send className="size-4" />
            <span>إرسال تجريبي</span>
            {activeTab === "test" && (
              <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-emerald-600" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("logs")}
            className={cn(
              "relative flex items-center gap-2 px-4 py-3.5 transition",
              activeTab === "logs" ? "text-emerald-700" : "text-slate-500 hover:text-slate-800",
            )}
          >
            <MessageSquare className="size-4" />
            <span>سجل النشاط ({logs.length})</span>
            {activeTab === "logs" && (
              <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-emerald-600" />
            )}
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* TAB 1: QR CODE & CONNECTION */}
          {activeTab === "qr" && (
            <div className="space-y-6">
              {isConnected ? (
                <div className="rounded-3xl bg-emerald-50/70 p-6 ring-1 ring-emerald-200">
                  <div className="flex items-start gap-4">
                    <span className="grid size-12 place-items-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/30">
                      <CircleCheck className="size-7" />
                    </span>
                    <div className="flex-1">
                      <h3 className="font-display text-lg font-bold text-emerald-950">
                        بوت الواتساب متصل بنجاح وجاهز للعمل!
                      </h3>
                      <p className="mt-1 text-sm text-emerald-800">
                        الرقم المتصل:{" "}
                        <strong className="font-mono text-base font-bold text-emerald-900" dir="ltr">
                          +{data?.user}
                        </strong>{" "}
                        ({data?.userName || "واتساب"})
                      </p>
                      {data?.lastConnectedAt && (
                        <p className="mt-1 text-xs text-emerald-700">
                          وقت الاتصال: {new Date(data.lastConnectedAt).toLocaleString("ar-EG")}
                        </p>
                      )}

                      <div className="mt-4 flex flex-wrap items-center gap-2.5">
                        <span className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-1.5 text-xs font-semibold text-emerald-900 shadow-sm ring-1 ring-emerald-300">
                          <Radio className="size-3.5 text-emerald-600 animate-pulse" />
                          المراسلة التلقائية للطلبات الجديدة: مفعلة
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-1.5 text-xs font-semibold text-emerald-900 shadow-sm ring-1 ring-emerald-300">
                          <CircleCheck className="size-3.5 text-emerald-600" />
                          الرد التلقائي للتأكيد: مفعل
                        </span>
                      </div>

                      <div className="mt-6 flex items-center gap-3 border-t border-emerald-200/80 pt-4">
                        <button
                          type="button"
                          onClick={() => handleConnect(false)}
                          disabled={actionLoading}
                          className={buttonClasses({ variant: "light", size: "sm" })}
                        >
                          <RefreshCw className={cn("size-4", actionLoading && "animate-spin")} />
                          فحص الاتصال
                        </button>
                        <button
                          type="button"
                          onClick={handleDisconnect}
                          disabled={actionLoading}
                          className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-rose-50 px-3.5 text-xs font-bold text-rose-700 ring-1 ring-inset ring-rose-200 transition hover:bg-rose-100"
                        >
                          <LogOut className="size-4" />
                          تسجيل الخروج وفصل الربط
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 md:items-center">
                  {/* QR Box */}
                  <div className="flex flex-col items-center justify-center rounded-3xl bg-slate-50 p-6 text-center ring-1 ring-slate-200">
                    {data?.qrDataUrl ? (
                      <div className="relative">
                        <div className="overflow-hidden rounded-2xl bg-white p-3 shadow-md ring-1 ring-slate-200">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={data.qrDataUrl}
                            alt="رمز استجابة سريعة للواتساب"
                            className="size-60 object-contain sm:size-64"
                          />
                        </div>
                        <p className="mt-3 text-xs font-semibold text-slate-500">
                          يتجدد الرمز تلقائياً كل 20 ثانية للحماية
                        </p>
                      </div>
                    ) : (
                      <div className="grid size-60 place-items-center rounded-2xl bg-slate-100 p-6 text-slate-400">
                        {isConnecting ? (
                          <div className="text-center">
                            <LoaderCircle className="mx-auto size-8 animate-spin text-brand-600" />
                            <p className="mt-3 text-sm font-semibold text-slate-700">جاري إنشاء رمز QR جديد...</p>
                          </div>
                        ) : (
                          <div className="text-center">
                            <QrCode className="mx-auto size-12 text-slate-400" />
                            <p className="mt-3 text-sm font-semibold text-slate-600">الرمز غير جاهز حالياً</p>
                            <button
                              type="button"
                              onClick={() => handleConnect(true)}
                              className={cn(buttonClasses({ variant: "primary", size: "sm" }), "mt-3")}
                            >
                              توليد رمز QR
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="mt-4 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleConnect(true)}
                        disabled={actionLoading}
                        className={buttonClasses({ variant: "light", size: "sm" })}
                      >
                        <RefreshCw className={cn("size-4", actionLoading && "animate-spin")} />
                        تحديث الرمز
                      </button>
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className="space-y-4">
                    <h3 className="font-display text-lg font-bold text-slate-900">
                      كيفية ربط الواتساب مع الموقع:
                    </h3>
                    <ol className="space-y-3 text-sm text-slate-600">
                      <li className="flex items-start gap-3">
                        <span className="grid size-6 shrink-0 place-items-center rounded-full bg-brand-50 font-mono text-xs font-bold text-brand-600">
                          1
                        </span>
                        <span>افتح تطبيق <strong>واتساب</strong> على هاتفك المحمول.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="grid size-6 shrink-0 place-items-center rounded-full bg-brand-50 font-mono text-xs font-bold text-brand-600">
                          2
                        </span>
                        <span>
                          اضغط على <strong>القائمة (⋮)</strong> في أندرويد أو <strong>الإعدادات</strong> في آيفون.
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="grid size-6 shrink-0 place-items-center rounded-full bg-brand-50 font-mono text-xs font-bold text-brand-600">
                          3
                        </span>
                        <span>
                          اختر <strong>الأجهزة المرتبطة (Linked Devices)</strong> ثم اضغط على <strong>ربط جهاز</strong>.
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="grid size-6 shrink-0 place-items-center rounded-full bg-brand-50 font-mono text-xs font-bold text-brand-600">
                          4
                        </span>
                        <span>وجّه كاميرا هاتفك نحو رمز الـ QR المقابل وسيبدأ البوت فوراً.</span>
                      </li>
                    </ol>

                    <div className="rounded-2xl bg-amber-50 p-3.5 text-xs text-amber-900 ring-1 ring-amber-200">
                      💡 <strong>ملاحظة هامة:</strong> بمجرد مسح الرمز، سيظل البوت شغالاً في الخلفية، وسيقوم تلقائياً بمراسلة أي عميل يسجل طلب نقل جديد فوراً.
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SETTINGS & TEMPLATES */}
          {activeTab === "settings" && (
            <div className="space-y-6">
              {/* Toggles */}
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex cursor-pointer items-start gap-3 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200 transition hover:bg-slate-100">
                  <input
                    type="checkbox"
                    checked={autoMessageNewOrders}
                    onChange={(e) => setAutoMessageNewOrders(e.target.checked)}
                    className="mt-1 size-4 rounded text-brand-600 focus:ring-brand-500"
                  />
                  <div>
                    <span className="text-sm font-bold text-slate-900">مراسلة الطلبات الجديدة تلقائياً</span>
                    <p className="mt-0.5 text-xs text-slate-500">
                      إرسال رسالة فورية للعميل بمجرد إرسال طلبه من الموقع مع كود الطلب.
                    </p>
                  </div>
                </label>

                <label className="flex cursor-pointer items-start gap-3 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200 transition hover:bg-slate-100">
                  <input
                    type="checkbox"
                    checked={autoReply}
                    onChange={(e) => setAutoReply(e.target.checked)}
                    className="mt-1 size-4 rounded text-brand-600 focus:ring-brand-500"
                  />
                  <div>
                    <span className="text-sm font-bold text-slate-900">الرد التلقائي وتأكيد الطلبات</span>
                    <p className="mt-0.5 text-xs text-slate-500">
                      تأكيد الطلب وتحديث حالته إلى &quot;مؤكد&quot; إذا رد العميل بـ (نعم / تأكيد).
                    </p>
                  </div>
                </label>
              </div>

              {/* Template Editor */}
              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="wa-template" className="text-sm font-bold text-slate-900">
                    نص الرسالة الترحيبية للطلب الجديد:
                  </label>
                  <button
                    type="button"
                    onClick={handleResetTemplate}
                    className="text-xs font-semibold text-brand-600 underline hover:text-brand-800"
                  >
                    استعادة النص الافتراضي
                  </button>
                </div>

                <textarea
                  id="wa-template"
                  rows={8}
                  value={template}
                  onChange={(e) => setTemplate(e.target.value)}
                  className="mt-2 block w-full rounded-2xl border-0 bg-slate-50 p-4 font-mono text-sm leading-relaxed text-slate-900 ring-1 ring-inset ring-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />

                {/* Available Variables tags */}
                <div className="mt-3">
                  <p className="text-xs font-semibold text-slate-500">
                    المتغيرات المتاحة للاستخدام في القالب (اضغط للإضافة):
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {[
                      { tag: "{client_name}", label: "اسم العميل" },
                      { tag: "{booking_code}", label: "رقم الطلب" },
                      { tag: "{from_area}", label: "منطقة التحميل" },
                      { tag: "{to_area}", label: "منطقة التوصيل" },
                      { tag: "{move_date}", label: "تاريخ النقل" },
                      { tag: "{services_line}", label: "الخدمات المطلوبة" },
                    ].map((item) => (
                      <button
                        key={item.tag}
                        type="button"
                        onClick={() => setTemplate((t) => `${t} ${item.tag}`)}
                        className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200 hover:bg-slate-200"
                      >
                        <span className="font-mono text-brand-700">{item.tag}</span>
                        <span className="text-slate-400">({item.label})</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex items-center gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={handleSaveSettings}
                  disabled={actionLoading}
                  className={buttonClasses({ variant: "primary", size: "sm" })}
                >
                  {actionLoading ? "جاري الحفظ..." : "حفظ الإعدادات"}
                </button>
                {settingsSaved && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600">
                    <CircleCheck className="size-4" />
                    تم حفظ الإعدادات بنجاح
                  </span>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: TEST MESSAGE */}
          {activeTab === "test" && (
            <div className="max-w-xl space-y-4">
              <p className="text-sm text-slate-600">
                يمكنك تجربة إرسال رسالة مباشرة لأي رقم موبايل للتأكد من أن البوت يرسل بنجاح:
              </p>

              <form onSubmit={handleSendTest} className="space-y-4">
                <div>
                  <label htmlFor="test-phone" className="text-xs font-bold text-slate-700">
                    رقم الموبايل (مثال: 01012345678 أو 201012345678)
                  </label>
                  <input
                    id="test-phone"
                    type="tel"
                    required
                    value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value)}
                    placeholder="01xxxxxxxxx"
                    className="mt-1 block h-11 w-full rounded-2xl border-0 bg-slate-50 px-4 text-sm font-semibold text-slate-900 ring-1 ring-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label htmlFor="test-msg" className="text-xs font-bold text-slate-700">
                    نص الرسالة التجريبية
                  </label>
                  <textarea
                    id="test-msg"
                    rows={3}
                    required
                    value={testMsg}
                    onChange={(e) => setTestMsg(e.target.value)}
                    placeholder="مرحباً، هذه رسالة تجريبية من بوت NA2LAX..."
                    className="mt-1 block w-full rounded-2xl border-0 bg-slate-50 p-4 text-sm text-slate-900 ring-1 ring-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                {testNotice && (
                  <div
                    className={cn(
                      "rounded-2xl p-3 text-xs font-semibold ring-1 ring-inset",
                      testNotice.ok ? "bg-emerald-50 text-emerald-800 ring-emerald-200" : "bg-rose-50 text-rose-800 ring-rose-200",
                    )}
                  >
                    {testNotice.text}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={actionLoading || !isConnected}
                  className={cn(buttonClasses({ variant: "whatsapp", size: "sm" }), "mt-2")}
                >
                  <Send className="size-4" />
                  {actionLoading ? "جاري الإرسال..." : "إرسال الرسالة الآن"}
                </button>
                {!isConnected && (
                  <p className="mt-1 text-xs text-rose-600 font-semibold">
                    * يجب ربط البوت عبر الـ QR كود أولاً قبل الإرسال.
                  </p>
                )}
              </form>
            </div>
          )}

          {/* TAB 4: ACTIVITY LOGS */}
          {activeTab === "logs" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">
                  آخر الرسائل المرسلة والمستلمة عبر البوت:
                </span>
                <button
                  type="button"
                  onClick={loadLogs}
                  className="text-xs font-semibold text-brand-600 hover:text-brand-800 flex items-center gap-1"
                >
                  <RefreshCw className="size-3" />
                  تحديث السجل
                </button>
              </div>

              {logs.length === 0 ? (
                <div className="rounded-2xl bg-slate-50 py-12 text-center ring-1 ring-slate-200">
                  <Inbox className="mx-auto size-8 text-slate-400" />
                  <p className="mt-2 text-sm text-slate-600">لا توجد رسائل مسجلة حتى الآن.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 rounded-2xl bg-slate-50 ring-1 ring-slate-200 max-h-96 overflow-y-auto">
                  {logs.map((log) => (
                    <div key={log.id} className="p-3 text-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "rounded-full px-2 py-0.5 font-bold text-[10px]",
                              log.type === "sent" && "bg-emerald-100 text-emerald-800",
                              log.type === "received" && "bg-sky-100 text-sky-800",
                              log.type === "system" && "bg-slate-200 text-slate-700",
                              log.type === "error" && "bg-rose-100 text-rose-800",
                            )}
                          >
                            {log.type === "sent" && "مرسلة"}
                            {log.type === "received" && "واردة من عميل"}
                            {log.type === "system" && "نظام"}
                            {log.type === "error" && "خطأ"}
                          </span>

                          {log.phone && <span className="font-mono font-bold text-slate-700">{log.phone}</span>}
                          {log.clientName && <span className="text-slate-600">({log.clientName})</span>}
                          {log.bookingCode && (
                            <span className="font-mono rounded bg-white px-1.5 py-0.5 ring-1 ring-slate-200">
                              {log.bookingCode}
                            </span>
                          )}
                        </div>

                        <span className="text-[11px] text-slate-400">
                          {new Date(log.timestamp).toLocaleTimeString("ar-EG")}
                        </span>
                      </div>

                      <p className="mt-1.5 whitespace-pre-line text-slate-800 bg-white p-2 rounded-xl ring-1 ring-slate-200/60">
                        {log.message}
                      </p>

                      {log.status && (
                        <span className="mt-1 inline-block text-[10px] font-semibold text-emerald-600">
                          ✓ {log.status}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * زر وأيقونة حالة الواتساب في شريط الهيدر للوحة الإدارة
 */
export function WhatsAppHeaderButton() {
  const [modalOpen, setModalOpen] = useState(false);
  const [status, setStatus] = useState<WhatsAppStatus | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await getWhatsAppStatus();
        setStatus(res);
      } catch {}
    };

    const initialTimer = setTimeout(() => void fetchStatus(), 0);
    const intervalTimer = window.setInterval(fetchStatus, 8000);
    return () => {
      clearTimeout(initialTimer);
      clearInterval(intervalTimer);
    };
  }, []);

  const isConnected = status?.status === "connected";
  const isQr = status?.status === "qr";

  return (
    <>
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className={cn(
          "inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-bold transition shadow-sm",
          isConnected && "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/20",
          isQr && "bg-amber-500 text-white hover:bg-amber-600 shadow-amber-500/20 animate-pulse",
          (!status || status.status === "disconnected" || status.status === "error") &&
            "bg-white/10 text-slate-200 hover:bg-white/20 ring-1 ring-white/15",
        )}
      >
        <WhatsAppIcon className="size-4 shrink-0" />
        <span>
          {isConnected && `واتساب متصل (+${status.user?.slice(-4)})`}
          {isQr && "مسح كود الواتساب (QR)"}
          {(!status || status.status === "disconnected") && "ربط الواتساب (QR)"}
          {status?.status === "connecting" && "جاري الاتصال..."}
        </span>
      </button>

      <WhatsAppManagerModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
