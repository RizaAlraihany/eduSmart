// src/features/mata-pelajaran/pages/MataPelajaranPage.jsx
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  BookOpen,
  Search,
  Plus,
  X,
  AlertCircle,
  MoreHorizontal,
  Edit2,
  Trash2,
  Target,
} from "lucide-react";
import api from "@/lib/api";
import PageHeader from "@/shared/components/ui/PageHeader";
import ActionBar from "@/shared/components/ui/ActionBar";
import EmptyState from "@/shared/components/ui/EmptyState";
import StatusBadge from "@/shared/components/ui/StatusBadge";
import { TableSkeletonRow } from "@/shared/components/ui/SkeletonLoader";

const fetchMapel = (p) =>
  api.get("/mata-pelajaran", { params: p }).then((r) => r.data);
const deleteMapel = (id) =>
  api.delete(`/mata-pelajaran/${id}`).then((r) => r.data);

// ─── KKM Badge ──────────────────────────────────────────────────
const KkmBadge = ({ kkm }) => {
  const color =
    kkm >= 80
      ? "bg-red-50 text-red-700 border-red-200"
      : kkm >= 75
        ? "bg-amber-50 text-amber-700 border-amber-200"
        : "bg-emerald-50 text-emerald-700 border-emerald-200";
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${color}`}
    >
      <Target className="w-3 h-3" /> KKM {kkm}
    </span>
  );
};

// ─── Row Actions ─────────────────────────────────────────────────
const RowActions = ({ item, onDelete, deleting }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"
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

// ─── Tabs Tingkat ────────────────────────────────────────────────
// Mapel di-filter berdasarkan nama kode yang mengandung tingkat (opsional)
// Karena schema tidak ada kolom tingkat di mata_pelajarans, tabs ini sebagai UI grouping saja
const TINGKAT_TABS = [
  { value: "", label: "Semua" },
  { value: "X", label: "Kelas X" },
  { value: "XI", label: "Kelas XI" },
  { value: "XII", label: "Kelas XII" },
];

// ─── Main ────────────────────────────────────────────────────────
const MataPelajaranPage = () => {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [activeTab, setActiveTab] = useState("");
  const [page, setPage] = useState(1);

  const handleSearch = (e) => {
    const v = e.target.value;
    setSearch(v);
    setPage(1);
    clearTimeout(window._mapelST);
    window._mapelST = setTimeout(() => setDebounced(v), 400);
  };

  const params = {
    per_page: 20,
    page,
    search: debounced || undefined,
    status: "aktif",
  };

  const { data, isLoading, isError, error, isFetching, refetch } = useQuery({
    queryKey: ["mata-pelajaran", "list", params],
    queryFn: () => fetchMapel(params),
    placeholderData: (p) => p,
  });

  const allList = data?.data ?? [];
  const meta = data?.meta ?? null;

  // Client-side filter by tingkat (karena API tidak ada filter tingkat)
  const list = activeTab
    ? allList.filter((m) => m.tingkat === activeTab || !m.tingkat)
    : allList;

  const deleteMut = useMutation({
    mutationFn: deleteMapel,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["mata-pelajaran"] }),
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        <PageHeader
          icon={BookOpen}
          title="Mata Pelajaran"
          subtitle="Daftar mata pelajaran dan standar KKM"
        >
          {!isLoading && meta && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-50 border border-purple-100">
              <BookOpen className="w-3.5 h-3.5 text-purple-500" />
              <span className="text-xs font-semibold text-purple-600">
                {meta.total} mapel
              </span>
            </div>
          )}
        </PageHeader>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Tabs Tingkat */}
          <div className="px-5 pt-4 flex items-center gap-1 border-b border-slate-100 pb-0">
            {TINGKAT_TABS.map((t) => (
              <button
                key={t.value}
                onClick={() => {
                  setActiveTab(t.value);
                  setPage(1);
                }}
                className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all -mb-px ${
                  activeTab === t.value
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="px-5 py-4 border-b border-slate-50">
            <ActionBar
              onRefresh={refetch}
              loading={isFetching}
              left={
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari nama atau kode mapel..."
                    value={search}
                    onChange={handleSearch}
                    className="w-72 pl-9 pr-8 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder:text-slate-400 transition-all"
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
              }
              right={
                <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm shadow-indigo-100">
                  <Plus className="w-3.5 h-3.5" /> Tambah Mapel
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
                {error?.response?.data?.message ?? "Gagal memuat data."}
              </span>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  {[
                    "#",
                    "KODE",
                    "MATA PELAJARAN",
                    "DESKRIPSI",
                    "KKM",
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
                  [...Array(6)].map((_, i) => (
                    <TableSkeletonRow key={i} cols={7} />
                  ))}

                {!isLoading &&
                  !isError &&
                  list.map((m, idx) => (
                    <tr
                      key={m.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="px-5 py-4 text-xs text-slate-400">
                        {(page - 1) * 20 + idx + 1}
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-mono text-xs font-bold text-purple-700 bg-purple-50 border border-purple-100 px-2.5 py-1 rounded-md">
                          {m.kode_mapel}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                            <BookOpen className="w-4 h-4 text-indigo-400" />
                          </div>
                          <span className="font-semibold text-slate-800">
                            {m.nama_mapel}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-500 text-xs max-w-xs">
                        <p className="truncate">
                          {m.deskripsi ?? (
                            <span className="italic text-slate-300">
                              Tidak ada deskripsi
                            </span>
                          )}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <KkmBadge kkm={m.kkm ?? 75} />
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={m.status} dot />
                      </td>
                      <td className="px-5 py-4">
                        <RowActions
                          item={m}
                          onDelete={(id) => {
                            if (window.confirm("Hapus mapel ini?"))
                              deleteMut.mutate(id);
                          }}
                          deleting={
                            deleteMut.isPending && deleteMut.variables === m.id
                          }
                        />
                      </td>
                    </tr>
                  ))}

                {!isLoading && !isError && list.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-0">
                      <EmptyState
                        type="empty"
                        title="Tidak Ada Mata Pelajaran"
                        message={
                          debounced
                            ? `Tidak ada mapel "${debounced}"`
                            : "Belum ada data mata pelajaran."
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
                mata pelajaran
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

export default MataPelajaranPage;
