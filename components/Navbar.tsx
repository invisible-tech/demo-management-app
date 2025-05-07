"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const navItems = [
  { label: "Dashboard", href: "/" },
  { label: "All Demos", href: "/demos" },
  { label: "Request Demo", href: "/demos/request" },
  { label: "Submit Demo", href: "/demos/submit" },
  { label: "How to Demo", href: "/how-to-demo" },
  { label: "Admin", href: "/admin" },
]

export default function Navbar() {
  const pathname = usePathname()

  return (
    <nav className="bg-primary text-white">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex-shrink-0 font-bold text-xl">
            <Link href="/">Demo Management</Link>
          </div>
          <div className="hidden md:block">
            <div className="flex space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "px-3 py-2 rounded-md text-sm font-medium",
                    pathname === item.href
                      ? "bg-primary-foreground text-primary"
                      : "hover:bg-primary-foreground/10"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="md:hidden">
            {/* Mobile menu button - could be expanded in the future */}
            <button className="p-2 rounded-md hover:bg-primary-foreground/10">
              <span className="sr-only">Open menu</span>
              {/* Icon for menu */}
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
} 