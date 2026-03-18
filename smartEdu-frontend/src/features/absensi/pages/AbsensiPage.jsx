// src/features/absensi/pages/AbsensiPage.jsx
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ClipboardCheck,
  Search,
  Plus,
  X,
  AlertCircle,
  Calendar,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Clock,
  MinusCircle,
  Users,
} from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/shared/hooks/useAuth";
import PageHeader from "@/shared/components/ui/PageHeader";
import ActionBar from "@/shared/components/ui/ActionBar";
import EmptyState from "@/shared/components/ui/EmptyState";
import ClassHierarchyFilter from "@/shared/components/ui/ClassHierarchyFilter";
import { TableSkeletonRow } from "@/shared/components/ui/SkeletonLoader";

// ─── Query fns ──────────────────────────────────────────────────
const fetchAbsensi = (p) =>
  api.get("/absensi", { params: p }).then((r) => r.data);

// ─── Status Config ────────────────────────────────────────────────
const STATUS_CFG = {
  hadir: {
    label: "Hadir",
    icon: CheckCircle2,
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
    activeBg: "bg-emerald-600",
  },
  sakit: {
    label: "Sakit",
    icon: Clock,
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-700",
    dot: "bg-blue-500",
    activeBg: "bg-blue-600",
  },
  izin: {
    label: "Izin",
    icon: MinusCircle,
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-700",
    dot: "bg-amber-500",
    activeBg: "bg-amber-600",
  },
  alpha: {
    label: "Alpha",
    icon: XCircle,
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-700",
    dot: "bg-red-500",
    activeBg: "bg-red-600",
  },
};

// ─── Interaktif Status Badge ─────────────────────────────────────
const StatusRadio = ({ value, onChange, disabled = false }) => (
  <div className="flex gap-1.5">
    {Object.entries(STATUS_CFG).map(([key, cfg]) => {
      const Icon = cfg.icon;
      const isActive = value === key;
      return (
        <button
          key={key}
          type="button"
          disabled={disabled}
          onClick={() => onChange(key)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
            isActive
              ? `${cfg.activeBg} text-white border-transparent shadow-sm`
              : `${cfg.bg} ${cfg.text} ${cfg.border} hover:opacity-80`
          } disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          <Icon className="w-3 h-3" />
          {cfg.label}
        </button>
      );
    })}
  </div>
);

// ─── Status Badge (read-only) ────────────────────────────────────
const StatusBadge = ({ status }) => {
  const cfg = STATUS_CFG[status?.toLowerCase()] ?? STATUS_CFG.alpha;
  const Icon = cfg.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text} border ${cfg.border}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

// ─── Date Picker ─────────────────────────────────────────────────
const DateNavigation = ({ date, onChange }) => {
  const fmt = (d) =>
    d.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  const prev = () => {
    const d = new Date(date);
    d.setDate(d.getDate() - 1);
    onChange(d.toISOString().split("T")[0]);
  };
  const next = () => {
    const d = new Date(date);
    d.setDate(d.getDate() + 1);
    onChange(d.toISOString().split("T")[0]);
  };
  const today = () => onChange(new Date().toISOString().split("T")[0]);
  const isToday = date === new Date().toISOString().split("T")[0];

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={prev}
        className="w-8 h-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center transition-colors"
      >
        <ChevronLeft className="w-4 h-4 text-slate-500" />
      </button>
      <div className="relative">
        <input
          type="date"
          value={date}
          onChange={(e) => onChange(e.target.value)}
          className="pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 font-medium cursor-pointer"
        />
        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
      </div>
      <button
        onClick={next}
        className="w-8 h-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center transition-colors"
      >
        <ChevronRight className="w-4 h-4 text-slate-500" />
      </button>
      {!isToday && (
        <button
          onClick={today}
          className="px-3 py-2 text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-lg hover:bg-indigo-100 transition-colors"
        >
          Hari ini
        </button>
      )}
      <span className="hidden sm:block text-xs text-slate-400 ml-1">
        {fmt(new Date(date + "T00:00:00"))}
      </span>
    </div>
  );
};

