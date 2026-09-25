// The real <html>/<body> live in [lang]/layout.tsx. This pass-through root
// layout only exists so the top-level not-found.tsx has a layout to build with.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children
}
