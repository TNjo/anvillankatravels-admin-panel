"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import {
  Shield,
  ShieldCheck,
  Plus,
  Pencil,
  Trash2,
  X,
  Loader2,
  UserPlus,
  Check,
  Mail,
  User,
  KeyRound,
  AlertTriangle,
  Map,
  Building2,
  Sun,
  CalendarCheck,
  Car,
  UserCircle,
  Camera,
  MessageSquare,
  Languages,
  Settings,
  FileText,
  CalendarDays,
  MapPin,
} from "lucide-react";
import { toast } from "sonner";
import type { AdminRecord, AdminModule } from "@/types";
import { ALL_ADMIN_MODULES } from "@/types";

const MODULE_LABELS: Record<AdminModule, string> = {
  tours: "Tour Packages",
  hotels: "Hotels",
  "day-tours": "Day Tours",
  bookings: "Bookings",
  vehicles: "Vehicles",
  "tour-guides": "Tour Guides",
  "travel-memories": "Travel Memories",
  contacts: "Messages",
  translations: "Translations",
  settings: "Settings",
  invoices: "Invoices",
  calendar: "Calendar",
  locations: "Locations",
};

const MODULE_ICONS: Record<AdminModule, React.ComponentType<{ className?: string }>> = {
  tours: Map,
  hotels: Building2,
  "day-tours": Sun,
  bookings: CalendarCheck,
  vehicles: Car,
  "tour-guides": UserCircle,
  "travel-memories": Camera,
  contacts: MessageSquare,
  translations: Languages,
  settings: Settings,
  invoices: FileText,
  calendar: CalendarDays,
  locations: MapPin,
};

