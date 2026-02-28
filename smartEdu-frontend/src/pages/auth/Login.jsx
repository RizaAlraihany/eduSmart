import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  GraduationCap,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    setLoading(true);
    try {
      await login(form);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      if (err.response?.status === 422) {
        const errors = err.response.data?.errors ?? {};
        setFieldErrors(errors);
        setError(Object.values(errors).flat()[0] ?? "Validasi gagal.");
      } else {
        setError(err.response?.data?.message ?? "Email atau password salah.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-5/12 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-black text-xl">eduSmart</span>
        </div>
        <div>
          <h1 className="text-4xl font-black text-white leading-tight mb-4">
            Selamat Datang
            <br />
            di eduSmart
          </h1>
          <p className="text-indigo-200 text-sm leading-relaxed">
            Sistem manajemen sekolah modern untuk mengelola siswa, guru, kelas,
            dan jadwal dalam satu platform terintegrasi.
          </p>
          <div className="grid grid-cols-3 gap-4 mt-10">
            {[
              { value: "1.200+", label: "Siswa" },
              { value: "86", label: "Guru" },
              { value: "32", label: "Kelas" },
            ].map((s) => (
              <div key={s.label} className="bg-white/10 rounded-2xl p-4">
                <p className="text-2xl font-black text-white">{s.value}</p>
                <p className="text-indigo-300 text-xs mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="text-indigo-400 text-xs">
          © 2026 eduSmart. All rights reserved.
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="font-black text-gray-900 text-xl">eduSmart</span>
          </div>

          <h2 className="text-2xl font-black text-gray-900 mb-1">
            Masuk ke Akun
          </h2>
          <p className="text-sm text-gray-400 mb-7">
            Masukkan kredensial Anda untuk melanjutkan
          </p>

          {error && (
            <div className="flex items-center gap-2.5 bg-red-50 border border-red-100 text-red-600 px-3.5 py-3 rounded-xl mb-5 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              name="email"
              label="Email"
              placeholder="admin@edu.id"
              value={form.email}
              onChange={handleChange}
              icon={Mail}
              error={fieldErrors.email?.[0]}
              required
              autoComplete="email"
            />

            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                name="password"
                label="Password"
                placeholder="Masukkan password"
                value={form.password}
                onChange={handleChange}
                icon={Lock}
                error={fieldErrors.password?.[0]}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3.5 top-[34px] text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
              className="mt-2"
            >
              {loading ? "Memproses..." : "Masuk"}
            </Button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-6">
            Belum punya akun?{" "}
            <Link
              to="/register"
              className="text-indigo-600 font-semibold hover:underline"
            >
              Daftar sekarang
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
