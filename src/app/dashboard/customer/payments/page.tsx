
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  LoaderCircle,
  Receipt,
  XCircle,
} from "lucide-react";
import { authenticatedRequest } from "@/lib/api";

interface Payment {
  _id: string;
  bookingId: string;
  serviceTitle: string;
  customerName: string;
  technicianName: string;
  amount: number;
  currency: string;
  transactionId?: string;
  paymentProvider?: string;
  paymentStatus?: string;
  paidAt?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  count?: number;
}

function formatDate(value?: string) {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Not available";

  return new Intl.DateTimeFormat("en-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function formatAmount(amount: number, currency = "BDT") {
  const normalizedCurrency = currency.toUpperCase();

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: normalizedCurrency,
      maximumFractionDigits: 2,
    }).format(Number(amount || 0));
  } catch {
    return `${normalizedCurrency} ${Number(amount || 0).toLocaleString()}`;
  }
}

function getProviderLabel(provider?: string) {
  if (provider === "stripe") return "Stripe";

  if (provider === "development_simulator") {
    return "Development Simulator";
  }

  return "Other";
}

function getStatusLabel(status?: string) {
  if (!status) return "Unknown";

  return status
    .split(/[-_ ]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getStatusStyle(status?: string) {
  const normalized = status?.toLowerCase();

  if (normalized === "paid") {
    return "bg-green-100 text-green-700";
  }

  if (normalized === "pending" || normalized === "processing") {
    return "bg-amber-100 text-amber-700";
  }

  return "bg-red-100 text-red-700";
}

export default function CustomerPaymentsPage() {
  const router = useRouter();

  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadPayments() {
      try {
        const response = await authenticatedRequest<ApiResponse<Payment[]>>(
          "/api/payments/mine",
        );

        if (active) {
          setPayments(response.data || []);
          setError("");
        }
      } catch (err) {
        if (active) {
          const message =
            err instanceof Error
              ? err.message
              : "Unable to load payments.";

          if (message.toLowerCase().includes("session")) {
            router.replace("/sign-in");
            return;
          }

          setError(message);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadPayments();

    return () => {
      active = false;
    };
  }, [router]);

  const totalsByCurrency = payments.reduce<Record<string, number>>(
    (totals, payment) => {
      const currency = (payment.currency || "BDT").toUpperCase();
      totals[currency] =
        (totals[currency] || 0) + Number(payment.amount || 0);

      return totals;
    },
    {},
  );

  const totalPaidEntries = Object.entries(totalsByCurrency);

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <LoaderCircle className="h-9 w-9 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/dashboard/customer"
          className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600"
        >
          <ArrowLeft size={17} />
          Back to Dashboard
        </Link>

        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
            Customer Account
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Payment History
          </h1>

          <p className="mt-2 text-slate-500">
            Review your completed transactions and payment records.
          </p>
        </div>

        <div className="mb-8 grid gap-5 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">
                Total Transactions
              </p>
              <Receipt className="text-blue-600" size={23} />
            </div>

            <p className="mt-4 text-3xl font-bold text-slate-900">
              {payments.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">
                Total Amount Paid
              </p>
              <CreditCard className="text-green-600" size={23} />
            </div>

            {totalPaidEntries.length === 0 ? (
              <p className="mt-4 text-2xl font-bold text-slate-900">
                {formatAmount(0)}
              </p>
            ) : (
              <div className="mt-4 space-y-2">
                {totalPaidEntries.map(([currency, amount]) => (
                  <p
                    key={currency}
                    className="text-2xl font-bold text-slate-900"
                  >
                    {formatAmount(amount, currency)}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <XCircle size={18} />
            {error}
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 px-6 py-5">
            <h2 className="text-lg font-bold text-slate-900">
              Transaction Records
            </h2>
          </div>

          {payments.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <CreditCard className="mx-auto h-12 w-12 text-slate-300" />

              <h3 className="mt-4 font-semibold text-slate-900">
                No payments yet
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Your completed payment transactions will appear here.
              </p>

              <Link
                href="/dashboard/customer/bookings"
                className="mt-5 inline-flex rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
              >
                View Bookings
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-6 py-4">Service</th>
                    <th className="px-6 py-4">Technician</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Provider</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Transaction</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {payments.map((payment) => (
                    <tr key={payment._id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        {payment.serviceTitle || "Repair Service"}
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {payment.technicianName || "Not available"}
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {formatDate(payment.paidAt)}
                      </td>

                      <td className="px-6 py-4 font-bold text-slate-900">
                        {formatAmount(
                          Number(payment.amount || 0),
                          payment.currency,
                        )}
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {getProviderLabel(payment.paymentProvider)}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(payment.paymentStatus)}`}
                        >
                          {payment.paymentStatus === "paid" && (
                            <CheckCircle2 size={13} />
                          )}
                          {getStatusLabel(payment.paymentStatus)}
                        </span>
                      </td>

                      <td className="max-w-40 truncate px-6 py-4 font-mono text-xs text-slate-500">
                        {payment.transactionId || payment.bookingId || "Not available"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