const MODULE_COLORS: Record<AdminModule, { badge: string; icon: string; selected: string }> = {
  tours: {
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    icon: "text-blue-500 dark:text-blue-400",
    selected: "border-blue-300 bg-blue-50 ring-blue-100 dark:border-blue-700 dark:bg-blue-900/20 dark:ring-blue-900/40",
  },
  hotels: {
    badge: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    icon: "text-purple-500 dark:text-purple-400",
    selected: "border-purple-300 bg-purple-50 ring-purple-100 dark:border-purple-700 dark:bg-purple-900/20 dark:ring-purple-900/40",
  },
  "day-tours": {
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    icon: "text-amber-500 dark:text-amber-400",
    selected: "border-amber-300 bg-amber-50 ring-amber-100 dark:border-amber-700 dark:bg-amber-900/20 dark:ring-amber-900/40",
  },
  bookings: {
    badge: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    icon: "text-green-500 dark:text-green-400",
    selected: "border-green-300 bg-green-50 ring-green-100 dark:border-green-700 dark:bg-green-900/20 dark:ring-green-900/40",
  },
  vehicles: {
    badge: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
    icon: "text-cyan-500 dark:text-cyan-400",
    selected: "border-cyan-300 bg-cyan-50 ring-cyan-100 dark:border-cyan-700 dark:bg-cyan-900/20 dark:ring-cyan-900/40",
  },
  "tour-guides": {
    badge: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
    icon: "text-indigo-500 dark:text-indigo-400",
    selected: "border-indigo-300 bg-indigo-50 ring-indigo-100 dark:border-indigo-700 dark:bg-indigo-900/20 dark:ring-indigo-900/40",
  },
  "travel-memories": {
    badge: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
    icon: "text-pink-500 dark:text-pink-400",
    selected: "border-pink-300 bg-pink-50 ring-pink-100 dark:border-pink-700 dark:bg-pink-900/20 dark:ring-pink-900/40",
  },
  contacts: {
    badge: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    icon: "text-orange-500 dark:text-orange-400",
    selected: "border-orange-300 bg-orange-50 ring-orange-100 dark:border-orange-700 dark:bg-orange-900/20 dark:ring-orange-900/40",
  },
  translations: {
    badge: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
    icon: "text-teal-500 dark:text-teal-400",
    selected: "border-teal-300 bg-teal-50 ring-teal-100 dark:border-teal-700 dark:bg-teal-900/20 dark:ring-teal-900/40",
  },
  settings: {
    badge: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
    icon: "text-gray-500 dark:text-gray-400",
    selected: "border-gray-400 bg-gray-50 ring-gray-200 dark:border-gray-500 dark:bg-gray-700/50 dark:ring-gray-700",
  },
  invoices: {
    badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    icon: "text-emerald-500 dark:text-emerald-400",
    selected: "border-emerald-300 bg-emerald-50 ring-emerald-100 dark:border-emerald-700 dark:bg-emerald-900/20 dark:ring-emerald-900/40",
  },
  calendar: {
    badge: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
    icon: "text-rose-500 dark:text-rose-400",
    selected: "border-rose-300 bg-rose-50 ring-rose-100 dark:border-rose-700 dark:bg-rose-900/20 dark:ring-rose-900/40",
  },
  locations: {
    badge: "bg-lime-100 text-lime-700 dark:bg-lime-900/30 dark:text-lime-400",
    icon: "text-lime-500 dark:text-lime-400",
    selected: "border-lime-300 bg-lime-50 ring-lime-100 dark:border-lime-700 dark:bg-lime-900/20 dark:ring-lime-900/40",
  },
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const AVATAR_COLORS = [
  "from-blue-500 to-indigo-600",
  "from-emerald-500 to-teal-600",
  "from-orange-500 to-red-600",
  "from-purple-500 to-pink-600",
  "from-cyan-500 to-blue-600",
  "from-amber-500 to-orange-600",
  "from-rose-500 to-pink-600",
  "from-violet-500 to-purple-600",
];

function getAvatarColor(email: string) {
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    hash = email.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export default function AdminManagementPage() {
  const { getToken, adminRole, adminLoading } = useAuth();
  const router = useRouter();
  const [admins, setAdmins] = useState<AdminRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminRecord | null>(null);
  const [deleteConfirmEmail, setDeleteConfirmEmail] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!adminLoading && !adminRole?.isSuperAdmin) {
      router.replace("/dashboard");
    }
  }, [adminRole, adminLoading, router]);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch("/api/admin", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setAdmins(await res.json());
      }
    } catch (error) {
      console.error("Failed to fetch admins:", error);
      toast.error("Failed to load admins");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (adminRole?.isSuperAdmin) {
      fetchAdmins();
    }
  }, [adminRole]);

  const handleDelete = async (email: string) => {
    setDeleting(true);
    try {
      const token = await getToken();
      const res = await fetch(`/api/admin/${encodeURIComponent(email)}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setAdmins(admins.filter((a) => a.email !== email));
        toast.success("Admin removed successfully");
      } else {
        throw new Error("Failed to delete");
      }
    } catch {
      toast.error("Failed to remove admin");
    } finally {
      setDeleting(false);
      setDeleteConfirmEmail(null);
    }
  };

  const handleSave = async (data: { email: string; name: string; permissions: AdminModule[] }) => {
    try {
      const token = await getToken();

      if (editingAdmin) {
        const res = await fetch(`/api/admin/${encodeURIComponent(editingAdmin.email)}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: data.name, permissions: data.permissions }),
        });

        if (res.ok) {
          const updated = await res.json();
          setAdmins(admins.map((a) => (a.email === editingAdmin.email ? updated : a)));
          toast.success("Admin updated successfully");
        } else {
          const err = await res.json();
          throw new Error(err.error || "Failed to update");
        }
      } else {
        const res = await fetch("/api/admin", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (res.ok) {
          const newAdmin = await res.json();
          setAdmins([newAdmin, ...admins]);
          toast.success("Admin created successfully");
        } else {
          const err = await res.json();
          throw new Error(err.error || "Failed to create");
        }
      }

      setIsModalOpen(false);
      setEditingAdmin(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save admin");
    }
  };

  if (adminLoading || !adminRole?.isSuperAdmin) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-lg shadow-primary-500/20">
            <ShieldCheck className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Management</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {admins.length} admin{admins.length !== 1 ? "s" : ""} configured
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            setEditingAdmin(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-500/25 transition-all hover:shadow-xl hover:shadow-primary-500/30 hover:from-primary-500 hover:to-primary-600 active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          Add Admin
        </button>
      </div>

      {/* Admin List */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-full bg-gray-200 dark:bg-gray-700" />
                <div className="flex-1">
                  <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700" />
                  <div className="mt-2 h-3 w-36 rounded bg-gray-200 dark:bg-gray-700" />
                </div>
              </div>
              <div className="mt-4 flex gap-1.5">
                <div className="h-6 w-16 rounded-full bg-gray-200 dark:bg-gray-700" />
                <div className="h-6 w-20 rounded-full bg-gray-200 dark:bg-gray-700" />
              </div>
            </div>
          ))}
        </div>
      ) : admins.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800">
            <UserPlus className="h-8 w-8 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">No admins yet</h3>
          <p className="mt-1 max-w-sm text-sm text-gray-500 dark:text-gray-400">
            Create your first admin user to grant dashboard access to team members
          </p>
          <button
            onClick={() => {
              setEditingAdmin(null);
              setIsModalOpen(true);
            }}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-500/25 transition-all hover:shadow-xl hover:shadow-primary-500/30 active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            Add First Admin
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {admins.map((admin) => (
            <div
              key={admin.email}
              className="group relative rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 transition-all hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-black/20 hover:border-gray-300 dark:hover:border-gray-600"
            >
              {/* Action buttons */}
              <div className="absolute right-3 top-3 flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  onClick={() => {
                    setEditingAdmin(admin);
                    setIsModalOpen(true);
                  }}
                  className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/30 dark:hover:text-blue-400"
                  title="Edit permissions"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setDeleteConfirmEmail(admin.email)}
                  className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                  title="Remove admin"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Avatar + Info */}
              <div className="flex items-center gap-3">
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${getAvatarColor(admin.email)} shadow-md`}>
                  <span className="text-sm font-bold text-white">{getInitials(admin.name)}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                    {admin.name}
                  </h3>
                  <p className="truncate text-xs text-gray-500 dark:text-gray-400">{admin.email}</p>
                </div>
              </div>

              {/* Permissions */}
              <div className="mt-4 flex flex-wrap gap-1.5">
                {admin.permissions.length === 0 ? (
                  <span className="text-xs text-gray-400 dark:text-gray-500 italic">
                    No permissions
                  </span>
                ) : admin.permissions.length === ALL_ADMIN_MODULES.length ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary-100 dark:bg-primary-900/30 px-2.5 py-1 text-xs font-semibold text-primary-700 dark:text-primary-400">
                    <ShieldCheck className="h-3 w-3" />
                    Full Access
                  </span>
                ) : (
                  admin.permissions.map((perm) => (
                    <span
                      key={perm}
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${MODULE_COLORS[perm].badge}`}
                    >
                      {MODULE_LABELS[perm]}
                    </span>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="mt-4 flex items-center justify-between border-t border-gray-100 dark:border-gray-700/50 pt-3">
                <p className="text-[11px] text-gray-400 dark:text-gray-500">
                  Added {new Date(admin.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </p>
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-400 dark:text-gray-500">
                  <KeyRound className="h-3 w-3" />
                  {admin.permissions.length}/{ALL_ADMIN_MODULES.length}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmEmail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => !deleting && setDeleteConfirmEmail(null)}>
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">Remove Admin</h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                This will revoke all dashboard access for <span className="font-medium text-gray-700 dark:text-gray-300">{deleteConfirmEmail}</span>
              </p>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setDeleteConfirmEmail(null)}
                disabled={deleting}
                className="flex-1 rounded-xl border border-gray-200 dark:border-gray-600 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmEmail)}
                disabled={deleting}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                {deleting ? "Removing..." : "Remove"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      <AdminModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingAdmin(null);
        }}
        onSave={handleSave}
        admin={editingAdmin}
      />
    </div>
  );
}

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { email: string; name: string; permissions: AdminModule[] }) => Promise<void>;
  admin: AdminRecord | null;
}

