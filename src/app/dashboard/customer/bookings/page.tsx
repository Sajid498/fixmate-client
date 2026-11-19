
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  LoaderCircle,
  MapPin,
  Package,
  RefreshCw,
  Search,
  Wrench,
  XCircle,
} from "lucide-react";
import { authenticatedRequest } from "@/lib/api";

type BookingStatus =
  | "requested"
  | "accepted"
  | "in-progress"
  | "completed"
  | "rejected"
  | "cancelled";

interface Booking {
  _id: string;
  serviceTitle: string;
  serviceImage?: string;
  category?: string;
  technicianName?: string;
  technicianEmail?: string;
  basePrice: number;
  finalAmount: number;
  status: BookingStatus;
  paymentStatus: "paid" | "unpaid";
  preferredDate: string;
  address: string;
  problemDescription: string;
  createdAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

const statusStyles: Record<BookingStatus, string> = {
  requested: "bg-amber-100 text-amber-700",
  accepted: "bg-blue-100 text-blue-700",
  "in-progress": "bg-violet-100 text-violet-700",
  completed: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  cancelled: "bg-slate-100 text-slate-600",
};

const filters = [
  "all",
  "requested",
  "accepted",
  "in-progress",
  "completed",
  "rejected",
  "cancelled",
] as const;

type BookingFilter = (typeof filters)[number];

function formatDate(value?: string) {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Not available";

  return new Intl.DateTimeFormat("en-BD", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatMoney(value?: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(value) || 0);
}

export default function CustomerBookingsPage() {
  const router = useRouter();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<BookingFilter>("all");
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadBookings = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await authenticatedRequest<ApiResponse<Booking[]>>(
        "/api/bookings/mine",
      );

      setBookings(response.data || []);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to load bookings.";

      if (message.toLowerCase().includes("session")) {
        router.replace("/sign-in");
        return;
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const matchesStatus =
        activeFilter === "all" || booking.status === activeFilter;

      const searchText = search.trim().toLowerCase();

      const matchesSearch =
        !searchText ||
        booking.serviceTitle?.toLowerCase().includes(searchText) ||
        booking.technicianName?.toLowerCase().includes(searchText) ||
        booking.category?.toLowerCase().includes(searchText) ||
        booking.address?.toLowerCase().includes(searchText);

      return matchesStatus && matchesSearch;
    });
  }, [bookings, activeFilter, search]);

  async function handleCancel(bookingId: string) {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this repair request?",
    );

    if (!confirmed) return;

    setCancellingId(bookingId);
    setError("");
    setNotice("");

    try {
      const response = await authenticatedRequest<{
        success: boolean;
        message?: string;
      }>(`/api/bookings/${bookingId}/cancel`, {
        method: "PATCH",
      });

      setNotice(response.message || "Booking cancelled successfully.");

      setBookings((current) =>
        current.map((booking) =>
          booking._id === bookingId
            ? { ...booking, status: "cancelled" }
            : booking,
        ),
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to cancel booking.",
      );
    } finally {
      setCancellingId(null);
    }
  }

  async function handlePayment(bookingId: string) {
    setPayingId(bookingId);
    setError("");
    setNotice("");

    try {
      const response = await authenticatedRequest<{
        success: boolean;
        checkoutUrl?: string;
        sessionId?: string;
        message?: string;
      }>("/api/payments/create-checkout-session", {
        method: "POST",
        body: JSON.stringify({ bookingId }),
      });

      if (!response.checkoutUrl) {
        throw new Error("Stripe checkout URL was not returned.");
      }

      window.location.assign(response.checkoutUrl);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to start payment.",
      );
      setPayingId(null);
    }
  }

  const totalBookings = bookings.length;
  const completedBookings = bookings.filter(
    (booking) => booking.status === "completed",
  ).length;
  const pendingBookings = bookings.filter(
    (booking) =>
      booking.status === "requested" ||
      booking.status === "accepted" ||
      booking.status === "in-progress",
  ).length;
  const paidBookings = bookings.filter(
    (booking) => booking.paymentStatus === "paid",
  ).length;

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <LoaderCircle className="h-9 w-9 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Link
          href="/dashboard/customer"
          className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-blue-600"
        >
          <ArrowLeft size={17} />
          Back to Dashboard
        </Link>

        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
              Customer Dashboard
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              My Bookings
            </h1>
            <p className="mt-2 text-slate-500">
              View your repair requests, track progress and manage payments.
            </p>
          </div>

          <Link
            href="/services"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <Wrench size={18} />
            Book a Repair
          </Link>
        </div>

        {error && (
          <div className="mb-5 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <XCircle size={18} />
            {error}
          </div>
        )}

        {notice && (
          <div className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {notice}
          </div>
        )}

        <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            title="Total Bookings"
            value={totalBookings}
            icon={<Package size={21} />}
            color="blue"
          />
          <SummaryCard
            title="Active Requests"
            value={pendingBookings}
            icon={<Clock3 size={21} />}
            color="amber"
          />
          <SummaryCard
            title="Completed"
            value={completedBookings}
            icon={<CheckCircle2 size={21} />}
            color="green"
          />
          <SummaryCard
            title="Paid Bookings"
            value={paidBookings}
            icon={<CreditCard size={21} />}
            color="violet"
          />
        </div>

        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-sm">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search service, technician or area..."
                className="w-full rounded-lg border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <button
              type="button"
              onClick={loadBookings}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={`rounded-full px-4 py-2 text-xs font-semibold capitalize transition ${
                  activeFilter === filter
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {filter.replace("-", " ")}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">
            Repair History
          </h2>
          <p className="text-sm text-slate-500">
            {filteredBookings.length} booking(s)
          </p>
        </div>

        {filteredBookings.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <Package size={29} />
            </div>
            <h3 className="mt-5 text-lg font-bold text-slate-900">
              No bookings found
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              {search || activeFilter !== "all"
                ? "Try changing your search or status filter."
                : "You have not requested any repair services yet."}
            </p>
            <Link
              href="/services"
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Explore Services
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {filteredBookings.map((booking) => (
              <article
                key={booking._id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="p-5 sm:p-6">
                  <div className="flex flex-col gap-5 md:flex-row">
                    <div className="h-28 w-full shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:h-28 sm:w-36">
                      {booking.serviceImage ? (
                        <img
                          src={booking.serviceImage}
                          alt={booking.serviceTitle}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-slate-400">
                          <Wrench size={34} />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-lg font-bold text-slate-900">
                          {booking.serviceTitle}
                        </h3>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                            statusStyles[booking.status]
                          }`}
                        >
                          {booking.status.replace("-", " ")}
                        </span>
                      </div>

                      <p className="mt-1 text-sm text-slate-500">
                        {booking.category || "Repair Service"} · Technician:{" "}
                        {booking.technicianName || "Not assigned"}
                      </p>

                      <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
                        <div className="flex items-center gap-2">
                          <CalendarDays
                            size={16}
                            className="shrink-0 text-blue-600"
                          />
                          <span>
                            Preferred: {formatDate(booking.preferredDate)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <MapPin
                            size={16}
                            className="shrink-0 text-blue-600"
                          />
                          <span className="truncate">{booking.address}</span>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 md:text-right">
                      <p className="text-xs text-slate-400">Final Amount</p>
                      <p className="mt-1 text-xl font-bold text-slate-900">
                        {formatMoney(booking.finalAmount)}
                      </p>
                      <span
                        className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                          booking.paymentStatus === "paid"
                            ? "bg-green-100 text-green-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {booking.paymentStatus}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 border-t border-slate-100 pt-5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Problem Description
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {booking.problemDescription}
                    </p>

                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                      <p className="text-xs text-slate-400">
                        Booking ID: {booking._id}
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {booking.status === "requested" && (
                          <button
                            type="button"
                            onClick={() => handleCancel(booking._id)}
                            disabled={cancellingId === booking._id}
                            className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                          >
                            {cancellingId === booking._id ? (
                              <LoaderCircle size={15} className="animate-spin" />
                            ) : (
                              <XCircle size={15} />
                            )}
                            Cancel Request
                          </button>
                        )}

                        {booking.status === "completed" &&
                          booking.paymentStatus === "unpaid" && (
                            <button
                              type="button"
                              onClick={() => handlePayment(booking._id)}
                              disabled={payingId === booking._id}
                              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
                            >
                              {payingId === booking._id ? (
                                <LoaderCircle
                                  size={15}
                                  className="animate-spin"
                                />
                              ) : (
                                <CreditCard size={15} />
                              )}
                              {payingId === booking._id
                                ? "Redirecting..."
                                : "Pay Now"}
                            </button>
                          )}

                        {booking.status === "completed" &&
                          booking.paymentStatus === "paid" && (
                            <span className="inline-flex items-center gap-2 rounded-lg bg-green-50 px-4 py-2.5 text-xs font-semibold text-green-700">
                              <CheckCircle2 size={15} />
                              Payment Complete
                            </span>
                          )}
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function SummaryCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: "blue" | "amber" | "green" | "violet";
}) {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    amber: "bg-amber-50 text-amber-600",
    green: "bg-green-50 text-green-600",
    violet: "bg-violet-50 text-violet-600",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <span
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${colors[color]}`}
        >
          {icon}
        </span>
      </div>
      <p className="mt-4 text-3xl font-bold text-slate-900">{value}</p>
    </div>
  );
}
