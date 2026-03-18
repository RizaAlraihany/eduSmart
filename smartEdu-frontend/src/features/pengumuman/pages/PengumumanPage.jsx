// src/features/pengumuman/pages/PengumumanPage.jsx
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Megaphone,
  Search,
  Plus,
  X,
  AlertCircle,
  Calendar,
  Tag,
  Eye,
  MoreHorizontal,
  Edit2,
  Trash2,
  Pin,
  Bell,
} from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/shared/hooks/useAuth";
import PageHeader from "@/shared/components/ui/PageHeader";
import ActionBar from "@/shared/components/ui/ActionBar";
import EmptyState from "@/shared/components/ui/EmptyState";
import { TableSkeletonRow } from "@/shared/components/ui/SkeletonLoader";

// ─── Query fns ─────────────────────────────────────────────────
const fetchPengumuman = (p) =>
  api.get("/pengumuman", { params: p }).then((r) => r.data);
const deletePengumuman = (id) =>
  api.delete(`/pengumuman/${id}`).then((r) => r.data);

// ─── Date format ──────────────────────────────────────────────
const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

const isNew = (d) => {
  if (!d) return false;
  const diff = (new Date() - new Date(d)) / (1000 * 60 * 60 * 24);
  return diff <= 3;
};

// ─── Target Badge ─────────────────────────────────────────────
const TARGET_CFG = {
  semua: { label: "Semua", bg: "bg-slate-100 text-slate-600 border-slate-200" },
  siswa: { label: "Siswa", bg: "bg-blue-50 text-blue-700 border-blue-200" },
  guru: { label: "Guru", bg: "bg-violet-50 text-violet-700 border-violet-200" },
  admin: { label: "Admin", bg: "bg-amber-50 text-amber-700 border-amber-200" },
};

