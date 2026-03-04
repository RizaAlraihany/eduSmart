import { useState, useEffect, useCallback } from "react";
import { School, Search, Plus, RefreshCw, X, Users } from "lucide-react";
import { kelasService } from "../../services/dataService";

const Badge = ({ status }) => {
  const map = {
    aktif: "bg-green-100 text-green-700",
    nonaktif: "bg-red-100 text-red-700",
  };
  return (
    <span
      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${map[status] ?? "bg-gray-100 text-gray-600"}`}
    >
      {status}
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

const TINGKAT = ["X", "XI", "XII"];

const Kelas = () => {
  const [list, setList] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterTingkat, setFilterTingkat] = useState("");
  const [page, setPage] = useState(1);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await kelasService.getAll({
        per_page: 15,
        page,
        search: search || undefined,
        tingkat: filterTingkat || undefined,
      });
      setList(res.data ?? []);
      setMeta(res.meta ?? null);
    } catch {
      setError("Gagal memuat data kelas.");
    } finally {
      setLoading(false);
    }
  }, [page, search, filterTingkat]);

  useEffect(() => {
    const t = setTimeout(() => fetch(), 400);
    return () => clearTimeout(t);
  }, [fetch]);
  useEffect(() => {
    setPage(1);
  }, [search, filterTingkat]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-9 h-9 bg-orange-500 rounded-lg flex items-center justify-center">
              <School className="w-5 h-5 text-white" />
            </div>
            Data Kelas
          </h1>
          <p className="text-gray-500 text-sm mt-1 ml-12">
            Kelola data kelas dan wali kelas
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">
          <Plus className="w-4 h-4" /> Tambah Kelas
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <X className="w-4 h-4 flex-shrink-0" />
          {error}
          <button
            onClick={fetch}
            className="ml-auto flex items-center gap-1 text-xs underline"
          >
            <RefreshCw className="w-3 h-3" /> Coba lagi
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari nama kelas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterTingkat}
            onChange={(e) => setFilterTingkat(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Semua Tingkat</option>
            {TINGKAT.map((t) => (
              <option key={t} value={t}>
                Kelas {t}
              </option>
            ))}
          </select>
          <button
            onClick={fetch}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
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
                  "Nama Kelas",
                  "Tingkat",
                  "Tahun Ajaran",
                  "Wali Kelas",
                  "Kapasitas",
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
                    <School className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">Tidak ada data kelas</p>
                  </td>
                </tr>
              ) : (
                list.map((k, i) => {
                  const terisi = k.siswas?.length ?? 0;
                  const pct = k.kapasitas
                    ? Math.round((terisi / k.kapasitas) * 100)
                    : 0;
                  return (
                    <tr
                      key={k.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-gray-400 text-xs">
                        {(meta?.current_page - 1) * 15 + i + 1}
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-900">
                        {k.nama_kelas}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-xs font-bold">
                          Kelas {k.tingkat}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {k.tahun_ajaran}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {k.wali_kelas?.nama ?? (
                          <span className="text-gray-400 italic text-xs">
                            Belum ditentukan
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Users className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-gray-700">
                            {terisi}/{k.kapasitas}
                          </span>
                          <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${pct >= 90 ? "bg-red-400" : pct >= 70 ? "bg-yellow-400" : "bg-green-400"}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge status={k.status} />
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

export default Kelas;
