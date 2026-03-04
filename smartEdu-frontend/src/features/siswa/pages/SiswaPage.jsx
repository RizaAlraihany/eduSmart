import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, Search, Plus, RefreshCw, X, AlertCircle } from "lucide-react";
import api from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";

// Query fns 
const fetchSiswa = (params) =>
  api.get("/siswa", { params }).then((r) => r.data);

const deleteSiswa = (id) => api.delete(`/siswa/${id}`).then((r) => r.data);

// Sub-components 
const BadgeStatus = ({ status }) => {
  const map = {
    aktif: "bg-green-100 text-green-700",
    nonaktif: "bg-gray-100 text-gray-600",
    lulus: "bg-blue-100 text-blue-700",
    pindah: "bg-yellow-100 text-yellow-700",
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

// Main Component
const SiswaPage = () => {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebounced] = useState("");
  const [page, setPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState("");

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    setPage(1);
    clearTimeout(window._siswaSearchTimer);
    window._siswaSearchTimer = setTimeout(() => setDebounced(val), 400);
  };

  const params = {
    per_page: 15,
    page,
    search: debouncedSearch || undefined,
    status: filterStatus || undefined,
  };

  // useQuery
  const { data, isLoading, isError, error, isFetching, refetch } = useQuery({
    queryKey: queryKeys.siswa.list(params),
    queryFn: () => fetchSiswa(params),
    placeholderData: (prev) => prev,
  });

  const list = data?.data ?? [];
  const meta = data?.meta ?? null;

  // useMutation: delete
  const deleteMutation = useMutation({
    mutationFn: deleteSiswa,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.siswa.all }),
  });

  const handleDelete = (id) => {
    if (!window.confirm("Hapus data siswa ini?")) return;
    deleteMutation.mutate(id);
  };

  const errorMessage =
    error?.response?.data?.message ?? "Gagal memuat data siswa.";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            Data Siswa
          </h1>
          <p className="text-gray-500 text-sm mt-1 ml-12">
            Kelola data seluruh siswa
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
          <Plus className="w-4 h-4" />
          Tambah Siswa
        </button>
      </div>

      {/* Mutation error */}
      {deleteMutation.isError && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>
            {deleteMutation.error?.response?.data?.message ??
              "Gagal menghapus siswa."}
          </span>
          <button onClick={() => deleteMutation.reset()} className="ml-auto">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari nama, NISN, email..."
            value={search}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {search && (
            <button
              onClick={() => {
                setSearch("");
                setDebounced("");
                setPage(1);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter status */}
        <select
          value={filterStatus}
          onChange={(e) => {
            setFilterStatus(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Semua Status</option>
          <option value="aktif">Aktif</option>
          <option value="nonaktif">Nonaktif</option>
          <option value="lulus">Lulus</option>
          <option value="pindah">Pindah</option>
        </select>

        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw
            className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </div>

      {/* Query error */}
      {isError && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
          <button
            onClick={() => refetch()}
            className="ml-auto flex items-center gap-1 underline text-xs"
          >
            <RefreshCw className="w-3 h-3" /> Coba lagi
          </button>
        </div>
      )}

      {/*  Tabel */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        {isFetching && !isLoading && (
          <div className="h-0.5 bg-indigo-500 animate-pulse" />
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {[
                  "NISN",
                  "Nama",
                  "Kelas",
                  "Jenis Kelamin",
                  "Status",
                  "Tanggal Lahir",
                  "Aksi",
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
            <tbody className="divide-y divide-gray-100">
              {isLoading &&
                [...Array(5)].map((_, i) => <SkeletonRow key={i} />)}

              {!isLoading &&
                list.map((siswa) => (
                  <tr
                    key={siswa.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 font-mono text-xs text-gray-600">
                      {siswa.nisn}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-sm flex-shrink-0">
                          {siswa.nama?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {siswa.nama}
                          </p>
                          <p className="text-xs text-gray-400">{siswa.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {siswa.kelas?.nama_kelas ?? "—"}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {siswa.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan"}
                    </td>
                    <td className="px-6 py-4">
                      <BadgeStatus status={siswa.status} />
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {siswa.tanggal_lahir
                        ? new Date(siswa.tanggal_lahir).toLocaleDateString(
                            "id-ID",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            },
                          )
                        : "—"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button className="text-xs px-3 py-1 rounded-md bg-indigo-50 text-indigo-600 hover:bg-indigo-100 font-medium transition-colors">
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(siswa.id)}
                          disabled={deleteMutation.isPending}
                          className="text-xs px-3 py-1 rounded-md bg-red-50 text-red-600 hover:bg-red-100 font-medium transition-colors disabled:opacity-50"
                        >
                          {deleteMutation.isPending ? "..." : "Hapus"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

              {!isLoading && !isError && list.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-gray-400 text-sm"
                  >
                    {debouncedSearch
                      ? `Tidak ada siswa dengan kata kunci "${debouncedSearch}"`
                      : "Belum ada data siswa."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {meta && meta.last_page > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
            <span>
              Menampilkan {list.length} dari {meta.total} siswa
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || isFetching}
                className="px-3 py-1 border rounded-md hover:bg-gray-50 disabled:opacity-40"
              >
                ← Prev
              </button>
              <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-md font-medium">
                {page} / {meta.last_page}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
                disabled={page === meta.last_page || isFetching}
                className="px-3 py-1 border rounded-md hover:bg-gray-50 disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SiswaPage;
