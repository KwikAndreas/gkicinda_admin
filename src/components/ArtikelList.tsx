import { useEffect, useState } from "react";
import { supabase } from "../api/supabase";
import EditArtikelModal from "./EditArtikelModal";
import ArtikelForm from "./ArtikelForm";

export default function ArtikelList() {
  const [data, setData] = useState<any[]>([]);
  const [editingArtikel, setEditingArtikel] = useState<any | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchArtikel = async () => {
    const { data } = await supabase
      .from("artikel")
      .select("*")
      .order("created_at", { ascending: false });
    setData(data || []);
  };

  const handleDelete = async (id: string) => {
    const confirm = window.confirm("Yakin ingin menghapus artikel?");
    if (!confirm) return;

    const { error } = await supabase.from("artikel").delete().eq("id", id);
    if (error) {
      alert("Gagal menghapus: " + error.message);
    } else {
      fetchArtikel();
    }
  };

  useEffect(() => {
    fetchArtikel();
  }, []);

  return (
    <div className="p-4 mt-6 bg-white rounded-xl shadow">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Daftar Artikel</h2>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={() => setShowAddModal(true)}
        >
          + Tambah Artikel
        </button>
      </div>
      {data.length === 0 ? (
        <p className="text-gray-500 text-center">Belum ada artikel.</p>
      ) : (
        data.map((item) => (
          <div key={item.id} className="mb-4 border-b pb-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold">{item.judul}</h3>
                <p className="text-sm text-gray-500">Penulis: {item.penulis}</p>
                <p className="mt-2">{item.ringkasan}</p>
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
                  onClick={() => setEditingArtikel(item)}
                  className="text-blue-600 hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-red-600 hover:underline"
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>
        ))
      )}
      {/* Modal Tambah Artikel */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-xl p-6 relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={() => setShowAddModal(false)}
            >
              ✕
            </button>
            <ArtikelForm
              onSuccess={() => {
                setShowAddModal(false);
                fetchArtikel();
              }}
            />
          </div>
        </div>
      )}
      {/* Modal Edit Artikel */}
      {editingArtikel && (
        <EditArtikelModal
          artikel={editingArtikel}
          onClose={() => setEditingArtikel(null)}
          onUpdated={fetchArtikel}
        />
      )}
    </div>
  );
}
