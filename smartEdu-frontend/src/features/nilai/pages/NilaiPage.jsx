import { useState, useEffect, useCallback } from "react";
import { TrendingUp, RefreshCw, X } from "lucide-react";
import { nilaiService } from "@/services/dataService";

const JENIS = ["tugas", "harian", "uts", "uas", "praktek"];
const SEMESTER = [
  { v: "1", l: "Semester 1" },
  { v: "2", l: "Semester 2" },
];

// Warna nilai
const nilaiColor = (n) => {
  if (n >= 85)
    return { bar: "bg-green-500", text: "text-green-700", bg: "bg-green-50" };
  if (n >= 70)
    return {
      bar: "bg-yellow-400",
      text: "text-yellow-700",
      bg: "bg-yellow-50",
    };
  return { bar: "bg-red-400", text: "text-red-700", bg: "bg-red-50" };
};

const JenisBadge = ({ jenis }) => {
  const map = {
    tugas: "bg-blue-100 text-blue-700",
    harian: "bg-cyan-100 text-cyan-700",
    uts: "bg-orange-100 text-orange-700",
    uas: "bg-red-100 text-red-700",
    praktek: "bg-purple-100 text-purple-700",
  };
  return (
    <span
      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${map[jenis] ?? "bg-gray-100 text-gray-600"}`}
    >
      {jenis}
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

const Nilai = () => {
  const [list, setList] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterJenis, setFilterJenis] = useState("");
  const [filterSemester, setFilterSemester] = useState("");
  const [page, setPage] = useState(1);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await nilaiService.getAll({
        per_page: 15,
        page,
        jenis_nilai: filterJenis || undefined,
        semester: filterSemester || undefined,
      });
      setList(res.data ?? []);
      setMeta(res.meta ?? null);
    } catch {
      setError("Gagal memuat data nilai.");
    } finally {
      setLoading(false);
    }
  }, [page, filterJenis, filterSemester]);

  useEffect(() => {
    fetch();
  }, [fetch]);
  useEffect(() => {
    setPage(1);
  }, [filterJenis, filterSemester]);

  // Rata-rata nilai dari data yang tampil
  const avg = list.length
    ? Math.round(
        list.reduce((s, n) => s + parseFloat(n.nilai ?? 0), 0) / list.length,
      )
    : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-9 h-9 bg-rose-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            Nilai
          </h1>
          <p className="text-gray-500 text-sm mt-1 ml-12">
            Rekap nilai siswa per mata pelajaran
          </p>
        </div>
        {avg !== null && (
          <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl shadow-sm">
            <span className="text-xs text-gray-500">Rata-rata halaman ini</span>
            <span className={`text-lg font-bold ${nilaiColor(avg).text}`}>
              {avg}
            </span>
          </div>
        )}
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
          <select
            value={filterJenis}
            onChange={(e) => setFilterJenis(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Semua Jenis Nilai</option>
            {JENIS.map((j) => (
              <option key={j} value={j} className="capitalize">
                {j.toUpperCase()}
              </option>
            ))}
          </select>
          <select
            value={filterSemester}
            onChange={(e) => setFilterSemester(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Semua Semester</option>
            {SEMESTER.map((s) => (
              <option key={s.v} value={s.v}>
                {s.l}
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
                  "Siswa",
                  "Kelas",
                  "Mata Pelajaran",
                  "Jenis",
                  "Nilai",
                  "Semester",
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
                    <TrendingUp className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">Tidak ada data nilai</p>
                  </td>
                </tr>
              ) : (
                list.map((n, i) => {
                  const c = nilaiColor(parseFloat(n.nilai));
                  return (
                    <tr
                      key={n.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-gray-400 text-xs">
                        {(meta?.current_page - 1) * 15 + i + 1}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {n.siswa?.nama ?? "-"}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {n.kelas?.nama_kelas ?? "-"}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {n.mata_pelajaran?.nama_mapel ?? "-"}
                      </td>
                      <td className="px-6 py-4">
                        <JenisBadge jenis={n.jenis_nilai} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {/* Nilai angka */}
                          <span
                            className={`w-10 text-center px-1.5 py-0.5 rounded-lg text-xs font-bold ${c.bg} ${c.text}`}
                          >
                            {n.nilai}
                          </span>
                          {/* Progress bar */}
                          <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${c.bar}`}
                              style={{ width: `${n.nilai}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        Semester {n.semester}
                      </td>
                    </tr>
                  );
                })
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

export default Nilai;
