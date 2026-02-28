import React, { useState, useEffect, useCallback } from "react";
import { GraduationCap, Search, Plus, RefreshCw } from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Card from "../../components/common/card";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Loading from "../../components/common/Loading";
import DataTable from "../../components/dashboard/DataTable";
import { guruService } from "../../services/dataService";
import { formatTanggal, labelJenisKelamin } from "../../utils/helpers";

const Guru = () => {
  const [guruList, setGuruList] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const fetchGuru = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await guruService.search({
        per_page: 15,
        page,
        search: search || undefined,
      });
      setGuruList(res.data ?? []);
      setMeta(res.meta ?? null);
    } catch {
      setError("Gagal memuat data guru.");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    const timer = setTimeout(() => fetchGuru(), 400);
    return () => clearTimeout(timer);
  }, [fetchGuru]);

  const columns = [
    { header: "NIP", width: "15%" },
    { header: "Nama Guru", width: "28%" },
    { header: "Jenis Kelamin", width: "15%" },
    { header: "Pendidikan", width: "20%" },
    { header: "Telepon", width: "15%" },
    { header: "Status", width: "7%" },
  ];

  return (
    <DashboardLayout>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 font-display flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            Data Guru
          </h1>
          <p className="text-gray-500 mt-1 ml-[52px]">
            Kelola data seluruh tenaga pengajar
          </p>
        </div>
        <Button variant="primary" size="md">
          <Plus className="w-4 h-4 mr-2" />
          Tambah Guru
        </Button>
      </div>

      <Card glass padding="none">
        <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari nama atau NIP..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9 pr-4 py-2.5 w-full text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition"
            />
          </div>
          <button
            onClick={fetchGuru}
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
            <Loading size="md" text="Memuat data guru..." />
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={guruList}
            emptyMessage="Tidak ada data guru"
            renderRow={(guru) => (
              <>
                <td className="px-6 py-4 text-sm font-mono text-gray-700">
                  {guru.nip ?? "—"}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(guru.nama)}&background=7c3aed&color=fff&size=36`}
                      alt=""
                      className="w-9 h-9 rounded-full flex-shrink-0"
                    />
                    <div>
                      <p className="text-sm font-bold text-gray-900">
                        {guru.nama}
                      </p>
                      <p className="text-xs text-gray-500">
                        {guru.email ?? "—"}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {labelJenisKelamin(guru.jenis_kelamin)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {guru.pendidikan_terakhir ?? "—"}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {guru.telepon ?? "—"}
                </td>
                <td className="px-6 py-4">
                  <Badge
                    variant={guru.status === "aktif" ? "success" : "default"}
                  >
                    {guru.status === "aktif" ? "Aktif" : "Nonaktif"}
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
              <span className="font-bold">{meta.total}</span> guru
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

export default Guru;
