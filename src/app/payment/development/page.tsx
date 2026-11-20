
"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  LoaderCircle,
  ShieldAlert,
  XCircle,
} from "lucide-react";
import { authenticatedRequest } from "@/lib/api";

interface BookingPreview {
  _id: string;
  serviceTitle: string;
  finalAmount: number;
  status: string;
  paymentStatus: string;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

function formatMoney(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: process.env.NEXT_PUBLIC_PAYMENT_CURRENCY || "USD",
  }).format(amount);
}

function DevelopmentPaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId");

  const [booking, setBooking] = useState<BookingPreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadBooking() {
      if (!bookingId) {
        setError("Booking information is missing.");
        setLoading(false);
        return;
      }

      try {
        const response = await authenticatedRequest<
          ApiResponse<BookingPreview[]>
        >("/api/bookings/mine");

        const selected = response.data.find(
          (item) => item._id === bookingId,
        );

        if (!selected) {
          throw new Error("Booking not found in your account.");
        }

        if (
          selected.status !== "completed" ||
          selected.paymentStatus !== "unpaid"
        ) {
          throw new Error("Only completed and unpaid bookings can be paid.");
        }

        if (active) setBooking(selected);
      } catch (loadError) {
        if (active) {
          const message =
            loadError instanceof Error
              ? loadError.message
              : "Unable to load booking.";

          if (message.toLowerCase().includes("session")) {
            router.replace("/sign-in");
            return;
          }

          setError(message);
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadBooking();

    return () => {
      active = false;
    };
  }, [bookingId, router]);

  async function confirmDevelopmentPayment() {
    if (!bookingId) return;

    setPaying(true);
    setError("");

    try {
      const response = await authenticatedRequest<ApiResponse<unknown>>(
        "/api/payments/development/confirm",
        {
          method: "POST",
          body: JSON.stringify({ bookingId }),
        },
      );

      const message =
        response.message || "Development payment completed.";

      router.replace(
        `/payment/development/success?bookingId=${encodeURIComponent(
          bookingId,
        )}&message=${encodeURIComponent(message)}`,
      );
    } catch (paymentError) {
      setError(
        paymentError instanceof Error
          ? paymentError.message
          : "Unable to simulate payment.",
      );
      setPaying(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <LoaderCircle className="h-9 w-9 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <section className="flex min-h-[75vh] items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-lg rounded-2xl border border-amber-200 bg-white p-8 shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 text-amber-600">
          <ShieldAlert size={32} />
        </div>

        <p className="mt-5 text-center text-xs font-bold uppercase tracking-widest text-amber-700">
          Development-only simulator
        </p>

        <h1 className="mt-2 text-center text-2xl font-bold text-slate-900">
          Simulate Payment
        </h1>

        <p className="mt-3 text-center text-sm leading-6 text-slate-600">
          This is a local development simulation. No card details are collected
          and no real money will be charged.
        </p>

        {error && (
          <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {booking && (
          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Repair service
            </p>

            <p className="mt-1 font-bold text-slate-900">
              {booking.serviceTitle}
            </p>

            <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4">
              <span className="text-sm text-slate-600">Final amount</span>
              <span className="text-xl font-bold text-slate-900">
                {formatMoney(booking.finalAmount)}
              </span>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={confirmDevelopmentPayment}
          disabled={!booking || paying || Boolean(error)}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {paying ? (
            <LoaderCircle size={18} className="animate-spin" />
          ) : (
            <CheckCircle2 size={18} />
          )}

          {paying
            ? "Processing simulation..."
            : "Simulate Successful Payment"}
        </button>

        <Link
          href="/payment/cancel"
          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
        >
          <XCircle size={17} />
          Cancel payment
        </Link>

        <p className="mt-5 text-center text-xs leading-5 text-slate-400">
          Use this screen only while developing locally. Actual Stripe payments
          use Stripe Checkout separately.
        </p>
      </div>
    </section>
  );
}

export default function DevelopmentPaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[70vh] items-center justify-center">
          <LoaderCircle className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      }
    >
      <DevelopmentPaymentContent />
    </Suspense>
  );
}
