import React from "react";
import {
  Users,
  Calendar,
  TrendingUp,
  DollarSign,
  Megaphone,
  BarChart3,
  Shield,
  Zap,
  Clock,
} from "lucide-react";

const FeaturesSection = () => {
  const features = [
    {
      icon: Users,
      title: "Manajemen Siswa",
      description:
        "Kelola data siswa, kelas, dan informasi akademik dengan mudah dan terorganisir.",
      color: "bg-blue-500",
    },
    {
      icon: Calendar,
      title: "Jadwal & Absensi",
      description:
        "Atur jadwal pelajaran dan pantau kehadiran siswa secara real-time dengan sistem terintegrasi.",
      color: "bg-green-500",
    },
    {
      icon: TrendingUp,
      title: "Penilaian & Rapor",
      description:
        "Sistem penilaian komprehensif dan generasi rapor otomatis untuk mempermudah evaluasi.",
      color: "bg-purple-500",
    },
    {
      icon: DollarSign,
      title: "Manajemen Keuangan",
      description:
        "Kelola pembayaran SPP dan keuangan sekolah dengan transparan dan terstruktur.",
      color: "bg-yellow-500",
    },
    {
      icon: Megaphone,
      title: "Pengumuman",
      description:
        "Sistem pengumuman terintegrasi untuk semua stakeholder sekolah secara instan.",
      color: "bg-red-500",
    },
    {
      icon: BarChart3,
      title: "Laporan & Analitik",
      description:
        "Dashboard analitik dan laporan komprehensif untuk pengambilan keputusan yang tepat.",
      color: "bg-indigo-500",
    },
    {
      icon: Shield,
      title: "Keamanan Data",
      description:
        "Perlindungan data dengan enkripsi tingkat tinggi dan backup otomatis.",
      color: "bg-emerald-500",
    },
    {
      icon: Zap,
      title: "Performa Cepat",
      description:
        "Sistem yang dioptimalkan untuk kecepatan dan efisiensi maksimal.",
      color: "bg-orange-500",
    },
    {
      icon: Clock,
      title: "Akses 24/7",
      description:
        "Akses kapan saja, di mana saja melalui web dan mobile application.",
      color: "bg-pink-500",
    },
  ];

  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Fitur Unggulan
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Solusi lengkap untuk manajemen sekolah modern dengan teknologi
            terkini
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="card card-hover group">
                <div
                  className={`w-16 h-16 ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}
                >
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 mb-4">
            Dan masih banyak fitur lainnya yang akan memudahkan pengelolaan
            sekolah Anda
          </p>
          <a href="#contact" className="btn-primary btn-lg">
            Mulai Sekarang
          </a>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
