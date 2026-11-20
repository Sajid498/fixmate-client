
"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  LoaderCircle,
  MapPin,
  RefreshCw,
  Search,
  UserRound,
  Wrench,
  Phone,
  CreditCard,
  Eye,
  X,
} from "lucide-react";
import { authenticatedRequest } from "@/lib/api";
import { toast } from "sonner";

type BookingStatus =
  | "requested"
  | "accepted"
  | "rejected"
  | "in-progress"
  | "completed"
  | "cancelled";

interface Booking {
  _id: string;
  serviceId: string;
  serviceTitle: string;
  serviceImage?: string;
  category: string;
  basePrice: number;
  finalAmount?: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  preferredDate: string;
  problemDescription: string;
  status: BookingStatus;
  paymentStatus: "paid" | "unpaid";
  createdAt: string;
  updatedAt: string;
}

const statusOptions = [
  { value: "all", label: "All Bookings" },
  { value: "requested", label: "Requested" },
  { value: "accepted", label: "Accepted" },
  { value: "in-progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "rejected", label: "Rejected" },
  { value: "cancelled", label: "Cancelled" },
];

function formatStatus(status: BookingStatus) {
  const labels: Record<BookingStatus, string> = {
    requested: "Requested",
    accepted: "Accepted",
    rejected: "Rejected",
    "in-progress": "In Progress",
    completed: "Completed",
    cancelled: "Cancelled",
  };

  return labels[status];
}

function statusClasses(status: BookingStatus) {
  const styles: Record<BookingStatus, string> = {
    requested: "bg-amber-50 text-amber-700",
    accepted: "bg-blue-50 text-blue-700",
    rejected: "bg-red-50 text-red-700",
    "in-progress": "bg-purple-50 text-purple-700",
    completed: "bg-green-50 text-green-700",
    cancelled: "bg-slate-100 text-slate-600",
  };

  return styles[status];
}

function formatDate(date: string) {
  if (!date) return "Not specified";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "Not specified";

  return parsed.toLocaleDateString("en-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function TechnicianBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [completionBooking, setCompletionBooking] = useState<Booking | null>(null);
  const [finalAmount, setFinalAmount] = useState("");

  const loadBookings = useCallback(async () => {
    try {
      setLoading(true);

      const result = await authenticatedRequest<{
        success: boolean;
        count: number;
        data: Booking[];
      }>("/api/technician/bookings");

      setBookings(result.data || []);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to load bookings."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const filteredBookings = useMemo(() => {
    const term = search.trim().toLowerCase();

    return bookings.filter((booking) => {
      const matchesStatus =
        filter === "all" || booking.status === filter;

      const matchesSearch =
        !term ||
        booking.serviceTitle?.toLowerCase().includes(term) ||
        booking.customerName?.toLowerCase().includes(term) ||
        booking.customerEmail?.toLowerCase().includes(term) ||
        booking.customerPhone?.toLowerCase().includes(term) ||
        booking.address?.toLowerCase().includes(term);

      return matchesStatus && matchesSearch;
    });
  }, [bookings, search, filter]);

  const counts = useMemo(
    () => ({
      total: bookings.length,
      requested: bookings.filter((item) => item.status === "requested").length,
      active: bookings.filter(
        (item) =>
          item.status === "accepted" || item.status === "in-progress"
      ).length,
      completed: bookings.filter((item) => item.status === "completed").length,
    }),
    [bookings]
  );

  const updateStatus = async (
    booking: Booking,
    status: BookingStatus,
    amount?: number
  ) => {
    setUpdatingId(booking._id);

    try {
      const payload: {
        status: BookingStatus;
        finalAmount?: number;
      } = { status };

      if (amount !== undefined) {
        payload.finalAmount = amount;
      }

      await authenticatedRequest(
        `/api/technician/bookings/${booking._id}/status`,
        {
          method: "PATCH",
          body: JSON.stringify(payload),
        }
      );

      toast.success(
        status === "completed"
          ? "Repair marked as completed."
          : `Booking ${formatStatus(status).toLowerCase()} successfully.`
      );

      setSelectedBooking(null);
      setCompletionBooking(null);
      setFinalAmount("");

      await loadBookings();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to update booking."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const handleReject = async (booking: Booking) => {
    const confirmed = window.confirm(
      "Are you sure you want to reject this repair request?"
    );

    if (!confirmed) return;

    await updateStatus(booking, "rejected");
  };

  const openCompletionModal = (booking: Booking) => {
    setCompletionBooking(booking);
    setFinalAmount(String(booking.finalAmount ?? booking.basePrice));
  };

  const handleCompletion = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!completionBooking) return;

    const amount = Number(finalAmount);

    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error("Please enter a valid final repair amount.");
      return;
    }

    await updateStatus(completionBooking, "completed", amount);
  };

  const renderActions = (booking: Booking) => {
    if (booking.status === "requested") {
      return (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => updateStatus(booking, "accepted")}
            disabled={updatingId === booking._id}
            className="rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
          >
            Accept
          </button>
          <button
            onClick={() => handleReject(booking)}
            disabled={updatingId === booking._id}
            className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
          >
            Reject
          </button>
        </div>
      );
    }

    if (booking.status === "accepted") {
      return (
        <button
          onClick={() => updateStatus(booking, "in-progress")}
          disabled={updatingId === booking._id}
          className="rounded-lg bg-purple-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-purple-700 disabled:opacity-50"
        >
          Start Repair
        </button>
      );
    }

    if (booking.status === "in-progress") {
      return (
        <button
          onClick={() => openCompletionModal(booking)}
          disabled={updatingId === booking._id}
          className="rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
        >
          Complete Repair
        </button>
      );
    }

    if (booking.status === "completed") {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700">
          <CheckCircle2 size={15} />
          Completed
        </span>
      );
    }

    return (
      <span className="text-xs font-medium text-slate-400">
        No further action
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Link
          href="/dashboard/technician"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-blue-600"
        >
          <ArrowLeft size={17} />
          Back to Dashboard
        </Link>

        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-blue-600">
              Technician Workspace
            </p>
            <h1 className="text-3xl font-bold text-slate-900">
              Repair Bookings
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Manage customer requests and track your repair jobs.
            </p>
          </div>

          <button
            onClick={loadBookings}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
          >
            <RefreshCw
              size={17}
              className={loading ? "animate-spin" : ""}
            />
            Refresh Bookings
          </button>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-slate-500">Total Bookings</span>
              <Wrench className="text-blue-600" size={21} />
            </div>
            <p className="text-3xl font-bold text-slate-900">
              {counts.total}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-slate-500">New Requests</span>
              <Clock3 className="text-amber-600" size={21} />
            </div>
            <p className="text-3xl font-bold text-amber-700">
              {counts.requested}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-slate-500">Active Repairs</span>
              <RefreshCw className="text-purple-600" size={21} />
            </div>
            <p className="text-3xl font-bold text-purple-700">
              {counts.active}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-slate-500">Completed Jobs</span>
              <CheckCircle2 className="text-green-600" size={21} />
            </div>
            <p className="text-3xl font-bold text-green-700">
              {counts.completed}
            </p>
          </div>
        </div>

        <div className="mb-6 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={19}
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search customer, service, phone or address..."
              className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="flex min-h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white">
            <div className="text-center">
              <LoaderCircle
                className="mx-auto mb-3 animate-spin text-blue-600"
                size={35}
              />
              <p className="text-sm text-slate-500">
                Loading repair bookings...
              </p>
            </div>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <CalendarDays
              className="mx-auto mb-4 text-slate-300"
              size={45}
            />
            <h3 className="text-lg font-semibold text-slate-800">
              No bookings found
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              {search || filter !== "all"
                ? "Try changing your search term or status filter."
                : "Customer repair requests will appear here when they book your services."}
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {filteredBookings.map((booking) => (
              <article
                key={booking._id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="flex flex-col gap-5 p-5 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex min-w-0 flex-1 gap-4">
                    <div className="hidden h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:block">
                      {booking.serviceImage ? (
                        <img
                          src={booking.serviceImage}
                          alt={booking.serviceTitle}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Wrench size={30} className="text-slate-300" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClasses(booking.status)}`}
                        >
                          {formatStatus(booking.status)}
                        </span>
                        <span className="text-xs text-slate-400">
                          {booking.category}
                        </span>
                      </div>

                      <h2 className="truncate text-lg font-bold text-slate-900">
                        {booking.serviceTitle}
                      </h2>

                      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">
                        <span className="inline-flex items-center gap-1.5">
                          <UserRound size={15} />
                          {booking.customerName}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <CalendarDays size={15} />
                          {formatDate(booking.preferredDate)}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin size={15} />
                          <span className="max-w-52 truncate">
                            {booking.address}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 lg:min-w-52 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
                    <div>
                      <p className="text-xs text-slate-400">Base Price</p>
                      <p className="text-xl font-bold text-slate-900">
                        ৳{booking.basePrice?.toLocaleString("en-BD")}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => setSelectedBooking(booking)}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        <Eye size={15} />
                        Details
                      </button>

                      {renderActions(booking)}
                    </div>
                  </div>
                </div>

                {updatingId === booking._id && (
                  <div className="flex items-center gap-2 border-t border-blue-100 bg-blue-50 px-5 py-2 text-xs font-medium text-blue-700">
                    <LoaderCircle size={14} className="animate-spin" />
                    Updating booking...
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </div>

      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4">
          <div className="my-8 w-full max-w-xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Booking Details
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Review the customer's repair request.
                </p>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                aria-label="Close details"
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={21} />
              </button>
            </div>

            <div className="space-y-5 p-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                  Service
                </p>
                <h3 className="mt-1 text-lg font-bold text-slate-900">
                  {selectedBooking.serviceTitle}
                </h3>
                <p className="text-sm text-slate-500">
                  {selectedBooking.category}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-slate-400">Customer Name</p>
                  <p className="mt-1 font-semibold text-slate-800">
                    {selectedBooking.customerName}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">Customer Email</p>
                  <p className="mt-1 break-all text-sm font-medium text-slate-800">
                    {selectedBooking.customerEmail}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">Phone Number</p>
                  <p className="mt-1 flex items-center gap-2 font-medium text-slate-800">
                    <Phone size={15} />
                    {selectedBooking.customerPhone}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">Preferred Date</p>
                  <p className="mt-1 font-medium text-slate-800">
                    {formatDate(selectedBooking.preferredDate)}
                  </p>
                </div>

                <div className="sm:col-span-2">
                  <p className="text-xs text-slate-400">Repair Address</p>
                  <p className="mt-1 flex items-start gap-2 text-sm text-slate-800">
                    <MapPin size={16} className="mt-0.5 shrink-0" />
                    {selectedBooking.address}
                  </p>
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Problem Description
                </p>
                <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
                  {selectedBooking.problemDescription}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-400">Base Price</p>
                  <p className="mt-1 text-lg font-bold text-slate-900">
                    ৳{selectedBooking.basePrice?.toLocaleString("en-BD")}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">Final Amount</p>
                  <p className="mt-1 text-lg font-bold text-slate-900">
                    {selectedBooking.finalAmount !== undefined
                      ? `৳${selectedBooking.finalAmount.toLocaleString("en-BD")}`
                      : "Not set"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">Booking Status</p>
                  <span
                    className={`mt-1 inline-block rounded-full px-3 py-1 text-xs font-semibold ${statusClasses(selectedBooking.status)}`}
                  >
                    {formatStatus(selectedBooking.status)}
                  </span>
                </div>

                <div>
                  <p className="text-xs text-slate-400">Payment Status</p>
                  <p className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-slate-700">
                    <CreditCard size={15} />
                    {selectedBooking.paymentStatus}
                  </p>
                </div>
              </div>

              <div className="flex justify-end border-t border-slate-100 pt-4">
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {completionBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Complete Repair
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Set the final repair amount for this booking.
                </p>
              </div>

              <button
                onClick={() => {
                  setCompletionBooking(null);
                  setFinalAmount("");
                }}
                disabled={updatingId === completionBooking._id}
                aria-label="Close completion form"
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-5 rounded-xl bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-800">
                {completionBooking.serviceTitle}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Customer: {completionBooking.customerName}
              </p>
              <p className="mt-2 text-sm text-slate-600">
                Base price: ৳
                {completionBooking.basePrice?.toLocaleString("en-BD")}
              </p>
            </div>

            <form onSubmit={handleCompletion}>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Final Repair Amount (BDT)
              </label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                required
                autoFocus
                value={finalAmount}
                onChange={(event) => setFinalAmount(event.target.value)}
                placeholder="Enter final amount"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

              <p className="mt-2 text-xs leading-5 text-slate-500">
                The customer will use this amount for the payment process after the repair is completed.
              </p>

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setCompletionBooking(null);
                    setFinalAmount("");
                  }}
                  disabled={updatingId === completionBooking._id}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={updatingId === completionBooking._id}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-60"
                >
                  {updatingId === completionBooking._id ? (
                    <>
                      <LoaderCircle size={17} className="animate-spin" />
                      Completing...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={17} />
                      Confirm Completion
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
