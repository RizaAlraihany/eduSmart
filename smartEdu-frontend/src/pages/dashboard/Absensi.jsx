import { useState, useEffect, useCallback } from "react";
import { ClipboardCheck, RefreshCw, X, CalendarDays } from "lucide-react";
import { absensiService } from "../../services/dataService";

const STATUS_MAP = {
  hadir: { label: "Hadir", cls: "bg-green-100 text-green-700" },
  sakit: { label: "Sakit", cls: "bg-yellow-100 text-yellow-700" },
  izin: { label: "Izin", cls: "bg-blue-100 text-blue-700" },
  alpa: { label: "Alpa", cls: "bg-red-100 text-red-700" },
};

const StatusBadge = ({ status }) => {
  const s = STATUS_MAP[status] ?? {
    label: status,
    cls: "bg-gray-100 text-gray-600",
  };
  return (
    <span
      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${s.cls}`}
    >
      {s.label}
    </span>
  );
};

const SkeletonRow = () => (
  <tr className="animate-pulse">
    {[...Array(7)].map((_, i) => (
      <td key={i} className="px-6 py-4">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
      </td>
    ))}
  </tr>
);

// Format tanggal → "Senin, 03 Mar 2025"
const fmtDate = (d) =>
  new Date(d).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const Absensi = () => {
  const [list, setList] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterTgl, setFilterTgl] = useState("");
  const [page, setPage] = useState(1);

  const today = new Date().toISOString().split("T")[0];

  const fetch = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await absensiService.getAll({
        per_page: 15,
        page,
        tanggal: filterTgl || undefined,
        status_kehadiran: filterStatus || undefined,
      });
      setList(res.data ?? []);
      setMeta(res.meta ?? null);
    } catch {
      setError("Gagal memuat data absensi.");
    } finally {
      setLoading(false);
    }
  }, [page, filterTgl, filterStatus]);

  useEffect(() => {
    fetch();
  }, [fetch]);
  useEffect(() => {
    setPage(1);
  }, [filterTgl, filterStatus]);

  // Summary count dari data yang tampil
  const summary = list.reduce((acc, a) => {
    acc[a.status_kehadiran] = (acc[a.status_kehadiran] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-9 h-9 bg-teal-600 rounded-lg flex items-center justify-center">
              <ClipboardCheck className="w-5 h-5 text-white" />
            </div>
            Absensi
          </h1>
          <p className="text-gray-500 text-sm mt-1 ml-12">
            Rekap kehadiran siswa
          </p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Object.entries(STATUS_MAP).map(([k, v]) => (
          <div
            key={k}
            className={`rounded-xl p-4 border ${v.cls.replace("text-", "border-").replace("-700", "-200").replace("-100", "-50")} bg-white shadow-sm`}
          >
            <p className="text-xs font-semibold text-gray-500 uppercase">
              {v.label}
            </p>
            <p className={`text-2xl font-bold mt-1 ${v.cls.split(" ")[1]}`}>
              {summary[k] ?? 0}
            </p>
          </div>
        ))}
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

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-gray-400" />
            <input
              type="date"
              value={filterTgl}
              onChange={(e) => setFilterTgl(e.target.value)}
              max={today}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            {filterTgl && (
              <button
                onClick={() => setFilterTgl("")}
                className="text-xs text-gray-400 hover:text-gray-600"
              >
                Reset
              </button>
            )}
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Semua Status</option>
            {Object.entries(STATUS_MAP).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </select>
          <button
            onClick={fetch}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 ml-auto"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {[
                  "#",
                  "Tanggal",
                  "Siswa",
                  "Kelas",
                  "Mata Pelajaran",
                  "Guru",
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
                [...Array(8)].map((_, i) => <SkeletonRow key={i} />)
              ) : list.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-16 text-center text-gray-400"
                  >
                    <ClipboardCheck className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">Tidak ada data absensi</p>
                    <p className="text-xs mt-1">
                      Coba ubah filter tanggal atau status
                    </p>
                  </td>
                </tr>
              ) : (
                list.map((a, i) => (
                  <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-gray-400 text-xs">
                      {(meta?.current_page - 1) * 15 + i + 1}
                    </td>
                    <td className="px-6 py-4 text-gray-700 text-xs whitespace-nowrap">
                      {fmtDate(a.tanggal)}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {a.siswa?.nama ?? "-"}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {a.kelas?.nama_kelas ?? "-"}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {a.jadwal?.mata_pelajaran?.nama_mapel ?? "-"}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {a.guru?.nama ?? "-"}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={a.status_kehadiran} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {meta && meta.last_page > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
            <span>
              Menampilkan {list.length} dari {meta.total} data
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
    </div>
  );
};

export default Absensi;
