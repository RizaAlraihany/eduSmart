import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  GraduationCap,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  CreditCard,
  Contact,
  IdCard,
  UserRound,
  Users,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import api from "../../services/api";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";

const STEPS = [
  { id: 1, label: "Identitas" },
  { id: 2, label: "Data Diri" },
  { id: 3, label: "Akun" },
];

const INITIAL_FORM = {
  nik: "",
  nisn: "",
  nama: "",
  jenis_kelamin: "",
  tanggal_lahir: "",
  telepon: "",
  alamat: "",
  nama_orang_tua: "",
  telepon_orang_tua: "",
  email: "",
  password: "",
  password_confirmation: "",
};

const StepIndicator = ({ currentStep }) => (
  <div className="flex items-center justify-center mb-8">
    {STEPS.map((step, i) => (
      <React.Fragment key={step.id}>
        <div className="flex flex-col items-center">
          <div
            className={`
            w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all duration-300
            ${currentStep > step.id ? "bg-emerald-500 text-white" : currentStep === step.id ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-400"}
          `}
          >
            {currentStep > step.id ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              step.id
            )}
          </div>
          <span
            className={`text-xs font-semibold mt-1.5 ${currentStep === step.id ? "text-indigo-600" : "text-gray-400"}`}
          >
            {step.label}
          </span>
        </div>
        {i < STEPS.length - 1 && (
          <div
            className={`h-px w-10 mx-2 mb-5 transition-all duration-300 ${currentStep > step.id ? "bg-emerald-400" : "bg-gray-200"}`}
          />
        )}
      </React.Fragment>
    ))}
  </div>
);

// Dropdown dengan style sama seperti Input
const Select = ({
  label,
  hint,
  required,
  value,
  onChange,
  name,
  error,
  children,
}) => (
  <div className="w-full">
    <div className="flex items-center gap-1.5 mb-1.5">
      <label className="text-sm font-semibold text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {hint && <span className="text-xs text-gray-400">{hint}</span>}
    </div>
    <div
      className={`
      flex items-center h-11 px-3.5 bg-white border rounded-xl transition-all duration-150
      ${error ? "border-red-300 ring-1 ring-red-300" : "border-gray-200 hover:border-gray-300 focus-within:border-indigo-400 focus-within:ring-1 focus-within:ring-indigo-400"}
    `}
    >
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="flex-1 text-sm text-gray-900 bg-transparent outline-none appearance-none"
      >
        {children}
      </select>
    </div>
    {error && <p className="mt-1 text-xs text-red-500 font-medium">{error}</p>}
  </div>
);

// Textarea dengan style sama
const Textarea = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  icon: Icon,
}) => (
  <div className="w-full">
    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
      {label}
    </label>
    <div className="flex gap-2.5 px-3.5 py-3 bg-white border border-gray-200 hover:border-gray-300 focus-within:border-indigo-400 focus-within:ring-1 focus-within:ring-indigo-400 rounded-xl transition-all duration-150">
      {Icon && <Icon className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />}
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={3}
        className="flex-1 text-sm text-gray-900 bg-transparent outline-none resize-none placeholder:text-gray-300"
      />
    </div>
  </div>
);

