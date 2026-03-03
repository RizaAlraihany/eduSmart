import { useState, useEffect, useCallback } from "react";
import { DollarSign, RefreshCw, X, AlertCircle } from "lucide-react";
import { pembayaranService } from "../../services/dataService";

const STATUS_MAP = {
  belum_bayar: { label: "Belum Bayar", cls: "bg-red-100 text-red-700" },
  sudah_bayar: { label: "Lunas", cls: "bg-green-100 text-green-700" },
  terlambat: { label: "Terlambat", cls: "bg-orange-100 text-orange-700" },
};

const StatusBadge = ({ status }) => {
  const s = STATUS_MAP[status] ?? {
    label: status,
    cls: "bg-gray-100 text-gray-600",
  };
  return (
    <span
      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${s.cls}`}
    >
      {s.label}
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

const fmtRupiah = (n) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n ?? 0);

const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "-";

const Pembayaran = () => {
  const [list, setList] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [page, setPage] = useState(1);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await pembayaranService.getAll({
        per_page: 15,
        page,
        status_pembayaran: filterStatus || undefined,
      });
      setList(res.data ?? []);
      setMeta(res.meta ?? null);
    } catch {
      setError("Gagal memuat data pembayaran.");
    } finally {
      setLoading(false);
    }
  }, [page, filterStatus]);

  useEffect(() => {
    fetch();
  }, [fetch]);
  useEffect(() => {
    setPage(1);
  }, [filterStatus]);

  // Summary
  const summary = list.reduce((acc, p) => {
    if (!acc[p.status_pembayaran])
      acc[p.status_pembayaran] = { count: 0, total: 0 };
    acc[p.status_pembayaran].count++;
    acc[p.status_pembayaran].total += parseFloat(p.jumlah ?? 0);
    return acc;
  }, {});

  const totalLunas = summary.sudah_bayar?.total ?? 0;
  const totalPending = summary.belum_bayar?.total ?? 0;
  const totalTerlambat = summary.terlambat?.total ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-9 h-9 bg-emerald-600 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            Pembayaran
          </h1>
          <p className="text-gray-500 text-sm mt-1 ml-12">
            Rekap pembayaran siswa
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-green-200 p-4 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase">Lunas</p>
          <p className="text-xl font-bold text-green-700 mt-1">
            {fmtRupiah(totalLunas)}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {summary.sudah_bayar?.count ?? 0} transaksi
          </p>
        </div>
        <div className="bg-white rounded-xl border border-red-200 p-4 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase">
            Belum Bayar
          </p>
          <p className="text-xl font-bold text-red-700 mt-1">
            {fmtRupiah(totalPending)}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {summary.belum_bayar?.count ?? 0} transaksi
          </p>
        </div>
        <div className="bg-white rounded-xl border border-orange-200 p-4 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase">
            Terlambat
          </p>
          <p className="text-xl font-bold text-orange-700 mt-1">
            {fmtRupiah(totalTerlambat)}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {summary.terlambat?.count ?? 0} transaksi
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <X className="w-4 h-4 flex-shrink-0" />
          {error}
          <button onClick={fetch} className="ml-auto text-xs underline">
            Coba lagi
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3">
          <div className="flex flex-wrap gap-2">
            {[
              { v: "", l: "Semua" },
              ...Object.entries(STATUS_MAP).map(([v, { label: l }]) => ({
                v,
                l,
              })),
            ].map(({ v, l }) => (
              <button
                key={v}
                onClick={() => setFilterStatus(v)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${filterStatus === v ? "bg-primary-600 text-white border-primary-600" : "text-gray-600 border-gray-200 hover:bg-gray-50"}`}
              >
                {l}
              </button>
            ))}
          </div>
          <button
            onClick={fetch}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 ml-auto"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {[
                  "#",
                  "Siswa",
                  "Jenis Pembayaran",
                  "Jumlah",
                  "Jatuh Tempo",
                  "Tgl Bayar",
                  "Status",
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
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                [...Array(8)].map((_, i) => <SkeletonRow key={i} />)
              ) : list.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-16 text-center text-gray-400"
                  >
                    <DollarSign className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">Tidak ada data pembayaran</p>
                  </td>
                </tr>
              ) : (
                list.map((p, i) => {
                  // Tandai lewat jatuh tempo
                  const isOverdue =
                    p.status_pembayaran === "belum_bayar" &&
                    p.tanggal_jatuh_tempo &&
                    new Date(p.tanggal_jatuh_tempo) < new Date();
                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-gray-50 transition-colors ${isOverdue ? "bg-red-50/40" : ""}`}
                    >
                      <td className="px-6 py-4 text-gray-400 text-xs">
                        {(meta?.current_page - 1) * 15 + i + 1}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {p.siswa?.nama ?? "-"}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {p.jenis_pembayaran}
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-900">
                        {fmtRupiah(p.jumlah)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          {isOverdue && (
                            <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                          )}
                          <span
                            className={
                              isOverdue
                                ? "text-red-600 font-medium"
                                : "text-gray-600"
                            }
                          >
                            {fmtDate(p.tanggal_jatuh_tempo)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {fmtDate(p.tanggal_pembayaran)}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={p.status_pembayaran} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {meta && meta.last_page > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
            <span>
              Menampilkan {list.length} dari {meta.total} data
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ‹
              </button>
              <span className="px-3 py-1.5 text-xs">
                {page} / {meta.last_page}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
                disabled={page === meta.last_page}
                className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ›
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Pembayaran;
