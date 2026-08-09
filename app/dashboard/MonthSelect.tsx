"use client";

import { useRouter } from "next/navigation";

function monthLabel(monthStr: string): string {
  const [y, m] = monthStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString("es", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export default function MonthSelect({ month, options }: { month: string; options: string[] }) {
  const router = useRouter();

  return (
    <select
      value={month}
      onChange={(e) => router.push(`/dashboard?month=${e.target.value}`)}
      className="input-field w-auto capitalize"
    >
      {options.map((m) => (
        <option key={m} value={m} className="capitalize">
          {monthLabel(m)}
        </option>
      ))}
    </select>
  );
}
