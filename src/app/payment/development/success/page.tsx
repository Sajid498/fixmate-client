
import Link from "next/link";
import { CheckCircle2, ReceiptText } from "lucide-react";

export default async function DevelopmentPaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ bookingId?: string; message?: string }>;
}) {
  const params = await searchParams;

  return (
    <section className="flex min-h-[75vh] items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-lg rounded-2xl border border-amber-200 bg-white p-8 text-center shadow-sm">
        <CheckCircle2 className="mx-auto h-16 w-16 text-green-500" />

        <p className="mt-5 text-xs font-bold uppercase tracking-widest text-amber-700">
          Development simulation
        </p>

        <h1 className="mt-2 text-2xl font-bold text-slate-900">
          Simulated Payment Successful
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-600">
          {params.message ||
            "The development payment was recorded successfully."}
        </p>

        <div className="mt-5 rounded-lg bg-amber-50 p-4 text-left text-sm text-amber-900">
          <div className="flex items-center gap-2 font-semibold">
            <ReceiptText size={17} />
            Test transaction only
          </div>

          <p className="mt-1">
            No real money was charged. This is not a Stripe transaction.
          </p>

          {params.bookingId && (
            <p className="mt-2 break-all text-xs">
              Booking ID: {params.bookingId}
            </p>
          )}
        </div>

        <Link
          href="/dashboard/customer/bookings"
          className="mt-7 inline-flex w-full justify-center rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Back to My Bookings
        </Link>
      </div>
    </section>
  );
}
