import { redirect } from "next/navigation";

export default function Home() {
  // Redirect to catalog page as the main entry point
  redirect("/catalog");
}
