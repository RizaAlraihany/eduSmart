import { useState, useEffect, useCallback } from "react";
import { FileSignature, RefreshCw, X, Plus, BookOpen } from "lucide-react";
import { nilaiService } from "@/services/dataService";
import { useAuth } from "@/shared/hooks/useAuth";
import Button from "@/shared/components/ui/Button";
import NilaiFormModal from "../components/NilaiFormModal";

const JENIS_NILAI_MAP = {
  tugas: { label: "Tugas", cls: "bg-blue-100 text-blue-700" },
  pts: { label: "PTS", cls: "bg-purple-100 text-purple-700" },
  uts: { label: "UTS", cls: "bg-indigo-100 text-indigo-700" },
  uas: { label: "UAS", cls: "bg-pink-100 text-pink-700" },
  harian: { label: "Harian", cls: "bg-cyan-100 text-cyan-700" },
  praktek: { label: "Praktek", cls: "bg-orange-100 text-orange-700" },
};

const JenisBadge = ({ type }) => {
  const s = JENIS_NILAI_MAP[type?.toLowerCase()] ?? {
    label: type,
    cls: "bg-gray-100 text-gray-600",
  };
  return (
    <span
      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase ${s.cls}`}
    >
      {s.label || type || "Unknown"}
    </span>
  );
};

const getScoreColor = (score) => {
  if (score >= 85) return "text-green-600 font-bold";
  if (score >= 70) return "text-blue-600 font-bold";
  if (score >= 50) return "text-yellow-600 font-bold";
  return "text-red-600 font-bold";
};

const NilaiPage = () => {
  const { isAdmin, user } = useAuth();
  const isGuru = user?.role === "guru";

  const [list, setList] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [filterJenis, setFilterJenis] = useState("");

  // State Modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await nilaiService.getAll({
        per_page: 15,
        page,
        jenis_nilai: filterJenis || undefined,
      });
      // Handle response API
      const dataArr = res.data?.data || res.data || [];
      setList(Array.isArray(dataArr) ? dataArr : []);
      setMeta(res.meta ?? res.data?.meta ?? null);
    } catch {
      setError("Gagal memuat data nilai.");
    } finally {
      setLoading(false);
    }
  }, [page, filterJenis]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    setPage(1);
  }, [filterJenis]);

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-9 h-9 bg-fuchsia-500 rounded-lg flex items-center justify-center">
              <FileSignature className="w-5 h-5 text-white" />
            </div>
            Data Nilai Siswa
          </h1>
          <p className="text-gray-500 text-sm mt-1 ml-12">
            Manajemen penilaian dan hasil belajar
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={loadData}
            disabled={loading}
            className="px-3 py-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </Button>

          {(isAdmin || isGuru) && (
            <Button
              onClick={() => setIsModalOpen(true)}
              className="bg-fuchsia-600 hover:bg-fuchsia-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Input Nilai
            </Button>
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
          { v: "", l: "Semua Kategori" },
          { v: "tugas", l: "Tugas" },
          { v: "harian", l: "Harian" },
          { v: "pts", l: "PTS" },
          { v: "uas", l: "UAS" },
        ].map(({ v, l }) => (
          <button
            key={v}
            onClick={() => setFilterJenis(v)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              filterJenis === v
                ? "bg-fuchsia-600 text-white border-fuchsia-600"
                : "bg-white text-gray-600 border-gray-200 hover:border-fuchsia-300"
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      {/* ── Table View ── */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  #
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Nama Siswa
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Kelas
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Mata Pelajaran
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Kategori
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">
                  Skor Nilai
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {[...Array(6)].map((_, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded w-full" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : list.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-16 text-center text-gray-400"
                  >
                    <FileSignature className="w-10 h-10 mx-auto mb-3 opacity-30 text-fuchsia-500" />
                    <p className="font-medium">Tidak ada data nilai</p>
                  </td>
                </tr>
              ) : (
                list.map((item, i) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-gray-400 text-xs">
                      {(meta?.current_page ? meta.current_page - 1 : 0) * 15 +
                        i +
                        1}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {item.siswa?.nama_lengkap || `Siswa ID: ${item.siswa_id}`}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {item.kelas?.nama_kelas || "-"}
                    </td>
                    <td className="px-6 py-4 text-gray-600 flex items-center gap-2">
                      <BookOpen className="w-3.5 h-3.5 text-gray-400" />
                      {item.mata_pelajaran?.nama || "-"}
                    </td>
                    <td className="px-6 py-4">
                      <JenisBadge type={item.jenis_nilai} />
                    </td>
                    <td
                      className={`px-6 py-4 text-right text-base ${getScoreColor(item.nilai)}`}
                    >
                      {item.nilai}
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
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                ← Prev
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
                disabled={page === meta.last_page}
              >
                Next →
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ── Modal Form ── */}
      <NilaiFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadData}
      />
    </div>
  );
};

export default NilaiPage;
