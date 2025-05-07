import Link from "next/link"
import { Button } from "@/app/components/ui/button"

export default function Home() {
  return (
    <div className="space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Demo Management Portal</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Streamline your demo process from request to delivery
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DashboardCard
          title="View Demos"
          description="Browse all existing demos, search, and filter by different criteria."
          href="/demos"
          buttonText="Browse Demos"
        />
        <DashboardCard
          title="Request Demo"
          description="Need a new demo? Submit a request and track its progress."
          href="/demos/request"
          buttonText="Request Demo"
        />
        <DashboardCard
          title="Submit Demo"
          description="Created a new demo? Submit it for review and cataloging."
          href="/demos/submit"
          buttonText="Submit Demo"
        />
        <DashboardCard
          title="How to Demo"
          description="Learn best practices for creating and delivering effective demos."
          href="/how-to-demo"
          buttonText="Learn More"
        />
        <DashboardCard
          title="Admin Dashboard"
          description="Manage demos, assign tasks, and track progress (for admins only)."
          href="/admin"
          buttonText="Admin Panel"
        />
        <DashboardCard
          title="Demo Status"
          description="Check the status of requested demos and their progress."
          href="/demos?status=requested"
          buttonText="View Status"
        />
      </div>
    </div>
  )
}

function DashboardCard({
  title,
  description,
  href,
  buttonText,
}: {
  title: string
  description: string
  href: string
  buttonText: string
}) {
  return (
    <div className="bg-card rounded-lg shadow-md p-6 flex flex-col justify-between">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="text-muted-foreground">{description}</p>
      </div>
      <div className="mt-4">
        <Button asChild className="w-full">
          <Link href={href}>{buttonText}</Link>
        </Button>
      </div>
    </div>
  )
}
