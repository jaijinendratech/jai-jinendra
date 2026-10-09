import {
  Banknote,
  CheckCircle2,
  Clock,
  CreditCard,
  Truck,
  XCircle,
} from "lucide-react";

function StatusIcon({ status }: { status: string }) {
  const className = "size-3.5 shrink-0";
  switch (status) {
    case "cancelled":
      return <XCircle className={className} aria-hidden />;
    case "ready_to_ship":
    case "dispatched":
    case "shipped":
      return <Truck className={className} aria-hidden />;
    case "confirmed":
    case "cod_confirmed":
    case "delivered":
      return <CheckCircle2 className={className} aria-hidden />;
    default:
      return <Clock className={className} aria-hidden />;
  }
}

const CUSTOMER_STATUS_LABELS: Record<string, string> = {
  ready_to_ship: "Packed, ready for pickup",
  cod_confirmed: "Confirmed (Cash on delivery)",
};

export function OrderStatusChip({ status }: { status: string }) {
  return (
    <span className="inline-flex items-center gap-1 capitalize">
      <StatusIcon status={status} />
      {CUSTOMER_STATUS_LABELS[status] ?? status.replace(/_/g, " ")}
    </span>
  );
}

export function PaymentMethodLabel({ method }: { method: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 capitalize">
      {method === "cod" ? (
        <Banknote className="size-4 shrink-0" aria-hidden />
      ) : (
        <CreditCard className="size-4 shrink-0" aria-hidden />
      )}
      {method.replace(/_/g, " ")}
    </span>
  );
}
