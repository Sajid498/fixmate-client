
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Search,
  RefreshCw,
  LoaderCircle,
  Users,
  UserRound,
  ShieldCheck,
  Wrench,
  Mail,
  Phone,
  MapPin,
  CalendarDays,
  ChevronDown,
  X,
} from "lucide-react";
import { authenticatedRequest } from "@/lib/api";
import { toast } from "sonner";

type UserRole = "customer" | "technician" | "admin";

interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  image?: string;
  phone?: string;
  area?: string;
  createdAt?: string;
}

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

function roleStyle(role: UserRole) {
  const styles: Record<UserRole, string> = {
    customer: "bg-blue-50 text-blue-700",
    technician: "bg-purple-50 text-purple-700",
    admin: "bg-amber-50 text-amber-700",
  };

  return styles[role];
}

function RoleIcon({ role }: { role: UserRole }) {
  if (role === "technician") return <Wrench size={15} />;
  if (role === "admin") return <ShieldCheck size={15} />;
  return <UserRound size={15} />;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);

      const [usersResult, currentUserResult] = await Promise.all([
        authenticatedRequest<{
          success: boolean;
          count: number;
          data: AdminUser[];
        }>("/api/admin/users"),

        authenticatedRequest<{
          success: boolean;
          user?: { id?: string };
          data?: { id?: string };
        }>("/api/users/me"),
      ]);

      setUsers(usersResult.data || []);

      const identity =
        currentUserResult.user?.id || currentUserResult.data?.id;

      if (identity) setCurrentUserId(identity);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to load users."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        !term ||
        user.name?.toLowerCase().includes(term) ||
        user.email?.toLowerCase().includes(term) ||
        user.phone?.toLowerCase().includes(term) ||
        user.area?.toLowerCase().includes(term);

      const matchesRole =
        roleFilter === "all" || user.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  const counts = useMemo(
    () => ({
      total: users.length,
      customers: users.filter((user) => user.role === "customer").length,
      technicians: users.filter((user) => user.role === "technician").length,
      admins: users.filter((user) => user.role === "admin").length,
    }),
    [users]
  );

  const updateRole = async (user: AdminUser, newRole: UserRole) => {
    if (user.role === newRole) return;

    if (currentUserId && user._id === currentUserId) {
      toast.error("You cannot change your own role.");
      return;
    }

    const confirmed = window.confirm(
      `Change ${user.name}'s role from ${user.role} to ${newRole}?`
    );

    if (!confirmed) return;

    setUpdatingId(user._id);

    try {
      await authenticatedRequest(`/api/admin/users/${user._id}/role`, {
        method: "PATCH",
        body: JSON.stringify({ role: newRole }),
      });

      setUsers((current) =>
        current.map((item) =>
          item._id === user._id ? { ...item, role: newRole } : item
        )
      );

      setSelectedUser((current) =>
        current?._id === user._id
          ? { ...current, role: newRole }
          : current
      );

      toast.success(`${user.name}'s role was updated successfully.`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to update user role."
      );
    } finally {
      setUpdatingId(null);
    }
  };

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
              User Management
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              View registered accounts and manage their platform roles.
            </p>
          </div>

          <button
            onClick={loadUsers}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
          >
            <RefreshCw
              size={17}
              className={loading ? "animate-spin" : ""}
            />
            Refresh Users
          </button>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: "Total Users",
              value: counts.total,
              icon: Users,
              color: "bg-blue-50 text-blue-600",
            },
            {
              label: "Customers",
              value: counts.customers,
              icon: UserRound,
              color: "bg-sky-50 text-sky-600",
            },
            {
              label: "Technicians",
              value: counts.technicians,
              icon: Wrench,
              color: "bg-purple-50 text-purple-600",
            },
            {
              label: "Administrators",
              value: counts.admins,
              icon: ShieldCheck,
              color: "bg-amber-50 text-amber-600",
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-500">{item.label}</p>
                  <div className={`rounded-xl p-3 ${item.color}`}>
                    <Icon size={21} />
                  </div>
                </div>
                <p className="mt-4 text-3xl font-bold text-slate-900">
                  {item.value}
                </p>
              </div>
            );
          })}
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
              placeholder="Search by name, email, phone or area..."
              className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
          >
            <option value="all">All Roles</option>
            <option value="customer">Customers</option>
            <option value="technician">Technicians</option>
            <option value="admin">Administrators</option>
          </select>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <h2 className="font-bold text-slate-900">Registered Users</h2>
              <p className="mt-1 text-xs text-slate-500">
                {filteredUsers.length} matching accounts
              </p>
            </div>
            <Users size={21} className="text-blue-600" />
          </div>

          {loading ? (
            <div className="flex min-h-64 items-center justify-center">
              <div className="text-center">
                <LoaderCircle
                  size={35}
                  className="mx-auto mb-3 animate-spin text-blue-600"
                />
                <p className="text-sm text-slate-500">
                  Loading registered users...
                </p>
              </div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <Users
                size={40}
                className="mx-auto mb-3 text-slate-300"
              />
              <h3 className="font-semibold text-slate-800">
                No users found
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                Try another search term or role filter.
              </p>
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-5 py-4 font-semibold">User</th>
                      <th className="px-5 py-4 font-semibold">Contact</th>
                      <th className="px-5 py-4 font-semibold">Role</th>
                      <th className="px-5 py-4 font-semibold">Joined</th>
                      <th className="px-5 py-4 font-semibold">Manage</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {filteredUsers.map((user) => {
                      const isSelf =
                        currentUserId === user._id ||
                        (!currentUserId && false);

                      return (
                        <tr
                          key={user._id}
                          className="transition hover:bg-slate-50"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-50 text-sm font-bold text-blue-700">
                                {user.image ? (
                                  <img
                                    src={user.image}
                                    alt={user.name}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  user.name?.charAt(0).toUpperCase() || "U"
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="max-w-48 truncate text-sm font-semibold text-slate-900">
                                  {user.name}
                                </p>
                                <p className="text-xs text-slate-400">
                                  Account ID: {user._id.slice(-8)}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <p className="flex items-center gap-2 text-sm text-slate-700">
                              <Mail size={14} className="text-slate-400" />
                              {user.email}
                            </p>
                            <p className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                              <Phone size={13} className="text-slate-400" />
                              {user.phone || "Not provided"}
                            </p>
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${roleStyle(user.role)}`}
                            >
                              <RoleIcon role={user.role} />
                              {user.role}
                            </span>
                          </td>

                          <td className="px-5 py-4 text-sm text-slate-500">
                            {formatDate(user.createdAt)}
                          </td>

                          <td className="px-5 py-4">
                            <div className="relative">
                              <select
                                value={user.role}
                                disabled={isSelf || updatingId === user._id}
                                onChange={(event) =>
                                  updateRole(
                                    user,
                                    event.target.value as UserRole
                                  )
                                }
                                className="max-w-36 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-blue-500 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:opacity-60"
                                aria-label={`Change role for ${user.name}`}
                              >
                                <option value="customer">Customer</option>
                                <option value="technician">Technician</option>
                                <option value="admin">Admin</option>
                              </select>
                              {updatingId === user._id && (
                                <LoaderCircle
                                  size={14}
                                  className="ml-2 inline animate-spin text-blue-600"
                                />
                              )}
                            </div>
                            {isSelf && (
                              <p className="mt-1 text-xs text-slate-400">
                                Your account
                              </p>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="divide-y divide-slate-100 md:hidden">
                {filteredUsers.map((user) => {
                  const isSelf = currentUserId === user._id;

                  return (
                    <div key={user._id} className="p-5">
                      <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-50 font-bold text-blue-700">
                          {user.image ? (
                            <img
                              src={user.image}
                              alt={user.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            user.name?.charAt(0).toUpperCase() || "U"
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="truncate font-semibold text-slate-900">
                            {user.name}
                          </h3>
                          <p className="mt-1 break-all text-xs text-slate-500">
                            {user.email}
                          </p>
                          <span
                            className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${roleStyle(user.role)}`}
                          >
                            <RoleIcon role={user.role} />
                            {user.role}
                          </span>
                        </div>

                        <button
                          onClick={() => setSelectedUser(user)}
                          aria-label={`View ${user.name} details`}
                          className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
                        >
                          <ChevronDown size={17} />
                        </button>
                      </div>

                      <div className="mt-4 flex items-center justify-between gap-3">
                        <span className="text-xs text-slate-400">
                          Joined {formatDate(user.createdAt)}
                        </span>

                        <select
                          value={user.role}
                          disabled={isSelf || updatingId === user._id}
                          onChange={(event) =>
                            updateRole(
                              user,
                              event.target.value as UserRole
                            )
                          }
                          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none disabled:opacity-50"
                          aria-label={`Change role for ${user.name}`}
                        >
                          <option value="customer">Customer</option>
                          <option value="technician">Technician</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>

                      {isSelf && (
                        <p className="mt-2 text-right text-xs text-slate-400">
                          Your account
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">
                User Information
              </h2>
              <button
                onClick={() => setSelectedUser(null)}
                aria-label="Close user information"
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-5 flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-blue-50 text-xl font-bold text-blue-700">
                {selectedUser.image ? (
                  <img
                    src={selectedUser.image}
                    alt={selectedUser.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  selectedUser.name?.charAt(0).toUpperCase() || "U"
                )}
              </div>
              <div>
                <h3 className="font-bold text-slate-900">
                  {selectedUser.name}
                </h3>
                <span
                  className={`mt-1 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${roleStyle(selectedUser.role)}`}
                >
                  <RoleIcon role={selectedUser.role} />
                  {selectedUser.role}
                </span>
              </div>
            </div>

            <div className="space-y-4 border-t border-slate-100 pt-5">
              <div>
                <p className="text-xs text-slate-400">Email Address</p>
                <p className="mt-1 break-all text-sm font-medium text-slate-800">
                  {selectedUser.email}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">Phone Number</p>
                <p className="mt-1 flex items-center gap-2 text-sm text-slate-800">
                  <Phone size={15} />
                  {selectedUser.phone || "Not provided"}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">Area</p>
                <p className="mt-1 flex items-center gap-2 text-sm text-slate-800">
                  <MapPin size={15} />
                  {selectedUser.area || "Not provided"}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">Registration Date</p>
                <p className="mt-1 flex items-center gap-2 text-sm text-slate-800">
                  <CalendarDays size={15} />
                  {formatDate(selectedUser.createdAt)}
                </p>
              </div>
            </div>

            <button
              onClick={() => setSelectedUser(null)}
              className="mt-6 w-full rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
