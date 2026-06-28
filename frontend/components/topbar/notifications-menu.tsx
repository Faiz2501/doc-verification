"use client";

import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import api from "@/lib/api/axios";

type NotificationItem = {
  id?: string;
  title?: string;
  message?: string;
  createdAt?: string;
  type?: string;
};

type Props = {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
};

export default function NotificationsMenu({
  open,
  onOpen,
  onClose,
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    const handleOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (target && rootRef.current && !rootRef.current.contains(target)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("touchstart", handleOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("touchstart", handleOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);

        const response = await api.get("/notifications");
        const payload = response.data;

        const list = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.data)
            ? payload.data
            : [];

        if (!cancelled) {
          setItems(list);
        }
      } catch {
        if (!cancelled) {
          setItems([]);
        }
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
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        onClick={() => (open ? onClose() : onOpen())}
        className="
          rounded-xl
          border
          border-[var(--border)]
          bg-[var(--surface)]
          p-3
        "
      >
        <Bell size={18} />
      </button>

      {open && (
        <div
          className="
            absolute
            right-0
            top-14
            z-50
            w-[340px]
            overflow-hidden
            rounded-2xl
            border
            border-[var(--border)]
            bg-[var(--surface)]
            shadow-2xl
          "
        >
          <div className="border-b border-[var(--border)] p-4">
            <h3 className="font-semibold">Notifications</h3>
          </div>

          <div className="space-y-3 p-4">
            {loading ? (
              <p className="text-sm text-slate-400">Loading...</p>
            ) : items.length > 0 ? (
              items.map((item, index) => (
                <div
                  key={item.id ?? `${item.title ?? "notification"}-${index}`}
                  className="rounded-xl border border-[var(--border)] px-4 py-3"
                >
                  <p className="font-medium text-white">
                    {item.title || "Notification"}
                  </p>
                  {item.message ? (
                    <p className="mt-1 text-sm text-slate-400">{item.message}</p>
                  ) : null}
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-[var(--border)] px-4 py-6 text-sm text-slate-400">
                No notifications available
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}