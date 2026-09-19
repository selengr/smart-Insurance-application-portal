import "./globals.css";
import { use } from 'react'
import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import { Locale, i18n } from "../../../i18n.config";

import Navbar from "@/sections/nav/navbar";
import SiteFooter from "@/sections/footer/site-footer";
import QueryProvider from "@/provider/QueryClientProvider";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { estedad, displayFont, bodyFont } from "@/tailwind/font";
import { getDictionary } from "@/lib/dictionary";
import { APP_DEFAULT_TITLE_EN, APP_DESCRIPTION_EN, APP_TITLE_TEMPLATE_EN, APP_DEFAULT_TITLE_FA, APP_DESCRIPTION_FA, APP_TITLE_TEMPLATE_FA, APP_KEYWORDS } from "../../../config-global";

const metadataTranslations: Record<Locale, Metadata> = {
  en: {
    title: {
      absolute: '',
      default: APP_DEFAULT_TITLE_EN,
      template: APP_TITLE_TEMPLATE_EN,
    },
    description: APP_DESCRIPTION_EN,
    keywords: APP_KEYWORDS,
    openGraph: {
      title: APP_DEFAULT_TITLE_EN,
      description: APP_DESCRIPTION_EN,
      type: "website",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: APP_DEFAULT_TITLE_EN,
      description: APP_DESCRIPTION_EN,
    },
  },
  fa: {
    title: {
      absolute: '',
      default: APP_DEFAULT_TITLE_FA,
      template: APP_TITLE_TEMPLATE_FA,
    },
    description: APP_DESCRIPTION_FA,
    keywords: APP_KEYWORDS,
    openGraph: {
      title: APP_DEFAULT_TITLE_FA,
      description: APP_DESCRIPTION_FA,
      type: "website",
      locale: "fa_IR",
    },
    twitter: {
      card: "summary_large_image",
      title: APP_DEFAULT_TITLE_FA,
      description: APP_DESCRIPTION_FA,
    },
  },
};

type Params = Promise<{ lang: Locale }>
export async function generateMetadata({ params }: { params: Params }) {
  const { lang } = await params;
  return metadataTranslations[lang];
}

export async function generateStaticParams() {
  return i18n.locales.map((locale: string) => ({ lang: locale }));
}

export default function RootLayout(props: {
  children: React.ReactNode
  params: Params
}) {
  const params = use(props.params)
  const lang = params.lang
  const { page } = use(getDictionary(lang))

  const fontClass =
    lang === "fa"
      ? `${estedad.className}`
      : `${displayFont.variable} ${bodyFont.variable} font-[family-name:var(--font-body)]`;

  return (
    <html lang={lang} dir={lang === "fa" ? "rtl" : "ltr"}>
      <body
        className={`${fontClass} antialiased min-h-screen transition-colors duration-300`}
      >
        <ThemeProvider defaultTheme="system" storageKey="theme">
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
          >
            {page.common.skipToContent}
          </a>
          <div className="flex min-h-screen flex-col">
            <Navbar lang={lang} />
            <div id="main-content" className="flex-1 pt-16" tabIndex={-1}>
              <QueryProvider>{props.children}</QueryProvider>
            </div>
            <SiteFooter lang={lang} />
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
