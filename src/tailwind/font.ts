import localFont from 'next/font/local';
import { Syne, DM_Sans } from "next/font/google";

export const estedad = localFont({
  src: [
    {
      path: '../../public/fonts/estedad/Estedad-FD-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../../public/fonts/estedad/Estedad-FD-ExtraBold.woff2',
      weight: '800',
      style: 'normal',
    },
    {
      path: '../../public/fonts/estedad/Estedad-FD-SemiBold.woff2',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../../public/fonts/estedad/Estedad-FD-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../public/fonts/estedad/Estedad-FD-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
  ],
  variable: "--font-display",
});

/** Display — bold postmodern headlines (EN) */
export const displayFont = Syne({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

/** Body — clean readable UI text (EN) */
export const bodyFont = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

/** Keep aliases used elsewhere */
export const geistSans = bodyFont;
export const geistMono = bodyFont;
