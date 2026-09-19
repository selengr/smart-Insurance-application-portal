import { Shield, Sparkles, Clock3 } from "lucide-react"

const TIPS: Record<
  string,
  { en: { title: string; body: string }[]; fa: { title: string; body: string }[] }
> = {
  health_insurance_application: {
    en: [
      { title: "Pick the right network", body: "In-network plans usually cost less if your doctors are listed." },
      { title: "Be honest about smoking", body: "Accurate answers keep your reserved rate valid later." },
    ],
    fa: [
      { title: "شبکه مناسب", body: "اگر پزشکان شما طرف قرارداد هستند، طرح شبکه داخلی معمولاً ارزان‌تر است." },
      { title: "سیگار را درست اعلام کنید", body: "پاسخ دقیق باعث می‌شود نرخ رزرو شده بعداً معتبر بماند." },
    ],
  },
  home_insurance_application: {
    en: [
      { title: "City drives pricing", body: "Choose country first — cities load automatically." },
      { title: "Contents matter", body: "High-value contents cover is worth it if you own expensive items." },
    ],
    fa: [
      { title: "شهر روی قیمت اثر دارد", body: "اول کشور را انتخاب کنید تا شهرها خودکار بارگذاری شوند." },
      { title: "اثاثیه مهم است", body: "اگر وسایل گران دارید، پوشش ارزش بالا منطقی است." },
    ],
  },
  car_insurance_application: {
    en: [
      { title: "Brand unlocks models", body: "Select a brand to see matching model presets." },
      { title: "Usage changes risk", body: "Ride-share and business use typically raise the estimate." },
    ],
    fa: [
      { title: "برند، مدل را باز می‌کند", body: "با انتخاب برند، مدل‌های ازپیش‌تعریف‌شده ظاهر می‌شوند." },
      { title: "کاربری ریسک را عوض می‌کند", body: "استفاده تجاری یا اسنپ معمولاً برآورد را بالاتر می‌برد." },
    ],
  },
  life_insurance_application: {
    en: [
      { title: "Term vs amount", body: "Longer terms cost more — balance cover with what you can reserve." },
      { title: "Name a beneficiary", body: "A clear beneficiary speeds up any future claim review." },
    ],
    fa: [
      { title: "مدت در برابر مبلغ", body: "مدت طولانی‌تر هزینه بیشتری دارد — تعادل را حفظ کنید." },
      { title: "ذی‌نفع را مشخص کنید", body: "ذی‌نفع شفاف بررسی ادعای بعدی را سریع‌تر می‌کند." },
    ],
  },
}

const ICONS = [Sparkles, Shield, Clock3]

export function ApplicationTips({
  formId,
  lang,
  heading,
}: {
  formId: string
  lang: string
  heading: string
}) {
  const tips = TIPS[formId]?.[lang === "fa" ? "fa" : "en"] ?? TIPS.health_insurance_application.en

  return (
    <aside className="border border-border/80 bg-card/40 p-5">
      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-primary">{heading}</p>
      <ul className="mt-4 space-y-4">
        {tips.map((tip, index) => {
          const Icon = ICONS[index % ICONS.length]
          return (
            <li key={tip.title} className="flex gap-3">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center border border-border bg-background">
                <Icon className="h-4 w-4 text-primary" aria-hidden />
              </span>
              <div>
                <p className="text-sm font-semibold">{tip.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{tip.body}</p>
              </div>
            </li>
          )
        })}
      </ul>
    </aside>
  )
}
