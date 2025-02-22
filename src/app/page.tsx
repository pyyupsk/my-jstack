import { RecentPost } from "@/components/post"
import Balancer from "react-wrap-balancer"

export default function Page() {
  return (
    <main className="grid min-h-screen place-items-center">
      <div className="container flex flex-col items-center gap-6 px-4 py-16">
        <h1 className="text-5xl font-extrabold tracking-tight">JStack</h1>
        <p className="text-muted-foreground max-w-sm text-center text-lg">
          <Balancer>
            The stack for building fast, lightweight, and end-to-end typesafe Next.js apps.
          </Balancer>
        </p>
        <RecentPost />
      </div>
    </main>
  )
}
