"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { client } from "@/lib/client"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Loader } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

export function RecentPost() {
  const [name, setName] = useState("")
  const queryClient = useQueryClient()

  const { data: recentPost, isPending: isLoadingPosts } = useQuery({
    queryKey: ["get-recent-post"],
    queryFn: async () => {
      const res = await client.post.recent.$get()
      return await res.json()
    },
  })

  const { mutate: createPost, isPending } = useMutation({
    mutationFn: async ({ name }: { name: string }) => {
      const res = await client.post.create.$post({ name })
      return await res.json()
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["get-recent-post"] })
      setName("")
    },
    onError: (err) => {
      toast.error(err.message)
    },
  })

  return (
    <Card className="w-full max-w-sm">
      <CardContent className="space-y-4">
        <p className="text-center font-mono">
          {isLoadingPosts
            ? "Loading posts..."
            : recentPost
              ? `Your recent post: "${recentPost.name}"`
              : "You have no posts yet."}
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            createPost({ name })
          }}
          className="flex flex-col gap-4"
        >
          <Input
            type="text"
            placeholder="Enter a title..."
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Button disabled={isPending} type="submit">
            {isPending ? <Loader className="animate-spin" /> : "Create Post"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
