import { useState, useEffect } from "react";
import api from "@/lib/api"; // Asumsi Anda menggunakan instance axios dari @/lib/api

const TugasPage = () => {
  const [tugas, setTugas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTugas = async () => {
      try {
        setLoading(true);
        setError(null);

        // Panggil endpoint API
        const response = await api.get("/tugas/siswa");

        // Amankan pengambilan data (antisipasi berbagai struktur response API)
        const data = response?.data?.data || response?.data || [];

        // Validasi ketat: Pastikan data adalah Array sebelum di-set ke state
        if (Array.isArray(data)) {
          setTugas(data);
        } else {
          setTugas([]);
          console.error("Format data dari API bukan array:", data);
        }
      } catch (err) {
        console.error("Gagal mengambil data tugas:", err);
        setError("Gagal memuat daftar tugas. Silakan coba lagi nanti.");
      } finally {
        setLoading(false);
      }
    };

    fetchTugas();
  }, []);

  // 1. Render Loading State
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-500">Memuat data tugas...</p>
        </div>
      </div>
    );
  }

  // 2. Render Error State
  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
          <div className="flex items-center">
            <span className="text-red-600 font-medium">{error}</span>
          </div>
        </div>
      </div>
    );
  }

  // 3. Render Main UI
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Daftar Tugas</h1>

      {/* 4. Fallback UI Jika Data Kosong */}
      {tugas.length === 0 ? (
        <div className="bg-gray-50 p-8 text-center rounded-xl border border-dashed border-gray-300">
          <p className="text-gray-500 font-medium">Tidak ada tugas saat ini.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* 5. Map Data dengan Aman (menggunakan Optional Chaining) */}
          {tugas.map((item) => (
            <div
              key={item?.id || Math.random()}
              className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow flex flex-col h-full"
            >
              <div className="flex justify-between items-start mb-3">
                <span className="bg-indigo-100 text-indigo-800 text-xs font-semibold px-2.5 py-1 rounded">
                  {/* Pastikan tidak render object, selalu konversi ke string atau fallback */}
                  {String(item?.mapel || "Umum")}
                </span>
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize ${
                    item?.status === "selesai" || item?.status === "dikumpulkan"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {String(item?.status || "belum dikumpulkan")}
                </span>
              </div>

              <h3 className="text-lg font-bold text-gray-800 mb-2 flex-grow">
                {String(item?.judul || "Tanpa Judul")}
              </h3>

              <div className="flex items-center text-sm text-gray-500 mt-4 pt-4 border-t border-gray-100">
                <svg
                  className="w-4 h-4 mr-2 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  ></path>
                </svg>
                <span className="font-medium text-gray-600">
                  {String(item?.tanggal_deadline || "-")}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TugasPage;
