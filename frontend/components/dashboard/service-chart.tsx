export default function UsageChart({
  data = [],
}: {
  data?: { label: string; count: number }[];
}) {
  const max = Math.max(1, ...data.map((d) => d.count));

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[8px] p-6 h-[420px]">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-semibold tracking-[-0.03em]">
          API Usage (Daily Volume)
        </h3>
      </div>

      <div className="h-[320px] rounded-[6px] border border-[var(--border)] bg-[var(--surface-card)] p-4">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-[var(--foreground-muted)]">
            No usage data yet
          </div>
        ) : (
          <div className="flex h-full items-end gap-3">
            {data.map((item) => (
              <div key={item.label} className="flex-1">
                <div className="mb-2 text-xs text-[var(--foreground-muted)]">
                  {item.label}
                </div>
                <div className="h-[240px] flex items-end">
                  <div
                    className="w-full rounded-t-md bg-blue-600"
                    style={{ height: `${Math.max(8, (item.count / max) * 100)}%` }}
                  />
                </div>
                <div className="mt-2 text-xs text-center text-white">{item.count}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}