"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { Plus, Pencil, Trash2, Eye, EyeOff, Search, Map as MapIcon, ChevronDown, ChevronRight, Package } from "lucide-react";
import { toast } from "sonner";
import type { Tour } from "@/types";

export default function ToursPage() {
  const { getToken } = useAuth();
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expandedParents, setExpandedParents] = useState<Set<string>>(new Set());
  const debounceRef = useRef<NodeJS.Timeout>();

  const fetchTours = useCallback(async (searchQuery?: string) => {
    try {
      const token = await getToken();
      const params = new URLSearchParams({ all: "true" });
      if (searchQuery) params.set("search", searchQuery);
      const res = await fetch(`/api/tours?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setTours(await res.json());
      }
    } catch (error) {
      console.error("Failed to fetch tours:", error);
      toast.error("Failed to load tours");
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    fetchTours();
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchTours(search || undefined);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search, fetchTours]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this tour?")) return;

    try {
      const token = await getToken();
      const res = await fetch(`/api/tours/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setTours(tours.filter((t) => t.id !== id));
        toast.success("Tour deleted successfully");
      } else {
        toast.error("Failed to delete tour");
      }
    } catch {
      toast.error("Failed to delete tour");
    }
  };

  const togglePublish = async (tour: Tour) => {
    try {
      const token = await getToken();
      const res = await fetch(`/api/tours/${tour.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ published: !tour.published }),
      });

      if (res.ok) {
        setTours(
          tours.map((t) =>
            t.id === tour.id ? { ...t, published: !t.published } : t
          )
        );
        toast.success(
          tour.published ? "Tour unpublished" : "Tour published"
        );
      }
    } catch {
      toast.error("Failed to update tour");
    }
  };

  const parentTours = tours.filter((t) => !t.parentTourName);
  const subPackageMap = new Map<string, Tour[]>();
  tours.filter((t) => t.parentTourName).forEach((t) => {
    const list = subPackageMap.get(t.parentTourName!) || [];
    list.push(t);
    subPackageMap.set(t.parentTourName!, list);
  });

  const toggleExpand = (tourName: string) => {
    setExpandedParents((prev) => {
      const next = new Set(prev);
      if (next.has(tourName)) next.delete(tourName);
      else next.add(tourName);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tour Packages</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your multi-day tour packages
          </p>
        </div>
        <Link href="/dashboard/tours/new" className="btn-primary">
          <Plus className="mr-2 h-4 w-4" />
          Add Tour
        </Link>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search tours..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input pl-10"
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
      ) : parentTours.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-12 text-center">
          <MapIcon className="mb-4 h-12 w-12 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900">No tours found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {search ? "Try a different search term" : "Get started by adding your first tour"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {parentTours.map((tour) => {
            const subs = subPackageMap.get(tour.name) || [];
            const isExpanded = expandedParents.has(tour.name);
            return (
              <div key={tour.id}>
                <div className="card">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {tour.name}
                        </h3>
                        {tour.published ? (
                          <span className="badge-success">Published</span>
                        ) : (
                          <span className="badge-neutral">Draft</span>
                        )}
                        {subs.length > 0 && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                            <Package className="h-3 w-3" />
                            {subs.length} sub-packages
                          </span>
                        )}
                      </div>
                      {subs.length === 0 && (
                        <p className="mt-1 text-sm text-gray-500">
                          {tour.duration.days} days / {tour.duration.nights} nights
                        </p>
                      )}
                      <p className="mt-2 line-clamp-2 text-sm text-gray-600">
                        {tour.summary}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {tour.tags?.map((tag) => (
                          <span key={tag} className="badge-info">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="ml-4 flex items-center gap-2">
                      {subs.length > 0 && (
                        <button
                          onClick={() => toggleExpand(tour.name)}
                          className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                          title={isExpanded ? "Hide sub-packages" : "Show sub-packages"}
                        >
                          {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </button>
                      )}
                      <button
                        onClick={() => togglePublish(tour)}
                        className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                        title={tour.published ? "Unpublish" : "Publish"}
                      >
                        {tour.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                      <Link
                        href={`/dashboard/tours/${tour.id}/edit`}
                        className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-blue-600"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(tour.id)}
                        className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-red-600"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Sub-packages */}
                {isExpanded && subs.length > 0 && (
                  <div className="ml-6 mt-2 space-y-2 border-l-2 border-blue-200 pl-4">
                    {subs.map((sub) => (
                      <div key={sub.id} className="card bg-blue-50/50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <Package className="h-4 w-4 text-blue-500" />
                              <h4 className="text-base font-semibold text-gray-900">
                                {sub.name}
                              </h4>
                              {sub.published ? (
                                <span className="badge-success">Published</span>
                              ) : (
                                <span className="badge-neutral">Draft</span>
                              )}
                            </div>
                            <p className="mt-1 text-sm text-gray-500">
                              {sub.duration.days} days / {sub.duration.nights} nights
                            </p>
                            <p className="mt-1 line-clamp-1 text-sm text-gray-600">
                              {sub.summary}
                            </p>
                          </div>
                          <div className="ml-4 flex items-center gap-2">
                            <button
                              onClick={() => togglePublish(sub)}
                              className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-white hover:text-gray-600"
                              title={sub.published ? "Unpublish" : "Publish"}
                            >
                              {sub.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                            <Link
                              href={`/dashboard/tours/${sub.id}/edit`}
                              className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-white hover:text-blue-600"
                              title="Edit"
                            >
                              <Pencil className="h-4 w-4" />
                            </Link>
                            <button
                              onClick={() => handleDelete(sub.id)}
                              className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-white hover:text-red-600"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
