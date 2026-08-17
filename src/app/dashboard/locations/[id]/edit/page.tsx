"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { useRequirePermission } from "@/lib/useRequirePermission";
import LocationForm from "../../LocationForm";
import type { Location } from "@/types";

export default function EditLocationPage() {
  const { id } = useParams();
  const { getToken } = useAuth();
  const { authorized, loading: permLoading } = useRequirePermission("locations");
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const token = await getToken();
        const res = await fetch(`/api/locations/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          setLocation(await res.json());
        }
      } catch (error) {
        console.error("Failed to fetch location:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchLocation();
  }, [id, getToken]);

  if (permLoading || !authorized || loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  if (!location) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Location not found</h2>
      </div>
    );
  }

  return <LocationForm location={location} />;
}
