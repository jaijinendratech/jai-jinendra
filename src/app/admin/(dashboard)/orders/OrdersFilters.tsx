"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ORDER_STATUSES,
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
} from "@/lib/admin/status";
import { fieldClassName } from "@/components/admin/ui";
import { SearchField } from "@/components/admin/SearchField";

export function OrdersFilters({
  q,
  status,
  payment,
}: {
  q: string;
  status: string;
  payment: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(q);
  const [st, setSt] = useState(status);
  const [pay, setPay] = useState(payment);

  function apply(next?: { q?: string; status?: string; payment?: string }) {
    const params = new URLSearchParams();
    const qq = next?.q ?? query;
    const ss = next?.status ?? st;
    const pp = next?.payment ?? pay;
    if (qq) params.set("q", qq);
    if (ss && ss !== "all") params.set("status", ss);
    if (pp && pp !== "all") params.set("payment", pp);
    const qs = params.toString();
    router.push(qs ? `/admin/orders?${qs}` : "/admin/orders");
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <SearchField
        value={query}
        onChange={(value) => {
          setQuery(value);
          apply({ q: value });
        }}
        onSubmit={() => apply({ q: query })}
        placeholder="Search order, customer, email…"
      />
      <select
        value={st}
        onChange={(e) => {
          setSt(e.target.value);
          apply({ status: e.target.value });
        }}
        className={`${fieldClassName()} mt-0! max-w-45`}
        aria-label="Filter by order status"
      >
        <option value="all">All statuses</option>
        {ORDER_STATUSES.map((s) => (
          <option key={s} value={s}>
            {ORDER_STATUS_LABELS[s]}
          </option>
        ))}
      </select>
      <select
        value={pay}
        onChange={(e) => {
          setPay(e.target.value);
          apply({ payment: e.target.value });
        }}
        className={`${fieldClassName()} mt-0! max-w-40`}
        aria-label="Filter by payment status"
      >
        <option value="all">All payments</option>
        {Object.entries(PAYMENT_STATUS_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
}
