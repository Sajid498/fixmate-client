
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  LoaderCircle,
  RefreshCw,
  ShieldCheck,
  Users,
  Wrench,
  XCircle,
} from "lucide-react";
import { authenticatedRequest } from "@/lib/api";
import { toast } from "sonner";

type UserRole = "customer" | "technician" | "admin";
type ApprovalStatus = "pending" | "approved" | "rejected";
type BookingStatus =
  | "requested"
  | "accepted"
  | "rejected"
  | "in-progress"
  | "completed"
  | "cancelled";

interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt?: string;
}

interface AdminService {
  _id: string;
  title: string;
  category: string;
  technicianName?: string;
  basePrice: number;
  approvalStatus: ApprovalStatus;
  createdAt?: string;
}

interface AdminBooking {
  _id: string;
  serviceTitle: string;
  customerName: string;
  technicianName: string;
  status: BookingStatus;
  basePrice: number;
  finalAmount?: number;
  createdAt?: string;
}

interface AdminPaymentSummary {
  totalRevenue: number;
  totalTransactions: number;
}

interface DashboardData {
  users: AdminUser[];
  services: AdminService[];
  bookings: AdminBooking[];
  paymentSummary: AdminPaymentSummary;
}

const initialData: DashboardData = {
  users: [],
  services: [],
  bookings: [],
  paymentSummary: {
    totalRevenue: 0,
    totalTransactions: 0,
  },
};

function formatDate(value?: string) {
  if (!value) return "Recently";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Recently";

  return date.toLocaleDateString("en-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-BD").format(value || 0);
}

