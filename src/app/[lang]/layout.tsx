import "./globals.css";
import { use } from 'react'
import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import { Locale, i18n } from "../../../i18n.config";

import Navbar from "@/sections/nav/navbar";
import QueryProvider from "@/provider/QueryClientProvider";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { estedad, geistMono, geistSans } from "@/tailwind/font";
import { APP_DEFAULT_TITLE_EN, APP_DESCRIPTION_EN, APP_TITLE_TEMPLATE_EN, APP_DEFAULT_TITLE_FA, APP_DESCRIPTION_FA, APP_TITLE_TEMPLATE_FA, APP_KEYWORDS } from "../../../config-global";


// ----------------------------------------------------------------------

const metadataTranslations: Record<Locale, Metadata> = {
  en: {
    title: {
      absolute: '',
      default: APP_DEFAULT_TITLE_EN,
      template: APP_TITLE_TEMPLATE_EN,
    },
    description: APP_DESCRIPTION_EN,
    keywords: APP_KEYWORDS,
  },
  fa: {
    title: {
      absolute: '',
      default: APP_DEFAULT_TITLE_FA,
      template: APP_TITLE_TEMPLATE_FA,
    },
    description: APP_DESCRIPTION_FA,
    keywords: APP_KEYWORDS,
  },
};

type Params = Promise<{ lang: Locale }>
export async function generateMetadata({ params }: { params: Params }) {

  const { lang } = await (params);
  return metadataTranslations[lang];
}

// ----------------------------------------------------------------------

// ----------------------------------------------------------------------
export async function generateStaticParams() {
  return i18n.locales.map((locale: string) => ({ lang: locale }));
}
// ----------------------------------------------------------------------


  export default function RootLayout(props: {
    children: React.ReactNode
    params: Params
  }) {
  const params = use(props.params)
  const lang = params.lang

  const fontClass =
     lang === "fa"
      ? `${estedad.className}`
      : `${geistSans.variable} ${geistMono.variable} font-sans`;

  return (
    <html lang={lang}>
      <body
        className={`${fontClass} antialiased min-h-screen dark:text-[hsla(0,0%,100%,.9)] transition-colors duration-300`}
      >
        <ThemeProvider defaultTheme="dark" storageKey="theme">
          <Navbar lang={lang} />

          <div className="mt-16">
            <QueryProvider>{props.children}</QueryProvider>
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
