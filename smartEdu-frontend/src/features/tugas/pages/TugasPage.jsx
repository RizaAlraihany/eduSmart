import { useState, useEffect, useCallback } from "react";
import {
  ClipboardList,
  RefreshCw,
  X,
  Plus,
  CalendarDays,
  BookOpen,
  LayoutGrid,
  List,
} from "lucide-react";
import { tugasService } from "@/services/dataService";
import { useAuth } from "@/shared/hooks/useAuth";

// ── Constants ──────────────────────────────────────────────────────────────────

const STATUS_MAP = {
  "belum dikumpulkan": {
    label: "Belum Dikumpulkan",
    cls: "bg-yellow-100 text-yellow-700",
    bar: "border-yellow-500",
    bg: "bg-yellow-50",
  },
  selesai: {
    label: "Selesai",
    cls: "bg-green-100 text-green-700",
    bar: "border-green-500",
    bg: "bg-green-50",
  },
  dikumpulkan: {
    label: "Dikumpulkan",
    cls: "bg-blue-100 text-blue-700",
    bar: "border-blue-400",
    bg: "bg-blue-50",
  },
  terlambat: {
    label: "Terlambat",
    cls: "bg-red-100 text-red-700",
    bar: "border-red-500",
    bg: "bg-red-50",
  },
};

// ── Sub Components ─────────────────────────────────────────────────────────────

const StatusBadge = ({ status }) => {
  const s = STATUS_MAP[status?.toLowerCase()] ?? {
    label: status,
    cls: "bg-gray-100 text-gray-600",
  };
  return (
    <span
      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${s.cls}`}
    >
      {s.label || status || "Unknown"}
    </span>
  );
};

const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "-";

const SkeletonCard = () => (
  <div className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
    <div className="flex justify-between mb-3">
      <div className="h-4 bg-gray-200 rounded w-2/3" />
      <div className="h-4 bg-gray-200 rounded w-16" />
    </div>
    <div className="space-y-2 mb-4">
      <div className="h-3 bg-gray-200 rounded w-1/2" />
    </div>
    <div className="flex justify-between mt-4 pt-3 border-t border-gray-100">
      <div className="h-3 bg-gray-200 rounded w-1/3" />
    </div>
  </div>
);

// ── Main Component ─────────────────────────────────────────────────────────────

const TugasPage = () => {
  const { isAdmin, user } = useAuth();
  // Catatan: sesuaikan properti 'user.role' dengan implementasi useAuth Anda
  const isGuru = user?.role === "guru";

  const [list, setList] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState("card");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      // Sesuaikan metode fetching API ini, contoh memanggil getAll
      const res = await tugasService.getAll({
        per_page: 12,
        page,
        status: filterStatus || undefined,
      });
      setList(res.data ?? []);
      setMeta(res.meta ?? null);
    } catch {
      setError("Gagal memuat data tugas.");
    } finally {
      setLoading(false);
    }
  }, [page, filterStatus]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    setPage(1);
  }, [filterStatus]);

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-500 rounded-lg flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-white" />
            </div>
            Daftar Tugas
          </h1>
          <p className="text-gray-500 text-sm mt-1 ml-12">
            Manajemen dan pemantauan tugas akademik
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode("card")}
              className={`px-3 py-2 transition-colors ${viewMode === "card" ? "bg-gray-900 text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`px-3 py-2 transition-colors ${viewMode === "table" ? "bg-gray-900 text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={loadData}
            className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Admin & Guru Only: tombol buat Tugas */}
          {(isAdmin || isGuru) && (
            <button className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg text-sm font-medium hover:bg-indigo-600 transition-colors">
              <Plus className="w-4 h-4" />
              Buat Tugas
            </button>
          )}
        </div>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <X className="w-4 h-4 flex-shrink-0" />
          {error}
          <button onClick={loadData} className="ml-auto text-xs underline">
            Coba lagi
          </button>
        </div>
      )}

      {/* ── Filter Pills ── */}
      <div className="flex flex-wrap gap-2">
        {[
          { v: "", l: "Semua Status" },
          { v: "belum dikumpulkan", l: "Belum Dikumpulkan" },
          { v: "dikumpulkan", l: "Dikumpulkan" },
          { v: "selesai", l: "Selesai" },
          { v: "terlambat", l: "Terlambat" },
        ].map(({ v, l }) => (
          <button
            key={v}
            onClick={() => setFilterStatus(v)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              filterStatus === v
                ? "bg-gray-900 text-white border-gray-900"
                : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      {/* ── Content: Card View ── */}
      {viewMode === "card" && (
        <>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : list.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Tidak ada data tugas</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {list.map((t) => {
                const style = STATUS_MAP[t.status?.toLowerCase()] ?? {
                  bar: "border-gray-200",
                  bg: "bg-white",
                };
                return (
                  <div
                    key={t.id}
                    className={`bg-white rounded-xl border-l-4 border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow ${style.bar} flex flex-col h-full`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2">
                        {t.judul}
                      </h3>
                      <StatusBadge status={t.status} />
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-600 mb-4 font-medium flex-grow">
                      <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                      {t.mapel || "Umum"}
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-400 border-t border-gray-100 pt-3">
                      <div className="flex items-center gap-1">
                        <CalendarDays className="w-3.5 h-3.5" />
                        <span
                          className={
                            new Date(t.tanggal_deadline) < new Date() &&
                            t.status !== "selesai"
                              ? "text-red-500 font-semibold"
                              : ""
                          }
                        >
                          Tenggat: {fmtDate(t.tanggal_deadline)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ── Content: Table View ── */}
      {viewMode === "table" && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Judul Tugas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Mata Pelajaran
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Deadline
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {[...Array(5)].map((_, j) => (
                        <td key={j} className="px-6 py-4">
                          <div className="h-4 bg-gray-200 rounded w-3/4" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : list.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-16 text-center text-gray-400"
                    >
                      <ClipboardList className="w-10 h-10 mx-auto mb-3 opacity-30" />
                      <p className="font-medium">Tidak ada data tugas</p>
                    </td>
                  </tr>
                ) : (
                  list.map((t, i) => (
                    <tr
                      key={t.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-gray-400 text-xs">
                        {(meta?.current_page ? meta.current_page - 1 : 0) * 12 +
                          i +
                          1}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900 max-w-xs truncate">
                        {t.judul}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {t.mapel || "Umum"}
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-xs">
                        {fmtDate(t.tanggal_deadline)}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={t.status} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {meta && meta.last_page > 1 && (
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
              <p className="text-xs text-gray-400">
                Halaman {meta.current_page} dari {meta.last_page} · {meta.total}{" "}
                total
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
                >
                  ← Prev
                </button>
                <button
                  onClick={() =>
                    setPage((p) => Math.min(meta.last_page, p + 1))
                  }
                  disabled={page === meta.last_page}
                  className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TugasPage;
