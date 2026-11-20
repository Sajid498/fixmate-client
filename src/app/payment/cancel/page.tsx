
import Link from "next/link";
import { ArrowLeft, CreditCard, XCircle } from "lucide-react";

export default function PaymentCancelPage() {
  return (
    <section className="flex min-h-[75vh] items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <XCircle className="mx-auto h-16 w-16 text-amber-500" />

        <h1 className="mt-6 text-2xl font-bold text-slate-900">
          Payment Cancelled
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-500">
          Your checkout was cancelled. No payment was recorded and your booking
          remains unpaid. You can try again whenever you are ready.
        </p>

        <Link
          href="/dashboard/customer/bookings"
          className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
        >
          <CreditCard size={18} />
          Try Again
        </Link>

        <Link
          href="/dashboard/customer"
          className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>
      </div>
    </section>
  );
}
