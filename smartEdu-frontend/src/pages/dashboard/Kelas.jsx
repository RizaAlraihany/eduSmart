import React, { useState, useEffect, useCallback } from "react";
import { BookOpen, Search, Plus, RefreshCw, Users } from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Card from "../../components/common/card";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Loading from "../../components/common/Loading";
import DataTable from "../../components/dashboard/DataTable";
import { kelasService } from "../../services/dataService";

const Kelas = () => {
  const [kelasList, setKelasList] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterTingkat, setFilterTingkat] = useState("");
  const [page, setPage] = useState(1);

  const fetchKelas = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await kelasService.getAll({
        per_page: 15,
        page,
        search: search || undefined,
        tingkat: filterTingkat || undefined,
      });
      setKelasList(res.data ?? []);
      setMeta(res.meta ?? null);
    } catch {
      setError("Gagal memuat data kelas.");
    } finally {
      setLoading(false);
    }
  }, [page, search, filterTingkat]);

  useEffect(() => {
    const timer = setTimeout(() => fetchKelas(), 400);
    return () => clearTimeout(timer);
  }, [fetchKelas]);

  const columns = [
    { header: "Nama Kelas", width: "20%" },
    { header: "Tingkat", width: "10%" },
    { header: "Tahun Ajaran", width: "15%" },
    { header: "Wali Kelas", width: "25%" },
    { header: "Kapasitas", width: "15%" },
    { header: "Status", width: "15%" },
  ];

  return (
    <DashboardLayout>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 font-display flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            Data Kelas
          </h1>
          <p className="text-gray-500 mt-1 ml-[52px]">
            Kelola data seluruh kelas aktif
          </p>
        </div>
        <Button variant="primary" size="md">
          <Plus className="w-4 h-4 mr-2" />
          Tambah Kelas
        </Button>
      </div>

      <Card glass padding="none">
        <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div className="flex gap-3 w-full sm:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:w-52">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cari nama kelas..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-9 pr-4 py-2.5 w-full text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition"
              />
            </div>
            {/* Filter Tingkat */}
            <select
              value={filterTingkat}
              onChange={(e) => {
                setFilterTingkat(e.target.value);
                setPage(1);
              }}
              className="text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition"
            >
              <option value="">Semua Tingkat</option>
              <option value="X">X</option>
              <option value="XI">XI</option>
              <option value="XII">XII</option>
            </select>
          </div>
          <button
            onClick={fetchKelas}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 font-medium transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        {error && (
          <div className="px-6 py-4 text-sm text-red-600 bg-red-50">
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-16 flex justify-center">
            <Loading size="md" text="Memuat data kelas..." />
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={kelasList}
            emptyMessage="Tidak ada data kelas"
            renderRow={(kelas) => (
              <>
                <td className="px-6 py-4">
                  <span className="text-sm font-bold text-gray-900">
                    {kelas.nama_kelas}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <Badge variant="primary">{kelas.tingkat}</Badge>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {kelas.tahun_ajaran}
                </td>
                <td className="px-6 py-4">
                  {kelas.wali_kelas ? (
                    <div className="flex items-center gap-2">
                      <img
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(kelas.wali_kelas.nama)}&background=7c3aed&color=fff&size=28`}
                        alt=""
                        className="w-7 h-7 rounded-full flex-shrink-0"
                      />
                      <span className="text-sm text-gray-700 font-medium">
                        {kelas.wali_kelas.nama}
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400 italic">
                      Belum ditentukan
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5 text-sm text-gray-600">
                    <Users className="w-3.5 h-3.5 text-gray-400" />
                    <span>
                      {kelas.siswas_count ?? kelas.siswas?.length ?? "—"}
                    </span>
                    <span className="text-gray-400">/ {kelas.kapasitas}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <Badge
                    variant={kelas.status === "aktif" ? "success" : "default"}
                  >
                    {kelas.status === "aktif" ? "Aktif" : "Nonaktif"}
                  </Badge>
                </td>
              </>
            )}
          />
        )}

        {meta && meta.last_page > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between text-sm">
            <p className="text-gray-500">
              Halaman <span className="font-bold">{meta.current_page}</span>{" "}
              dari <span className="font-bold">{meta.last_page}</span> · Total{" "}
              <span className="font-bold">{meta.total}</span> kelas
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
    </DashboardLayout>
  );
};

export default Kelas;
