"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { Map, Sun, CalendarCheck, MessageSquare, TrendingUp, Users } from "lucide-react";

interface Stats {
  totalTours: number;
  totalDayTours: number;
  totalBookings: number;
  unreadContacts: number;
  pendingBookings: number;
}

export default function DashboardPage() {
  const { getToken } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

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
      color: "bg-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-900/30",
      textColor: "text-blue-700 dark:text-blue-400",
    },
    {
      label: "Day Tours",
      value: stats?.totalDayTours ?? 0,
      icon: Sun,
      color: "bg-amber-500",
      bgColor: "bg-amber-50 dark:bg-amber-900/30",
      textColor: "text-amber-700 dark:text-amber-400",
    },
    {
      label: "Total Bookings",
      value: stats?.totalBookings ?? 0,
      icon: CalendarCheck,
      color: "bg-green-500",
      bgColor: "bg-green-50 dark:bg-green-900/30",
      textColor: "text-green-700 dark:text-green-400",
    },
    {
      label: "Pending Bookings",
      value: stats?.pendingBookings ?? 0,
      icon: TrendingUp,
      color: "bg-orange-500",
      bgColor: "bg-orange-50 dark:bg-orange-900/30",
      textColor: "text-orange-700 dark:text-orange-400",
    },
    {
      label: "Unread Messages",
      value: stats?.unreadContacts ?? 0,
      icon: MessageSquare,
      color: "bg-purple-500",
      bgColor: "bg-purple-50 dark:bg-purple-900/30",
      textColor: "text-purple-700 dark:text-purple-400",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Overview of your travel platform
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {statCards.map((card) => (
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

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Quick Actions
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <a href="/dashboard/tours" className="flex items-center gap-3 rounded-lg border border-gray-200 dark:border-gray-700 p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700">
              <Map className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Manage Tours</span>
            </a>
            <a href="/dashboard/day-tours" className="flex items-center gap-3 rounded-lg border border-gray-200 dark:border-gray-700 p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700">
              <Sun className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Manage Day Tours</span>
            </a>
            <a href="/dashboard/bookings" className="flex items-center gap-3 rounded-lg border border-gray-200 dark:border-gray-700 p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700">
              <CalendarCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">View Bookings</span>
            </a>
            <a href="/dashboard/contacts" className="flex items-center gap-3 rounded-lg border border-gray-200 dark:border-gray-700 p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700">
              <MessageSquare className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">View Messages</span>
            </a>
          </div>
        </div>

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
