import { useState } from "react";
import { absensiService } from "@/services/dataService";
import Modal from "@/shared/components/ui/Modal";
import Input from "@/shared/components/ui/Input";
import Select from "@/shared/components/ui/Select";
import Button from "@/shared/components/ui/Button";
import Alert from "@/shared/components/ui/Alert";

const AbsensiFormModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    siswa_id: "",
    kelas_id: "",
    jadwal_id: "",
    tanggal: new Date().toISOString().split("T")[0],
    status_kehadiran: "hadir",
    keterangan: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await absensiService.create(formData);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Gagal menyimpan absensi.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Input Kehadiran" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert type="error">{error}</Alert>}

        <div className="grid grid-cols-2 gap-4">
          <Input
            type="number"
            label="ID Siswa"
            name="siswa_id"
            required
            value={formData.siswa_id}
            onChange={handleChange}
          />
          <Input
            type="number"
            label="ID Kelas"
            name="kelas_id"
            required
            value={formData.kelas_id}
            onChange={handleChange}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            type="number"
            label="ID Jadwal"
            name="jadwal_id"
            required
            value={formData.jadwal_id}
            onChange={handleChange}
          />
          <Input
            type="date"
            label="Tanggal"
            name="tanggal"
            required
            value={formData.tanggal}
            onChange={handleChange}
          />
        </div>

        {/* Jika Select.jsx menerima array options */}
        <Select
          label="Status Kehadiran"
          name="status_kehadiran"
          value={formData.status_kehadiran}
          onChange={handleChange}
          options={[
            { value: "hadir", label: "Hadir" },
            { value: "sakit", label: "Sakit" },
            { value: "izin", label: "Izin" },
            { value: "alpa", label: "Alpa" },
          ]}
        />

        <Input
          type="text"
          label="Keterangan (Opsional)"
          name="keterangan"
          value={formData.keterangan}
          onChange={handleChange}
        />

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-4">
          <Button
            variant="outline"
            type="button"
            onClick={onClose}
            disabled={loading}
          >
            Batal
          </Button>
          <Button type="submit" isLoading={loading} disabled={loading}>
            Simpan Absensi
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AbsensiFormModal;
