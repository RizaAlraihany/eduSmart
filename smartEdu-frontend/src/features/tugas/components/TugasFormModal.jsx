import { useState } from "react";
import { tugasService } from "@/services/dataService";
import Modal from "@/shared/components/ui/Modal";
import Input from "@/shared/components/ui/Input";
import Button from "@/shared/components/ui/Button";
import Alert from "@/shared/components/ui/Alert";

const TugasFormModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    judul: "",
    deskripsi: "",
    kelas_id: "",
    mata_pelajaran_id: "",
    tanggal_diberikan: new Date().toISOString().split("T")[0],
    tanggal_deadline: "",
    semester: "1",
    tahun_ajaran: "2025/2026",
    status: "aktif",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await tugasService.create(formData);
      onSuccess(); 
      onClose(); 
    } catch (err) {
      setError(err.response?.data?.message || "Gagal menyimpan tugas.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Buat Tugas Baru" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert type="error">{error}</Alert>}

        <Input 
          label="Judul Tugas" 
          name="judul"
          required 
          value={formData.judul} 
          onChange={handleChange} 
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
          <textarea 
            name="deskripsi"
            className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" 
            rows="3"
            value={formData.deskripsi} 
            onChange={handleChange}
          ></textarea>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input 
            type="date" 
            label="Tgl Diberikan" 
            name="tanggal_diberikan"
            required 
            value={formData.tanggal_diberikan} 
            onChange={handleChange} 
          />
          <Input 
            type="date" 
            label="Tenggat Waktu (Deadline)" 
            name="tanggal_deadline"
            required 
            value={formData.tanggal_deadline} 
            onChange={handleChange} 
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-4">
          <Button variant="outline" type="button" onClick={onClose} disabled={loading}>
            Batal
          </Button>
          <Button type="submit" isLoading={loading} disabled={loading}>
            Simpan Tugas
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default TugasFormModal;
