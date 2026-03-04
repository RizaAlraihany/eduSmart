import { useState, useEffect, useCallback } from "react";
import {
  Megaphone,
  RefreshCw,
  X,
  Plus,
  CalendarDays,
  Users,
} from "lucide-react";
import { pengumumanService } from "@/services/dataService";

const TIPE_MAP = {
  urgent: {
    label: "Urgent",
    cls: "bg-red-100 text-red-700",
    bar: "border-red-500 bg-red-50",
  },
  penting: {
    label: "Penting",
    cls: "bg-yellow-100 text-yellow-700",
    bar: "border-yellow-500 bg-yellow-50",
  },
  biasa: {
    label: "Biasa",
    cls: "bg-blue-100 text-blue-700",
    bar: "border-blue-400 bg-blue-50",
  },
};

const STATUS_MAP = {
  aktif: "bg-green-100 text-green-700",
  draft: "bg-gray-100 text-gray-600",
  nonaktif: "bg-red-100 text-red-700",
};

const TipeBadge = ({ tipe }) => {
  const t = TIPE_MAP[tipe] ?? { label: tipe, cls: "bg-gray-100 text-gray-600" };
  return (
    <span
      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${t.cls}`}
    >
      {t.label}
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

const Pengumuman = () => {
  const [list, setList] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterTipe, setFilterTipe] = useState("");
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState("card"); // "card" | "table"

  const fetch = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await pengumumanService.getAll({
        per_page: 12,
        page,
        status: filterStatus || undefined,
        tipe: filterTipe || undefined,
      });
      setList(res.data ?? []);
      setMeta(res.meta ?? null);
    } catch {
      setError("Gagal memuat data pengumuman.");
    } finally {
      setLoading(false);
    }
  }, [page, filterStatus, filterTipe]);

  useEffect(() => {
    fetch();
  }, [fetch]);
  useEffect(() => {
    setPage(1);
  }, [filterStatus, filterTipe]);

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-9 h-9 bg-amber-500 rounded-lg flex items-center justify-center">
              <Megaphone className="w-5 h-5 text-white" />
            </div>
            Pengumuman
          </h1>
          <p className="text-gray-500 text-sm mt-1 ml-12">
            Kelola pengumuman untuk siswa dan guru
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">
          <Plus className="w-4 h-4" /> Buat Pengumuman
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <X className="w-4 h-4 flex-shrink-0" />
          {error}
          <button onClick={fetch} className="ml-auto text-xs underline">
            Coba lagi
          </button>
        </div>
      )}

      {/* ── Toolbar ── */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        {/* Filter Tipe */}
        <div className="flex flex-wrap gap-2">
          {[
            { v: "", l: "Semua" },
            ...Object.entries(TIPE_MAP).map(([v, { label: l }]) => ({ v, l })),
          ].map(({ v, l }) => (
            <button
              key={v}
              onClick={() => setFilterTipe(v)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${filterTipe === v ? "bg-primary-600 text-white border-primary-600" : "text-gray-600 border-gray-200 hover:bg-gray-50"}`}
            >
              {l}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {/* Filter Status */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Semua Status</option>
            {Object.keys(STATUS_MAP).map((s) => (
              <option key={s} value={s} className="capitalize">
                {s}
              </option>
            ))}
          </select>

          {/* Toggle view */}
          <div className="flex border border-gray-200 rounded-lg overflow-hidden">
            {["card", "table"].map((m) => (
              <button
                key={m}
                onClick={() => setViewMode(m)}
                className={`px-3 py-2 text-xs font-medium transition-colors ${viewMode === m ? "bg-primary-600 text-white" : "text-gray-600 hover:bg-gray-50"}`}
              >
                {m === "card" ? "Kartu" : "Tabel"}
              </button>
            ))}
          </div>

          <button
            onClick={fetch}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── View: Kartu ── */}
      {viewMode === "card" &&
        (loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="animate-pulse bg-white rounded-xl border border-gray-200 p-5 space-y-3"
              >
                <div className="h-4 bg-gray-200 rounded w-2/3" />
                <div className="h-3 bg-gray-100 rounded w-full" />
                <div className="h-3 bg-gray-100 rounded w-4/5" />
              </div>
            ))}
          </div>
        ) : list.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Megaphone className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Tidak ada pengumuman</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {list.map((p) => {
              const t = TIPE_MAP[p.tipe] ?? TIPE_MAP.biasa;
              return (
                <div
                  key={p.id}
                  className={`bg-white rounded-xl border-l-4 border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow ${t.bar}`}
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <h3 className="font-semibold text-gray-900 text-sm leading-snug">
                      {p.judul}
                    </h3>
                    <TipeBadge tipe={p.tipe} />
                  </div>
                  <p className="text-gray-500 text-xs leading-relaxed line-clamp-3 mb-4">
                    {p.isi}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-400 border-t border-gray-100 pt-3">
                    <div className="flex items-center gap-1">
                      <CalendarDays className="w-3.5 h-3.5" />
                      <span>
                        {fmtDate(p.tanggal_mulai)} –{" "}
                        {fmtDate(p.tanggal_selesai)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      <span className="capitalize">
                        {p.target_audience?.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${STATUS_MAP[p.status] ?? "bg-gray-100 text-gray-600"}`}
                    >
                      {p.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ))}

      {/* ── View: Tabel ── */}
      {viewMode === "table" && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {[
                    "#",
                    "Judul",
                    "Tipe",
                    "Target",
                    "Mulai",
                    "Selesai",
                    "Status",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  [...Array(6)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {[...Array(7)].map((_, j) => (
                        <td key={j} className="px-6 py-4">
                          <div className="h-4 bg-gray-200 rounded w-3/4" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : list.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-16 text-center text-gray-400"
                    >
                      <Megaphone className="w-10 h-10 mx-auto mb-3 opacity-30" />
                      <p className="font-medium">Tidak ada pengumuman</p>
                    </td>
                  </tr>
                ) : (
                  list.map((p, i) => (
                    <tr
                      key={p.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-gray-400 text-xs">
                        {(meta?.current_page - 1) * 12 + i + 1}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900 max-w-xs truncate">
                        {p.judul}
                      </td>
                      <td className="px-6 py-4">
                        <TipeBadge tipe={p.tipe} />
                      </td>
                      <td className="px-6 py-4 text-gray-600 capitalize">
                        {p.target_audience?.replace("_", " ")}
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-xs">
                        {fmtDate(p.tanggal_mulai)}
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-xs">
                        {fmtDate(p.tanggal_selesai)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${STATUS_MAP[p.status] ?? "bg-gray-100 text-gray-600"}`}
                        >
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Pagination ── */}
      {meta && meta.last_page > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>
            Menampilkan {list.length} dari {meta.total} pengumuman
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ‹
            </button>
            <span className="px-3 py-1.5 text-xs">
              {page} / {meta.last_page}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
              disabled={page === meta.last_page}
              className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ›
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pengumuman;