const TargetBadge = ({ target }) => {
  const cfg = TARGET_CFG[target?.toLowerCase()] ?? TARGET_CFG.semua;
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.bg}`}
    >
      {cfg.label}
    </span>
  );
};

// ─── Status Badge ─────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    aktif: "bg-emerald-50 text-emerald-700 border-emerald-200",
    nonaktif: "bg-slate-100 text-slate-500 border-slate-200",
    draft: "bg-amber-50 text-amber-700 border-amber-200",
  };
  return (
    <span
      className={`px-2.5 py-1 rounded-full text-xs font-semibold border capitalize ${map[status?.toLowerCase()] ?? "bg-slate-100 text-slate-500 border-slate-200"}`}
    >
      {status}
    </span>
  );
};

// ─── Row Actions ──────────────────────────────────────────────
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
          <div className="absolute right-0 top-full mt-1 z-20 w-40 bg-white rounded-xl shadow-lg border border-slate-100 py-1">
            <button
              onClick={() => setOpen(false)}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
            >
              <Eye className="w-3.5 h-3.5 text-indigo-400" /> Lihat Detail
            </button>
            <button
              onClick={() => setOpen(false)}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
            >
              <Edit2 className="w-3.5 h-3.5 text-indigo-400" /> Edit
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

// ─── Main Component ───────────────────────────────────────────
const PengumumanPage = () => {
  const { isAdmin, isGuru } = useAuth();
  const canManage = isAdmin || isGuru;
  const qc = useQueryClient();

  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [filterTarget, setFilterTarget] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [page, setPage] = useState(1);

  const handleSearch = (e) => {
    const v = e.target.value;
    setSearch(v);
    setPage(1);
    clearTimeout(window._pengumST);
    window._pengumST = setTimeout(() => setDebounced(v), 400);
  };

  const params = {
    per_page: 15,
    page,
    search: debounced || undefined,
    target: filterTarget || undefined,
    status: filterStatus || undefined,
  };

  const { data, isLoading, isError, error, isFetching, refetch } = useQuery({
    queryKey: ["pengumuman", "list", params],
    queryFn: () => fetchPengumuman(params),
    placeholderData: (p) => p,
  });

  const list = data?.data ?? [];
  const meta = data?.meta ?? null;

  const deleteMut = useMutation({
    mutationFn: deletePengumuman,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pengumuman"] }),
  });

  const TARGET_FILTERS = [
    { value: "", label: "Semua Target" },
    { value: "semua", label: "Semua" },
    { value: "siswa", label: "Siswa" },
    { value: "guru", label: "Guru" },
    { value: "admin", label: "Admin" },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        <PageHeader
          icon={Megaphone}
          title="Pengumuman"
          subtitle="Kelola informasi dan pemberitahuan untuk seluruh pengguna"
        >
          {!isLoading && meta && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-100">
              <Bell className="w-3.5 h-3.5 text-indigo-500" />
              <span className="text-xs font-semibold text-indigo-600">
                {meta.total} pengumuman
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
                      placeholder="Cari judul pengumuman..."
                      value={search}
                      onChange={handleSearch}
                      className="w-64 pl-9 pr-8 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder:text-slate-400 transition-all"
                    />
                    {search && (
                      <button
                        onClick={() => {
                          setSearch("");
                          setDebounced("");
                        }}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <select
                    value={filterTarget}
                    onChange={(e) => {
                      setFilterTarget(e.target.value);
                      setPage(1);
                    }}
                    className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-600"
                  >
                    {TARGET_FILTERS.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
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
                canManage && (
                  <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm shadow-indigo-100">
                    <Plus className="w-3.5 h-3.5" /> Buat Pengumuman
                  </button>
                )
              }
            />
          </div>

          {isFetching && !isLoading && (
            <div className="h-0.5 bg-indigo-500 animate-pulse" />
          )}
          {isError && (
            <div className="mx-5 my-4 flex items-center gap-3 p-3.5 bg-red-50 border border-red-100 rounded-lg text-red-700 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>
                {error?.response?.data?.message ?? "Gagal memuat pengumuman."}
              </span>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  {[
                    "#",
                    "JUDUL",
                    "DIBUAT OLEH",
                    "TARGET",
                    "TGL TERBIT",
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
                  list.map((p, idx) => (
                    <tr
                      key={p.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="px-5 py-4 text-xs text-slate-400">
                        {(page - 1) * 15 + idx + 1}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-start gap-2 max-w-xs">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-0.5">
                              {p.is_pinned && (
                                <Pin className="w-3 h-3 text-amber-500 flex-shrink-0" />
                              )}
                              <p className="font-semibold text-slate-800 leading-snug line-clamp-1">
                                {p.judul}
                              </p>
                              {isNew(p.created_at) && (
                                <span className="flex-shrink-0 text-[10px] font-bold text-white bg-indigo-500 px-1.5 py-0.5 rounded-full">
                                  NEW
                                </span>
                              )}
                            </div>
                            {p.isi && (
                              <p className="text-xs text-slate-400 line-clamp-1">
                                {p.isi}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-xs">
                          <p className="font-medium text-slate-700">
                            {p.user?.name ?? p.dibuat_oleh ?? "—"}
                          </p>
                          <p className="text-slate-400 capitalize">
                            {p.user?.role ?? ""}
                          </p>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <TargetBadge target={p.target} />
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <Calendar className="w-3 h-3 text-slate-300" />
                          {fmtDate(p.tanggal_terbit ?? p.created_at)}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={p.status} />
                      </td>
                      <td className="px-5 py-4">
                        {canManage && (
                          <RowActions
                            item={p}
                            onDelete={(id) => {
                              if (window.confirm("Hapus pengumuman ini?"))
                                deleteMut.mutate(id);
                            }}
                            deleting={
                              deleteMut.isPending &&
                              deleteMut.variables === p.id
                            }
                          />
                        )}
                      </td>
                    </tr>
                  ))}

                {!isLoading && !isError && list.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-0">
                      <EmptyState
                        type="empty"
                        title="Tidak Ada Pengumuman"
                        message={
                          debounced
                            ? `Tidak ada pengumuman "${debounced}"`
                            : "Belum ada pengumuman yang diterbitkan."
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
                pengumuman
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

export default PengumumanPage;
