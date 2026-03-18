// src/features/jadwal/pages/JadwalPage.jsx
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/shared/hooks/useAuth";
import PageHeader from "@/shared/components/ui/PageHeader";
import ClassHierarchyFilter from "@/shared/components/ui/ClassHierarchyFilter";
import EmptyState from "@/shared/components/ui/EmptyState";

// ─── Constants ──────────────────────────────────────────────────
const HARI = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

const HARI_THEME = {
  Senin: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    dot: "bg-blue-500",
    text: "text-blue-700",
    header: "bg-blue-500",
  },
  Selasa: {
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
    text: "text-emerald-700",
    header: "bg-emerald-500",
  },
  Rabu: {
    bg: "bg-violet-50",
    border: "border-violet-200",
    dot: "bg-violet-500",
    text: "text-violet-700",
    header: "bg-violet-500",
  },
  Kamis: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    dot: "bg-amber-500",
    text: "text-amber-700",
    header: "bg-amber-500",
  },
  Jumat: {
    bg: "bg-rose-50",
    border: "border-rose-200",
    dot: "bg-rose-500",
    text: "text-rose-700",
    header: "bg-rose-500",
  },
  Sabtu: {
    bg: "bg-slate-50",
    border: "border-slate-200",
    dot: "bg-slate-400",
    text: "text-slate-600",
    header: "bg-slate-400",
  },
};

// Hari ini untuk highlight
const HARI_MAP_EN = {
  Monday: "Senin",
  Tuesday: "Selasa",
  Wednesday: "Rabu",
  Thursday: "Kamis",
  Friday: "Jumat",
  Saturday: "Sabtu",
  Sunday: "Minggu",
};
const hariIni =
  HARI_MAP_EN[new Date().toLocaleDateString("en-US", { weekday: "long" })] ??
  "";

// ─── Query fn ────────────────────────────────────────────────────
const fetchJadwal = (params) =>
  api.get("/jadwal", { params }).then((r) => r.data);

