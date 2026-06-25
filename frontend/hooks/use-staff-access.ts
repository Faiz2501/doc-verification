"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/lib/api/axios";
import { getStoredUser, type AuthUser } from "@/lib/auth/auth";
import type { StaffPermission } from "@/config/staff-permissions";

type PermissionAssignment = {
  user: {
    id: string;
  };
  permission: {
    id: string;
    name: string;
  };
};

type StaffAccess = {
  loading: boolean;
  error: string;
  user: AuthUser | null;
  permissions: string[];
  hasPermission: (permission: StaffPermission | string) => boolean;
};

export function useStaffAccess(enabled = true): StaffAccess {
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState("");
  const [user, setUser] = useState<AuthUser | null>(() => getStoredUser());
  const [permissions, setPermissions] = useState<string[]>([]);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const meResponse = await api.get("/users/me");
        const me = meResponse.data as AuthUser;

        if (cancelled) return;

        setUser(me);

        if (me.role !== "staff") {
          setPermissions([]);
          return;
        }

        const assignmentsResponse = await api.get("/permissions/assignments");
        const assignments = Array.isArray(assignmentsResponse.data)
          ? (assignmentsResponse.data as PermissionAssignment[])
          : [];

        const currentPermissions = assignments
          .filter((item) => item?.user?.id === me.id)
          .map((item) => item?.permission?.name)
          .filter(Boolean) as string[];

        setPermissions(Array.from(new Set(currentPermissions)));
      } catch (err: any) {
        console.error(err);
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load access information.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  const permissionSet = useMemo(
    () => new Set(permissions),
    [permissions],
  );

  const hasPermission = (permission: StaffPermission | string) =>
    permissionSet.has(permission);

  return {
    loading,
    error,
    user,
    permissions,
    hasPermission,
  };
}