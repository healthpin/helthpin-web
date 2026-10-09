import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/PageHeader";
import { getLiveQueue } from "@/features/bookings/api/bookingsApi";
import { LiveQueue } from "@/features/bookings/components/LiveQueue";
import { withHospitalToken } from "@/lib/auth/hospitalRequest";
import { requireHospital } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Live Queue" };

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export default async function QueuePage({ searchParams }: PageProps<"/hospital/queue">) {
  await requireHospital();

  const params = await searchParams;
  // No date: today at the hospital, decided by the server.
  const date = typeof params.date === "string" && DATE_PATTERN.test(params.date) ? params.date : undefined;
  const queue = await withHospitalToken((token) => getLiveQueue(token, date));

  return (
    <>
      <PageHeader
        title="Live Queue"
        description="Who is being seen, who is waiting and the estimated wait for each doctor."
      />
      <LiveQueue initial={queue} date={date} />
    </>
  );
}
