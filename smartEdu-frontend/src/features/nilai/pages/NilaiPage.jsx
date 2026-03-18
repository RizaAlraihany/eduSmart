// src/features/nilai/pages/NilaiPage.jsx
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, Search, Plus, X, AlertCircle, Filter } from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/shared/hooks/useAuth";
import PageHeader from "@/shared/components/ui/PageHeader";
import ActionBar from "@/shared/components/ui/ActionBar";
import EmptyState from "@/shared/components/ui/EmptyState";
import ClassHierarchyFilter from "@/shared/components/ui/ClassHierarchyFilter";
import { TableSkeletonRow } from "@/shared/components/ui/SkeletonLoader";

// ─── Query fn ─────────────────────────────────────────────────────
const fetchNilai = (p) => api.get("/nilai", { params: p }).then((r) => r.data);
const fetchMapel = () =>
  api.get("/mata-pelajaran", { params: { per_page: 100 } }).then((r) => r.data);

// ─── Kategori Nilai Tabs ──────────────────────────────────────────
const JENIS_TABS = [
  { value: "", label: "Semua", color: "indigo" },
  { value: "tugas", label: "Tugas", color: "blue" },
  { value: "harian", label: "Harian", color: "cyan" },
  { value: "pts", label: "PTS", color: "purple" },
  { value: "uts", label: "UTS", color: "violet" },
  { value: "uas", label: "UAS", color: "rose" },
  { value: "praktek", label: "Praktek", color: "orange" },
];

const TAB_ACTIVE = {
  indigo: "border-indigo-600 text-indigo-600",
  blue: "border-blue-600   text-blue-600",
  cyan: "border-cyan-600   text-cyan-600",
  purple: "border-purple-600 text-purple-600",
  violet: "border-violet-600 text-violet-600",
  rose: "border-rose-600   text-rose-600",
  orange: "border-orange-600 text-orange-600",
};

const JENIS_BADGE = {
  tugas: "bg-blue-50 text-blue-700 border-blue-200",
  harian: "bg-cyan-50 text-cyan-700 border-cyan-200",
  pts: "bg-purple-50 text-purple-700 border-purple-200",
  uts: "bg-violet-50 text-violet-700 border-violet-200",
  uas: "bg-rose-50 text-rose-700 border-rose-200",
  praktek: "bg-orange-50 text-orange-700 border-orange-200",
};

