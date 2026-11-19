
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  Eye,
  LoaderCircle,
  MapPin,
  RefreshCw,
  Search,
  UserRound,
  Wrench,
  X,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Banknote,
  ClipboardList,
  Phone,
} from "lucide-react";
import { authenticatedRequest } from "@/lib/api";
import { toast } from "sonner";

type BookingStatus =
  | "requested"
  | "accepted"
  | "in-progress"
  | "completed"
  | "rejected"
  | "cancelled";

interface AdminBooking {
  _id: string;
  serviceId?: string;
  serviceTitle?: string;
  serviceCategory?: string;
  serviceImage?: string;
  customerId?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  technicianId?: string;
  technicianName?: string;
  technicianEmail?: string;
  technicianPhone?: string;
  status: BookingStatus;
  scheduledDate?: string;
  scheduledTime?: string;
  address?: string;
  area?: string;
  description?: string;
  customerNote?: string;
  finalAmount?: number;
  basePrice?: number;
  createdAt?: string;
  updatedAt?: string;
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

function formatDate(value?: string) {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Not available";

  return date.toLocaleDateString("en-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatStatus(status: BookingStatus) {
  return status
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function statusStyle(status: BookingStatus) {
  const styles: Record<BookingStatus, string> = {
    requested: "bg-amber-50 text-amber-700",
    accepted: "bg-blue-50 text-blue-700",
    "in-progress": "bg-purple-50 text-purple-700",
    completed: "bg-green-50 text-green-700",
    rejected: "bg-red-50 text-red-700",
    cancelled: "bg-slate-100 text-slate-600",
  };

  return styles[status] || "bg-slate-100 text-slate-600";
}

function getBookingId(id: string) {
  return id.length > 12
    ? `${id.slice(0, 8)}...${id.slice(-4)}`
    : id;
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedBooking, setSelectedBooking] =
    useState<AdminBooking | null>(null);

  const loadBookings = useCallback(async () => {
    try {
      setLoading(true);

      const query =
        filter === "all"
          ? ""
          : `?status=${encodeURIComponent(filter)}`;

      const result = await authenticatedRequest<{
        success: boolean;
        count: number;
        data: AdminBooking[];
      }>(`/api/admin/bookings${query}`);

      setBookings(result.data || []);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to load bookings."
      );
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const filteredBookings = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return bookings;

    return bookings.filter((booking) => {
      const searchableValues = [
        booking._id,
        booking.serviceTitle,
        booking.serviceCategory,
        booking.customerName,
        booking.customerEmail,
        booking.customerPhone,
        booking.technicianName,
        booking.technicianEmail,
        booking.area,
        booking.address,
      ];

      return searchableValues.some((value) =>
        value?.toLowerCase().includes(term)
      );
    });
  }, [bookings, search]);

  const stats = useMemo(
    () => ({
      total: bookings.length,
      requested: bookings.filter(
        (booking) => booking.status === "requested"
      ).length,
      active: bookings.filter((booking) =>
        ["accepted", "in-progress"].includes(booking.status)
      ).length,
      completed: bookings.filter(
        (booking) => booking.status === "completed"
      ).length,
      rejected: bookings.filter(
        (booking) => booking.status === "rejected"
      ).length,
      cancelled: bookings.filter(
        (booking) => booking.status === "cancelled"
      ).length,
    }),
    [bookings]
  );

  const cards = [
    {
      label: "Total Bookings",
      value: stats.total,
      icon: ClipboardList,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Requested",
      value: stats.requested,
      icon: Clock3,
      color: "bg-amber-50 text-amber-600",
    },
    {
      label: "Active Jobs",
      value: stats.active,
      icon: Wrench,
      color: "bg-purple-50 text-purple-600",
    },
    {
      label: "Completed",
      value: stats.completed,
      icon: CheckCircle2,
      color: "bg-green-50 text-green-600",
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
              Booking Management
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Monitor repair requests and track booking progress across FixMate.
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

        <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.label}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-500">{card.label}</p>
                  <div className={`rounded-xl p-3 ${card.color}`}>
                    <Icon size={21} />
                  </div>
                </div>
                <p className="mt-4 text-3xl font-bold text-slate-900">
                  {card.value}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-red-50 p-2 text-red-600">
                <XCircle size={19} />
              </div>
              <div>
                <p className="text-xs text-slate-500">Rejected Bookings</p>
                <p className="text-xl font-bold text-slate-900">
                  {stats.rejected}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-slate-100 p-2 text-slate-600">
                <AlertCircle size={19} />
              </div>
              <div>
                <p className="text-xs text-slate-500">Cancelled Bookings</p>
                <p className="text-xl font-bold text-slate-900">
                  {stats.cancelled}
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
              placeholder="Search booking ID, service, customer or technician..."
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

        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-bold text-slate-900">
            All Repair Bookings
          </h2>
          <p className="text-xs text-slate-500">
            {filteredBookings.length} matching bookings
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
                Loading bookings...
              </p>
            </div>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <CalendarDays
              size={42}
              className="mx-auto mb-4 text-slate-300"
            />
            <h3 className="font-semibold text-slate-800">
              No bookings found
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Try changing your search or booking status filter.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-4">Booking</th>
                    <th className="px-5 py-4">Customer</th>
                    <th className="px-5 py-4">Technician</th>
                    <th className="px-5 py-4">Schedule</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4 text-right">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredBookings.map((booking) => (
                    <tr
                      key={booking._id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-900">
                          {booking.serviceTitle || "Repair Service"}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          #{getBookingId(booking._id)}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-medium text-slate-800">
                          {booking.customerName || "Customer"}
                        </p>
                        <p className="mt-1 max-w-44 truncate text-xs text-slate-400">
                          {booking.customerEmail || "No email"}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-medium text-slate-800">
                          {booking.technicianName || "Not assigned"}
                        </p>
                        <p className="mt-1 max-w-44 truncate text-xs text-slate-400">
                          {booking.technicianEmail || "No email"}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-medium text-slate-800">
                          {formatDate(booking.scheduledDate)}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          {booking.scheduledTime || "Time not set"}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusStyle(booking.status)}`}
                        >
                          {formatStatus(booking.status)}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => setSelectedBooking(booking)}
                          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                        >
                          <Eye size={15} />
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4">
          <div className="my-8 w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Booking Details
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Booking ID: {selectedBooking._id}
                </p>
              </div>

              <button
                onClick={() => setSelectedBooking(null)}
                aria-label="Close booking details"
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={21} />
              </button>
            </div>

            <div className="max-h-[75vh] space-y-5 overflow-y-auto p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                    {selectedBooking.serviceCategory || "Repair Service"}
                  </p>
                  <h3 className="mt-1 text-xl font-bold text-slate-900">
                    {selectedBooking.serviceTitle || "Repair Service"}
                  </h3>
                </div>

                <span
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold ${statusStyle(selectedBooking.status)}`}
                >
                  {formatStatus(selectedBooking.status)}
                </span>
              </div>

              <div className="grid gap-4 rounded-xl bg-slate-50 p-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-slate-400">Scheduled Date</p>
                  <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-slate-800">
                    <CalendarDays size={16} />
                    {formatDate(selectedBooking.scheduledDate)}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">Scheduled Time</p>
                  <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-slate-800">
                    <Clock3 size={16} />
                    {selectedBooking.scheduledTime || "Not available"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">Final Amount</p>
                  <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-slate-800">
                    <Banknote size={16} />
                    {selectedBooking.finalAmount !== undefined
                      ? `৳${Number(selectedBooking.finalAmount).toLocaleString("en-BD")}`
                      : "Not finalized"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">Base Price</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {selectedBooking.basePrice !== undefined
                      ? `৳${Number(selectedBooking.basePrice).toLocaleString("en-BD")}`
                      : "Not available"}
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
                  {selectedBooking.customerName || "Not available"}
                </p>
                <p className="mt-1 break-all text-sm text-slate-500">
                  {selectedBooking.customerEmail || "No email available"}
                </p>
                {selectedBooking.customerPhone && (
                  <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                    <Phone size={15} />
                    {selectedBooking.customerPhone}
                  </p>
                )}
              </div>

              <div className="rounded-xl border border-slate-100 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Wrench size={18} className="text-blue-600" />
                  <h4 className="font-semibold text-slate-900">
                    Technician Information
                  </h4>
                </div>

                <p className="text-sm font-semibold text-slate-800">
                  {selectedBooking.technicianName || "Not assigned"}
                </p>
                <p className="mt-1 break-all text-sm text-slate-500">
                  {selectedBooking.technicianEmail || "No email available"}
                </p>
                {selectedBooking.technicianPhone && (
                  <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                    <Phone size={15} />
                    {selectedBooking.technicianPhone}
                  </p>
                )}
              </div>

              <div className="rounded-xl border border-slate-100 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <MapPin size={18} className="text-blue-600" />
                  <h4 className="font-semibold text-slate-900">
                    Service Location
                  </h4>
                </div>
                <p className="text-sm leading-6 text-slate-600">
                  {selectedBooking.address || "Address not available"}
                </p>
                {selectedBooking.area && (
                  <p className="mt-1 text-sm text-slate-500">
                    Area: {selectedBooking.area}
                  </p>
                )}
              </div>

              {(selectedBooking.description ||
                selectedBooking.customerNote) && (
                <div className="rounded-xl bg-slate-50 p-4">
                  <h4 className="mb-2 font-semibold text-slate-900">
                    Customer Notes
                  </h4>
                  <p className="whitespace-pre-wrap text-sm leading-6 text-slate-600">
                    {selectedBooking.description ||
                      selectedBooking.customerNote}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                <div>
                  <p className="text-xs text-slate-400">Booking Created</p>
                  <p className="mt-1 text-sm font-medium text-slate-700">
                    {formatDate(selectedBooking.createdAt)}
                  </p>
                </div>

                <button
                  onClick={() => setSelectedBooking(null)}
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
