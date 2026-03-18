// src/features/pembayaran/pages/PembayaranPage.jsx
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  DollarSign,
  Search,
  X,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  Plus,
  Download,
} from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/shared/hooks/useAuth";
import PageHeader from "@/shared/components/ui/PageHeader";
import ActionBar from "@/shared/components/ui/ActionBar";
import EmptyState from "@/shared/components/ui/EmptyState";
import { TableSkeletonRow } from "@/shared/components/ui/SkeletonLoader";

// ─── Query fn ─────────────────────────────────────────────────────
const fetchPembayaran = (p) =>
  api.get("/pembayaran", { params: p }).then((r) => r.data);

// ─── Formatters ──────────────────────────────────────────────────
const fmtRupiah = (n) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n ?? 0);

const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

// ─── Summary Card (Stripe-style) ─────────────────────────────────
const MetricCard = ({ label, value, sub, icon: Icon, trend, color }) => {
  const themes = {
    emerald: {
      bg: "bg-white",
      border: "border-emerald-200",
      iconBg: "bg-emerald-100",
      iconText: "text-emerald-600",
      valueText: "text-slate-900",
      labelText: "text-emerald-700",
      trendText: "text-emerald-600",
    },
    red: {
      bg: "bg-white",
      border: "border-red-200",
      iconBg: "bg-red-100",
      iconText: "text-red-600",
      valueText: "text-slate-900",
      labelText: "text-red-700",
      trendText: "text-red-600",
    },
    amber: {
      bg: "bg-white",
      border: "border-amber-200",
      iconBg: "bg-amber-100",
      iconText: "text-amber-600",
      valueText: "text-slate-900",
      labelText: "text-amber-700",
      trendText: "text-amber-600",
    },
    slate: {
      bg: "bg-white",
      border: "border-slate-200",
      iconBg: "bg-slate-100",
      iconText: "text-slate-600",
      valueText: "text-slate-900",
      labelText: "text-slate-600",
      trendText: "text-slate-500",
    },
  };
  const t = themes[color] ?? themes.slate;

  return (
    <div className={`${t.bg} rounded-xl border ${t.border} shadow-sm p-5`}>
      <div className="flex items-start justify-between mb-3">
        <div
          className={`w-10 h-10 ${t.iconBg} rounded-xl flex items-center justify-center`}
        >
          <Icon className={`w-5 h-5 ${t.iconText}`} />
        </div>
        {trend !== undefined && (
          <span
            className={`flex items-center gap-1 text-xs font-semibold ${trend >= 0 ? "text-emerald-600" : "text-red-600"}`}
          >
            {trend >= 0 ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5" />
            )}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className={`text-2xl font-bold ${t.valueText} leading-none mb-1`}>
        {value}
      </p>
      <p className={`text-xs font-semibold ${t.labelText} mb-0.5`}>{label}</p>
      {sub && <p className="text-[11px] text-slate-400">{sub}</p>}
    </div>
  );
};

// ─── Payment Status Badge ─────────────────────────────────────────
const PaymentBadge = ({ status }) => {
  const map = {
    sudah_bayar: {
      label: "Lunas",
      bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
      dot: "bg-emerald-500",
    },
    belum_bayar: {
      label: "Belum Bayar",
      bg: "bg-red-50 text-red-700 border-red-200",
      dot: "bg-red-500",
    },
    terlambat: {
      label: "Terlambat",
      bg: "bg-amber-50 text-amber-700 border-amber-200",
      dot: "bg-amber-500",
    },
  };
  const cfg = map[status] ?? {
    label: status,
    bg: "bg-slate-50 text-slate-600 border-slate-200",
    dot: "bg-slate-400",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.bg}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

// ─── Main Component ───────────────────────────────────────────────
const PembayaranPage = () => {
  const { isAdmin } = useAuth();

  const [filterStatus, setFilterStatus] = useState("");
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [page, setPage] = useState(1);

  const handleSearch = (e) => {
    const v = e.target.value;
    setSearch(v);
    setPage(1);
    clearTimeout(window._bayarST);
    window._bayarST = setTimeout(() => setDebounced(v), 400);
  };

  const params = {
    per_page: 15,
    page,
    status_pembayaran: filterStatus || undefined,
    search: debounced || undefined,
  };

  const { data, isLoading, isError, error, isFetching, refetch } = useQuery({
    queryKey: ["pembayaran", "list", params],
    queryFn: () => fetchPembayaran(params),
    placeholderData: (p) => p,
  });

  // Summary — fetch all status untuk metrics (tanpa pagination filter)
  const { data: summaryData } = useQuery({
    queryKey: ["pembayaran", "summary"],
    queryFn: () => fetchPembayaran({ per_page: 500 }),
    staleTime: 5 * 60 * 1000,
  });

  const list = data?.data ?? [];
  const meta = data?.meta ?? null;
  const allList = summaryData?.data ?? [];

  // Kalkulasi metrics
  const metrics = allList.reduce((acc, p) => {
    const jml = parseFloat(p.jumlah ?? 0);
    acc[p.status_pembayaran] = acc[p.status_pembayaran] ?? {
      count: 0,
      total: 0,
    };
    acc[p.status_pembayaran].count++;
    acc[p.status_pembayaran].total += jml;
    acc.all = (acc.all ?? 0) + jml;
    return acc;
  }, {});

  const STATUS_FILTERS = [
    { value: "", label: "Semua" },
    { value: "sudah_bayar", label: "Lunas" },
    { value: "belum_bayar", label: "Belum Bayar" },
    { value: "terlambat", label: "Terlambat" },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        <PageHeader
          icon={DollarSign}
          title="Pembayaran"
          subtitle="Monitoring SPP dan tagihan siswa"
        >
          {isAdmin && (
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 bg-white hover:bg-slate-50 transition-colors">
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Export</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm shadow-indigo-100">
                <Plus className="w-3.5 h-3.5" /> Catat Bayar
              </button>
            </div>
          )}
        </PageHeader>

        {/* ── Stripe-style Metrics ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Total Terkumpul"
            value={fmtRupiah(metrics.sudah_bayar?.total)}
            sub={`${metrics.sudah_bayar?.count ?? 0} transaksi lunas`}
            icon={CheckCircle2}
            color="emerald"
          />
          <MetricCard
            label="Belum Dibayar"
            value={fmtRupiah(metrics.belum_bayar?.total)}
            sub={`${metrics.belum_bayar?.count ?? 0} tagihan pending`}
            icon={Clock}
            color="red"
          />
          <MetricCard
            label="Terlambat"
            value={fmtRupiah(metrics.terlambat?.total)}
            sub={`${metrics.terlambat?.count ?? 0} tagihan jatuh tempo`}
            icon={AlertCircle}
            color="amber"
          />
          <MetricCard
            label="Total Keseluruhan"
            value={fmtRupiah(metrics.all)}
            sub={`${allList.length} total transaksi`}
            icon={DollarSign}
            color="slate"
          />
        </div>

        {/* ── Table ── */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <ActionBar
              onRefresh={refetch}
              loading={isFetching}
              left={
                <>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Cari nama siswa..."
                      value={search}
                      onChange={handleSearch}
                      className="w-56 pl-9 pr-8 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder:text-slate-400 transition-all"
                    />
                    {search && (
                      <button
                        onClick={() => {
                          setSearch("");
                          setDebounced("");
                        }}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="flex gap-1.5">
                    {STATUS_FILTERS.map((s) => (
                      <button
                        key={s.value}
                        onClick={() => {
                          setFilterStatus(s.value);
                          setPage(1);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${filterStatus === s.value ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-500 border-slate-200 hover:border-indigo-300"}`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </>
              }
            />
          </div>

          {isFetching && !isLoading && (
            <div className="h-0.5 bg-indigo-500 animate-pulse" />
          )}
          {isError && (
            <div className="mx-5 my-4 flex items-center gap-3 p-3.5 bg-red-50 border border-red-100 rounded-lg text-red-700 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>
                {error?.response?.data?.message ?? "Gagal memuat data."}
              </span>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  {[
                    "#",
                    "SISWA",
                    "JENIS PEMBAYARAN",
                    "JUMLAH",
                    "JATUH TEMPO",
                    "TGL BAYAR",
                    "STATUS",
                  ].map((h, i) => (
                    <th
                      key={i}
                      className="px-5 py-3 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {isLoading &&
                  [...Array(5)].map((_, i) => (
                    <TableSkeletonRow key={i} cols={7} />
                  ))}

                {!isLoading &&
                  !isError &&
                  list.map((p, idx) => {
                    const isOverdue =
                      p.status_pembayaran === "belum_bayar" &&
                      p.tanggal_jatuh_tempo &&
                      p.tanggal_jatuh_tempo <
                        new Date().toISOString().split("T")[0];

                    return (
                      <tr
                        key={p.id}
                        className="hover:bg-slate-50/80 transition-colors"
                      >
                        <td className="px-5 py-4 text-xs text-slate-400">
                          {(page - 1) * 15 + idx + 1}
                        </td>
                        <td className="px-5 py-4">
                          <div>
                            <p className="font-semibold text-slate-800">
                              {p.siswa?.nama ?? "—"}
                            </p>
                            <p className="text-xs text-slate-400">
                              {p.siswa?.kelas?.nama_kelas ?? ""}
                            </p>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-xs font-medium text-slate-700 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-md capitalize">
                            {p.jenis_pembayaran?.replace(/_/g, " ") ?? "—"}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="font-bold text-slate-800 text-sm">
                            {fmtRupiah(p.jumlah)}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`text-xs font-medium ${isOverdue ? "text-red-600 font-semibold" : "text-slate-500"}`}
                          >
                            {fmtDate(p.tanggal_jatuh_tempo)}
                            {isOverdue && (
                              <span className="ml-1.5 text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-semibold">
                                Lewat
                              </span>
                            )}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-xs text-slate-500">
                          {fmtDate(p.tanggal_pembayaran)}
                        </td>
                        <td className="px-5 py-4">
                          <PaymentBadge status={p.status_pembayaran} />
                        </td>
                      </tr>
                    );
                  })}

                {!isLoading && !isError && list.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-0">
                      <EmptyState
                        type="empty"
                        title="Tidak Ada Data Pembayaran"
                        message={
                          filterStatus
                            ? `Tidak ada pembayaran dengan status "${filterStatus}".`
                            : "Belum ada data pembayaran."
                        }
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {meta && meta.last_page > 1 && (
            <div className="px-5 py-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>
                Menampilkan{" "}
                <span className="font-semibold text-slate-700">
                  {list.length}
                </span>{" "}
                dari{" "}
                <span className="font-semibold text-slate-700">
                  {meta.total}
                </span>{" "}
                transaksi
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1 || isFetching}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 font-medium"
                >
                  ← Prev
                </button>
                <span className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg font-semibold">
                  {page}/{meta.last_page}
                </span>
                <button
                  onClick={() =>
                    setPage((p) => Math.min(meta.last_page, p + 1))
                  }
                  disabled={page === meta.last_page || isFetching}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 font-medium"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PembayaranPage;
