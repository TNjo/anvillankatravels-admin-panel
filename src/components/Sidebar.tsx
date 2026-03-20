"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Map,
  Sun,
  CalendarCheck,
  MessageSquare,
  Settings,
  LogOut,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Building2,
  Languages,
  Camera,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "./AuthProvider";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/tours", label: "Tour Packages", icon: Map },
  { href: "/dashboard/hotels", label: "Hotels", icon: Building2 },
  { href: "/dashboard/day-tours", label: "Day Tours", icon: Sun },
  { href: "/dashboard/bookings", label: "Bookings", icon: CalendarCheck },
  { href: "/dashboard/travel-memories", label: "Travel Memories", icon: Camera },
  { href: "/dashboard/contacts", label: "Messages", icon: MessageSquare },
  { href: "/dashboard/translations", label: "Translations", icon: Languages },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "flex h-screen flex-col border-r border-gray-200 bg-white transition-all duration-300",
        collapsed ? "w-[72px]" : "w-64"
      )}
    >
      <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <MapPin className="h-7 w-7 text-primary-600" />
            <span className="text-sm font-bold text-gray-900">
              Anvil Lanka
            </span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary-50 text-primary-700"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                collapsed && "justify-center px-2"
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className={cn("h-5 w-5 shrink-0", isActive ? "text-primary-600" : "")} />
              {!collapsed && item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-gray-200 p-3">
        {!collapsed && user && (
          <div className="mb-3 rounded-lg bg-gray-50 px-3 py-2">
            <p className="truncate text-xs font-medium text-gray-900">
              {user.displayName || "Admin"}
            </p>
            <p className="truncate text-xs text-gray-500">{user.email}</p>
          </div>
        )}
        <button
          onClick={logout}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-red-50 hover:text-red-700",
            collapsed && "justify-center px-2"
          )}
          title={collapsed ? "Logout" : undefined}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && "Logout"}
        </button>
      </div>
    </aside>
  );
}
