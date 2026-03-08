"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import HotelForm from "../../HotelForm";
import type { Hotel } from "@/types";

export default function EditHotelPage() {
  const { id } = useParams<{ id: string }>();
  const { getToken } = useAuth();
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const token = await getToken();
        const res = await fetch(`/api/hotels/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          setHotel(await res.json());
        }
      } catch (error) {
        console.error("Failed to load hotel:", error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, getToken]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-xl font-semibold text-gray-900">Hotel not found</h2>
      </div>
    );
  }

  return <HotelForm hotel={hotel} />;
}
