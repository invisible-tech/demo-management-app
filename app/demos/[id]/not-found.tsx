import Link from "next/link"
import { Button } from "@/app/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <h2 className="text-4xl font-bold mb-4">Demo Not Found</h2>
      <p className="text-muted-foreground mb-8 max-w-md">
        The demo you&apos;re looking for doesn&apos;t exist or has been removed.
      </p>
      <div className="flex gap-4">
        <Button asChild>
          <Link href="/demos">Browse Demos</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/demos/request">Request New Demo</Link>
        </Button>
      </div>
    </div>
  )
} 