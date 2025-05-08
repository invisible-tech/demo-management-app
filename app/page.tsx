import { redirect } from "next/navigation"

export default function Home() {
  redirect("/demos")
  
  // This won't be rendered due to the redirect
  return null
}
