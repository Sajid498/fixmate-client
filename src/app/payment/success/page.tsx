
"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, LoaderCircle, XCircle } from "lucide-react";
import { authenticatedRequest } from "@/lib/api";

interface VerifiedPayment {
  amount: number;
  currency: string;
  transactionId: string;
  paidAt?: string;
}

interface VerificationResponse {
  success: boolean;
  message?: string;
  data?: VerifiedPayment;
}

function formatMoney(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount);
}

function PaymentVerification() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("session_id");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [payment, setPayment] = useState<VerifiedPayment | null>(null);

  useEffect(() => {
    let active = true;

    async function verifyPayment() {
      if (!sessionId) {
        setMessage("Payment session information is missing.");
        setLoading(false);
        return;
      }

      try {
        const response = await authenticatedRequest<VerificationResponse>(
          `/api/payments/verify?session_id=${encodeURIComponent(sessionId)}`,
        );

        if (!response.success || !response.data) {
          throw new Error(
            response.message || "Payment verification did not return payment details.",
          );
        }

        if (active) {
          setPayment(response.data);
          setSuccess(true);
          setMessage(response.message || "Your payment has been verified.");
        }
      } catch (error) {
        if (active) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Payment verification failed.";

          if (errorMessage.toLowerCase().includes("session")) {
            router.replace("/sign-in");
            return;
          }

          setMessage(errorMessage);
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void verifyPayment();

    return () => {
      active = false;
    };
  }, [sessionId, router]);

  return (
    <div className="flex min-h-[75vh] items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        {loading ? (
          <>
            <LoaderCircle className="mx-auto h-16 w-16 animate-spin text-blue-600" />
            <h1 className="mt-6 text-2xl font-bold text-slate-900">
              Verifying Your Payment
            </h1>
            <p className="mt-3 text-sm text-slate-500">
              Please wait while we confirm your transaction with Stripe.
            </p>
          </>
        ) : success && payment ? (
          <>
            <CheckCircle2 className="mx-auto h-16 w-16 text-green-500" />
            <h1 className="mt-6 text-2xl font-bold text-slate-900">
              Payment Successful!
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              {message}
            </p>

            <div className="mt-6 rounded-xl bg-green-50 p-5 text-left">
              <p className="text-xs font-semibold uppercase tracking-wide text-green-700">
                Payment receipt
              </p>
              <div className="mt-3 flex items-center justify-between gap-4">
                <span className="text-sm text-slate-600">Amount paid</span>
                <span className="text-xl font-bold text-slate-900">
                  {formatMoney(payment.amount, payment.currency)}
                </span>
              </div>
              <div className="mt-3 border-t border-green-100 pt-3">
                <p className="text-xs text-slate-500">Transaction ID</p>
                <p className="mt-1 break-all text-sm font-semibold text-slate-800">
                  {payment.transactionId || "Not provided by Stripe"}
                </p>
              </div>
              {payment.paidAt && (
                <p className="mt-3 text-xs text-slate-500">
                  Paid on: {new Date(payment.paidAt).toLocaleString()}
                </p>
              )}
            </div>

            <p className="mt-4 text-sm text-slate-500">
              Thank you for choosing FixMate.
            </p>
            <Link
              href="/dashboard/customer/bookings"
              className="mt-7 inline-flex w-full justify-center rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Back to My Bookings
            </Link>
          </>
        ) : (
          <>
            <XCircle className="mx-auto h-16 w-16 text-red-500" />
            <h1 className="mt-6 text-2xl font-bold text-slate-900">
              Verification Unsuccessful
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              {message}
            </p>
            <Link
              href="/dashboard/customer/bookings"
              className="mt-7 inline-flex w-full justify-center rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Return to My Bookings
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[75vh] items-center justify-center">
          <LoaderCircle className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      }
    >
      <PaymentVerification />
    </Suspense>
  );
}
