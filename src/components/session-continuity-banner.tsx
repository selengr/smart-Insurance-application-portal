import Link from "next/link"
import { Button } from "@/components/ui/button"

type Props = {
  lang: string
  signedIn: boolean
  title: string
  body: string
  cta: string
  signedInLabel: string
  storageNote: string
}

export function SessionContinuityBanner({
  lang,
  signedIn,
  title,
  body,
  cta,
  signedInLabel,
  storageNote,
}: Props) {
  return (
    <div className="mb-6 border border-primary/25 bg-primary/5 px-4 py-4 sm:px-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">
            {signedIn ? signedInLabel : title}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {signedIn ? storageNote : body}
          </p>
        </div>
        {!signedIn ? (
          <Button asChild size="sm" className="shrink-0">
            <Link href={`/${lang}/login`}>{cta}</Link>
          </Button>
        ) : null}
      </div>
      {!signedIn ? (
        <p className="mt-3 text-xs text-muted-foreground">{storageNote}</p>
      ) : null}
    </div>
  )
}
