// src/features/siswa/pages/SiswaPage.jsx
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Users,
  Search,
  Plus,
  X,
  AlertCircle,
  RefreshCw,
  UserPlus,
  GraduationCap,
  Phone,
  Calendar,
  MoreHorizontal,
  Edit2,
  Trash2,
} from "lucide-react";
import api from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import ClassHierarchyFilter from "@/shared/components/ui/ClassHierarchyFilter";
import PageHeader from "@/shared/components/ui/PageHeader";
import ActionBar from "@/shared/components/ui/ActionBar";
import EmptyState from "@/shared/components/ui/EmptyState";
import StatusBadge from "@/shared/components/ui/StatusBadge";
import { TableSkeletonRow } from "@/shared/components/ui/SkeletonLoader";

// ─── Query Functions ────────────────────────────────────────────
const fetchSiswa = (params) =>
  api.get("/siswa", { params }).then((r) => r.data);

const deleteSiswa = (id) => api.delete(`/siswa/${id}`).then((r) => r.data);

// ─── Avatar Siswa (initial) ─────────────────────────────────────
const AVATAR_COLORS = [
  "bg-violet-100 text-violet-700",
  "bg-blue-100 text-blue-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-cyan-100 text-cyan-700",
  "bg-indigo-100 text-indigo-700",
];

const getAvatarColor = (name = "") => {
  const idx = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
};

