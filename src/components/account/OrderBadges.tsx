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

export function OrderStatusChip({ status }: { status: string }) {
  return (
    <span className="inline-flex items-center gap-1 capitalize">
      <StatusIcon status={status} />
      {status.replace(/_/g, " ")}
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
