"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import Image from "next/image";
import {
  LayoutDashboard,
  Map,
  Sun,
  CalendarCheck,
  MessageSquare,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Building2,
  Languages,
  Camera,
  Car,
  UserCircle,
  Shield,
  CalendarDays,
  FileText,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "./AuthProvider";
import { ThemeToggle } from "./ThemeToggle";
import type { AdminModule } from "@/types";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  permission: AdminModule | null; // null = always visible
  superAdminOnly?: boolean;
}

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, permission: null },
  { href: "/dashboard/tours", label: "Tour Packages", icon: Map, permission: "tours" },
  { href: "/dashboard/hotels", label: "Hotels", icon: Building2, permission: "hotels" },
  { href: "/dashboard/day-tours", label: "Day Tours", icon: Sun, permission: "day-tours" },
  { href: "/dashboard/bookings", label: "Bookings", icon: CalendarCheck, permission: "bookings" },
  { href: "/dashboard/vehicles", label: "Vehicles", icon: Car, permission: "vehicles" },
  { href: "/dashboard/tour-guides", label: "Tour Guides", icon: UserCircle, permission: "tour-guides" },
  { href: "/dashboard/travel-memories", label: "Travel Memories", icon: Camera, permission: "travel-memories" },
  { href: "/dashboard/contacts", label: "Messages", icon: MessageSquare, permission: "contacts" },
  { href: "/dashboard/translations", label: "Translations", icon: Languages, permission: "translations" },
  { href: "/dashboard/settings", label: "Settings", icon: Settings, permission: "settings" },
  { href: "/dashboard/calendar", label: "Calendar", icon: CalendarDays, permission: "calendar" },
  { href: "/dashboard/invoices", label: "Invoices", icon: FileText, permission: "invoices" },
  { href: "/dashboard/admin-management", label: "Admin Management", icon: Shield, permission: null, superAdminOnly: true },
];

export function Sidebar() {
  const pathname = usePathname();
  const { logout, user, adminRole } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const visibleItems = navItems.filter((item) => {
    // Super admin only items
    if (item.superAdminOnly) {
      return adminRole?.isSuperAdmin === true;
    }
    // Always visible items (Dashboard)
    if (item.permission === null) return true;
    // Super admin sees everything
    if (adminRole?.isSuperAdmin) return true;
    // Check specific permission
    return adminRole?.permissions.includes(item.permission) ?? false;
  });

  return (
    <aside
      className={cn(
        "flex h-screen flex-col border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-all duration-300",
        collapsed ? "w-[72px]" : "w-64"
      )}
    >
      <div className="flex h-16 items-center justify-between border-b border-gray-200 dark:border-gray-700 px-3">
        <div className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="Anvil Lanka Travels"
            width={40}
            height={40}
            className="rounded-full"
          />
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
                Anvil Lanka
              </span>
              <span className="text-[10px] font-medium uppercase tracking-wider text-primary-600 dark:text-primary-400">
                Travels
              </span>
            </div>
          )}
        </div>
        {!collapsed && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
      </div>
      {collapsed && (
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="mx-auto mt-2 rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      )}

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {visibleItems.map((item) => {
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
                  ? "bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white",
                collapsed && "justify-center px-2"
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className={cn("h-5 w-5 shrink-0", isActive ? "text-primary-600 dark:text-primary-400" : "")} />
              {!collapsed && item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-gray-200 dark:border-gray-700 p-3 space-y-2">
        <ThemeToggle collapsed={collapsed} />
        {!collapsed && user && (
          <div className="rounded-lg bg-gray-50 dark:bg-gray-700 px-3 py-2">
            <p className="truncate text-xs font-medium text-gray-900 dark:text-white">
              {user.displayName || "Admin"}
            </p>
            <p className="truncate text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
            {adminRole?.isSuperAdmin && (
              <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Super Admin
              </p>
            )}
          </div>
        )}
        <button
          onClick={logout}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 transition-colors hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-700 dark:hover:text-red-400",
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
