// src/features/guru/pages/GuruPage.jsx
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  GraduationCap,
  Search,
  Plus,
  X,
  AlertCircle,
  MoreHorizontal,
  Edit2,
  Trash2,
  Phone,
  Mail,
  User,
} from "lucide-react";
import api from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import PageHeader from "@/shared/components/ui/PageHeader";
import ActionBar from "@/shared/components/ui/ActionBar";
import EmptyState from "@/shared/components/ui/EmptyState";
import StatusBadge from "@/shared/components/ui/StatusBadge";
import { TableSkeletonRow } from "@/shared/components/ui/SkeletonLoader";

// ─── Query fns ──────────────────────────────────────────────────
const fetchGuru = (p) => api.get("/guru", { params: p }).then((r) => r.data);
const deleteGuru = (id) => api.delete(`/guru/${id}`).then((r) => r.data);

// ─── Nama + Gelar parser ─────────────────────────────────────────
// Input: "Dr. Budi Santoso, M.Pd." → nama: "Budi Santoso", gelar: ["Dr.", "M.Pd."]
// Input: "Siti Rahma S.Pd" → nama: "Siti Rahma", gelar: ["S.Pd"]
const parseNamaGelar = (namaLengkap = "") => {
  // Gelar depan: Dr. / Drs. / Prof. / Ir.
  const gelarDepanRe = /^(Prof\.|Dr\.|Drs\.|Drh\.|Ir\.)\s*/i;
  // Gelar belakang: S.Pd / M.Pd / M.Si / Ph.D / dll
  const gelarBelakangRe =
    /,?\s*(S\.[A-Za-z.]+|M\.[A-Za-z.]+|Ph\.D\.?|S\.T|M\.T|S\.Kom|M\.Kom|S\.Ag|M\.Ag)\.?$/gi;

  let nama = namaLengkap.trim();
  const gelar = [];

  const depanMatch = nama.match(gelarDepanRe);
  if (depanMatch) {
    gelar.unshift(depanMatch[1]);
    nama = nama.replace(gelarDepanRe, "").trim();
  }

  let belakang;
  const re2 = new RegExp(gelarBelakangRe.source, "gi");
  while ((belakang = re2.exec(nama)) !== null) {
    gelar.push(belakang[1]);
  }
  nama = nama
    .replace(new RegExp(gelarBelakangRe.source, "gi"), "")
    .replace(/,\s*$/, "")
    .trim();

  return { nama: nama || namaLengkap, gelar };
};

// ─── Avatar Guru ─────────────────────────────────────────────────
const AVATAR_COLORS = [
  "bg-violet-100 text-violet-700",
  "bg-teal-100 text-teal-700",
  "bg-rose-100 text-rose-700",
  "bg-amber-100 text-amber-700",
  "bg-cyan-100 text-cyan-700",
  "bg-indigo-100 text-indigo-700",
];
const avatarColor = (n = "") =>
  AVATAR_COLORS[n.charCodeAt(0) % AVATAR_COLORS.length];

// ─── Row Actions ─────────────────────────────────────────────────
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

// ─── Main ────────────────────────────────────────────────────────
const GuruPage = () => {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [page, setPage] = useState(1);

  const handleSearch = (e) => {
    const v = e.target.value;
    setSearch(v);
    setPage(1);
    clearTimeout(window._guruST);
    window._guruST = setTimeout(() => setDebounced(v), 400);
  };

  const params = {
    per_page: 15,
    page,
    search: debounced || undefined,
    status: filterStatus || undefined,
  };

  const { data, isLoading, isError, error, isFetching, refetch } = useQuery({
    queryKey: queryKeys.guru.list(params),
    queryFn: () => fetchGuru(params),
    placeholderData: (p) => p,
  });

  const list = data?.data ?? [];
  const meta = data?.meta ?? null;

  const deleteMut = useMutation({
    mutationFn: deleteGuru,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.guru.all }),
  });

  const handleDelete = (id) => {
    if (!window.confirm("Hapus data guru ini?")) return;
    deleteMut.mutate(id);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        <PageHeader
          icon={GraduationCap}
          title="Data Guru"
          subtitle="Kelola tenaga pengajar dan staf akademik"
        >
          {!isLoading && meta && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-100">
              <GraduationCap className="w-3.5 h-3.5 text-indigo-500" />
              <span className="text-xs font-semibold text-indigo-600">
                {meta.total} guru
              </span>
            </div>
          )}
        </PageHeader>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
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
                      placeholder="Cari nama, NIP, email..."
                      value={search}
                      onChange={handleSearch}
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
                  </select>
                </>
              }
              right={
                <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm shadow-indigo-100">
                  <Plus className="w-3.5 h-3.5" /> Tambah Guru
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
                {error?.response?.data?.message ?? "Gagal memuat data guru."}
              </span>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  {[
                    "#",
                    "GURU",
                    "NIP",
                    "KONTAK",
                    "PENDIDIKAN",
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
                    <TableSkeletonRow key={i} cols={7} />
                  ))}

                {!isLoading &&
                  !isError &&
                  list.map((guru, idx) => {
                    const { nama, gelar } = parseNamaGelar(guru.nama);
                    return (
                      <tr
                        key={guru.id}
                        className="hover:bg-slate-50/80 transition-colors"
                      >
                        <td className="px-5 py-4 text-xs text-slate-400 font-medium">
                          {(page - 1) * 15 + idx + 1}
                        </td>

                        {/* ── Nama + Gelar ── */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${avatarColor(nama)}`}
                            >
                              {nama.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-slate-800 leading-tight">
                                {nama}
                              </p>
                              {gelar.length > 0 && (
                                <div className="flex gap-1 mt-0.5 flex-wrap">
                                  {gelar.map((g, i) => (
                                    <span
                                      key={i}
                                      className="text-[10px] font-medium text-slate-400 bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded"
                                    >
                                      {g}
                                    </span>
                                  ))}
                                </div>
                              )}
                              <p className="text-xs text-slate-400 mt-0.5">
                                {guru.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* NIP */}
                        <td className="px-5 py-4">
                          <span className="font-mono text-xs text-slate-500 bg-slate-50 border border-slate-100 px-2 py-1 rounded-md">
                            {guru.nip ?? (
                              <span className="text-slate-300 italic">—</span>
                            )}
                          </span>
                        </td>

                        {/* Kontak */}
                        <td className="px-5 py-4">
                          <div className="space-y-1">
                            {guru.telepon && (
                              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                <Phone className="w-3 h-3 text-slate-300" />
                                {guru.telepon}
                              </div>
                            )}
                            {guru.email && (
                              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                <Mail className="w-3 h-3 text-slate-300" />
                                <span className="truncate max-w-[140px]">
                                  {guru.email}
                                </span>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Pendidikan */}
                        <td className="px-5 py-4">
                          <span className="text-xs font-medium text-slate-600 bg-slate-50 border border-slate-100 px-2 py-1 rounded-md">
                            {guru.pendidikan_terakhir ?? "—"}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <StatusBadge status={guru.status} dot />
                        </td>
                        <td className="px-5 py-4">
                          <RowActions
                            item={guru}
                            onDelete={handleDelete}
                            deleting={
                              deleteMut.isPending &&
                              deleteMut.variables === guru.id
                            }
                          />
                        </td>
                      </tr>
                    );
                  })}

                {!isLoading && !isError && list.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-0">
                      <EmptyState
                        type="empty"
                        title="Tidak Ada Guru"
                        message={
                          debounced
                            ? `Tidak ada guru "${debounced}"`
                            : "Belum ada data guru."
                        }
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

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
                guru
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

export default GuruPage;
