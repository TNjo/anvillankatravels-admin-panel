"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { Plus, Pencil, Trash2, Search, Building2, Star, MapPin } from "lucide-react";
import { toast } from "sonner";
import { useRequirePermission } from "@/lib/useRequirePermission";
import type { Hotel } from "@/types";

export default function HotelsPage() {
  const { getToken } = useAuth();
  const { authorized, loading: permLoading } = useRequirePermission("hotels");
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const debounceRef = useRef<NodeJS.Timeout>(undefined);

  const fetchHotels = useCallback(async (searchQuery?: string) => {
    try {
      const token = await getToken();
      const params = new URLSearchParams();
      if (searchQuery) params.set("search", searchQuery);
      const res = await fetch(`/api/hotels?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setHotels(await res.json());
      }
    } catch (error) {
      console.error("Failed to fetch hotels:", error);
      toast.error("Failed to load hotels");
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    fetchHotels();
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchHotels(search || undefined);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search, fetchHotels]);

  if (permLoading || !authorized) return null;

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this hotel?")) return;

    try {
      const token = await getToken();
      const res = await fetch(`/api/hotels/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setHotels((prev) => prev.filter((h) => h.id !== id));
        toast.success("Hotel deleted");
      }
    } catch {
      toast.error("Failed to delete hotel");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hotels</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage accommodation details for tour packages
          </p>
        </div>
        <Link href="/dashboard/hotels/new" className="btn-primary">
          <Plus className="mr-2 h-4 w-4" /> Add Hotel
        </Link>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search hotels..."
          className="input pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-6 w-1/3 rounded bg-gray-200" />
              <div className="mt-2 h-4 w-2/3 rounded bg-gray-200" />
            </div>
          ))}
        </div>
      ) : hotels.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-12 text-center">
          <Building2 className="mb-4 h-12 w-12 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900">No hotels found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {search ? "Try a different search term" : "Get started by adding your first hotel"}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {hotels.map((hotel) => (
            <div key={hotel.id} className="card overflow-hidden">
              {hotel.heroImage && (
                <div className="relative -mx-6 -mt-6 mb-4 h-40 overflow-hidden">
                  <img
                    src={hotel.heroImage}
                    alt={hotel.name}
                    className="h-full w-full object-cover"
                  />
                  {hotel.starRating && (
                    <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs font-medium text-white">{hotel.starRating}</span>
                    </div>
                  )}
                </div>
              )}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-gray-900">{hotel.name}</h3>
                  <div className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                    <MapPin className="h-3.5 w-3.5" />
                    {hotel.location}
                  </div>
                  {hotel.category && (
                    <span className="mt-2 inline-block rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                      {hotel.category}
                    </span>
                  )}
                  <p className="mt-2 line-clamp-2 text-xs text-gray-600">{hotel.description}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 border-t border-gray-100 pt-3">
                <Link
                  href={`/dashboard/hotels/${hotel.id}/edit`}
                  className="flex-1 rounded-lg py-1.5 text-center text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-blue-600"
                >
                  <Pencil className="mr-1 inline h-3.5 w-3.5" /> Edit
                </Link>
                <button
                  onClick={() => handleDelete(hotel.id)}
                  className="flex-1 rounded-lg py-1.5 text-center text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-red-600"
                >
                  <Trash2 className="mr-1 inline h-3.5 w-3.5" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