// ─── Nilai Color ──────────────────────────────────────────────────
const NilaiDisplay = ({ nilai, kkm = 75 }) => {
  const n = parseFloat(nilai ?? 0);
  const lulus = n >= kkm;
  const colorClass =
    n >= 90
      ? "text-emerald-600 bg-emerald-50 border-emerald-200"
      : n >= 80
        ? "text-blue-600 bg-blue-50 border-blue-200"
        : n >= 75
          ? "text-indigo-600 bg-indigo-50 border-indigo-200"
          : n >= 60
            ? "text-amber-600 bg-amber-50 border-amber-200"
            : "text-red-600 bg-red-50 border-red-200";

  return (
    <div className="flex items-center gap-2">
      <span
        className={`w-14 text-center py-1.5 rounded-lg text-sm font-bold border ${colorClass}`}
      >
        {n.toFixed(0)}
      </span>
      {!lulus && (
        <span className="text-[10px] font-semibold text-red-500 bg-red-50 px-1.5 py-0.5 rounded">
          Remidi
        </span>
      )}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────
const NilaiPage = () => {
  const { isAdmin, isGuru } = useAuth();

  const [filter, setFilter] = useState({
    jurusan: null,
    tingkat: null,
    kelas_id: null,
  });
  const [activeJenis, setActiveJenis] = useState("");
  const [mapelId, setMapelId] = useState("");
  const [semester, setSemester] = useState("1");
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [page, setPage] = useState(1);

  const handleSearch = (e) => {
    const v = e.target.value;
    setSearch(v);
    setPage(1);
    clearTimeout(window._nilaiST);
    window._nilaiST = setTimeout(() => setDebounced(v), 400);
  };

  const canFilter = isAdmin || isGuru;
  const isFilterReady = canFilter ? !!filter.kelas_id : true;

  // Fetch mapel untuk dropdown
  const { data: mapelData } = useQuery({
    queryKey: ["mata-pelajaran", "dropdown"],
    queryFn: fetchMapel,
    staleTime: 5 * 60 * 1000,
  });
  const mapelList = mapelData?.data ?? [];

  const params = {
    per_page: 20,
    page,
    kelas_id: filter.kelas_id || undefined,
    jenis_nilai: activeJenis || undefined,
    mata_pelajaran_id: mapelId || undefined,
    semester,
    search: debounced || undefined,
  };

  const { data, isLoading, isError, error, isFetching, refetch } = useQuery({
    queryKey: ["nilai", "list", params],
    queryFn: () => fetchNilai(params),
    enabled: isFilterReady,
    placeholderData: (p) => p,
  });

  const list = data?.data ?? [];
  const meta = data?.meta ?? null;

  // Stats dari current page
  const avg =
    list.length > 0
      ? (
          list.reduce((a, n) => a + parseFloat(n.nilai ?? 0), 0) / list.length
        ).toFixed(1)
      : null;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        <PageHeader
          icon={TrendingUp}
          title="Data Nilai"
          subtitle="Penilaian akademik siswa per kategori"
        >
          <div className="flex items-center gap-2">
            {/* Semester switch */}
            <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5">
              {["1", "2"].map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setSemester(s);
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${semester === s ? "bg-indigo-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                >
                  Sem {s}
                </button>
              ))}
            </div>
            {avg && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg">
                <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />
                <span className="text-xs font-semibold text-slate-700">
                  Rata: {avg}
                </span>
              </div>
            )}
          </div>
        </PageHeader>

        {/* Filter Kelas */}
        {canFilter && (
          <ClassHierarchyFilter
            value={filter}
            onChange={(v) => {
              setFilter(v);
              setPage(1);
            }}
          />
        )}

        {canFilter && !filter.kelas_id ? (
          <EmptyState
            type="filter"
            title="Pilih Kelas"
            message="Pilih Jurusan, Tingkat, dan Kelas untuk menampilkan nilai."
          />
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Jenis Tabs */}
            <div className="px-5 pt-4 flex items-center gap-0 overflow-x-auto border-b border-slate-100 pb-0 scrollbar-none">
              {JENIS_TABS.map((t) => {
                const isActive = activeJenis === t.value;
                const activeClass = isActive
                  ? TAB_ACTIVE[t.color]
                  : "border-transparent text-slate-400 hover:text-slate-600";
                return (
                  <button
                    key={t.value}
                    onClick={() => {
                      setActiveJenis(t.value);
                      setPage(1);
                    }}
                    className={`flex-shrink-0 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all -mb-px ${activeClass}`}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>

            {/* ActionBar */}
            <div className="px-5 py-4 border-b border-slate-50">
              <ActionBar
                onRefresh={refetch}
                loading={isFetching}
                left={
                  <>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Cari nama siswa..."
                        value={search}
                        onChange={handleSearch}
                        className="w-56 pl-9 pr-8 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder:text-slate-400 transition-all"
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
                    {/* Filter Mapel */}
                    <select
                      value={mapelId}
                      onChange={(e) => {
                        setMapelId(e.target.value);
                        setPage(1);
                      }}
                      className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-600 max-w-[180px]"
                    >
                      <option value="">Semua Mapel</option>
                      {mapelList.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.nama_mapel}
                        </option>
                      ))}
                    </select>
                  </>
                }
                right={
                  (isAdmin || isGuru) && (
                    <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm shadow-indigo-100">
                      <Plus className="w-3.5 h-3.5" /> Input Nilai
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
                  {error?.response?.data?.message ?? "Gagal memuat nilai."}
                </span>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    {[
                      "#",
                      "SISWA",
                      "KELAS",
                      "MATA PELAJARAN",
                      "KATEGORI",
                      "NILAI",
                      "SEMESTER",
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
                    list.map((item, idx) => (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-50/80 transition-colors"
                      >
                        <td className="px-5 py-4 text-xs text-slate-400">
                          {(page - 1) * 20 + idx + 1}
                        </td>
                        <td className="px-5 py-4">
                          <div>
                            <p className="font-semibold text-slate-800">
                              {item.siswa?.nama ?? "—"}
                            </p>
                            <p className="text-xs text-slate-400">
                              {item.siswa?.nisn ?? ""}
                            </p>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-xs font-medium text-slate-600 bg-slate-50 border border-slate-100 px-2 py-1 rounded-md">
                            {item.kelas?.nama_kelas ?? "—"}
                          </span>
                        </td>
                        <td className="px-5 py-4 font-medium text-slate-700">
                          {item.mata_pelajaran?.nama_mapel ?? "—"}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-semibold border capitalize ${JENIS_BADGE[item.jenis_nilai?.toLowerCase()] ?? "bg-slate-50 text-slate-600 border-slate-200"}`}
                          >
                            {item.jenis_nilai?.toUpperCase() ?? "—"}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <NilaiDisplay
                            nilai={item.nilai}
                            kkm={item.mata_pelajaran?.kkm ?? 75}
                          />
                        </td>
                        <td className="px-5 py-4 text-xs text-slate-500">
                          Sem {item.semester} · {item.tahun_ajaran}
                        </td>
                      </tr>
                    ))}

                  {!isLoading && !isError && list.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-0">
                        <EmptyState
                          type="empty"
                          title="Tidak Ada Data Nilai"
                          message={
                            activeJenis
                              ? `Belum ada nilai ${activeJenis} untuk filter ini.`
                              : "Belum ada data nilai."
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
                  nilai
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
        )}
      </div>
    </div>
  );
};

export default NilaiPage;
