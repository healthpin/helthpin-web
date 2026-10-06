import { redirect } from "next/navigation";

/** "/" -> the dashboard (proxy.ts sends signed-out visitors to /login). */
export default function Home() {
  redirect("/dashboard");
}
