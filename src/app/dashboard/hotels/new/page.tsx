"use client";

import HotelForm from "../HotelForm";
import { useRequirePermission } from "@/lib/useRequirePermission";

export default function NewHotelPage() {
  const { authorized, loading: permLoading } = useRequirePermission("hotels");

  if (permLoading || !authorized) return null;

  return <HotelForm />;
}
