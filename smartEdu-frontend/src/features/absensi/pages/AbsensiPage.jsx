import { useState, useEffect, useCallback } from "react";
import { UserCheck, RefreshCw, X, Plus, CalendarDays } from "lucide-react";
import { absensiService } from "@/services/dataService";
import { useAuth } from "@/shared/hooks/useAuth";
import Button from "@/shared/components/ui/Button";
import AbsensiFormModal from "../components/AbsensiFormModal";

const STATUS_MAP = {
  hadir: { label: "Hadir", cls: "bg-green-100 text-green-700" },
  sakit: { label: "Sakit", cls: "bg-yellow-100 text-yellow-700" },
  izin: { label: "Izin", cls: "bg-blue-100 text-blue-700" },
  alpa: { label: "Alpa", cls: "bg-red-100 text-red-700" },
};

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

const AbsensiPage = () => {
  const { isAdmin, user } = useAuth();
  const isGuru = user?.role === "guru";

  const [list, setList] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [filterTanggal, setFilterTanggal] = useState("");

  // State Modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await absensiService.getAll({
        per_page: 15,
        page,
        tanggal: filterTanggal || undefined,
      });
      // Handle response API
      const dataArr = res.data?.data || res.data || [];
      setList(Array.isArray(dataArr) ? dataArr : []);
      setMeta(res.meta ?? res.data?.meta ?? null);
    } catch {
      setError("Gagal memuat data absensi.");
    } finally {
      setLoading(false);
    }
  }, [page, filterTanggal]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    setPage(1);
  }, [filterTanggal]);

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-9 h-9 bg-teal-500 rounded-lg flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-white" />
            </div>
            Data Absensi
          </h1>
          <p className="text-gray-500 text-sm mt-1 ml-12">
            Pemantauan kehadiran siswa per kelas
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="date"
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-teal-500"
            value={filterTanggal}
            onChange={(e) => setFilterTanggal(e.target.value)}
          />

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
              className="bg-teal-600 hover:bg-teal-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Input Absensi
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
                  Tanggal
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Keterangan
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
                    <UserCheck className="w-10 h-10 mx-auto mb-3 opacity-30 text-teal-500" />
                    <p className="font-medium">Tidak ada data kehadiran</p>
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
                      <CalendarDays className="w-3.5 h-3.5 text-gray-400" />
                      {fmtDate(item.tanggal)}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={item.status_kehadiran} />
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs">
                      {item.keterangan || "-"}
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
      <AbsensiFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadData}
      />
    </div>
  );
};

export default AbsensiPage;
