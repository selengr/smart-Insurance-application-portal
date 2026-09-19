import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[50vh] w-full max-w-xl flex-col items-center justify-center gap-4 px-4 py-20 text-center">
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold">
        Page not found
      </h1>
      <p className="text-muted-foreground">
        That page does not exist or the link is outdated.
      </p>
      <Button asChild>
        <Link href="/en">Go home</Link>
      </Button>
    </main>
  )
}
