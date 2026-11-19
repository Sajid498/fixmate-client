
"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LoaderCircle, ShieldCheck } from "lucide-react";
import { authClient } from "@/lib/auth-client";

const dashboardByRole: Record<string, string> = {
  customer: "/dashboard/customer",
  technician: "/dashboard/technician",
  admin: "/dashboard/admin",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isPending } = authClient.useSession();

  const role = session?.user?.role as string | undefined;
  const allowedDashboard = role ? dashboardByRole[role] : undefined;

  const hasAccess =
    Boolean(allowedDashboard) &&
    pathname.startsWith(allowedDashboard);

  useEffect(() => {
    if (isPending) return;

    if (!session?.user) {
      const callbackURL = encodeURIComponent(pathname);
      router.replace(`/sign-in?callbackURL=${callbackURL}`);
      return;
    }

    if (!allowedDashboard) {
      router.replace("/");
      return;
    }

    if (!hasAccess) {
      router.replace(allowedDashboard);
    }
  }, [
    isPending,
    session,
    allowedDashboard,
    hasAccess,
    pathname,
    router,
  ]);

  if (isPending || !session?.user || !hasAccess) {
    return (
      <div className="flex min-h-[65vh] items-center justify-center bg-slate-50 px-4">
        <div className="text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            {isPending ? (
              <LoaderCircle size={30} className="animate-spin" />
            ) : (
              <ShieldCheck size={30} />
            )}
          </div>
          <h2 className="text-lg font-bold text-slate-900">
            Securing your dashboard
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Verifying your account permissions...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
