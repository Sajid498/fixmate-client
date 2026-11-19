
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Banknote,
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  Eye,
  LoaderCircle,
  RefreshCw,
  Search,
  UserRound,
  X,
  Receipt,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { authenticatedRequest } from "@/lib/api";
import { toast } from "sonner";

interface AdminPayment {
  _id: string;
  bookingId?: string;
  customerId?: string;
  customerName?: string;
  customerEmail?: string;
  serviceTitle?: string;
  amount: number;
  currency?: string;
  status?: string;
  paymentStatus?: string;
  paymentMethod?: string;
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  transactionId?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface PaymentResponse {
  success: boolean;
  count: number;
  totalRevenue: number;
  totalTransactions: number;
  data: AdminPayment[];
}

function formatDate(value?: string) {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Not available";

  return date.toLocaleString("en-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatCurrency(amount: number, currency = "usd") {
  const normalizedCurrency = currency.toUpperCase();

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: normalizedCurrency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${normalizedCurrency} ${Number(amount || 0).toLocaleString()}`;
  }
}

function getPaymentStatus(payment: AdminPayment) {
  return (
    payment.paymentStatus ||
    payment.status ||
    "completed"
  ).toLowerCase();
}

function statusStyle(status: string) {
  if (["completed", "paid", "succeeded", "success"].includes(status)) {
    return "bg-green-50 text-green-700";
  }

  if (["pending", "processing"].includes(status)) {
    return "bg-amber-50 text-amber-700";
  }

  if (["failed", "refunded", "cancelled", "canceled"].includes(status)) {
    return "bg-red-50 text-red-700";
  }

  return "bg-slate-100 text-slate-600";
}

function formatStatus(status: string) {
  return status
    .split(/[-_ ]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function shortenId(value?: string) {
  if (!value) return "Not available";

  return value.length > 18
    ? `${value.slice(0, 10)}...${value.slice(-5)}`
    : value;
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<AdminPayment[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedPayment, setSelectedPayment] =
    useState<AdminPayment | null>(null);

  const loadPayments = useCallback(async () => {
    try {
      setLoading(true);

      const result = await authenticatedRequest<PaymentResponse>(
        "/api/admin/payments"
      );

      setPayments(result.data || []);
      setTotalRevenue(Number(result.totalRevenue || 0));
      setTotalTransactions(Number(result.totalTransactions || 0));
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to load payment records."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  const filteredPayments = useMemo(() => {
    let result = payments;

    if (filter !== "all") {
      result = result.filter(
        (payment) => getPaymentStatus(payment) === filter
      );
    }

    const term = search.trim().toLowerCase();

    if (!term) return result;

    return result.filter((payment) => {
      const searchableValues = [
        payment._id,
        payment.bookingId,
        payment.customerId,
        payment.customerName,
        payment.customerEmail,
        payment.serviceTitle,
        payment.transactionId,
        payment.stripeSessionId,
        payment.stripePaymentIntentId,
      ];

      return searchableValues.some((value) =>
        value?.toLowerCase().includes(term)
      );
    });
  }, [payments, search, filter]);

  const completedCount = payments.filter((payment) =>
    ["completed", "paid", "succeeded", "success"].includes(
      getPaymentStatus(payment)
    )
  ).length;

  const pendingCount = payments.filter((payment) =>
    ["pending", "processing"].includes(getPaymentStatus(payment))
  ).length;

  const failedCount = payments.filter((payment) =>
    ["failed", "refunded", "cancelled", "canceled"].includes(
      getPaymentStatus(payment)
    )
  ).length;

  const stats = [
    {
      label: "Recorded Revenue",
      value: formatCurrency(totalRevenue),
      icon: TrendingUp,
      color: "bg-green-50 text-green-600",
    },
    {
      label: "Total Transactions",
      value: totalTransactions.toLocaleString(),
      icon: Receipt,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Completed Payments",
      value: completedCount.toLocaleString(),
      icon: CheckCircle2,
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Pending Payments",
      value: pendingCount.toLocaleString(),
      icon: Clock3,
      color: "bg-amber-50 text-amber-600",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Link
          href="/dashboard/admin"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-blue-600"
        >
          <ArrowLeft size={17} />
          Back to Admin Dashboard
        </Link>

        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-blue-600">
              Administration
            </p>
            <h1 className="text-3xl font-bold text-slate-900">
              Payment Management
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Monitor transactions, recorded revenue and customer payments.
            </p>
          </div>

          <button
            onClick={loadPayments}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
          >
            <RefreshCw
              size={17}
              className={loading ? "animate-spin" : ""}
            />
            Refresh Payments
          </button>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm text-slate-500">{item.label}</p>
                  <div className={`rounded-xl p-3 ${item.color}`}>
                    <Icon size={21} />
                  </div>
                </div>
                <p className="mt-4 break-words text-2xl font-bold text-slate-900">
                  {item.value}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-red-50 p-2 text-red-600">
                <Wallet size={19} />
              </div>
              <div>
                <p className="text-xs text-slate-500">
                  Failed / Refunded / Cancelled
                </p>
                <p className="text-xl font-bold text-slate-900">
                  {failedCount}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-50 p-2 text-green-600">
                <CreditCard size={19} />
              </div>
              <div>
                <p className="text-xs text-slate-500">
                  Payment Records Retrieved
                </p>
                <p className="text-xl font-bold text-slate-900">
                  {payments.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search transaction, booking, customer or service..."
              className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
          >
            <option value="all">All Payments</option>
            <option value="completed">Completed</option>
            <option value="paid">Paid</option>
            <option value="succeeded">Succeeded</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-bold text-slate-900">
            Transaction History
          </h2>
          <p className="text-xs text-slate-500">
            {filteredPayments.length} matching transactions
          </p>
        </div>

        {loading ? (
          <div className="flex min-h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white">
            <div className="text-center">
              <LoaderCircle
                size={35}
                className="mx-auto mb-3 animate-spin text-blue-600"
              />
              <p className="text-sm text-slate-500">
                Loading payment records...
              </p>
            </div>
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <Receipt
              size={42}
              className="mx-auto mb-4 text-slate-300"
            />
            <h3 className="font-semibold text-slate-800">
              No transactions found
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Try changing your search or payment status filter.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-4">Transaction</th>
                    <th className="px-5 py-4">Customer</th>
                    <th className="px-5 py-4">Service</th>
                    <th className="px-5 py-4">Amount</th>
                    <th className="px-5 py-4">Date</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4 text-right">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredPayments.map((payment) => {
                    const status = getPaymentStatus(payment);

                    return (
                      <tr
                        key={payment._id}
                        className="transition hover:bg-slate-50"
                      >
                        <td className="px-5 py-4">
                          <p className="font-semibold text-slate-900">
                            {shortenId(payment._id)}
                          </p>
                          <p className="mt-1 text-xs text-slate-400">
                            Booking: {shortenId(payment.bookingId)}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <p className="font-medium text-slate-800">
                            {payment.customerName || "Customer"}
                          </p>
                          <p className="mt-1 max-w-40 truncate text-xs text-slate-400">
                            {payment.customerEmail || "No email"}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <p className="max-w-44 truncate font-medium text-slate-800">
                            {payment.serviceTitle || "Repair Service"}
                          </p>
                        </td>

                        <td className="px-5 py-4 font-semibold text-slate-900">
                          {formatCurrency(
                            Number(payment.amount || 0),
                            payment.currency
                          )}
                        </td>

                        <td className="px-5 py-4 text-slate-600">
                          {formatDate(payment.createdAt)}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusStyle(status)}`}
                          >
                            {formatStatus(status)}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={() => setSelectedPayment(payment)}
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                          >
                            <Eye size={15} />
                            Details
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4">
          <div className="my-8 w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Transaction Details
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Payment record information
                </p>
              </div>

              <button
                onClick={() => setSelectedPayment(null)}
                aria-label="Close transaction details"
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={21} />
              </button>
            </div>

            <div className="max-h-[75vh] space-y-5 overflow-y-auto p-6">
              <div className="rounded-xl bg-slate-50 p-5 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
                  <Banknote size={24} />
                </div>

                <p className="text-sm text-slate-500">
                  Transaction Amount
                </p>

                <p className="mt-1 text-3xl font-bold text-slate-900">
                  {formatCurrency(
                    Number(selectedPayment.amount || 0),
                    selectedPayment.currency
                  )}
                </p>

                <span
                  className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusStyle(getPaymentStatus(selectedPayment))}`}
                >
                  {formatStatus(getPaymentStatus(selectedPayment))}
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-xs text-slate-400">
                    Payment Record ID
                  </p>
                  <p className="mt-1 break-all text-sm font-semibold text-slate-800">
                    {selectedPayment._id}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">Booking ID</p>
                  <p className="mt-1 break-all text-sm font-semibold text-slate-800">
                    {selectedPayment.bookingId || "Not available"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">Transaction ID</p>
                  <p className="mt-1 break-all text-sm font-semibold text-slate-800">
                    {selectedPayment.transactionId ||
                      selectedPayment.stripePaymentIntentId ||
                      "Not available"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">
                    Stripe Checkout Session
                  </p>
                  <p className="mt-1 break-all text-sm text-slate-700">
                    {selectedPayment.stripeSessionId || "Not available"}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-100 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <UserRound size={18} className="text-blue-600" />
                  <h4 className="font-semibold text-slate-900">
                    Customer Information
                  </h4>
                </div>

                <p className="text-sm font-semibold text-slate-800">
                  {selectedPayment.customerName || "Not available"}
                </p>

                <p className="mt-1 break-all text-sm text-slate-500">
                  {selectedPayment.customerEmail || "No email available"}
                </p>
              </div>

              <div className="rounded-xl border border-slate-100 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <CreditCard size={18} className="text-blue-600" />
                  <h4 className="font-semibold text-slate-900">
                    Payment Information
                  </h4>
                </div>

                <p className="text-sm text-slate-600">
                  Service:{" "}
                  <span className="font-semibold text-slate-800">
                    {selectedPayment.serviceTitle || "Repair Service"}
                  </span>
                </p>

                <p className="mt-2 text-sm text-slate-600">
                  Payment Method:{" "}
                  <span className="font-semibold text-slate-800">
                    {selectedPayment.paymentMethod || "Stripe"}
                  </span>
                </p>

                <p className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                  <CalendarDays size={15} />
                  {formatDate(selectedPayment.createdAt)}
                </p>
              </div>

              <div className="flex justify-end border-t border-slate-100 pt-4">
                <button
                  onClick={() => setSelectedPayment(null)}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Close Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
