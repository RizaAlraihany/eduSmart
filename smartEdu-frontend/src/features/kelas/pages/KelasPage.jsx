// src/features/kelas/pages/KelasPage.jsx
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  School,
  Search,
  Plus,
  X,
  AlertCircle,
  RefreshCw,
  Users,
  MoreHorizontal,
  Edit2,
  Trash2,
  BookOpen,
} from "lucide-react";
import api from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import PageHeader from "@/shared/components/ui/PageHeader";
import ActionBar from "@/shared/components/ui/ActionBar";
import EmptyState from "@/shared/components/ui/EmptyState";
import StatusBadge from "@/shared/components/ui/StatusBadge";
import { TableSkeletonRow } from "@/shared/components/ui/SkeletonLoader";

// ─── Query fns ──────────────────────────────────────────────────
const fetchKelas = (p) => api.get("/kelas", { params: p }).then((r) => r.data);
const deleteKelas = (id) => api.delete(`/kelas/${id}`).then((r) => r.data);

// ─── ProgressBar Kapasitas ──────────────────────────────────────
const KapasitasBar = ({ terisi, kapasitas }) => {
  const pct =
    kapasitas > 0 ? Math.min(100, Math.round((terisi / kapasitas) * 100)) : 0;
  const color =
    pct >= 90 ? "bg-red-500" : pct >= 70 ? "bg-amber-500" : "bg-emerald-500";

  return (
    <div className="w-28">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-semibold text-slate-700">
          {terisi}
          <span className="text-slate-400 font-normal">/{kapasitas}</span>
        </span>
        <span
          className={`text-[10px] font-bold ${pct >= 90 ? "text-red-600" : pct >= 70 ? "text-amber-600" : "text-emerald-600"}`}
        >
          {pct}%
        </span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

// ─── Row Actions ────────────────────────────────────────────────
const RowActions = ({ item, onDelete, deleting }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-20 w-36 bg-white rounded-xl shadow-lg border border-slate-100 py-1">
            <button
              onClick={() => setOpen(false)}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
            >
              <Edit2 className="w-3.5 h-3.5 text-indigo-500" /> Edit
            </button>
            <button
              onClick={() => {
                setOpen(false);
                onDelete(item.id);
              }}
              disabled={deleting}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" /> {deleting ? "..." : "Hapus"}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

// ─── Tingkat Pills ──────────────────────────────────────────────
const TINGKAT = ["X", "XI", "XII"];

// ─── Main Component ─────────────────────────────────────────────
const KelasPage = () => {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [filterTingkat, setFilterTingkat] = useState("");
  const [page, setPage] = useState(1);

  const handleSearch = (e) => {
    const v = e.target.value;
    setSearch(v);
    setPage(1);
    clearTimeout(window._kelasST);
    window._kelasST = setTimeout(() => setDebounced(v), 400);
  };

  const params = {
    per_page: 15,
    page,
    search: debounced || undefined,
    tingkat: filterTingkat || undefined,
  };

  const { data, isLoading, isError, error, isFetching, refetch } = useQuery({
    queryKey: queryKeys.kelas.list(params),
    queryFn: () => fetchKelas(params),
    placeholderData: (p) => p,
  });

  const list = data?.data ?? [];
  const meta = data?.meta ?? null;

  const deleteMut = useMutation({
    mutationFn: deleteKelas,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.kelas.all }),
  });

  const handleDelete = (id) => {
    if (!window.confirm("Hapus kelas ini?")) return;
    deleteMut.mutate(id);
  };

  // Summary counts
  const totalSiswa = list.reduce(
    (a, k) => a + (k.siswas?.length ?? k.siswas_count ?? 0),
    0,
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        {/* Header */}
        <PageHeader
          icon={School}
          title="Data Kelas"
          subtitle="Manajemen kelas dan kapasitas siswa"
        >
          {!isLoading && meta && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-100">
                <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                <span className="text-xs font-semibold text-indigo-600">
                  {meta.total} kelas
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-100">
                <Users className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-xs font-semibold text-emerald-600">
                  {totalSiswa} siswa
                </span>
              </div>
            </div>
          )}
        </PageHeader>

        {/* Main Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Action Bar */}
          <div className="px-5 py-4 border-b border-slate-100">
            <ActionBar
              onRefresh={refetch}
              loading={isFetching}
              left={
                <>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Cari nama kelas..."
                      value={search}
                      onChange={handleSearch}
                      className="w-56 pl-9 pr-8 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder:text-slate-400 transition-all"
                    />
                    {search && (
                      <button
                        onClick={() => {
                          setSearch("");
                          setDebounced("");
                          setPage(1);
                        }}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  {/* Tingkat pills */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        setFilterTingkat("");
                        setPage(1);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${!filterTingkat ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-500 border-slate-200 hover:border-indigo-300"}`}
                    >
                      Semua
                    </button>
                    {TINGKAT.map((t) => (
                      <button
                        key={t}
                        onClick={() => {
                          setFilterTingkat(t === filterTingkat ? "" : t);
                          setPage(1);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${filterTingkat === t ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-500 border-slate-200 hover:border-indigo-300"}`}
                      >
                        Kelas {t}
                      </button>
                    ))}
                  </div>
                </>
              }
              right={
                <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm shadow-indigo-100">
                  <Plus className="w-3.5 h-3.5" /> Tambah Kelas
                </button>
              }
            />
          </div>

          {isFetching && !isLoading && (
            <div className="h-0.5 bg-indigo-500 animate-pulse" />
          )}

          {isError && (
            <div className="mx-5 my-4 flex items-center gap-3 p-3.5 bg-red-50 border border-red-100 rounded-lg text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>
                {error?.response?.data?.message ?? "Gagal memuat data kelas."}
              </span>
            </div>
          )}

          {/* Delete error */}
          {deleteMut.isError && (
            <div className="mx-5 my-2 flex items-center gap-3 p-3 bg-red-50 border border-red-100 rounded-lg text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>
                {deleteMut.error?.response?.data?.message ??
                  "Gagal menghapus kelas."}
              </span>
              <button onClick={() => deleteMut.reset()} className="ml-auto">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  {[
                    "#",
                    "NAMA KELAS",
                    "TINGKAT",
                    "WALI KELAS",
                    "KAPASITAS",
                    "TAHUN AJARAN",
                    "STATUS",
                    "",
                  ].map((h, i) => (
                    <th
                      key={i}
                      className="px-5 py-3 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {isLoading &&
                  [...Array(5)].map((_, i) => (
                    <TableSkeletonRow key={i} cols={8} />
                  ))}

                {!isLoading &&
                  !isError &&
                  list.map((kelas, idx) => {
                    const terisi =
                      kelas.siswas?.length ?? kelas.siswas_count ?? 0;
                    return (
                      <tr
                        key={kelas.id}
                        className="hover:bg-slate-50/80 transition-colors"
                      >
                        <td className="px-5 py-4 text-xs text-slate-400 font-medium">
                          {(page - 1) * 15 + idx + 1}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                              <School className="w-4 h-4 text-indigo-500" />
                            </div>
                            <span className="font-semibold text-slate-800">
                              {kelas.nama_kelas}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md text-xs font-bold">
                            Kelas {kelas.tingkat}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-slate-600 text-sm">
                          {kelas.wali_kelas?.nama ?? (
                            <span className="text-slate-300 italic text-xs">
                              Belum ditentukan
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <KapasitasBar
                            terisi={terisi}
                            kapasitas={kelas.kapasitas}
                          />
                        </td>
                        <td className="px-5 py-4 text-slate-500 text-xs">
                          {kelas.tahun_ajaran}
                        </td>
                        <td className="px-5 py-4">
                          <StatusBadge status={kelas.status} dot />
                        </td>
                        <td className="px-5 py-4">
                          <RowActions
                            item={kelas}
                            onDelete={handleDelete}
                            deleting={
                              deleteMut.isPending &&
                              deleteMut.variables === kelas.id
                            }
                          />
                        </td>
                      </tr>
                    );
                  })}

                {!isLoading && !isError && list.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-0">
                      <EmptyState
                        type="empty"
                        title="Tidak Ada Kelas"
                        message={
                          debounced
                            ? `Tidak ada kelas "${debounced}"`
                            : filterTingkat
                              ? `Tidak ada kelas tingkat ${filterTingkat}`
                              : "Belum ada data kelas."
                        }
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {meta && meta.last_page > 1 && (
            <div className="px-5 py-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>
                Menampilkan{" "}
                <span className="font-semibold text-slate-700">
                  {list.length}
                </span>{" "}
                dari{" "}
                <span className="font-semibold text-slate-700">
                  {meta.total}
                </span>{" "}
                kelas
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1 || isFetching}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 font-medium"
                >
                  ← Prev
                </button>
                <span className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg font-semibold">
                  {page}/{meta.last_page}
                </span>
                <button
                  onClick={() =>
                    setPage((p) => Math.min(meta.last_page, p + 1))
                  }
                  disabled={page === meta.last_page || isFetching}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 font-medium"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KelasPage;
