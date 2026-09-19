import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function RootNotFound() {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground antialiased">
        <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col items-center justify-center gap-4 px-4 text-center">
          <h1 className="text-3xl font-bold">Page not found / صفحه پیدا نشد</h1>
          <p className="text-muted-foreground">
            That page does not exist. / این صفحه وجود ندارد.
          </p>
          <div className="flex gap-3">
            <Button asChild>
              <Link href="/en">Home</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/fa">خانه</Link>
            </Button>
          </div>
        </main>
      </body>
    </html>
  )
}
