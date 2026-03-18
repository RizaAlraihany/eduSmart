// src/shared/components/ui/ClassHierarchyFilter.jsx
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, CheckCircle2, Circle } from "lucide-react";
import api from "@/lib/api";

/**
 * ClassHierarchyFilter
 *
 * Filter bertingkat: Jurusan → Tingkat → Kelas (Rombel)
 *
 * ARSITEKTUR:
 * - Jurusan (TKJ/TKR) → di-parse dari `nama_kelas` field di API /kelas
 *   karena schema DB tidak punya kolom `jurusan` terpisah.
 *   Format nama_kelas yang diharapkan: "X TKJ A", "XI TKR B", dst.
 *   Fallback graceful jika format berbeda.
 * - Tingkat (X/XI/XII) → kolom `tingkat` di tabel kelas
 * - Kelas/Rombel → `id` kelas yang dipilih
 *
 * Props:
 *   value      - { jurusan, tingkat, kelas_id } — controlled state
 *   onChange   - callback({ jurusan, tingkat, kelas_id })
 *   className  - class tambahan
 *
 * Contoh penggunaan:
 *   const [filter, setFilter] = useState({ jurusan: null, tingkat: null, kelas_id: null });
 *   <ClassHierarchyFilter value={filter} onChange={setFilter} />
 */

const JURUSAN_LIST = [
  { value: "TKJ", label: "TKJ", desc: "Teknik Komputer & Jaringan" },
  { value: "TKR", label: "TKR", desc: "Teknik Kendaraan Ringan" },
];

const TINGKAT_LIST = [
  { value: "X",   label: "X",   desc: "Kelas 10" },
  { value: "XI",  label: "XI",  desc: "Kelas 11" },
  { value: "XII", label: "XII", desc: "Kelas 12" },
];

// Fetch semua kelas aktif (cache 5 menit)
const fetchKelas = () =>
  api.get("/kelas", { params: { status: "aktif", per_page: 100 } }).then((r) => r.data);

// Parse jurusan dari nama_kelas
// "X TKJ A" → "TKJ"  |  "XI TKR B" → "TKR"  |  "X IPA 1" → null
const parseJurusan = (namaKelas = "") => {
  const upper = namaKelas.toUpperCase();
  if (upper.includes("TKJ")) return "TKJ";
  if (upper.includes("TKR")) return "TKR";
  return null;
};

// Parse rombel dari nama_kelas
// "X TKJ A" → "A"  |  "XI TKR B" → "B"
const parseRombel = (namaKelas = "") => {
  const match = namaKelas.match(/\b([A-Z])\s*$/i);
  return match ? match[1].toUpperCase() : null;
};

// ─── Sub-components ──────────────────────────────────────────────

