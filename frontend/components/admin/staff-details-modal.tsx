"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/lib/api/axios";
import { Loader2 } from "lucide-react";

type Props = {
  open: boolean;
  userId: string | null;
  onClose: () => void;
  onSaved?: () => void;
};

type UserDetails = {
  id: string;
  name?: string | null;
  email: string;
  role: string;
  walletBalance?: number;
  wallet?: { balance?: number };
  apiKeys?: unknown[];
  verificationStats?: {
    total: number;
    success: number;
    failed: number;
  };
  permissions?: string[];
  assignedPermissions?: string[];
  staffPermissions?: string[];
};

type PermissionsResponse =
  | string[]
  | {
      availablePermissions?: string[];
      assignedPermissions?: string[];
      permissions?: string[];
      available?: string[];
      assigned?: string[];
    };

const fallbackPermissions = [
  "MANAGE_STAFF",
  "VIEW_USERS",
  "VIEW_TRANSACTIONS",
  "VIEW_VERIFICATIONS",
  "MANAGE_PRICING",
  "VIEW_SUPPORT",
];

function normalizeRole(role?: string | null) {
  const value = (role ?? "").toUpperCase();
  if (value === "STAFF") return "STAFF";
  return "DEVELOPER";
}

function prettyRole(role?: string | null) {
  return normalizeRole(role) === "STAFF" ? "Staff" : "Developer";
}

function parsePermissions(payload: PermissionsResponse) {
  if (Array.isArray(payload)) {
    return {
      available: payload,
      assigned: [] as string[],
    };
  }

  const available =
    payload.availablePermissions ??
    payload.available ??
    payload.permissions ??
    fallbackPermissions;

  const assigned =
    payload.assignedPermissions ??
    payload.assigned ??
    [];

  return {
    available: available.length ? available : fallbackPermissions,
    assigned,
  };
}

export default function StaffDetailsModal({
  open,
  userId,
  onClose,
  onSaved,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState<UserDetails | null>(null);
  const [availablePermissions, setAvailablePermissions] = useState<string[]>(
    fallbackPermissions
  );
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [role, setRole] = useState<"DEVELOPER" | "STAFF">("DEVELOPER");

  const walletBalance = useMemo(() => {
    if (!user) return 0;
    return user.walletBalance ?? user.wallet?.balance ?? 0;
  }, [user]);

  useEffect(() => {
    if (!open || !userId) return;

    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const [userRes, permissionsRes] = await Promise.all([
          api.get(`/users/${userId}`),
          api.get("/staff/permissions"),
        ]);

        const userData = userRes.data as UserDetails;
        const permissionsData = parsePermissions(permissionsRes.data as PermissionsResponse);

        const assignedFromUser =
          userData.permissions ??
          userData.assignedPermissions ??
          userData.staffPermissions ??
          permissionsData.assigned;

        setUser(userData);
        setRole(normalizeRole(userData.role));
        setAvailablePermissions(
          permissionsData.available.length ? permissionsData.available : fallbackPermissions
        );
        setSelectedPermissions(Array.from(new Set(assignedFromUser ?? [])));
      } catch (err: any) {
        console.error(err);
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load user access details."
        );
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [open, userId]);

  if (!open) return null;

  const togglePermission = (permission: string) => {
    setSelectedPermissions((current) =>
      current.includes(permission)
        ? current.filter((item) => item !== permission)
        : [...current, permission]
    );
  };

  const handleSave = async () => {
    if (!userId || !user) return;

    try {
      setSaving(true);
      setError("");

      await api.patch(`/users/${userId}`, {
        role: role === "STAFF" ? "STAFF" : "DEVELOPER",
      });

      await api.post("/staff/assign-permission", {
        userId,
        permissions: role === "STAFF" ? selectedPermissions : [],
      });

      await onSaved?.();
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to save access changes."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/50">
      <div className="absolute right-0 top-0 h-full w-[500px] border-l border-slate-800 bg-[#08172b] p-8 overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">User Access</h2>

          <button onClick={onClose} className="text-slate-400">
            Close
          </button>
        </div>

        {loading ? (
          <div className="mt-8 flex items-center gap-3 text-slate-300">
            <Loader2 className="animate-spin" size={18} />
            Loading user...
          </div>
        ) : error ? (
          <div className="mt-8 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        ) : (
          <div className="mt-8 space-y-6">
            <div>
              <p className="text-slate-500">Name</p>
              <p className="mt-1 text-lg">{user?.name || "Unnamed User"}</p>
            </div>

            <div>
              <p className="text-slate-500">Email</p>
              <p className="mt-1">{user?.email}</p>
            </div>

            <div>
              <p className="text-slate-500">Role</p>

              <div className="mt-3 flex gap-3">
                <button
                  onClick={() => setRole("DEVELOPER")}
                  className={`rounded-xl border px-4 py-3 transition-all ${
                    role === "DEVELOPER"
                      ? "border-blue-500 bg-blue-500/10 text-blue-300"
                      : "border-slate-800 text-slate-300"
                  }`}
                >
                  Developer
                </button>

                <button
                  onClick={() => setRole("STAFF")}
                  className={`rounded-xl border px-4 py-3 transition-all ${
                    role === "STAFF"
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-300"
                      : "border-slate-800 text-slate-300"
                  }`}
                >
                  Staff
                </button>
              </div>

              <p className="mt-2 text-sm text-slate-400">
                Current access: {prettyRole(role)}
              </p>
            </div>

            <div>
              <p className="text-slate-500">Wallet Balance</p>
              <p className="mt-1 text-lg">
                ₹{new Intl.NumberFormat("en-IN").format(Number(walletBalance || 0))}
              </p>
            </div>

            <div>
              <p className="mb-4 text-slate-500">Permissions</p>

              <div className="space-y-3">
                {availablePermissions.map((permission) => (
                  <label
                    key={permission}
                    className="flex items-center justify-between rounded-xl border border-slate-800 px-4 py-3"
                  >
                    <span>{permission}</span>

                    <input
                      type="checkbox"
                      checked={selectedPermissions.includes(permission)}
                      onChange={() => togglePermission(permission)}
                    />
                  </label>
                ))}
              </div>
            </div>

            <div className="pt-4 flex items-center justify-end gap-3">
              <button
                onClick={onClose}
                className="rounded-xl border border-slate-700 px-4 py-3 text-slate-300"
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                disabled={saving}
                className="rounded-xl bg-blue-600 px-5 py-3 text-white disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Access"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}