import { useEffect, useState } from "react";
import { supabase } from "../api/supabase";
import InformasiForm from "./InformasiForm";
import EditInformasiModal from "./EditInformasiModal";

export default function InformasiList() {
  const [data, setData] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);

  const handleDelete = async (item: any) => {
    if (!window.confirm("Yakin ingin menghapus data ini?")) return;
    const table = item.kategori === "kegiatan" ? "kegiatan" : "berita";
    const { error } = await supabase.from(table).delete().eq("id", item.id);
    if (error) {
      alert("Gagal menghapus: " + error.message);
    } else {
      fetchInformasi();
    }
  };

  const fetchInformasi = async () => {
    // Ambil data dari kedua tabel
    const { data: kegiatan } = await supabase
      .from("kegiatan")
      .select("*")
      .order("created_at", { ascending: false });
    const { data: berita } = await supabase
      .from("berita")
      .select("*")
      .order("created_at", { ascending: false });
    // Tambahkan kategori untuk penanda
    const kegiatanList = (kegiatan || []).map((item) => ({
      ...item,
      kategori: "kegiatan",
    }));
    const beritaList = (berita || []).map((item) => ({
      ...item,
      kategori: "berita",
    }));
    // Gabungkan dan urutkan berdasarkan created_at
    const all = [...kegiatanList, ...beritaList].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    setData(all);
  };

  useEffect(() => {
    fetchInformasi();
  }, []);

  return (
    <div className="p-2 sm:p-4 mt-4 sm:mt-6 bg-white rounded-xl shadow">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
        <h2 className="text-2xl font-bold">Daftar Informasi</h2>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={() => setShowAddModal(true)}
        >
          + Tambah Informasi
        </button>
      </div>
      {data.length === 0 ? (
        <p className="text-gray-500 text-center">Belum ada informasi.</p>
      ) : (
        data.map((item) => (
          <div
            key={`${item.kategori}-${item.id}`}
            className={`mb-4 border-l-8 pb-4 pl-4 rounded ${
              item.kategori === "kegiatan"
                ? "border-blue-500"
                : "border-green-500"
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold">{item.judul}</h3>
                <span
                  className={`inline-block text-xs px-2 py-1 rounded mb-1 ${
                    item.kategori === "kegiatan"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {item.kategori.charAt(0).toUpperCase() +
                    item.kategori.slice(1)}
                </span>
                <p className="mt-2">{item.ringkasan || item.deskripsi}</p>
                {item.media_url && (
                  <div className="mt-2">
                    {item.media_url.includes("video") ? (
                      <video
                        src={item.media_url}
                        controls
                        className="w-full max-w-md"
                      />
                    ) : (
                      <img
                        src={item.media_url}
                        alt="media"
                        className="w-full max-w-md"
                      />
                    )}
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2 ml-4">
                <button
                  onClick={() => setEditing(item)}
                  className="text-blue-600 hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(item)}
                  className="text-red-600 hover:underline"
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>
        ))
      )}
      {/* Modal Tambah Informasi */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-2">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-xl p-4 sm:p-6 relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={() => setShowAddModal(false)}
            >
              ✕
            </button>
            <InformasiForm
              onSuccess={() => {
                setShowAddModal(false);
                fetchInformasi();
              }}
            />
          </div>
        </div>
      )}
      {/* Modal Edit Informasi */}
      {editing && (
        <EditInformasiModal
          data={editing}
          onClose={() => setEditing(null)}
          onUpdated={fetchInformasi}
        />
      )}
    </div>
  );
}