const Register = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(INITIAL_FORM);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    if (error) setError("");
  };

  const validateStep = () => {
    const errs = {};
    if (step === 1) {
      if (!form.nik || form.nik.length !== 16 || !/^\d+$/.test(form.nik))
        errs.nik = ["NIK harus 16 digit angka."];
      if (!form.nisn) errs.nisn = ["NISN wajib diisi."];
      if (!form.nama) errs.nama = ["Nama lengkap wajib diisi."];
      if (!form.jenis_kelamin)
        errs.jenis_kelamin = ["Jenis kelamin wajib dipilih."];
      if (!form.tanggal_lahir)
        errs.tanggal_lahir = ["Tanggal lahir wajib diisi."];
    }
    if (step === 3) {
      if (!form.email) errs.email = ["Email wajib diisi."];
      if (!form.password || form.password.length < 8)
        errs.password = ["Password minimal 8 karakter."];
      if (form.password !== form.password_confirmation)
        errs.password_confirmation = ["Konfirmasi password tidak cocok."];
    }
    return errs;
  };

  const handleNext = () => {
    const errs = validateStep();
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }
    setStep((s) => s + 1);
  };

  const handleBack = () => {
    setFieldErrors({});
    setError("");
    setStep((s) => s - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validateStep();
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }

    setLoading(true);
    setError("");
    try {
      await api.post("/register", {
        nik: form.nik,
        nisn: form.nisn,
        nama: form.nama,
        jenis_kelamin: form.jenis_kelamin,
        tanggal_lahir: form.tanggal_lahir,
        telepon: form.telepon || undefined,
        alamat: form.alamat || undefined,
        nama_orang_tua: form.nama_orang_tua || undefined,
        telepon_orang_tua: form.telepon_orang_tua || undefined,
        email: form.email,
        password: form.password,
        password_confirmation: form.password_confirmation,
      });
      setSuccess(true);
      setTimeout(() => navigate("/dashboard", { replace: true }), 2000);
    } catch (err) {
      if (err.response?.status === 422) {
        const errors = err.response.data?.errors ?? {};
        setFieldErrors(errors);
        const step1Fields = [
          "nik",
          "nisn",
          "nama",
          "jenis_kelamin",
          "tanggal_lahir",
        ];
        const step2Fields = [
          "telepon",
          "alamat",
          "nama_orang_tua",
          "telepon_orang_tua",
        ];
        if (step1Fields.some((f) => errors[f])) setStep(1);
        else if (step2Fields.some((f) => errors[f])) setStep(2);
        setError(Object.values(errors).flat()[0] ?? "Validasi gagal.");
      } else {
        setError(err.response?.data?.message ?? "Registrasi gagal. Coba lagi.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center max-w-sm w-full">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-emerald-500" />
          </div>
          <h2 className="text-xl font-black text-gray-900 mb-1">
            Registrasi Berhasil!
          </h2>
          <p className="text-sm text-gray-400">Mengarahkan ke dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-5/12 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-black text-xl">eduSmart</span>
        </div>
        <div>
          <h1 className="text-3xl font-black text-white leading-tight mb-3">
            Daftarkan Diri
            <br />
            Sebagai Siswa
          </h1>
          <p className="text-indigo-200 text-sm leading-relaxed">
            Lengkapi data diri Anda untuk membuat akun. Proses hanya membutuhkan
            beberapa menit.
          </p>
          <div className="mt-8 space-y-3">
            {[
              "Isi identitas diri",
              "Tambahkan data orang tua",
              "Buat akun login",
            ].map((s, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 ${step > i + 1 ? "opacity-100" : step === i + 1 ? "opacity-100" : "opacity-40"}`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0
                  ${step > i + 1 ? "bg-emerald-400 text-white" : step === i + 1 ? "bg-white text-indigo-700" : "bg-white/20 text-white"}`}
                >
                  {step > i + 1 ? "✓" : i + 1}
                </div>
                <span className="text-white text-sm font-medium">{s}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-indigo-400 text-xs">
          © 2026 eduSmart. All rights reserved.
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
        <div className="w-full max-w-md py-8">
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-6 lg:hidden">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="font-black text-gray-900 text-xl">eduSmart</span>
          </div>

          <h2 className="text-2xl font-black text-gray-900 mb-1">
            Buat Akun Siswa
          </h2>
          <p className="text-sm text-gray-400 mb-6">
            Langkah {step} dari {STEPS.length}
          </p>

          <StepIndicator currentStep={step} />

          {error && (
            <div className="flex items-center gap-2.5 bg-red-50 border border-red-100 text-red-600 px-3.5 py-3 rounded-xl mb-5 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* ══ STEP 1: Identitas ══ */}
            {step === 1 && (
              <div className="space-y-4">
                <Input
                  name="nik"
                  label="NIK"
                  hint="(16 digit — digunakan sebagai ID unik)"
                  placeholder="3271234567890001"
                  value={form.nik}
                  onChange={handleChange}
                  icon={IdCard}
                  error={fieldErrors.nik?.[0]}
                  required
                  maxLength={16}
                />
                {form.nik && form.nik.length < 16 && !fieldErrors.nik && (
                  <p className="-mt-3 text-xs text-gray-400">
                    {form.nik.length}/16 digit
                  </p>
                )}

                <Input
                  name="nisn"
                  label="NISN"
                  placeholder="0012345678"
                  value={form.nisn}
                  onChange={handleChange}
                  icon={Contact}
                  error={fieldErrors.nisn?.[0]}
                  required
                />

                <Input
                  name="nama"
                  label="Nama Lengkap"
                  placeholder="Ahmad Rizki"
                  value={form.nama}
                  onChange={handleChange}
                  icon={User}
                  error={fieldErrors.nama?.[0]}
                  required
                />

                <div className="grid grid-cols-2 gap-4">
                  <Select
                    name="jenis_kelamin"
                    label="Jenis Kelamin"
                    value={form.jenis_kelamin}
                    onChange={handleChange}
                    error={fieldErrors.jenis_kelamin?.[0]}
                    required
                  >
                    <option value="">Pilih</option>
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </Select>

                  <Input
                    type="date"
                    name="tanggal_lahir"
                    label="Tanggal Lahir"
                    value={form.tanggal_lahir}
                    onChange={handleChange}
                    error={fieldErrors.tanggal_lahir?.[0]}
                    required
                    max={new Date().toISOString().split("T")[0]}
                  />
                </div>
              </div>
            )}

            {/* ══ STEP 2: Data Diri ══ */}
            {step === 2 && (
              <div className="space-y-4">
                <Input
                  type="tel"
                  name="telepon"
                  label="No. Telepon"
                  placeholder="08123456789"
                  value={form.telepon}
                  onChange={handleChange}
                  icon={Phone}
                  required
                  error={fieldErrors.telepon?.[0]}
                />

                <Textarea
                  name="alamat"
                  label="Alamat"
                  placeholder="Jl. Merdeka No. 1, Bandung"
                  value={form.alamat}
                  onChange={handleChange}
                  icon={MapPin}
                  required
                />

                <div className="border-t border-gray-100 pt-4">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
                    Data Orang Tua / Wali
                  </p>
                  <div className="space-y-4">
                    <Input
                      name="nama_orang_tua"
                      label="Nama Orang Tua / Wali"
                      placeholder="Bapak/Ibu"
                      value={form.nama_orang_tua}
                      onChange={handleChange}
                      icon={Users}
                      error={fieldErrors.nama_orang_tua?.[0]}
                      required
                    />
                    <Input
                      type="tel"
                      name="telepon_orang_tua"
                      label="No. Telepon Orang Tua"
                      placeholder="08129876543"
                      value={form.telepon_orang_tua}
                      onChange={handleChange}
                      icon={Phone}
                      error={fieldErrors.telepon_orang_tua?.[0]}
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ══ STEP 3: Akun ══ */}
            {step === 3 && (
              <div className="space-y-4">
                <Input
                  type="email"
                  name="email"
                  label="Email"
                  placeholder="siswa@edu.id"
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
                    hint="(minimal 8 karakter)"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={handleChange}
                    icon={Lock}
                    error={fieldErrors.password?.[0]}
                    required
                    autoComplete="new-password"
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

                <div className="relative">
                  <Input
                    type={showConfirm ? "text" : "password"}
                    name="password_confirmation"
                    label="Konfirmasi Password"
                    placeholder="••••••••"
                    value={form.password_confirmation}
                    onChange={handleChange}
                    icon={Lock}
                    error={fieldErrors.password_confirmation?.[0]}
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3.5 top-[34px] text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirm ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                  {form.password_confirmation && (
                    <p
                      className={`mt-1 text-xs font-medium ${form.password === form.password_confirmation ? "text-emerald-500" : "text-red-500"}`}
                    >
                      {form.password === form.password_confirmation
                        ? "✓ Password cocok"
                        : "✗ Password tidak cocok"}
                    </p>
                  )}
                </div>

                {/* Ringkasan */}
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-xs text-gray-600 space-y-1">
                  <p className="font-semibold text-gray-700 mb-2">
                    Ringkasan Pendaftaran
                  </p>
                  <p>
                    Nama &nbsp;:{" "}
                    <span className="font-semibold text-gray-900">
                      {form.nama}
                    </span>
                  </p>
                  <p>
                    NIK &nbsp;&nbsp;&nbsp;:{" "}
                    <span className="font-semibold text-gray-900">
                      {form.nik}
                    </span>
                  </p>
                  <p>
                    NISN &nbsp;:{" "}
                    <span className="font-semibold text-gray-900">
                      {form.nisn}
                    </span>
                  </p>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex gap-3 mt-7">
              {step > 1 && (
                <Button
                  type="button"
                  variant="secondary"
                  size="lg"
                  onClick={handleBack}
                  className="flex-1"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" /> Kembali
                </Button>
              )}
              {step < 3 ? (
                <Button
                  type="button"
                  variant="primary"
                  size="lg"
                  onClick={handleNext}
                  className="flex-1"
                >
                  Lanjut <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={loading}
                  className="flex-1"
                >
                  {loading ? "Mendaftarkan..." : "Daftar Sekarang"}
                </Button>
              )}
            </div>
          </form>

          <p className="text-center text-sm text-gray-400 mt-6">
            Sudah punya akun?{" "}
            <Link
              to="/login"
              className="text-indigo-600 font-semibold hover:underline"
            >
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
