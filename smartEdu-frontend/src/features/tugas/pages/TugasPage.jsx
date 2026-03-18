// src/features/tugas/pages/TugasPage.jsx
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ClipboardList,
  Plus,
  RefreshCw,
  AlertCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  BookOpen,
  User,
  ChevronRight,
  Search,
  X,
} from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/shared/hooks/useAuth";
import PageHeader from "@/shared/components/ui/PageHeader";
import EmptyState from "@/shared/components/ui/EmptyState";
import ClassHierarchyFilter from "@/shared/components/ui/ClassHierarchyFilter";
import { CardSkeleton } from "@/shared/components/ui/SkeletonLoader";

// ─── Query fn ─────────────────────────────────────────────────────
const fetchTugas = (p) => api.get("/tugas", { params: p }).then((r) => r.data);

// ─── Date helpers ─────────────────────────────────────────────────
const today = () => new Date().toISOString().split("T")[0];
const fmtDate = (d) =>
  d
    ? new Date(d + "T00:00:00").toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

const getDaysLeft = (deadline) => {
  if (!deadline) return null;
  const diff = Math.ceil(
    (new Date(deadline + "T00:00:00") - new Date()) / (1000 * 60 * 60 * 24),
  );
  return diff;
};

// ─── Kanban Column Config ─────────────────────────────────────────
const COLUMNS = {
  overdue: {
    key: "overdue",
    label: "Overdue",
    icon: AlertTriangle,
    headerBg: "bg-red-500",
    headerText: "text-white",
    cardBorder: "border-red-100",
    cardBg: "bg-red-50/50",
    accentBar: "bg-red-400",
    countBg: "bg-red-400 text-white",
  },
  active: {
    key: "active",
    label: "Active",
    icon: Clock,
    headerBg: "bg-indigo-600",
    headerText: "text-white",
    cardBorder: "border-indigo-100",
    cardBg: "bg-indigo-50/40",
    accentBar: "bg-indigo-400",
    countBg: "bg-indigo-500 text-white",
  },
  completed: {
    key: "completed",
    label: "Completed",
    icon: CheckCircle2,
    headerBg: "bg-emerald-500",
    headerText: "text-white",
    cardBorder: "border-emerald-100",
    cardBg: "bg-emerald-50/40",
    accentBar: "bg-emerald-400",
    countBg: "bg-emerald-500 text-white",
  },
};

