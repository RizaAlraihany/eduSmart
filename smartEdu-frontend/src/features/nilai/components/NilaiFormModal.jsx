import { useState } from "react";
import { nilaiService } from "@/services/dataService";
import Modal from "@/shared/components/ui/Modal";
import Input from "@/shared/components/ui/Input";
import Select from "@/shared/components/ui/Select";
import Button from "@/shared/components/ui/Button";
import Alert from "@/shared/components/ui/Alert";

const NilaiFormModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    siswa_id: "",
    kelas_id: "",
    mata_pelajaran_id: "",
    jenis_nilai: "tugas",
    nilai: "",
    semester: "1",
    tahun_ajaran: "2025/2026",
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
      await nilaiService.create(formData);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Gagal menyimpan nilai.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Input Nilai Siswa" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert type="error">{error}</Alert>}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          <Input 
            type="number" 
            label="ID Mapel" 
            name="mata_pelajaran_id"
            required 
            value={formData.mata_pelajaran_id} 
            onChange={handleChange} 
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select 
            label="Jenis Penilaian" 
            name="jenis_nilai"
            value={formData.jenis_nilai} 
            onChange={handleChange}
            options={[
              { value: "tugas", label: "Tugas" },
              { value: "pts", label: "PTS" },
              { value: "uts", label: "UTS" },
              { value: "uas", label: "UAS" },
              { value: "harian", label: "Harian" },
              { value: "praktek", label: "Praktek" },
            ]}
          />
          <Input 
            type="number" 
            label="Nilai (0-100)" 
            name="nilai"
            min="0" 
            max="100"
            required 
            value={formData.nilai} 
            onChange={handleChange} 
          />
        </div>

        <Input 
          type="text" 
          label="Keterangan (Opsional)" 
          name="keterangan"
          value={formData.keterangan} 
          onChange={handleChange} 
        />

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-4">
          <Button variant="outline" type="button" onClick={onClose} disabled={loading}>
            Batal
          </Button>
          <Button type="submit" isLoading={loading} disabled={loading}>
            Simpan Nilai
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default NilaiFormModal;