"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { X, CheckCircle2 } from "lucide-react";
import api from "@/lib/api/axios";

type Props = {
  open: boolean;
  onClose: () => void;
  serviceName: string;
  mode: "single" | "driving-license" | "bank" | "pan-udyam" | "coming-soon";
  endpoint?: string;
  requestKey?: string;
  inputLabel?: string;
  placeholder?: string;
  defaultApiKey?: string;
};

export default function VerifyModal({
  open,
  onClose,
  serviceName,
  mode,
  endpoint,
  requestKey,
  inputLabel,
  placeholder,
  defaultApiKey = "",
}: Props) {
  const [singleValue, setSingleValue] = useState("");

  const [dlNumber, setDlNumber] = useState("");
  const [dobDay, setDobDay] = useState("");
  const [dobMonth, setDobMonth] = useState("");
  const [dobYear, setDobYear] = useState("");

  const [bankAccount, setBankAccount] = useState("");
  const [ifscCode, setIfscCode] = useState("");

  const [panValue, setPanValue] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    if (open) {
      setSingleValue("");
      setDlNumber("");
      setDobDay("");
      setDobMonth("");
      setDobYear("");
      setBankAccount("");
      setIfscCode("");
      setPanValue("");
      setError("");
      setResult(null);
    }
  }, [open, defaultApiKey]);

  if (!open) return null;

  const buildPayload = () => {
    if (mode === "single") {
      return { [requestKey || "value"]: singleValue.trim() };
    }

    if (mode === "driving-license") {
      return {
        drivingLicenseNumber: dlNumber.trim(),
        dateOfBirth: `${dobYear}-${dobMonth.padStart(2, "0")}-${dobDay.padStart(2, "0")}`,
      };
    }

    if (mode === "bank") {
      return {
        accountNumber: bankAccount.trim(),
        ifscCode: ifscCode.trim(),
      };
    }

    if (mode === "pan-udyam") {
      return { panNumber: panValue.trim() };
    }

    return {};
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError("");
      setResult(null);

      if (!endpoint) {
        setError("This service is not wired to a backend endpoint yet.");
        return;
      }

      const apiKey = defaultApiKey.trim();

      if (!apiKey) {
        setError("No active API key found. Please generate or activate one from your API keys page.");
        return;
      }

      const payload = buildPayload();

      const response = await api.request({
        method: "post",
        url: endpoint,
        data: payload,
        headers: {
          "x-api-key": apiKey,
        },
      });

      setResult(response.data);
    } catch (err: any) {
      console.error(err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Verification failed."
      );
    } finally {
      setLoading(false);
    }
  };

  const renderBody = () => {
    if (mode === "single") {
      return (
        <div className="space-y-5">
          <div>
            <label className="mb-2 block text-sm text-slate-300">
              {inputLabel || "Input"}
            </label>
            <input
              value={singleValue}
              onChange={(e) => setSingleValue(e.target.value)}
              placeholder={placeholder || "Enter value"}
              className="w-full rounded-xl border border-[#273647] bg-[#122131] px-4 py-3 text-white outline-none"
            />
          </div>
        </div>
      );
    }

    if (mode === "driving-license") {
      return (
        <div className="space-y-5">
          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Driving License Number
            </label>
            <input
              value={dlNumber}
              onChange={(e) => setDlNumber(e.target.value)}
              placeholder="MP982022000098"
              className="w-full rounded-xl border border-[#273647] bg-[#122131] px-4 py-3 text-white outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Date of Birth
            </label>
            <div className="grid grid-cols-3 gap-3">
              <input
                value={dobDay}
                onChange={(e) => setDobDay(e.target.value)}
                placeholder="DD"
                maxLength={2}
                className="rounded-xl border border-[#273647] bg-[#122131] px-4 py-3 text-white outline-none"
              />
              <input
                value={dobMonth}
                onChange={(e) => setDobMonth(e.target.value)}
                placeholder="MM"
                maxLength={2}
                className="rounded-xl border border-[#273647] bg-[#122131] px-4 py-3 text-white outline-none"
              />
              <input
                value={dobYear}
                onChange={(e) => setDobYear(e.target.value)}
                placeholder="YYYY"
                maxLength={4}
                className="rounded-xl border border-[#273647] bg-[#122131] px-4 py-3 text-white outline-none"
              />
            </div>
          </div>
        </div>
      );
    }

    if (mode === "bank") {
      return (
        <div className="space-y-5">
          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Bank Account Number
            </label>
            <input
              value={bankAccount}
              onChange={(e) => setBankAccount(e.target.value)}
              placeholder="Enter Bank Account Number"
              className="w-full rounded-xl border border-[#273647] bg-[#122131] px-4 py-3 text-white outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">
              IFSC Code
            </label>
            <input
              value={ifscCode}
              onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
              placeholder="XXX0XXXXXX"
              className="w-full rounded-xl border border-[#273647] bg-[#122131] px-4 py-3 text-white outline-none"
            />
          </div>
        </div>
      );
    }

    if (mode === "pan-udyam") {
      return (
        <div className="space-y-5">
          <div>
            <label className="mb-2 block text-sm text-slate-300">
              PAN Number (For UDYAM Lookup)
            </label>
            <input
              value={panValue}
              onChange={(e) => setPanValue(e.target.value.toUpperCase())}
              placeholder="ABCDE1234F"
              className="w-full rounded-xl border border-[#273647] bg-[#122131] px-4 py-3 text-white outline-none"
            />
          </div>
        </div>
      );
    }

    return null;
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-md">
      <div className="w-[880px] rounded-xl border border-[#273647] bg-[#0D1C2D] p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-white">
              {serviceName}
            </h2>
            <p className="mt-1 text-slate-400">
              {endpoint || "Fill the form below and send it to the backend."}
            </p>
          </div>

          <button onClick={onClose}>
            <X />
          </button>
        </div>

        <div className="mt-6">{renderBody()}</div>

        {error && (
          <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {result && (
          <div className="mt-5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle2 size={18} />
              <span>Verification Successful</span>
            </div>
            <pre className="mt-4 overflow-auto rounded-xl bg-black/30 p-4 text-xs text-white">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-xl border border-[#273647] px-5 py-3 text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="rounded-xl bg-blue-600 px-5 py-3 text-white disabled:opacity-60"
          >
            {loading ? "Verifying..." : "Verify"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}