import { useState, useEffect, useCallback } from "react";
import { Calendar, RefreshCw, X, Clock } from "lucide-react";
import { jadwalService } from "../../services/dataService";

const HARI = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const HARI_COLOR = {
  Senin: "bg-blue-50 text-blue-700 border-blue-200",
  Selasa: "bg-green-50 text-green-700 border-green-200",
  Rabu: "bg-yellow-50 text-yellow-700 border-yellow-200",
  Kamis: "bg-orange-50 text-orange-700 border-orange-200",
  Jumat: "bg-purple-50 text-purple-700 border-purple-200",
  Sabtu: "bg-pink-50 text-pink-700 border-pink-200",
};

const Badge = ({ status }) => (
  <span
    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${status === "aktif" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
  >
    {status}
  </span>
);

const SkeletonRow = () => (
  <tr className="animate-pulse">
    {[...Array(8)].map((_, i) => (
      <td key={i} className="px-6 py-4">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
      </td>
    ))}
  </tr>
);

const Jadwal = () => {
  const [list, setList] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterHari, setFilterHari] = useState("");
  const [page, setPage] = useState(1);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await jadwalService.getAll({
        per_page: 20,
        page,
        hari: filterHari || undefined,
      });
      setList(res.data ?? []);
      setMeta(res.meta ?? null);
    } catch {
      setError("Gagal memuat data jadwal.");
    } finally {
      setLoading(false);
    }
  }, [page, filterHari]);

  useEffect(() => {
    fetch();
  }, [fetch]);
  useEffect(() => {
    setPage(1);
  }, [filterHari]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            Jadwal Pelajaran
          </h1>
          <p className="text-gray-500 text-sm mt-1 ml-12">
            Jadwal mengajar per hari dan kelas
          </p>
        </div>
      </div>

      {/* Filter hari — pill tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilterHari("")}
          className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${filterHari === "" ? "bg-primary-600 text-white border-primary-600" : "text-gray-600 border-gray-200 hover:bg-gray-50"}`}
        >
          Semua Hari
        </button>
        {HARI.map((h) => (
          <button
            key={h}
            onClick={() => setFilterHari(h)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${filterHari === h ? "bg-primary-600 text-white border-primary-600" : "text-gray-600 border-gray-200 hover:bg-gray-50"}`}
          >
            {h}
          </button>
        ))}
        <button
          onClick={fetch}
          className="ml-auto flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-full hover:bg-gray-50"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
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

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {[
                  "#",
                  "Hari",
                  "Jam",
                  "Mata Pelajaran",
                  "Kelas",
                  "Guru",
                  "Ruangan",
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
                [...Array(10)].map((_, i) => <SkeletonRow key={i} />)
              ) : list.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-16 text-center text-gray-400"
                  >
                    <Calendar className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">Tidak ada data jadwal</p>
                  </td>
                </tr>
              ) : (
                list.map((j, i) => (
                  <tr key={j.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-gray-400 text-xs">
                      {(meta?.current_page - 1) * 20 + i + 1}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${HARI_COLOR[j.hari] ?? "bg-gray-100 text-gray-600 border-gray-200"}`}
                      >
                        {j.hari}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-gray-700">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        <span className="font-mono text-xs">
                          {j.jam_mulai} – {j.jam_selesai}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {j.mata_pelajaran?.nama_mapel ?? "-"}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {j.kelas?.nama_kelas ?? "-"}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {j.guru?.nama ?? "-"}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {j.ruangan ?? (
                        <span className="text-gray-300 italic text-xs">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <Badge status={j.status} />
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

export default Jadwal;
