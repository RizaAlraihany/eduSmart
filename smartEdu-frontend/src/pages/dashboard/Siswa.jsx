import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import dataService from "../../services/dataService";
import DataTable from "../../components/dashboard/DataTable";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Alert from "../../components/common/Alert";
import { Plus, Edit, Trash2, Eye, Search } from "lucide-react";

const Siswa = () => {
  const [siswas, setSiswas] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    kelas_id: "",
    jenis_kelamin: "",
  });

  useEffect(() => {
    fetchSiswas();
  }, [search, filters]);

  const fetchSiswas = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        search,
        ...filters,
      };
      const response = await dataService.getSiswas(params);
      setSiswas(response.data.data);
      setPagination({
        current_page: response.data.current_page,
        last_page: response.data.last_page,
        per_page: response.data.per_page,
        total: response.data.total,
      });
    } catch (err) {
      setError("Gagal memuat data siswa");
      console.error("Fetch siswa error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Apakah Anda yakin ingin menghapus data ini?")) return;

    try {
      await dataService.deleteSiswa(id);
      fetchSiswas();
    } catch (err) {
      setError("Gagal menghapus data siswa");
    }
  };

  const columns = [
    {
      header: "NISN",
      accessor: "nisn",
      render: (row) => <span className="font-medium">{row.nisn}</span>,
    },
    {
      header: "Nama",
      accessor: "nama",
      render: (row) => (
        <div className="flex items-center">
          <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold text-sm mr-3">
            {row.nama.charAt(0)}
          </div>
          <div>
            <div className="font-medium text-gray-900">{row.nama}</div>
            <div className="text-sm text-gray-500">{row.email}</div>
          </div>
        </div>
      ),
    },
    {
      header: "Kelas",
      accessor: "kelas",
      render: (row) => row.kelas?.nama_kelas || "-",
    },
    {
      header: "Jenis Kelamin",
      accessor: "jenis_kelamin",
      render: (row) => (row.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan"),
    },
    {
      header: "Status",
      accessor: "status",
      render: (row) => {
        const statusColors = {
          aktif: "success",
          nonaktif: "warning",
          lulus: "info",
          pindah: "danger",
        };
        return <Badge variant={statusColors[row.status]}>{row.status}</Badge>;
      },
    },
    {
      header: "Aksi",
      accessor: "actions",
      className: "text-right",
      render: (row) => (
        <div className="flex items-center justify-end space-x-2">
          <Link to={`/dashboard/siswa/${row.id}`}>
            <button className="btn-secondary btn-sm">
              <Eye className="w-4 h-4" />
            </button>
          </Link>
          <Link to={`/dashboard/siswa/edit/${row.id}`}>
            <button className="btn-secondary btn-sm">
              <Edit className="w-4 h-4" />
            </button>
          </Link>
          <button
            onClick={() => handleDelete(row.id)}
            className="btn-danger btn-sm"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Data Siswa</h1>
          <p className="text-gray-600 mt-1">Kelola data siswa</p>
        </div>
        <Link to="/dashboard/siswa/create">
          <Button variant="primary">
            <Plus className="w-4 h-4 mr-2" />
            Tambah Siswa
          </Button>
        </Link>
      </div>

      {error && (
        <Alert type="error" message={error} onClose={() => setError("")} />
      )}

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="label">Cari</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input pl-10"
                placeholder="Cari nama atau NISN..."
              />
            </div>
          </div>

          <div>
            <label className="label">Status</label>
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
              className="input"
            >
              <option value="">Semua Status</option>
              <option value="aktif">Aktif</option>
              <option value="nonaktif">Non-Aktif</option>
              <option value="lulus">Lulus</option>
              <option value="pindah">Pindah</option>
            </select>
          </div>

          <div>
            <label className="label">Jenis Kelamin</label>
            <select
              value={filters.jenis_kelamin}
              onChange={(e) =>
                setFilters({ ...filters, jenis_kelamin: e.target.value })
              }
              className="input"
            >
              <option value="">Semua</option>
              <option value="L">Laki-laki</option>
              <option value="P">Perempuan</option>
            </select>
          </div>

          <div className="flex items-end">
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => {
                setSearch("");
                setFilters({ status: "", kelas_id: "", jenis_kelamin: "" });
              }}
            >
              Reset Filter
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={siswas}
        loading={loading}
        pagination={pagination}
        onPageChange={fetchSiswas}
      />
    </div>
  );
};

export default Siswa;
