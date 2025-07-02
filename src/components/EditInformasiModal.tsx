import { useState } from "react";
import { supabase } from "../api/supabase";

function getHari(dateStr: string) {
  if (!dateStr) return "";
  const hari = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const d = new Date(dateStr);
  return hari[d.getDay()];
}

export default function EditInformasiModal({
  data,
  onClose,
  onUpdated,
}: {
  data: any;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const [form, setForm] = useState({
    judul: data.judul || "",
    deskripsi: data.deskripsi || "",
    kategori: data.kategori || "kegiatan",
    tanggal: data.tanggal || "",
    jadwal: data.jadwal || "",
  });
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpload = async () => {
    if (!mediaFile) return data.media_url;
    const fileExt = mediaFile.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const { error } = await supabase.storage
      .from("media-informasi")
      .upload(fileName, mediaFile, { upsert: true });
    if (error) {
      alert("Upload gagal: " + error.message);
      return data.media_url;
    }
    const url = supabase.storage.from("media-informasi").getPublicUrl(fileName)
      .data.publicUrl;
    return url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const media_url = await handleUpload();
    let payload: any = {
      judul: form.judul,
      deskripsi: form.deskripsi,
      media_url,
    };
    let table = "";
    if (form.kategori === "kegiatan") {
      table = "kegiatan";
      payload.jadwal = form.jadwal;
    } else {
      table = "berita";
      payload.tanggal = form.tanggal;
    }
    const { error } = await supabase
      .from(table)
      .update(payload)
      .eq("id", data.id);
    setLoading(false);
    if (error) {
      alert("Gagal mengupdate: " + error.message);
    } else {
      onUpdated();
      onClose();
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Yakin ingin menghapus data ini?")) return;
    setLoading(true);
    const table = form.kategori === "kegiatan" ? "kegiatan" : "berita";
    const { error } = await supabase.from(table).delete().eq("id", data.id);
    setLoading(false);
    if (error) {
      alert("Gagal menghapus: " + error.message);
    } else {
      onUpdated();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-2">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-xl w-full max-w-xl p-4 sm:p-6 relative space-y-4"
      >
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          type="button"
          onClick={onClose}
        >
          ✕
        </button>
        <h2 className="text-lg font-semibold mb-2">Edit Informasi</h2>
        <select
          name="kategori"
          value={form.kategori}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          disabled
        >
          <option value="kegiatan">Kegiatan</option>
          <option value="berita">Berita</option>
        </select>
        <input
          name="judul"
          placeholder="Judul"
          value={form.judul}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />
        <textarea
          name="deskripsi"
          placeholder="Deskripsi"
          value={form.deskripsi}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />
        {form.kategori === "kegiatan" && (
          <div>
            <label className="block mb-1 font-medium">Jadwal</label>
            <input
              type="date"
              name="jadwal"
              value={form.jadwal}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
            {form.jadwal && (
              <div className="text-sm text-gray-600 mt-1">
                Hari: <b>{getHari(form.jadwal)}</b>
              </div>
            )}
          </div>
        )}
        {form.kategori === "berita" && (
          <div>
            <label className="block mb-1 font-medium">Tanggal</label>
            <input
              type="date"
              name="tanggal"
              value={form.tanggal}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
            {form.tanggal && (
              <div className="text-sm text-gray-600 mt-1">
                Hari: <b>{getHari(form.tanggal)}</b>
              </div>
            )}
          </div>
        )}
        <input
          type="file"
          accept="image/*,video/*"
          onChange={(e) => setMediaFile(e.target.files?.[0] || null)}
        />
        <div className="flex justify-between mt-4">
          <button
            type="button"
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            onClick={handleDelete}
            disabled={loading}
          >
            Hapus
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </form>
    </div>
  );
}