function AdminModal({ isOpen, onClose, onSave, admin }: AdminModalProps) {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [permissions, setPermissions] = useState<AdminModule[]>([]);

  useEffect(() => {
    if (admin) {
      setEmail(admin.email);
      setName(admin.name);
      setPermissions([...admin.permissions]);
    } else {
      setEmail("");
      setName("");
      setPermissions([]);
    }
  }, [admin, isOpen]);

  const togglePermission = (module: AdminModule) => {
    setPermissions((prev) =>
      prev.includes(module) ? prev.filter((p) => p !== module) : [...prev, module]
    );
  };

  const toggleAll = () => {
    if (permissions.length === ALL_ADMIN_MODULES.length) {
      setPermissions([]);
    } else {
      setPermissions([...ALL_ADMIN_MODULES]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (permissions.length === 0) {
      toast.error("Please select at least one permission");
      return;
    }
    setLoading(true);
    try {
      await onSave({ email: email.trim(), name: name.trim(), permissions });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const allSelected = permissions.length === ALL_ADMIN_MODULES.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white dark:bg-gray-800 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-gray-100 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700">
                {admin ? <Pencil className="h-4 w-4 text-white" /> : <UserPlus className="h-4 w-4 text-white" />}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {admin ? "Edit Admin" : "New Admin"}
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {admin ? "Update permissions and details" : "Grant dashboard access to a team member"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-xl p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                <Mail className="h-3.5 w-3.5" />
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="teammate@company.com"
                required
                disabled={!!admin}
              />
              {admin && (
                <p className="mt-1.5 text-[11px] text-gray-400 dark:text-gray-500">
                  Email is locked after creation
                </p>
              )}
            </div>

            {/* Name Field */}
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                <User className="h-3.5 w-3.5" />
                Display Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input"
                placeholder="Full name"
                required
              />
            </div>

            {/* Permissions Section */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <Shield className="h-3.5 w-3.5" />
                  Permissions
                  <span className="ml-1 rounded-md bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 text-[10px] font-semibold text-gray-500 dark:text-gray-400">
                    {permissions.length}/{ALL_ADMIN_MODULES.length}
                  </span>
                </label>
                <button
                  type="button"
                  onClick={toggleAll}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                    allSelected
                      ? "bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600"
                  }`}
                >
                  {allSelected ? "Deselect All" : "Select All"}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {ALL_ADMIN_MODULES.map((module) => {
                  const isSelected = permissions.includes(module);
                  const colors = MODULE_COLORS[module];
                  const Icon = MODULE_ICONS[module];
                  return (
                    <button
                      key={module}
                      type="button"
                      onClick={() => togglePermission(module)}
                      className={`group/perm relative flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left text-sm transition-all ${
                        isSelected
                          ? `${colors.selected} ring-1 shadow-sm`
                          : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:border-gray-500 dark:hover:bg-gray-700/50"
                      }`}
                    >
                      <Icon className={`h-4 w-4 shrink-0 transition-colors ${isSelected ? colors.icon : "text-gray-400 dark:text-gray-500 group-hover/perm:text-gray-500 dark:group-hover/perm:text-gray-400"}`} />
                      <span className={`flex-1 truncate text-[13px] font-medium ${isSelected ? "text-gray-900 dark:text-white" : ""}`}>
                        {MODULE_LABELS[module]}
                      </span>
                      <div className={`flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-md transition-all ${
                        isSelected
                          ? "bg-primary-600 dark:bg-primary-500 text-white shadow-sm"
                          : "border border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-700"
                      }`}>
                        {isSelected && <Check className="h-3 w-3" strokeWidth={3} />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {permissions.length === 0 && (
                <p className="mt-2 flex items-center gap-1 text-xs text-red-500 dark:text-red-400">
                  <AlertTriangle className="h-3 w-3" />
                  Select at least one permission
                </p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 flex items-center justify-end gap-3 border-t border-gray-100 dark:border-gray-700 pt-5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-200 dark:border-gray-600 px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-500/25 transition-all hover:shadow-xl hover:shadow-primary-500/30 hover:from-primary-500 hover:to-primary-600 disabled:opacity-50 disabled:shadow-none active:scale-[0.98]"
              disabled={loading || permissions.length === 0}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : admin ? (
                <Check className="h-4 w-4" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              {loading ? "Saving..." : admin ? "Save Changes" : "Create Admin"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