// ─── TugasCard ────────────────────────────────────────────────────
const TugasCard = ({ tugas, col, onDetail }) => {
  const cfg = COLUMNS[col];
  const daysLeft = getDaysLeft(tugas.tanggal_deadline);

  const urgencyLabel =
    col === "overdue"
      ? `${Math.abs(daysLeft)} hari lalu`
      : col === "active" && daysLeft === 0
        ? "Hari ini!"
        : col === "active" && daysLeft === 1
          ? "Besok"
          : col === "active"
            ? `${daysLeft} hari lagi`
            : "Selesai";

  const urgencyColor =
    col === "overdue"
      ? "text-red-600 bg-red-50"
      : col === "active" && daysLeft <= 1
        ? "text-amber-700 bg-amber-50"
        : col === "active"
          ? "text-indigo-600 bg-indigo-50"
          : "text-emerald-600 bg-emerald-50";

  return (
    <div
      className={`relative group rounded-xl border ${cfg.cardBorder} bg-white shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden`}
      onClick={() => onDetail?.(tugas)}
    >
      {/* Accent bar */}
      <div className={`absolute top-0 left-0 w-1 h-full ${cfg.accentBar}`} />

      <div className="pl-4 pr-3 py-3.5">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2.5">
          <h3 className="font-semibold text-slate-800 text-sm leading-snug line-clamp-2 flex-1">
            {tugas.judul}
          </h3>
          <span
            className={`flex-shrink-0 text-[10px] font-bold px-2 py-1 rounded-full ${urgencyColor}`}
          >
            {urgencyLabel}
          </span>
        </div>

        {/* Meta */}
        <div className="space-y-1.5">
          {tugas.mata_pelajaran?.nama_mapel && (
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <BookOpen className="w-3 h-3 flex-shrink-0 text-slate-300" />
              <span>{tugas.mata_pelajaran.nama_mapel}</span>
            </div>
          )}
          {tugas.kelas?.nama_kelas && (
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <User className="w-3 h-3 flex-shrink-0 text-slate-300" />
              <span>{tugas.kelas.nama_kelas}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Calendar className="w-3 h-3 flex-shrink-0 text-slate-300" />
            <span>
              Deadline:{" "}
              <span
                className={`font-medium ${col === "overdue" ? "text-red-600" : "text-slate-700"}`}
              >
                {fmtDate(tugas.tanggal_deadline)}
              </span>
            </span>
          </div>
        </div>

        {/* Footer */}
        {tugas.guru?.nama && (
          <div className="mt-3 pt-2.5 border-t border-slate-50 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              Oleh:{" "}
              <span className="font-medium text-slate-600">
                {tugas.guru.nama}
              </span>
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 transition-colors" />
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Kanban Column ────────────────────────────────────────────────
const KanbanColumn = ({ col, tasks, loading }) => {
  const cfg = COLUMNS[col];
  const Icon = cfg.icon;

  return (
    <div className="flex flex-col rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-white">
      {/* Column Header */}
      <div
        className={`${cfg.headerBg} ${cfg.headerText} px-4 py-3 flex items-center gap-2.5`}
      >
        <Icon className="w-4 h-4" />
        <span className="font-bold text-sm">{cfg.label}</span>
        <span
          className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full ${cfg.countBg}`}
        >
          {loading ? "…" : tasks.length}
        </span>
      </div>

      {/* Cards */}
      <div className={`flex-1 p-3 space-y-2.5 min-h-[200px] ${cfg.cardBg}`}>
        {loading ? (
          [...Array(2)].map((_, i) => <CardSkeleton key={i} className="h-28" />)
        ) : tasks.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center py-10 opacity-60">
            <Icon className="w-8 h-8 text-slate-300 mb-2" />
            <p className="text-xs text-slate-400 text-center">
              Tidak ada tugas {cfg.label.toLowerCase()}
            </p>
          </div>
        ) : (
          tasks.map((t) => <TugasCard key={t.id} tugas={t} col={col} />)
        )}
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────
const TugasPage = () => {
  const { isAdmin, isGuru } = useAuth();
  const canManage = isAdmin || isGuru;

  const [filter, setFilter] = useState({
    jurusan: null,
    tingkat: null,
    kelas_id: null,
  });
  const [semester, setSemester] = useState("1");
  const [search, setSearch] = useState("");

  const isFilterReady = canManage ? !!filter.kelas_id : true;

  const params = {
    per_page: 100,
    kelas_id: filter.kelas_id || undefined,
    semester,
    tahun_ajaran: "2024/2025",
  };

  const { data, isLoading, isError, error, isFetching, refetch } = useQuery({
    queryKey: ["tugas", "kanban", params],
    queryFn: () => fetchTugas(params),
    enabled: isFilterReady,
    staleTime: 2 * 60 * 1000,
  });

  const allTasks = data?.data ?? [];

  // Filter search client-side
  const filtered = search
    ? allTasks.filter(
        (t) =>
          t.judul?.toLowerCase().includes(search.toLowerCase()) ||
          t.mata_pelajaran?.nama_mapel
            ?.toLowerCase()
            .includes(search.toLowerCase()),
      )
    : allTasks;

  // Kategorisasi Kanban
  const todayStr = today();
  const kanban = {
    overdue: filtered.filter(
      (t) => t.tanggal_deadline < todayStr && t.status !== "selesai",
    ),
    active: filtered.filter(
      (t) => t.tanggal_deadline >= todayStr && t.status === "aktif",
    ),
    completed: filtered.filter((t) => t.status === "selesai"),
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        {/* Header */}
        <PageHeader
          icon={ClipboardList}
          title="Tugas"
          subtitle="Manajemen tugas dalam tampilan Kanban"
        >
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5">
              {["1", "2"].map((s) => (
                <button
                  key={s}
                  onClick={() => setSemester(s)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${semester === s ? "bg-indigo-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                >
                  Sem {s}
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
            {canManage && (
              <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm shadow-indigo-100">
                <Plus className="w-3.5 h-3.5" /> Buat Tugas
              </button>
            )}
          </div>
        </PageHeader>

        {/* Filter Kelas */}
        {canManage && (
          <ClassHierarchyFilter value={filter} onChange={(v) => setFilter(v)} />
        )}

        {canManage && !filter.kelas_id ? (
          <EmptyState
            type="filter"
            title="Pilih Kelas"
            message="Pilih Jurusan, Tingkat, dan Kelas untuk menampilkan tugas."
          />
        ) : isError ? (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl text-red-700 text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>
              {error?.response?.data?.message ?? "Gagal memuat tugas."}
            </span>
          </div>
        ) : (
          <>
            {/* Search bar */}
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Cari judul tugas atau mapel..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-8 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder:text-slate-400 transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Summary Pills */}
            {!isLoading && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-slate-500">
                  Total{" "}
                  <span className="font-semibold text-slate-700">
                    {filtered.length}
                  </span>{" "}
                  tugas
                </span>
                {kanban.overdue.length > 0 && (
                  <span className="text-xs font-semibold text-red-600 bg-red-50 border border-red-100 px-2.5 py-1 rounded-full">
                    ⚠ {kanban.overdue.length} overdue
                  </span>
                )}
              </div>
            )}

            {/* Kanban Board */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.keys(COLUMNS).map((col) => (
                <KanbanColumn
                  key={col}
                  col={col}
                  tasks={kanban[col]}
                  loading={isLoading}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TugasPage;
