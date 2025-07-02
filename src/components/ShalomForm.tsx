import { useState } from "react";
import { supabase } from "../api/supabase";

const ShalomForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const [formData, setFormData] = useState({
    kategori: "renungan",
    judul: "",
    ayat_alkitab: "",
    tampilan_pasal: "",
    tanggal_berlaku: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.from("shalom").insert([formData]);

    if (error) {
      setMessage(`❌ Gagal: ${error.message}`);
    } else {
      setMessage("✅ Shalom berhasil dikirim.");
      setFormData({
        kategori: "renungan",
        judul: "",
        ayat_alkitab: "",
        tampilan_pasal: "",
        tanggal_berlaku: "",
      });
      onSuccess();
    }
    setLoading(false);
  };

  return (
    <div className="max-w-xl mx-auto p-4 sm:p-6 bg-white rounded-2xl shadow-md mt-6 sm:mt-10">
      <h2 className="text-xl font-semibold mb-4">Post Shalom</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium mb-1">Kategori</label>
          <select
            name="kategori"
            value={formData.kategori}
            onChange={handleChange}
            className="w-full border rounded p-2"
          >
            <option value="renungan">Renungan Harian</option>
            <option value="bacaan">Bacaan Alkitab Sepekan</option>
            <option value="pokok-doa">Pokok Doa Mingguan</option>
          </select>
        </div>

        <div>
          <label className="block font-medium mb-1">Judul</label>
          <input
            type="text"
            name="judul"
            value={formData.judul}
            onChange={handleChange}
            className="w-full border rounded p-2"
            required
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Ayat Alkitab</label>
          <input
            type="text"
            name="ayat_alkitab"
            value={formData.ayat_alkitab}
            onChange={handleChange}
            className="w-full border rounded p-2"
            placeholder="Contoh: Yohanes 3:16"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Tampilan Pasal</label>
          <input
            type="text"
            name="tampilan_pasal"
            value={formData.tampilan_pasal}
            onChange={handleChange}
            className="w-full border rounded p-2"
            placeholder="Contoh: Yoh 3:16"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Tanggal Berlaku</label>
          <input
            type="date"
            name="tanggal_berlaku"
            value={formData.tanggal_berlaku}
            onChange={handleChange}
            className="w-full border rounded p-2"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          {loading ? "Mengirim..." : "Kirim Shalom"}
        </button>

        {message && <p className="mt-3 text-sm text-center">{message}</p>}
      </form>
    </div>
  );
};

export default ShalomForm;
