// import type { Metadata } from "next"
// import Link from "next/link"
// import { Locale } from "../../../../i18n.config"
// import { getDictionary } from "@/lib/dictionary"
// import { buildPageMetadata } from "@/lib/page-metadata"
// import { ArrowUpRight } from "lucide-react"

// type Params = Promise<{ lang: Locale }>

// export async function generateMetadata({
//   params,
// }: {
//   params: Params
// }): Promise<Metadata> {
//   const { lang } = await params
//   const { page } = await getDictionary(lang)

//   return buildPageMetadata({
//     title: page.aboutPage.title,
//     description: page.aboutPage.lead,
//     lang,
//     path: "/about",
//   })
// }

// export default async function AboutPage({
//   params,
// }: {
//   params: Params
// }) {
//   const { lang } = await params
//   const { page } = await getDictionary(lang)
//   const about = page.aboutPage
//   const steps = about.steps ?? []

//   return (
//     <main className="relative mx-auto w-full max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
//       <div
//         className="pointer-events-none absolute inset-x-0 -top-10 -z-10 h-56 bg-[radial-gradient(ellipse_at_top,_oklch(0.72_0.06_195_/_0.14),_transparent_70%)]"
//         aria-hidden
//       />
//       <p className="mb-3 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-primary">
//         {page.home.brand}
//       </p>
//       <h1 className="font-[family-name:var(--font-display)] text-3xl font-extrabold tracking-tight sm:text-4xl">
//         {about.title}
//       </h1>
//       <p className="mt-4 text-lg text-muted-foreground">{about.lead}</p>
//       <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{about.body}</p>

//       {steps.length > 0 ? (
//         <section className="mt-12">
//           <h2 className="font-[family-name:var(--font-display)] text-xl font-bold">
//             {about.howTitle}
//           </h2>
//           <ol className="mt-6 grid gap-4 sm:grid-cols-3">
//             {steps.map((step, index) => (
//               <li
//                 key={step.title}
//                 className="border border-border bg-card/60 p-5"
//               >
//                 <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-primary">
//                   {String(index + 1).padStart(2, "0")}
//                 </p>
//                 <h3 className="mt-3 font-[family-name:var(--font-display)] text-base font-bold">
//                   {step.title}
//                 </h3>
//                 <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
//                   {step.body}
//                 </p>
//               </li>
//             ))}
//           </ol>
//         </section>
//       ) : null}

//       <Link
//         href={`/${lang}#products`}
//         className="mt-10 inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
//       >
//         {about.cta}
//         <ArrowUpRight className="h-4 w-4" aria-hidden />
//       </Link>
//     </main>
//   )
// }