function bookingStatusClass(status: BookingStatus) {
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

function approvalStatusClass(status: ApprovalStatus) {
  const styles: Record<ApprovalStatus, string> = {
    pending: "bg-amber-50 text-amber-700",
    approved: "bg-green-50 text-green-700",
    rejected: "bg-red-50 text-red-700",
  };

  return styles[status];
}

function StatCard({
  label,
  value,
  description,
  icon: Icon,
  iconClass,
}: {
  label: string;
  value: string | number;
  description: string;
  icon: typeof Users;
  iconClass: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <div className={`rounded-xl p-3 ${iconClass}`}>
          <Icon size={21} />
        </div>
      </div>
      <p className="mt-4 text-3xl font-bold text-slate-900">{value}</p>
      <p className="mt-2 text-xs text-slate-500">{description}</p>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData>(initialData);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);

      const [usersResult, servicesResult, bookingsResult, paymentsResult] =
        await Promise.all([
          authenticatedRequest<{
            success: boolean;
            count: number;
            data: AdminUser[];
          }>("/api/admin/users"),

          authenticatedRequest<{
            success: boolean;
            count: number;
            data: AdminService[];
          }>("/api/admin/services"),

          authenticatedRequest<{
            success: boolean;
            count: number;
            data: AdminBooking[];
          }>("/api/admin/bookings"),

          authenticatedRequest<{
            success: boolean;
            count: number;
            totalRevenue: number;
            totalTransactions: number;
            data: unknown[];
          }>("/api/admin/payments"),
        ]);

      setData({
        users: usersResult.data || [],
        services: servicesResult.data || [],
        bookings: bookingsResult.data || [],
        paymentSummary: {
          totalRevenue: paymentsResult.totalRevenue || 0,
          totalTransactions: paymentsResult.totalTransactions || 0,
        },
      });

      setLastUpdated(new Date());
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to load admin dashboard."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const customers = data.users.filter(
    (user) => user.role === "customer"
  ).length;

  const technicians = data.users.filter(
    (user) => user.role === "technician"
  ).length;

  const admins = data.users.filter(
    (user) => user.role === "admin"
  ).length;

  const pendingServices = data.services.filter(
    (service) => service.approvalStatus === "pending"
  );

  const approvedServices = data.services.filter(
    (service) => service.approvalStatus === "approved"
  ).length;

  const rejectedServices = data.services.filter(
    (service) => service.approvalStatus === "rejected"
  ).length;

  const bookingCounts = {
    requested: data.bookings.filter(
      (booking) => booking.status === "requested"
    ).length,
    active: data.bookings.filter(
      (booking) =>
        booking.status === "accepted" ||
        booking.status === "in-progress"
    ).length,
    completed: data.bookings.filter(
      (booking) => booking.status === "completed"
    ).length,
    rejected: data.bookings.filter(
      (booking) => booking.status === "rejected"
    ).length,
    cancelled: data.bookings.filter(
      (booking) => booking.status === "cancelled"
    ).length,
  };

  const recentBookings = [...data.bookings].slice(0, 5);

  const quickLinks = [
    {
      title: "Manage Users",
      description: "View accounts and update user roles.",
      href: "/dashboard/admin/users",
      icon: Users,
      color: "bg-blue-50 text-blue-700",
    },
    {
      title: "Review Services",
      description: "Approve or reject technician services.",
      href: "/dashboard/admin/services",
      icon: Wrench,
      color: "bg-amber-50 text-amber-700",
      badge: pendingServices.length,
    },
    {
      title: "Manage Bookings",
      description: "Monitor customer repair requests.",
      href: "/dashboard/admin/bookings",
      icon: CalendarDays,
      color: "bg-purple-50 text-purple-700",
    },
    {
      title: "Payment Transactions",
      description: "Review payments and recorded revenue.",
      href: "/dashboard/admin/payments",
      icon: CreditCard,
      color: "bg-green-50 text-green-700",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-blue-600">
              <ShieldCheck size={17} />
              Administration
            </div>
            <h1 className="text-3xl font-bold text-slate-900">
              Admin Dashboard
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Monitor users, services, repair bookings and transactions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {lastUpdated && (
              <span className="text-xs text-slate-400">
                Updated {lastUpdated.toLocaleTimeString()}
              </span>
            )}

            <button
              onClick={loadDashboard}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
            >
              <RefreshCw
                size={17}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-80 items-center justify-center rounded-2xl border border-slate-200 bg-white">
            <div className="text-center">
              <LoaderCircle
                size={38}
                className="mx-auto mb-3 animate-spin text-blue-600"
              />
              <p className="text-sm text-slate-500">
                Loading administration data...
              </p>
            </div>
          </div>
        ) : (
          <>
            <section className="mb-8">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">
                  Platform Overview
                </h2>
                <span className="text-xs text-slate-400">
                  Live database records
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                  label="Total Users"
                  value={formatNumber(data.users.length)}
                  description={`${customers} customers · ${technicians} technicians · ${admins} admins`}
                  icon={Users}
                  iconClass="bg-blue-50 text-blue-600"
                />

                <StatCard
                  label="Total Services"
                  value={formatNumber(data.services.length)}
                  description={`${approvedServices} approved · ${pendingServices.length} awaiting review`}
                  icon={Wrench}
                  iconClass="bg-amber-50 text-amber-600"
                />

                <StatCard
                  label="Total Bookings"
                  value={formatNumber(data.bookings.length)}
                  description={`${bookingCounts.requested} new requests · ${bookingCounts.active} active repairs`}
                  icon={CalendarDays}
                  iconClass="bg-purple-50 text-purple-600"
                />

                <StatCard
                  label="Transactions"
                  value={formatNumber(
                    data.paymentSummary.totalTransactions
                  )}
                  description="Recorded successful payment transactions"
                  icon={CreditCard}
                  iconClass="bg-green-50 text-green-600"
                />
              </div>
            </section>

            <section className="mb-8 grid gap-5 lg:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-2">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      Booking Overview
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Current repair workflow distribution.
                    </p>
                  </div>
                  <Activity className="text-blue-600" size={22} />
                </div>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {[
                    {
                      label: "Requested",
                      value: bookingCounts.requested,
                      color: "text-amber-700",
                    },
                    {
                      label: "Active",
                      value: bookingCounts.active,
                      color: "text-purple-700",
                    },
                    {
                      label: "Completed",
                      value: bookingCounts.completed,
                      color: "text-green-700",
                    },
                    {
                      label: "Rejected",
                      value: bookingCounts.rejected,
                      color: "text-red-700",
                    },
                    {
                      label: "Cancelled",
                      value: bookingCounts.cancelled,
                      color: "text-slate-600",
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-xl bg-slate-50 p-4"
                    >
                      <p className="text-xs text-slate-500">{item.label}</p>
                      <p className={`mt-2 text-2xl font-bold ${item.color}`}>
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <div className="mb-4 flex items-center gap-2">
                  <CreditCard className="text-green-600" size={21} />
                  <h2 className="text-lg font-bold text-slate-900">
                    Recorded Revenue
                  </h2>
                </div>

                <p className="text-3xl font-bold text-slate-900">
                  {formatNumber(data.paymentSummary.totalRevenue)}
                </p>

                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Aggregate amount stored in successful payment records.
                  Currency presentation depends on the payment configuration.
                </p>

                <div className="mt-6 border-t border-slate-100 pt-4">
                  <p className="text-sm text-slate-500">
                    Successful transactions
                  </p>
                  <p className="mt-1 text-xl font-bold text-green-700">
                    {formatNumber(
                      data.paymentSummary.totalTransactions
                    )}
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <div className="mb-4">
                <h2 className="text-lg font-bold text-slate-900">
                  Administration Tools
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Access the main management sections.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {quickLinks.map((item) => {
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.title}
                      href={item.href}
                      className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-md"
                    >
                      <div className="mb-4 flex items-center justify-between">
                        <div className={`rounded-xl p-3 ${item.color}`}>
                          <Icon size={22} />
                        </div>

                        {item.badge !== undefined && item.badge > 0 && (
                          <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-700">
                            {item.badge} pending
                          </span>
                        )}
                      </div>

                      <h3 className="font-bold text-slate-900">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-sm leading-5 text-slate-500">
                        {item.description}
                      </p>

                      <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-600">
                        Open section
                        <ArrowRight
                          size={16}
                          className="transition group-hover:translate-x-1"
                        />
                      </span>
                    </Link>
                  );
                })}
              </div>
            </section>

            <section className="mb-8 grid gap-5 lg:grid-cols-2">
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                  <div>
                    <h2 className="font-bold text-slate-900">
                      Pending Service Reviews
                    </h2>
                    <p className="mt-1 text-xs text-slate-500">
                      Services awaiting admin approval.
                    </p>
                  </div>

                  <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                    {pendingServices.length} pending
                  </span>
                </div>

                {pendingServices.length === 0 ? (
                  <div className="px-5 py-10 text-center">
                    <CheckCircle2
                      size={32}
                      className="mx-auto mb-2 text-green-500"
                    />
                    <p className="text-sm text-slate-500">
                      No services are waiting for review.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {pendingServices.slice(0, 5).map((service) => (
                      <div
                        key={service._id}
                        className="flex items-center justify-between gap-3 px-5 py-4"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-800">
                            {service.title}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {service.category} ·{" "}
                            {service.technicianName || "Technician"}
                          </p>
                          <p className="mt-1 text-xs text-slate-400">
                            {formatDate(service.createdAt)}
                          </p>
                        </div>

                        <span className="shrink-0 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                          Pending
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="border-t border-slate-100 px-5 py-3">
                  <Link
                    href="/dashboard/admin/services"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
                  >
                    Review all services
                    <ArrowRight size={15} />
                  </Link>
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                  <div>
                    <h2 className="font-bold text-slate-900">
                      Recent Bookings
                    </h2>
                    <p className="mt-1 text-xs text-slate-500">
                      Latest repair requests across the platform.
                    </p>
                  </div>
                  <CalendarDays size={21} className="text-blue-600" />
                </div>

                {recentBookings.length === 0 ? (
                  <div className="px-5 py-10 text-center">
                    <Clock3
                      size={32}
                      className="mx-auto mb-2 text-slate-300"
                    />
                    <p className="text-sm text-slate-500">
                      No bookings have been created yet.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {recentBookings.map((booking) => (
                      <div
                        key={booking._id}
                        className="flex items-center justify-between gap-3 px-5 py-4"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-800">
                            {booking.serviceTitle}
                          </p>
                          <p className="mt-1 truncate text-xs text-slate-500">
                            {booking.customerName} ·{" "}
                            {booking.technicianName || "Technician"}
                          </p>
                          <p className="mt-1 text-xs text-slate-400">
                            {formatDate(booking.createdAt)}
                          </p>
                        </div>

                        <span
                          className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${bookingStatusClass(booking.status)}`}
                        >
                          {booking.status.replace("-", " ")}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="border-t border-slate-100 px-5 py-3">
                  <Link
                    href="/dashboard/admin/bookings"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
                  >
                    View all bookings
                    <ArrowRight size={15} />
                  </Link>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                  <ShieldCheck size={23} />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900">
                    Platform Administration
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Manage access carefully. Only authorized administrators can change user roles or approve services.
                  </p>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
