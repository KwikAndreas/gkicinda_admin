import { useState, useEffect } from "react";
import { supabase } from "../api/supabase";

type EditShalomModalProps = {
  isOpen: boolean;
  onClose: () => void;
  shalom: {
    id: number;
    kategori: string;
    judul: string;
    ayat_alkitab: string;
    tampilan_pasal: string;
    tanggal_berlaku: string;
  };
  onUpdated: () => void;
};

const kategoriOptions = [
  "Renungan",
  "Bacaan",
  "Pokok_doa",
] as const;

export default function EditShalomModal({
  isOpen,
  onClose,
  shalom,
  onUpdated,
}: EditShalomModalProps) {
  const [form, setForm] = useState({ ...shalom });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setForm({ ...shalom });
  }, [shalom]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from("shalom")
      .update(form)
      .eq("id", form.id);

    setLoading(false);
    if (error) {
      alert("Gagal memperbarui: " + error.message);
    } else {
      onUpdated();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 bg-black/40 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 relative">
        <h2 className="text-xl font-semibold mb-4">Edit Shalom</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium">Kategori</label>
            <select
              name="kategori"
              value={form.kategori}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            >
              {kategoriOptions.map((option) => (
                <option key={option} value={option}>
                  {option.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Judul</label>
            <input
              type="text"
              name="judul"
              value={form.judul}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Ayat Alkitab</label>
            <input
              type="text"
              name="ayat_alkitab"
              value={form.ayat_alkitab}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Tampilan Pasal</label>
            <input
              type="text"
              name="tampilan_pasal"
              value={form.tampilan_pasal}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Tanggal Berlaku</label>
            <input
              type="date"
              name="tanggal_berlaku"
              value={form.tanggal_berlaku}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
          </div>
          <div className="flex justify-end mt-4 gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded bg-gray-200 hover:bg-gray-300"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {loading ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
