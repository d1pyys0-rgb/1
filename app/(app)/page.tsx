import { Suspense } from "react"
import { DownloadIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { WelcomeToast } from "@/components/welcome-toast"
import { getLatestDownloadFile } from "@/lib/db"
import { getServiceClient } from "@/lib/supabase/service"

async function getDownloadUrl() {
  const file = await getLatestDownloadFile()
  if (!file) return { file: null, url: null }

  const supabase = getServiceClient()
  const { data } = await supabase.storage.from("downloads").createSignedUrl(file.path, 60 * 10, {
    download: file.name,
  })
  return { file, url: data?.signedUrl ?? null }
}

export default async function HomePage() {
  const { file, url } = await getDownloadUrl()
  const isAvailable = Boolean(file && url)

  return (
    <main>
      <Suspense fallback={null}>
        <WelcomeToast />
      </Suspense>

      <section className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center gap-8 px-4 text-center">
        <h1 className="text-balance text-6xl font-bold tracking-tight">
          <span className="text-foreground">bunny</span>
          <span className="text-primary">love</span>
        </h1>

        <div className="flex flex-col items-center gap-2">
          {isAvailable ? (
            <Button
              size="lg"
              render={<a href={url!} download={file!.name} />}
              className="h-11 px-6 text-base transition-transform hover:scale-[1.02] hover:shadow-[0_0_32px_0_rgba(255,59,129,0.35)]"
            >
              <DownloadIcon data-icon="inline-start" />
              Download
            </Button>
          ) : (
            <>
              <Button size="lg" disabled className="h-11 px-6 text-base">
                <DownloadIcon data-icon="inline-start" />
                Download
              </Button>
              <p className="text-sm text-muted-foreground">файл ещё не добавлен</p>
            </>
          )}
        </div>
      </section>

      <div className="pt-20">
        <div className="mx-auto h-px w-full max-w-3xl bg-border" />
      </div>

      <section className="flex flex-col items-center gap-3 px-4 pb-24 pt-6 text-center">
        <h2 className="text-balance text-base font-medium tracking-tight text-muted-foreground sm:text-lg">
          <span className="text-foreground">bunny</span>
          <span className="text-primary">love</span>
          <span className="text-foreground"> mafia </span>
          <span className="font-semibold text-primary">$$$</span>
        </h2>
      </section>
    </main>
  )
}
