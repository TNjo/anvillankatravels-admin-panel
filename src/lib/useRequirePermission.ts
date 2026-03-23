"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { toast } from "sonner";
import type { AdminModule } from "@/types";

export function useRequirePermission(module: AdminModule) {
  const { adminRole, adminLoading } = useAuth();
  const router = useRouter();

  const hasAccess =
    adminRole?.isSuperAdmin ||
    adminRole?.permissions.includes(module) ||
    false;

  useEffect(() => {
    if (!adminLoading && adminRole && !hasAccess) {
      router.replace("/dashboard");
      toast.error("You do not have access to this module");
    }
  }, [adminRole, adminLoading, hasAccess, router]);

  return { authorized: hasAccess, loading: adminLoading };
}
