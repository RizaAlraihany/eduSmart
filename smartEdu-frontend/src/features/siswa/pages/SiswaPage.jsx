import React, { useState, useEffect, useCallback } from "react";
import { Users, Search, Plus, RefreshCw } from "lucide-react";
import Card from "../../../shared/components/ui/Card";
import Badge from "../../../shared/components/ui/Badge";
import Button from "../../../shared/components/ui/Button";
import Loading from "../../../shared/components/ui/Loading";
import DataTable from "../../../shared/components/ui/DataTable";
import siswaService from "../services/siswaService";
import {
  formatTanggal,
  labelJenisKelamin,
  statusSiswaBadge,
} from "../../../utils/helpers";

const Siswa = () => {
  const [siswaList, setSiswaList] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const fetchSiswa = useCallback(
    async (params = {}) => {
      setLoading(true);
      setError("");
      try {
        const res = await siswaService.search({
          per_page: 15,
          page,
          search: search || undefined,
          ...params,
        });
        setSiswaList(res.data ?? []);
        setMeta(res.meta ?? null);
      } catch {
        setError("Gagal memuat data siswa.");
      } finally {
        setLoading(false);
      }
    },
    [page, search],
  );

  useEffect(() => {
    const timer = setTimeout(() => fetchSiswa(), 400);
    return () => clearTimeout(timer);
  }, [fetchSiswa]);

  const columns = [
    { header: "NISN", width: "12%" },
    { header: "Nama Siswa", width: "25%" },
    { header: "Kelas", width: "15%" },
    { header: "Jenis Kelamin", width: "15%" },
    { header: "Tgl Lahir", width: "18%" },
    { header: "Status", width: "15%" },
  ];

  const labelStatus = {
    aktif: "Aktif",
    nonaktif: "Nonaktif",
    lulus: "Lulus",
    pindah: "Pindah",
  };

  return (
          {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 font-display flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <Users className="w-5 h-5 text-white" />
            </div>
            Data Siswa
          </h1>
          <p className="text-gray-500 mt-1 ml-[52px]">
            Kelola data seluruh siswa
          </p>
        </div>
        <Button variant="primary" size="md">
          <Plus className="w-4 h-4 mr-2" />
          Tambah Siswa
        </Button>
      </div>

      <Card glass padding="none">
        {/* Toolbar */}
        <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari nama atau NISN..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9 pr-4 py-2.5 w-full text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition"
            />
          </div>
          <button
            onClick={() => fetchSiswa()}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 font-medium transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="px-6 py-4 text-sm text-red-600 bg-red-50">
            {error}
          </div>
        )}

        {/* Table */}
        {loading ? (
          <div className="py-16 flex justify-center">
            <Loading size="md" text="Memuat data siswa..." />
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={siswaList}
            emptyMessage="Tidak ada data siswa"
            renderRow={(siswa) => (
              <>
                <td className="px-6 py-4 text-sm font-mono text-gray-700">
                  {siswa.nisn ?? "—"}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(siswa.nama)}&background=3b82f6&color=fff&size=36`}
                      alt=""
                      className="w-9 h-9 rounded-full flex-shrink-0"
                    />
                    <div>
                      <p className="text-sm font-bold text-gray-900">
                        {siswa.nama}
                      </p>
                      <p className="text-xs text-gray-500">
                        {siswa.email ?? "—"}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <Badge variant="primary">
                    {siswa.kelas?.nama_kelas ?? "—"}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {labelJenisKelamin(siswa.jenis_kelamin)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {formatTanggal(siswa.tanggal_lahir)}
                </td>
                <td className="px-6 py-4">
                  <Badge variant={statusSiswaBadge(siswa.status)}>
                    {labelStatus[siswa.status] ?? siswa.status}
                  </Badge>
                </td>
              </>
            )}
          />
        )}

        {/* Pagination */}
        {meta && meta.last_page > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between text-sm">
            <p className="text-gray-500">
              Halaman <span className="font-bold">{meta.current_page}</span>{" "}
              dari <span className="font-bold">{meta.last_page}</span> · Total{" "}
              <span className="font-bold">{meta.total}</span> siswa
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={meta.current_page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                ← Prev
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={meta.current_page === meta.last_page}
                onClick={() => setPage((p) => p + 1)}
              >
                Next →
              </Button>
            </div>
          </div>
        )}
      </Card>
      );
};

export default Siswa;