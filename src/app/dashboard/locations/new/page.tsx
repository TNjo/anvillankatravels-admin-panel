"use client";

import LocationForm from "../LocationForm";
import { useRequirePermission } from "@/lib/useRequirePermission";

export default function NewLocationPage() {
  const { authorized, loading } = useRequirePermission("locations");

  if (loading || !authorized) return null;

  return <LocationForm />;
}