const StepIndicator = ({ step, label, active, done }) => (
  <div className="flex items-center gap-1.5">
    <div
      className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
        done
          ? "bg-emerald-500 text-white"
          : active
          ? "bg-indigo-600 text-white"
          : "bg-slate-200 text-slate-400"
      }`}
    >
      {done ? (
        <CheckCircle2 className="w-3 h-3" />
      ) : (
        <span className="text-[10px] font-bold">{step}</span>
      )}
    </div>
    <span
      className={`text-xs font-semibold ${
        active ? "text-indigo-600" : done ? "text-emerald-600" : "text-slate-400"
      }`}
    >
      {label}
    </span>
  </div>
);

const PillButton = ({ label, desc, active, disabled, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`group relative px-3.5 py-2 rounded-lg text-sm font-semibold transition-all border ${
      disabled
        ? "border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed"
        : active
        ? "border-indigo-500 bg-indigo-600 text-white shadow-md shadow-indigo-100"
        : "border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
    }`}
  >
    {label}
    {desc && !disabled && (
      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block whitespace-nowrap bg-slate-900 text-white text-[10px] px-2 py-1 rounded-md z-10 pointer-events-none">
        {desc}
      </span>
    )}
  </button>
);

// ─── Main Component ───────────────────────────────────────────────

const ClassHierarchyFilter = ({ value = {}, onChange, className = "" }) => {
  const { jurusan, tingkat, kelas_id } = value;

  // Fetch semua kelas
  const { data: kelasData, isLoading: loadingKelas } = useQuery({
    queryKey: ["kelas", "all-aktif"],
    queryFn: fetchKelas,
    staleTime: 5 * 60 * 1000,
  });

  const allKelas = kelasData?.data ?? [];

  // Filter kelas berdasarkan jurusan + tingkat yang dipilih
  const filteredKelas = allKelas.filter((k) => {
    const j = parseJurusan(k.nama_kelas);
    const matchJurusan = jurusan ? j === jurusan : true;
    const matchTingkat = tingkat ? k.tingkat === tingkat : true;
    return matchJurusan && matchTingkat;
  });

  // Handlers
  const selectJurusan = (val) => {
    onChange({ jurusan: val === jurusan ? null : val, tingkat: null, kelas_id: null });
  };

  const selectTingkat = (val) => {
    onChange({ jurusan, tingkat: val === tingkat ? null : val, kelas_id: null });
  };

  const selectKelas = (val) => {
    onChange({ jurusan, tingkat, kelas_id: val === kelas_id ? null : val });
  };

  const isComplete = !!(jurusan && tingkat && kelas_id);

  return (
    <div
      className={`bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <StepIndicator
            step={1}
            label="Jurusan"
            active={!jurusan}
            done={!!jurusan}
          />
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <StepIndicator
            step={2}
            label="Tingkat"
            active={!!jurusan && !tingkat}
            done={!!tingkat}
          />
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <StepIndicator
            step={3}
            label="Kelas"
            active={!!jurusan && !!tingkat && !kelas_id}
            done={!!kelas_id}
          />
        </div>

        {isComplete && (
          <button
            type="button"
            onClick={() => onChange({ jurusan: null, tingkat: null, kelas_id: null })}
            className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
          >
            Reset
          </button>
        )}
      </div>

      {/* Filter Body */}
      <div className="px-5 py-4 space-y-4">
        {/* Step 1: Jurusan */}
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
            1 · Pilih Jurusan
          </p>
          <div className="flex gap-2 flex-wrap">
            {JURUSAN_LIST.map((j) => (
              <PillButton
                key={j.value}
                label={j.label}
                desc={j.desc}
                active={jurusan === j.value}
                onClick={() => selectJurusan(j.value)}
              />
            ))}
          </div>
        </div>

        {/* Step 2: Tingkat */}
        <div>
          <p
            className={`text-xs font-semibold uppercase tracking-wider mb-2.5 ${
              !jurusan ? "text-slate-200" : "text-slate-400"
            }`}
          >
            2 · Pilih Tingkat
          </p>
          <div className="flex gap-2 flex-wrap">
            {TINGKAT_LIST.map((t) => (
              <PillButton
                key={t.value}
                label={t.label}
                desc={t.desc}
                active={tingkat === t.value}
                disabled={!jurusan}
                onClick={() => selectTingkat(t.value)}
              />
            ))}
          </div>
        </div>

        {/* Step 3: Kelas */}
        <div>
          <p
            className={`text-xs font-semibold uppercase tracking-wider mb-2.5 ${
              !tingkat ? "text-slate-200" : "text-slate-400"
            }`}
          >
            3 · Pilih Kelas
          </p>
          <div className="flex gap-2 flex-wrap">
            {!jurusan || !tingkat ? (
              <span className="text-xs text-slate-300 italic">
                Pilih jurusan dan tingkat terlebih dahulu
              </span>
            ) : loadingKelas ? (
              <div className="flex gap-2">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-16 h-9 rounded-lg bg-slate-100 animate-pulse"
                  />
                ))}
              </div>
            ) : filteredKelas.length === 0 ? (
              <span className="text-xs text-slate-400 italic">
                Tidak ada kelas untuk filter ini
              </span>
            ) : (
              filteredKelas.map((k) => {
                const rombel = parseRombel(k.nama_kelas);
                return (
                  <PillButton
                    key={k.id}
                    label={rombel ?? k.nama_kelas}
                    desc={`${k.nama_kelas} · ${k.siswas?.length ?? 0}/${k.kapasitas} siswa`}
                    active={kelas_id === k.id}
                    onClick={() => selectKelas(k.id)}
                  />
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Status bar bawah */}
      {isComplete && (
        <div className="px-5 py-2.5 bg-emerald-50 border-t border-emerald-100 flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
          <p className="text-xs font-medium text-emerald-700">
            Filter aktif:{" "}
            <span className="font-bold">
              {jurusan} · Kelas {tingkat} ·{" "}
              {allKelas.find((k) => k.id === kelas_id)?.nama_kelas ?? ""}
            </span>
          </p>
        </div>
      )}
    </div>
  );
};

export default ClassHierarchyFilter;
