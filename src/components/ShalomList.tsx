import { useEffect, useState } from "react";
import { supabase } from "../api/supabase";
import EditShalomModal from "./EditShalomModal";

type Shalom = {
  id: number;
  kategori: string;
  judul: string;
  ayat_alkitab: string;
  tampilan_pasal: string;
  tanggal_berlaku: string;
};

const ShalomList = () => {
  const [shalomList, setShalomList] = useState<Shalom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedShalom, setSelectedShalom] = useState<Shalom | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const fetchShalom = async () => {
    const { data, error } = await supabase
      .from("shalom")
      .select("*")
      .order("tanggal_berlaku", { ascending: false });

    if (error) {
      setError(error.message);
    } else {
      setShalomList(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchShalom();
  }, []);

  const handleEdit = (item: Shalom) => {
    setSelectedShalom(item);
    setIsEditOpen(true);
  };

  if (loading) return <p className="text-center">Memuat...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="max-w-5xl mx-auto mt-6 sm:mt-10 px-2 sm:px-0">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
        <h2 className="text-2xl font-bold">Daftar Shalom</h2>
      </div>
      {shalomList.length === 0 ? (
        <p className="text-gray-500 text-center">Belum ada data shalom.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full table-auto border border-gray-200 text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-3 py-2 text-left">Kategori</th>
                <th className="border px-3 py-2 text-left">Judul</th>
                <th className="border px-3 py-2 text-left">Ayat</th>
                <th className="border px-3 py-2 text-left">Tanggal Berlaku</th>
                <th className="border px-3 py-2 text-left">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {shalomList.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="border px-3 py-2 capitalize">
                    {item.kategori}
                  </td>
                  <td className="border px-3 py-2">{item.judul}</td>
                  <td className="border px-3 py-2">{item.tampilan_pasal}</td>
                  <td className="border px-3 py-2">{item.tanggal_berlaku}</td>
                  <td className="border px-3 py-2 space-x-2">
                    <button
                      className="text-blue-600 hover:underline"
                      onClick={() => handleEdit(item)}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {isEditOpen && selectedShalom && (
        <EditShalomModal
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          shalom={selectedShalom}
          onUpdated={() => {
            setIsEditOpen(false);
            setSelectedShalom(null);
            fetchShalom();
          }}
        />
      )}
    </div>
  );
};

export default ShalomList;
