"use client";

import { useEffect, useRef, useState } from "react";
import api from "@/lib/api/axios";
import { logout, getRole, type UserRole } from "@/lib/auth/auth";
import { Wallet, ChevronDown, User } from "lucide-react";
import Link from "next/link";

type Props = {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
};

function roleLabel(role: UserRole | null) {
  if (role === "admin") return "Administrator";
  if (role === "staff") return "Staff";
  return "Developer";
}

function settingsPath(role: UserRole | null) {
  if (role === "admin") return "/admin/settings";
  if (role === "staff") return "/staff/settings";
  return "/developer/settings";
}

export default function UserMenu({ open, onOpen, onClose }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [walletOpen, setWalletOpen] = useState(false);

  // 1. Fetch user role on mount
  useEffect(() => {
    setRole(getRole());
  }, []);

  // 2. Combined outside click & Escape key handlers
  useEffect(() => {
    const handleOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (target && rootRef.current && !rootRef.current.contains(target)) {
        onClose();
        setWalletOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        setWalletOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("touchstart", handleOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("touchstart", handleOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  // 3. Fetch wallet balance if user is a developer
  useEffect(() => {
    let cancelled = false;

    const loadWallet = async () => {
      if (role !== "developer") {
        setWalletBalance(null);
        return;
      }

      try {
        const meResponse = await api.get("/users/me");
        const me = meResponse.data as { id: string };

        const walletResponse = await api.get(`/wallet/${me.id}`);
        const balance = walletResponse.data?.balance ?? 0;

        if (!cancelled) {
          setWalletBalance(balance);
        }
      } catch {
        if (!cancelled) {
          setWalletBalance(null);
        }
      }
    };

    void loadWallet();

    return () => {
      cancelled = true;
    };
  }, [role]);

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  return (
    <div ref={rootRef} className="flex items-center gap-4">
      
      {/* WALLET DROPDOWN (Only for Developers) */}
      {role === "developer" && (
        <div className="relative">
          <button
            onClick={() => {
              onClose(); // Close user menu if it's open
              setWalletOpen((v) => !v);
            }}
            className="flex items-center gap-2 rounded-[6px] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 transition-all hover:bg-[var(--hover-surface)]"
          >
            <Wallet size={16} />
            <span className="text-sm font-medium">
              {walletBalance === null
                ? "Loading..."
                : `₹${new Intl.NumberFormat("en-IN").format(walletBalance)}`}
            </span>
            <ChevronDown size={14} />
          </button>

          {walletOpen && (
            <div className="absolute right-0 top-12 z-50 w-56 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-xl">
              <Link
  href="/developer/api-keys?recharge=1"
  onClick={() => {
    setWalletOpen(false);
    onClose();
  }}
  className="block w-full px-4 py-3 text-left hover:bg-[var(--hover-surface)]"
>
  Recharge Wallet
</Link>

<Link
  href="/developer/api-keys#wallet-transactions"
  onClick={() => {
    setWalletOpen(false);
    onClose();
  }}
  className="block w-full px-4 py-3 text-left hover:bg-[var(--hover-surface)]"
>
  Wallet Logs
</Link>
            </div>
          )}
        </div>
      )}

      {/* USER PROFILE MENU DROPDOWN */}
      <div className="relative">
        <button
          onClick={() => {
            setWalletOpen(false); // Close wallet menu if it's open
            if (open) onClose();
            else onOpen();
          }}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--hover-surface)] transition-all"
        >
          <User size={18} />
        </button>

        {open && (
          <div className="absolute right-0 top-12 z-50 w-[260px] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl">
            <div className="p-4">
              <p className="font-medium">{roleLabel(role)}</p>
              <p className="text-sm text-slate-400">IDProofPro Console</p>
            </div>

            <div className="border-t border-[var(--border)]">
              <Link
                href={settingsPath(role)}
                className="block w-full px-4 py-3 text-left hover:bg-[var(--hover-surface)]"
                onClick={onClose}
              >
                Profile
              </Link>

              <Link
                href={settingsPath(role)}
                className="block w-full px-4 py-3 text-left hover:bg-[var(--hover-surface)]"
                onClick={onClose}
              >
                Security
              </Link>
            </div>

            <div className="border-t border-[var(--border)]">
              <button
                onClick={handleLogout}
                className="w-full px-4 py-3 text-left text-red-400 hover:bg-red-500/10"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}