// ─── JadwalCard ──────────────────────────────────────────────────
const JadwalCard = ({ jadwal, hari }) => {
  const theme = HARI_THEME[hari] ?? HARI_THEME.Senin;
  return (
    <div
      className={`group rounded-xl border ${theme.border} ${theme.bg} p-3 hover:shadow-md transition-all cursor-default`}
    >
      {/* Mapel */}
      <div className="flex items-start gap-2 mb-2">
        <div
          className={`w-2 h-2 rounded-full flex-shrink-0 mt-1 ${theme.dot}`}
        />
        <p className={`text-xs font-bold leading-tight ${theme.text}`}>
          {jadwal.mata_pelajaran?.nama_mapel ?? "—"}
        </p>
      </div>
      {/* Detail */}
      <div className="space-y-1 ml-4">
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
          <Clock className="w-3 h-3 flex-shrink-0" />
          <span className="font-medium font-mono">
            {jadwal.jam_mulai?.slice(0, 5)} – {jadwal.jam_selesai?.slice(0, 5)}
          </span>
        </div>
        {jadwal.guru?.nama && (
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <User className="w-3 h-3 flex-shrink-0" />
            <span className="truncate max-w-[110px]">{jadwal.guru.nama}</span>
          </div>
        )}
        {jadwal.ruangan && (
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span>{jadwal.ruangan}</span>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── SkeletonCard ─────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="animate-pulse rounded-xl border border-slate-100 bg-slate-50 p-3 space-y-2">
    <div className="h-3 bg-slate-200 rounded-full w-3/4" />
    <div className="h-2.5 bg-slate-100 rounded-full w-1/2" />
    <div className="h-2.5 bg-slate-100 rounded-full w-2/3" />
  </div>
);

// ─── CalendarGrid ─────────────────────────────────────────────────
const CalendarGrid = ({ jadwalByHari, loading }) => {
  const maxRows = HARI.reduce(
    (max, h) => Math.max(max, jadwalByHari[h]?.length ?? 0),
    0,
  );

  return (
    <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
      {HARI.map((hari) => {
        const theme = HARI_THEME[hari];
        const isToday = hari === hariIni;
        const items = jadwalByHari[hari] ?? [];

        return (
          <div
            key={hari}
            className={`flex flex-col rounded-xl border overflow-hidden ${isToday ? "ring-2 ring-indigo-500 ring-offset-1" : "border-slate-200"}`}
          >
            {/* Day Header */}
            <div
              className={`px-3 py-2.5 flex items-center gap-2 ${isToday ? "bg-indigo-600" : "bg-slate-50 border-b border-slate-100"}`}
            >
              <div
                className={`w-2 h-2 rounded-full ${isToday ? "bg-white" : theme.dot}`}
              />
              <span
                className={`text-xs font-bold ${isToday ? "text-white" : theme.text}`}
              >
                {hari}
              </span>
              {isToday && (
                <span className="ml-auto text-[10px] text-indigo-200 font-medium">
                  Hari ini
                </span>
              )}
              {!isToday && items.length > 0 && (
                <span
                  className={`ml-auto text-[10px] font-semibold ${theme.text} bg-white/70 px-1.5 py-0.5 rounded-full`}
                >
                  {items.length}
                </span>
              )}
            </div>

            {/* Cards */}
            <div className="flex-1 p-2 space-y-2 bg-white min-h-[120px]">
              {loading ? (
                [...Array(2)].map((_, i) => <SkeletonCard key={i} />)
              ) : items.length === 0 ? (
                <div className="h-full flex items-center justify-center py-6">
                  <p className="text-[11px] text-slate-300 italic text-center">
                    Tidak ada jadwal
                  </p>
                </div>
              ) : (
                items
                  .sort((a, b) =>
                    (a.jam_mulai ?? "").localeCompare(b.jam_mulai ?? ""),
                  )
                  .map((j) => <JadwalCard key={j.id} jadwal={j} hari={hari} />)
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────
const JadwalPage = () => {
  const { isAdmin } = useAuth();

  // Admin bisa filter per kelas; guru/siswa auto-filter di backend
  const [filter, setFilter] = useState({
    jurusan: null,
    tingkat: null,
    kelas_id: null,
  });
  const [semester, setSemester] = useState("1");
  const [tahunAjaran] = useState("2024/2025");

  const isAdmin_ = isAdmin;
  // Non-admin: fetch langsung tanpa ClassHierarchyFilter
  const isFilterReady = isAdmin_ ? !!filter.kelas_id : true;

  const queryParams = {
    per_page: 100,
    kelas_id: filter.kelas_id || undefined,
    semester,
    tahun_ajaran: tahunAjaran,
    status: "aktif",
  };

  const { data, isLoading, isError, error, isFetching, refetch } = useQuery({
    queryKey: ["jadwal", "grid", queryParams],
    queryFn: () => fetchJadwal(queryParams),
    enabled: isFilterReady,
    staleTime: 2 * 60 * 1000,
  });

  const list = data?.data ?? [];

  // Group by hari
  const jadwalByHari = HARI.reduce((acc, h) => {
    acc[h] = list.filter((j) => j.hari === h);
    return acc;
  }, {});

  const totalJadwal = list.length;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        {/* Header */}
        <PageHeader
          icon={Calendar}
          title="Jadwal Pelajaran"
          subtitle="Tampilan kalender mingguan Senin–Sabtu"
        >
          <div className="flex items-center gap-2">
            {/* Semester switch */}
            <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5">
              {["1", "2"].map((s) => (
                <button
                  key={s}
                  onClick={() => setSemester(s)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${semester === s ? "bg-indigo-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                >
                  Semester {s}
                </button>
              ))}
            </div>
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 bg-white hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`}
              />
            </button>
          </div>
        </PageHeader>

        {/* Filter (admin only) */}
        {isAdmin_ && (
          <ClassHierarchyFilter value={filter} onChange={(v) => setFilter(v)} />
        )}

        {/* Content */}
        {isAdmin_ && !filter.kelas_id ? (
          <EmptyState
            type="filter"
            title="Pilih Kelas"
            message="Pilih Jurusan, Tingkat, dan Kelas untuk melihat jadwal."
          />
        ) : isError ? (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl text-red-700 text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>
              {error?.response?.data?.message ?? "Gagal memuat jadwal."}
            </span>
          </div>
        ) : (
          <>
            {/* Summary */}
            {!isLoading && (
              <div className="flex items-center gap-4 px-1">
                <p className="text-xs text-slate-500">
                  <span className="font-semibold text-slate-700">
                    {totalJadwal}
                  </span>{" "}
                  jadwal aktif minggu ini
                </p>
                <span className="text-slate-300">•</span>
                <p className="text-xs text-slate-500">
                  Tahun Ajaran{" "}
                  <span className="font-semibold text-slate-700">
                    {tahunAjaran}
                  </span>
                </p>
              </div>
            )}

            {/* Calendar Grid */}
            <CalendarGrid jadwalByHari={jadwalByHari} loading={isLoading} />
          </>
        )}
      </div>
    </div>
  );
};

export default JadwalPage;