const SiswaAvatar = ({ nama }) => (
  <div
    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${getAvatarColor(nama)}`}
  >
    {nama?.charAt(0).toUpperCase() ?? "?"}
  </div>
);

// ─── Row Actions Dropdown ───────────────────────────────────────
const RowActions = ({ siswa, onEdit, onDelete, deleting }) => {
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
          {/* backdrop */}
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-20 w-36 bg-white rounded-xl shadow-lg border border-slate-100 py-1 overflow-hidden">
            <button
              onClick={() => {
                setOpen(false);
                onEdit?.(siswa);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5 text-indigo-500" />
              Edit
            </button>
            <button
              onClick={() => {
                setOpen(false);
                onDelete(siswa.id);
              }}
              disabled={deleting}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              {deleting ? "Menghapus..." : "Hapus"}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

// ─── Table Columns Config ────────────────────────────────────────
const TABLE_HEADERS = [
  { label: "#", width: "w-10" },
  { label: "SISWA", width: "min-w-[200px]" },
  { label: "NISN", width: "w-32" },
  { label: "KELAS", width: "w-28" },
  { label: "JK", width: "w-16" },
  { label: "TGL LAHIR", width: "w-32" },
  { label: "STATUS", width: "w-24" },
  { label: "", width: "w-12" },
];

// ─── Main Component ──────────────────────────────────────────────
const SiswaPage = () => {
  const queryClient = useQueryClient();

  // Filter bertingkat
  const [filter, setFilter] = useState({
    jurusan: null,
    tingkat: null,
    kelas_id: null,
  });

  // Filter tambahan
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebounced] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [page, setPage] = useState(1);

  const isFilterComplete = !!(
    filter.jurusan &&
    filter.tingkat &&
    filter.kelas_id
  );

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    setPage(1);
    clearTimeout(window._siswaSearchTimer);
    window._siswaSearchTimer = setTimeout(() => setDebounced(val), 400);
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setPage(1);
    setSearch("");
    setDebounced("");
  };

  // Hanya query jika filter lengkap
  const queryParams = isFilterComplete
    ? {
        kelas_id: filter.kelas_id,
        per_page: 15,
        page,
        search: debouncedSearch || undefined,
        status: filterStatus || undefined,
      }
    : null;

  const { data, isLoading, isError, error, isFetching, refetch } = useQuery({
    queryKey: queryKeys.siswa.list(queryParams ?? {}),
    queryFn: () => fetchSiswa(queryParams),
    enabled: isFilterComplete,
    placeholderData: (prev) => prev,
  });

  const list = data?.data ?? [];
  const meta = data?.meta ?? null;

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteSiswa,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.siswa.all }),
  });

  const handleDelete = (id) => {
    if (
      !window.confirm("Hapus data siswa ini? Tindakan tidak bisa dibatalkan.")
    )
      return;
    deleteMutation.mutate(id);
  };

  const errorMessage =
    error?.response?.data?.message ??
    "Gagal memuat data siswa. Periksa koneksi ke server.";

  // ─── Render ────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        {/* ── Page Header ── */}
        <PageHeader
          icon={Users}
          title="Data Siswa"
          subtitle="Kelola data siswa berdasarkan kelas dan jurusan"
        >
          {/* Summary count */}
          {isFilterComplete && !isLoading && meta && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-100">
              <GraduationCap className="w-3.5 h-3.5 text-indigo-500" />
              <span className="text-xs font-semibold text-indigo-600">
                {meta.total} siswa
              </span>
            </div>
          )}
        </PageHeader>

        {/* ── Class Hierarchy Filter ── */}
        <ClassHierarchyFilter value={filter} onChange={handleFilterChange} />

        {/* ── Content Area (hanya tampil jika filter lengkap) ── */}
        {!isFilterComplete ? (
          <EmptyState
            type="filter"
            title="Pilih Filter Kelas"
            message="Pilih Jurusan, Tingkat, dan Kelas di atas untuk menampilkan daftar siswa."
          />
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {/* ── Action Bar ── */}
            <div className="px-5 py-4 border-b border-slate-100">
              <ActionBar
                onRefresh={() => refetch()}
                loading={isFetching}
                left={
                  <>
                    {/* Search */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Cari nama, NISN, NIK..."
                        value={search}
                        onChange={handleSearchChange}
                        className="w-64 pl-9 pr-8 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder:text-slate-400 transition-all"
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

                    {/* Filter Status */}
                    <select
                      value={filterStatus}
                      onChange={(e) => {
                        setFilterStatus(e.target.value);
                        setPage(1);
                      }}
                      className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-600"
                    >
                      <option value="">Semua Status</option>
                      <option value="aktif">Aktif</option>
                      <option value="nonaktif">Nonaktif</option>
                      <option value="lulus">Lulus</option>
                      <option value="pindah">Pindah</option>
                    </select>
                  </>
                }
                right={
                  <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm shadow-indigo-100">
                    <UserPlus className="w-3.5 h-3.5" />
                    Tambah Siswa
                  </button>
                }
              />
            </div>

            {/* ── Fetch Progress Bar ── */}
            {isFetching && !isLoading && (
              <div className="h-0.5 bg-indigo-500 animate-pulse" />
            )}

            {/* ── Error State ── */}
            {isError && (
              <div className="mx-5 my-4 flex items-center gap-3 p-3.5 bg-red-50 border border-red-100 rounded-lg text-red-700 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
                <button
                  onClick={() => refetch()}
                  className="ml-auto flex items-center gap-1 text-xs underline opacity-70 hover:opacity-100"
                >
                  <RefreshCw className="w-3 h-3" /> Coba lagi
                </button>
              </div>
            )}

            {/* ── Table ── */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    {TABLE_HEADERS.map((h, i) => (
                      <th
                        key={i}
                        className={`${h.width} px-5 py-3 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider`}
                      >
                        {h.label}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-50">
                  {/* ── Skeleton ── */}
                  {isLoading &&
                    [...Array(6)].map((_, i) => (
                      <TableSkeletonRow key={i} cols={8} />
                    ))}

                  {/* ── Data Rows ── */}
                  {!isLoading &&
                    !isError &&
                    list.map((siswa, idx) => (
                      <tr
                        key={siswa.id}
                        className="hover:bg-slate-50/80 transition-colors group"
                      >
                        {/* No */}
                        <td className="px-5 py-3.5 text-xs text-slate-400 font-medium">
                          {(page - 1) * 15 + idx + 1}
                        </td>

                        {/* Nama + Email */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <SiswaAvatar nama={siswa.nama} />
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-800 truncate leading-tight">
                                {siswa.nama}
                              </p>
                              <p className="text-xs text-slate-400 truncate mt-0.5">
                                {siswa.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* NISN */}
                        <td className="px-5 py-3.5">
                          <span className="font-mono text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                            {siswa.nisn}
                          </span>
                        </td>

                        {/* Kelas */}
                        <td className="px-5 py-3.5">
                          <span className="text-xs font-medium text-slate-700 bg-indigo-50 border border-indigo-100 px-2 py-1 rounded-md">
                            {siswa.kelas?.nama_kelas ?? "—"}
                          </span>
                        </td>

                        {/* Jenis Kelamin */}
                        <td className="px-5 py-3.5">
                          <span
                            className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                              siswa.jenis_kelamin === "L"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-pink-100 text-pink-700"
                            }`}
                          >
                            {siswa.jenis_kelamin}
                          </span>
                        </td>

                        {/* Tgl Lahir */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <Calendar className="w-3 h-3 text-slate-300" />
                            {siswa.tanggal_lahir
                              ? new Date(
                                  siswa.tanggal_lahir,
                                ).toLocaleDateString("id-ID", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })
                              : "—"}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-5 py-3.5">
                          <StatusBadge status={siswa.status} dot />
                        </td>

                        {/* Aksi */}
                        <td className="px-5 py-3.5">
                          <RowActions
                            siswa={siswa}
                            onEdit={(s) => console.log("Edit", s)} // TODO: open modal
                            onDelete={handleDelete}
                            deleting={
                              deleteMutation.isPending &&
                              deleteMutation.variables === siswa.id
                            }
                          />
                        </td>
                      </tr>
                    ))}

                  {/* ── Empty (filter lengkap tapi data kosong) ── */}
                  {!isLoading && !isError && list.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-0">
                        <EmptyState
                          type="empty"
                          title="Tidak Ada Siswa"
                          message={
                            debouncedSearch
                              ? `Tidak ada siswa dengan kata kunci "${debouncedSearch}"`
                              : "Belum ada data siswa di kelas ini."
                          }
                          action={
                            debouncedSearch && (
                              <button
                                onClick={() => {
                                  setSearch("");
                                  setDebounced("");
                                }}
                                className="text-xs text-indigo-600 hover:underline"
                              >
                                Hapus pencarian
                              </button>
                            )
                          }
                        />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* ── Pagination ── */}
            {meta && meta.last_page > 1 && (
              <div className="px-5 py-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>
                  Menampilkan{" "}
                  <span className="font-semibold text-slate-700">
                    {(page - 1) * 15 + 1}–{Math.min(page * 15, meta.total)}
                  </span>{" "}
                  dari{" "}
                  <span className="font-semibold text-slate-700">
                    {meta.total}
                  </span>{" "}
                  siswa
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1 || isFetching}
                    className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 transition-colors font-medium"
                  >
                    ← Prev
                  </button>
                  {/* Page numbers */}
                  {Array.from(
                    { length: Math.min(5, meta.last_page) },
                    (_, i) => {
                      let p;
                      if (meta.last_page <= 5) {
                        p = i + 1;
                      } else if (page <= 3) {
                        p = i + 1;
                      } else if (page >= meta.last_page - 2) {
                        p = meta.last_page - 4 + i;
                      } else {
                        p = page - 2 + i;
                      }
                      return (
                        <button
                          key={p}
                          onClick={() => setPage(p)}
                          disabled={isFetching}
                          className={`w-8 h-8 rounded-lg font-medium transition-colors ${
                            p === page
                              ? "bg-indigo-600 text-white shadow-sm"
                              : "hover:bg-slate-50 text-slate-600"
                          }`}
                        >
                          {p}
                        </button>
                      );
                    },
                  )}
                  <button
                    onClick={() =>
                      setPage((p) => Math.min(meta.last_page, p + 1))
                    }
                    disabled={page === meta.last_page || isFetching}
                    className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 transition-colors font-medium"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SiswaPage;
