import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle } from "lucide-react";

const CTASection = () => {
  const benefits = [
    "Gratis 30 hari trial",
    "Tidak perlu kartu kredit",
    "Setup dalam 5 menit",
    "Support 24/7",
  ];

  return (
    <section
      id="contact"
      className="py-20 bg-gradient-to-r from-primary-600 to-primary-800 text-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Siap Memulai Transformasi Digital?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Bergabunglah dengan ribuan sekolah yang telah mempercayai SmartEdu
              untuk mengelola sistem pendidikan mereka.
            </p>

            {/* Benefits */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-300 mr-3 flex-shrink-0" />
                  <span className="text-blue-100">{benefit}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/register"
                className="btn bg-white text-primary-600 hover:bg-blue-50 btn-lg group"
              >
                Daftar Gratis Sekarang
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/login"
                className="btn border-2 border-white text-white hover:bg-white hover:text-primary-600 btn-lg"
              >
                Sudah Punya Akun?
              </Link>
            </div>
          </div>

          {/* Right Image/Illustration */}
          <div className="hidden lg:block">
            <div className="relative">
              <div className="absolute inset-0 bg-white/10 rounded-3xl transform rotate-6"></div>
              <div className="relative bg-white/20 backdrop-blur-sm rounded-3xl p-8">
                <div className="bg-white rounded-2xl p-6 shadow-2xl">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center mr-3">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">
                        Setup Selesai!
                      </div>
                      <div className="text-sm text-gray-600">Dalam 5 menit</div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-3 bg-gray-200 rounded animate-pulse"
                      ></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
