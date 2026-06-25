"use client";

import { useEffect, useState } from "react";
import { ChevronDown, Loader2 } from "lucide-react";
import api from "@/lib/api/axios";
import { useStaffAccess } from "@/hooks/use-staff-access";
import { displayName, roleLabel } from "@/lib/staff/utils";

export default function StaffSettingsPanel() {
  const access = useStaffAccess(true);

  const [profileOpen, setProfileOpen] = useState(true);
  const [securityOpen, setSecurityOpen] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");

  useEffect(() => {
    if (!access.user) return;

    setFirstName(access.user.firstName ?? "");
    setLastName(access.user.lastName ?? "");
    setEmail(access.user.email ?? "");
  }, [access.user]);

  const handleProfileSave = async () => {
    try {
      setSavingProfile(true);
      setProfileError("");
      setProfileMessage("");

      await api.patch("/users/me", {
        firstName,
        lastName,
        email,
      });

      setProfileMessage("Profile updated successfully.");
    } catch (err: any) {
      console.error(err);
      setProfileError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to update profile.",
      );
    } finally {
      setSavingProfile(false);
    }
  };

  if (access.loading) {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 text-[var(--foreground-muted)]">
        Loading settings...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 py-4">
      <div>
        <h1 className="text-4xl font-bold">Settings</h1>
        <p className="mt-2 text-slate-400">
          Manage the current account profile and security preferences.
        </p>
      </div>

      <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
        <button
          onClick={() => setProfileOpen(!profileOpen)}
          className="flex w-full items-center justify-between px-8 py-6 text-left"
        >
          <div>
            <h2 className="text-xl font-semibold text-white">Profile</h2>
            <p className="mt-1 text-sm text-slate-400">
              Personal information and account identity.
            </p>
          </div>

          <ChevronDown className={`transition-transform ${profileOpen ? "rotate-180" : ""}`} />
        </button>

        {profileOpen ? (
          <div className="px-8 pb-8">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-slate-500">
                  First Name
                </label>
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full rounded-2xl border border-slate-800 bg-[#020d1b] p-4 outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-slate-500">
                  Last Name
                </label>
                <input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full rounded-2xl border border-slate-800 bg-[#020d1b] p-4 outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-slate-500">
                  Email
                </label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-2xl border border-slate-800 bg-[#020d1b] p-4 outline-none"
                />
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-slate-800 bg-[#020d1b] p-4">
              <p className="text-sm text-slate-400">Current Role</p>
              <p className="mt-1 text-lg text-white">
                {roleLabel(access.user?.role)}
              </p>

              {access.user && (
  <p className="mt-2 text-sm text-slate-500">
    {displayName(access.user)}
  </p>
)}
            </div>

            {profileMessage ? (
              <div className="mt-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
                {profileMessage}
              </div>
            ) : null}

            {profileError ? (
              <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {profileError}
              </div>
            ) : null}

            <div className="mt-6 flex justify-end">
              <button
                onClick={handleProfileSave}
                disabled={savingProfile}
                className="rounded-xl bg-blue-600 px-5 py-3 font-medium text-white transition-all hover:bg-blue-500 disabled:opacity-60"
              >
                {savingProfile ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin" />
                    Saving...
                  </span>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
        <button
          onClick={() => setSecurityOpen(!securityOpen)}
          className="flex w-full items-center justify-between px-8 py-6 text-left"
        >
          <div>
            <h2 className="text-xl font-semibold text-white">Security</h2>
            <p className="mt-1 text-sm text-slate-400">
              Password management will stay ready for backend wiring.
            </p>
          </div>

          <ChevronDown className={`transition-transform ${securityOpen ? "rotate-180" : ""}`} />
        </button>

        {securityOpen ? (
          <div className="px-8 pb-8">
            <div className="rounded-2xl border border-dashed border-slate-700 bg-[#020d1b] p-4 text-sm text-slate-400">
              // Backend task pending:
              <span className="ml-1 text-white">/auth/change-password</span> is not verified yet.
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
              <input
                type="password"
                placeholder="Current Password"
                className="rounded-2xl border border-slate-800 bg-[#020d1b] p-4 outline-none"
              />
              <input
                type="password"
                placeholder="New Password"
                className="rounded-2xl border border-slate-800 bg-[#020d1b] p-4 outline-none"
              />
              <input
                type="password"
                placeholder="Confirm Password"
                className="rounded-2xl border border-slate-800 bg-[#020d1b] p-4 outline-none"
              />
            </div>

            <div className="mt-6 flex justify-end">
              <button
                disabled
                className="rounded-xl border border-slate-700 px-5 py-3 text-slate-500"
              >
                Update Password
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}