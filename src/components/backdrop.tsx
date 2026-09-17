/** خلفية زخرفية للأقسام الداكنة: توهج أزرق + شبكة خفيفة (بدون blur لأداء أفضل على الموبايل) */
export function DarkBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_65%_55%_at_50%_-5%,rgb(30_91_241/0.38),transparent_70%),radial-gradient(ellipse_45%_40%_at_0%_100%,rgb(14_165_233/0.14),transparent_70%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgb(255_255_255/0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgb(255_255_255/0.035)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_30%,black,transparent)]" />
    </div>
  );
}