// ─── Summary Cards ────────────────────────────────────────────────
const SummaryCard = ({ label, value, color, icon: Icon }) => (
  <div
    className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${color.bg} ${color.border}`}
  >
    <div
      className={`w-8 h-8 rounded-lg ${color.iconBg} flex items-center justify-center flex-shrink-0`}
    >
      <Icon className={`w-4 h-4 ${color.iconText}`} />
    </div>
    <div>
      <p className={`text-xl font-bold ${color.text}`}>{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  </div>
);

// ─── Main Component ──────────────────────────────────────────────
const AbsensiPage = () => {
  const { isAdmin } = useAuth();
  const qc = useQueryClient();

  const [filter, setFilter] = useState({
    jurusan: null,
    tingkat: null,
    kelas_id: null,
  });
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [page, setPage] = useState(1);

  const handleSearch = (e) => {
    const v = e.target.value;
    setSearch(v);
    setPage(1);
    clearTimeout(window._absensiST);
    window._absensiST = setTimeout(() => setDebounced(v), 400);
  };

  const isFilterReady = isAdmin ? !!filter.kelas_id : true;

  const params = {
    per_page: 30,
    page,
    tanggal: selectedDate,
    kelas_id: filter.kelas_id || undefined,
    search: debounced || undefined,
  };

  const { data, isLoading, isError, error, isFetching, refetch } = useQuery({
    queryKey: ["absensi", "list", params],
    queryFn: () => fetchAbsensi(params),
    enabled: isFilterReady,
    placeholderData: (p) => p,
  });

  const list = data?.data ?? [];
  const meta = data?.meta ?? null;

  // Summary hitung dari list
  const summary = list.reduce((acc, a) => {
    acc[a.status_kehadiran] = (acc[a.status_kehadiran] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        <PageHeader
          icon={ClipboardCheck}
          title="Absensi"
          subtitle="Rekap kehadiran siswa harian"
        >
          {!isLoading && list.length > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200">
              <Users className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-xs font-semibold text-slate-600">
                {list.length} siswa
              </span>
            </div>
          )}
        </PageHeader>

        {/* Filter Kelas (admin only) */}
        {isAdmin && (
          <ClassHierarchyFilter
            value={filter}
            onChange={(v) => {
              setFilter(v);
              setPage(1);
            }}
          />
        )}

        {/* Date Navigation */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-5 py-4">
          <DateNavigation
            date={selectedDate}
            onChange={(d) => {
              setSelectedDate(d);
              setPage(1);
            }}
          />
        </div>

        {/* Summary Cards */}
        {!isLoading && list.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <SummaryCard
              label="Hadir"
              value={summary.hadir ?? 0}
              icon={CheckCircle2}
              color={{
                bg: "bg-emerald-50",
                border: "border-emerald-100",
                iconBg: "bg-emerald-100",
                iconText: "text-emerald-600",
                text: "text-emerald-700",
              }}
            />
            <SummaryCard
              label="Sakit"
              value={summary.sakit ?? 0}
              icon={Clock}
              color={{
                bg: "bg-blue-50",
                border: "border-blue-100",
                iconBg: "bg-blue-100",
                iconText: "text-blue-600",
                text: "text-blue-700",
              }}
            />
            <SummaryCard
              label="Izin"
              value={summary.izin ?? 0}
              icon={MinusCircle}
              color={{
                bg: "bg-amber-50",
                border: "border-amber-100",
                iconBg: "bg-amber-100",
                iconText: "text-amber-600",
                text: "text-amber-700",
              }}
            />
            <SummaryCard
              label="Alpha"
              value={summary.alpha ?? 0}
              icon={XCircle}
              color={{
                bg: "bg-red-50",
                border: "border-red-100",
                iconBg: "bg-red-100",
                iconText: "text-red-600",
                text: "text-red-700",
              }}
            />
          </div>
        )}

        {/* Main Table */}
        {isAdmin && !filter.kelas_id ? (
          <EmptyState
            type="filter"
            title="Pilih Kelas"
            message="Pilih Jurusan, Tingkat, dan Kelas untuk menampilkan absensi."
          />
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <ActionBar
                onRefresh={refetch}
                loading={isFetching}
                left={
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Cari nama siswa..."
                      value={search}
                      onChange={handleSearch}
                      className="w-60 pl-9 pr-8 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder:text-slate-400 transition-all"
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
                }
                right={
                  <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm shadow-indigo-100">
                    <Plus className="w-3.5 h-3.5" /> Input Absensi
                  </button>
                }
              />
            </div>

            {isFetching && !isLoading && (
              <div className="h-0.5 bg-indigo-500 animate-pulse" />
            )}
            {isError && (
              <div className="mx-5 my-4 flex items-center gap-3 p-3.5 bg-red-50 border border-red-100 rounded-lg text-red-700 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>
                  {error?.response?.data?.message ?? "Gagal memuat absensi."}
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
                      "KELAS",
                      "JADWAL",
                      "STATUS",
                      "KETERANGAN",
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
                    [...Array(6)].map((_, i) => (
                      <TableSkeletonRow key={i} cols={6} />
                    ))}

                  {!isLoading &&
                    !isError &&
                    list.map((item, idx) => (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-50/80 transition-colors"
                      >
                        <td className="px-5 py-4 text-xs text-slate-400">
                          {(page - 1) * 30 + idx + 1}
                        </td>
                        <td className="px-5 py-4">
                          <div>
                            <p className="font-semibold text-slate-800">
                              {item.siswa?.nama ?? `Siswa ${item.siswa_id}`}
                            </p>
                            <p className="text-xs text-slate-400">
                              {item.siswa?.nisn ?? ""}
                            </p>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-xs font-medium text-slate-600 bg-indigo-50 border border-indigo-100 px-2 py-1 rounded-md">
                            {item.kelas?.nama_kelas ?? "—"}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          {item.jadwal ? (
                            <div className="text-xs text-slate-500">
                              <p className="font-medium text-slate-700">
                                {item.jadwal.mata_pelajaran?.nama_mapel ?? "—"}
                              </p>
                              <p className="font-mono">
                                {item.jadwal.jam_mulai?.slice(0, 5)} –{" "}
                                {item.jadwal.jam_selesai?.slice(0, 5)}
                              </p>
                            </div>
                          ) : (
                            <span className="text-slate-300 text-xs italic">
                              —
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <StatusBadge status={item.status_kehadiran} />
                        </td>
                        <td className="px-5 py-4 text-xs text-slate-500">
                          {item.keterangan ?? (
                            <span className="italic text-slate-300">—</span>
                          )}
                        </td>
                      </tr>
                    ))}

                  {!isLoading && !isError && list.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-0">
                        <EmptyState
                          type="empty"
                          title="Tidak Ada Data Absensi"
                          message={`Belum ada rekap absensi untuk tanggal ${new Date(selectedDate + "T00:00:00").toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`}
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
                  Total{" "}
                  <span className="font-semibold text-slate-700">
                    {meta.total}
                  </span>{" "}
                  data
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
        )}
      </div>
    </div>
  );
};

export default AbsensiPage;
