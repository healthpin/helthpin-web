"use client";

import { Button } from "@/components/ui/Button";
import { ReceiptIcon } from "@/components/ui/icons";

/** Opens the browser's print dialog, where "Save as PDF" downloads the receipt. */
export function PrintButton() {
  return (
    <Button onClick={() => window.print()} leadingIcon={<ReceiptIcon width={18} height={18} />}>
      Download PDF / Print
    </Button>
  );
}
