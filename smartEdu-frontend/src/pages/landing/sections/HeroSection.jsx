import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Play } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 text-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center bg-blue-500/30 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <span className="text-sm font-medium">
                🎉 Trusted by 1000+ Schools
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Sistem Manajemen
              <span className="block text-blue-200 mt-2">
                Pendidikan Cerdas
              </span>
            </h1>

            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Kelola sekolah dengan mudah, efisien, dan modern. Transformasi
              digital untuk pendidikan yang lebih baik.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                to="/register"
                className="btn bg-white text-blue-600 hover:bg-blue-50 btn-lg group"
              >
                Mulai Gratis
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="btn border-2 border-white text-white hover:bg-white hover:text-blue-600 btn-lg group">
                <Play className="mr-2 w-5 h-5" />
                Lihat Demo
              </button>
            </div>

            {/* Stats */}
            <div className="mt-12 grid grid-cols-3 gap-8">
              <div>
                <div className="text-3xl font-bold">1000+</div>
                <div className="text-blue-200 text-sm mt-1">Sekolah</div>
              </div>
              <div>
                <div className="text-3xl font-bold">50K+</div>
                <div className="text-blue-200 text-sm mt-1">Siswa</div>
              </div>
              <div>
                <div className="text-3xl font-bold">5K+</div>
                <div className="text-blue-200 text-sm mt-1">Guru</div>
              </div>
            </div>
          </div>

          {/* Right Image/Mockup */}
          <div className="hidden lg:block">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-400 rounded-3xl transform rotate-6"></div>
              <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden transform -rotate-2 hover:rotate-0 transition-transform duration-300">
                <div className="aspect-video bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center p-8">
                  <div className="text-center">
                    <div className="w-32 h-32 bg-blue-300 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <svg
                        className="w-16 h-16 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        />
                      </svg>
                    </div>
                    <p className="text-blue-600 font-semibold">
                      Dashboard Preview
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Wave Bottom */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            fill="rgb(249, 250, 251)"
          />
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;
