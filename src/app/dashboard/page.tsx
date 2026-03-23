"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { Map, Sun, CalendarCheck, MessageSquare, TrendingUp, Users } from "lucide-react";
import type { AdminModule } from "@/types";

interface Stats {
  totalTours: number;
  totalDayTours: number;
  totalBookings: number;
  unreadContacts: number;
  pendingBookings: number;
}

export default function DashboardPage() {
  const { getToken, adminRole } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const hasAccess = (module: AdminModule) =>
    adminRole?.isSuperAdmin || adminRole?.permissions.includes(module) || false;

  useEffect(() => {
    async function fetchStats() {
      try {
        const token = await getToken();
        const res = await fetch("/api/stats", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          setStats(await res.json());
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, [getToken]);

  const statCards = [
    {
      label: "Tour Packages",
      value: stats?.totalTours ?? 0,
      icon: Map,
      bgColor: "bg-blue-50 dark:bg-blue-900/30",
      textColor: "text-blue-700 dark:text-blue-400",
      module: "tours" as AdminModule,
    },
    {
      label: "Day Tours",
      value: stats?.totalDayTours ?? 0,
      icon: Sun,
      bgColor: "bg-amber-50 dark:bg-amber-900/30",
      textColor: "text-amber-700 dark:text-amber-400",
      module: "day-tours" as AdminModule,
    },
    {
      label: "Total Bookings",
      value: stats?.totalBookings ?? 0,
      icon: CalendarCheck,
      bgColor: "bg-green-50 dark:bg-green-900/30",
      textColor: "text-green-700 dark:text-green-400",
      module: "bookings" as AdminModule,
    },
    {
      label: "Pending Bookings",
      value: stats?.pendingBookings ?? 0,
      icon: TrendingUp,
      bgColor: "bg-orange-50 dark:bg-orange-900/30",
      textColor: "text-orange-700 dark:text-orange-400",
      module: "bookings" as AdminModule,
    },
    {
      label: "Unread Messages",
      value: stats?.unreadContacts ?? 0,
      icon: MessageSquare,
      bgColor: "bg-purple-50 dark:bg-purple-900/30",
      textColor: "text-purple-700 dark:text-purple-400",
      module: "contacts" as AdminModule,
    },
  ];

  const quickActions = [
    {
      href: "/dashboard/tours",
      label: "Manage Tours",
      icon: Map,
      iconColor: "text-primary-600 dark:text-primary-400",
      module: "tours" as AdminModule,
    },
    {
      href: "/dashboard/day-tours",
      label: "Manage Day Tours",
      icon: Sun,
      iconColor: "text-amber-600 dark:text-amber-400",
      module: "day-tours" as AdminModule,
    },
    {
      href: "/dashboard/bookings",
      label: "View Bookings",
      icon: CalendarCheck,
      iconColor: "text-green-600 dark:text-green-400",
      module: "bookings" as AdminModule,
    },
    {
      href: "/dashboard/contacts",
      label: "View Messages",
      icon: MessageSquare,
      iconColor: "text-purple-600 dark:text-purple-400",
      module: "contacts" as AdminModule,
    },
  ];

  const visibleStats = statCards.filter((card) => hasAccess(card.module));
  const visibleActions = quickActions.filter((action) => hasAccess(action.module));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Overview of your travel platform
        </p>
      </div>

      {visibleStats.length > 0 && (
        <div className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-3 ${visibleStats.length >= 4 ? "xl:grid-cols-" + Math.min(visibleStats.length, 5) : ""}`}>
          {visibleStats.map((card) => (
            <div key={card.label} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {card.label}
                  </p>
                  <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                    {loading ? (
                      <span className="inline-block h-8 w-12 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                    ) : (
                      card.value
                    )}
                  </p>
                </div>
                <div className={`rounded-xl ${card.bgColor} p-3`}>
                  <card.icon className={`h-6 w-6 ${card.textColor}`} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {visibleActions.length > 0 && (
          <div className="card">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Quick Actions
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {visibleActions.map((action) => (
                <a
                  key={action.href}
                  href={action.href}
                  className="flex items-center gap-3 rounded-lg border border-gray-200 dark:border-gray-700 p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <action.icon className={`h-5 w-5 ${action.iconColor}`} />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{action.label}</span>
                </a>
              ))}
            </div>
          </div>
        )}

        <div className="card">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Platform Info
          </h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Frontend</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Dream Sri Lanka Planner — React + Vite
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Backend</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Next.js API Routes + Firebase
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Map className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Database</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Cloud Firestore + Firebase Storage
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
