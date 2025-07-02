import { useState } from "react";
import { supabase } from "../api/supabase";

export default function EditArtikelModal({
  artikel,
  onClose,
  onUpdated,
}: {
  artikel: any;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const [form, setForm] = useState({
    judul: artikel.judul,
    penulis: artikel.penulis,
    ringkasan: artikel.ringkasan,
    isi: artikel.isi,
  });
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpload = async () => {
    if (!mediaFile) return artikel.media_url;
    const fileExt = mediaFile.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;

    const { error } = await supabase.storage
      .from("artikel-media")
      .upload(fileName, mediaFile, { upsert: true });

    if (error) {
      alert("Upload gagal: " + error.message);
      return artikel.media_url;
    }

    const url = supabase.storage.from("artikel-media").getPublicUrl(fileName)
      .data.publicUrl;
    return url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const media_url = await handleUpload();

    const { error } = await supabase
      .from("artikel")
      .update({ ...form, media_url })
      .eq("id", artikel.id);

    setLoading(false);
    if (error) {
      alert("Gagal mengupdate: " + error.message);
    } else {
      onUpdated();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 px-2">
      <form
        onSubmit={handleSubmit}
        className="bg-white w-full max-w-xl p-4 sm:p-6 rounded-xl space-y-4"
      >
        <h2 className="text-xl font-semibold">Edit Artikel</h2>
        <input
          name="judul"
          placeholder="Judul"
          value={form.judul}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />
        <input
          name="penulis"
          placeholder="Penulis"
          value={form.penulis}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />
        <textarea
          name="ringkasan"
          placeholder="Ringkasan"
          value={form.ringkasan}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />
        <textarea
          name="isi"
          placeholder="Isi artikel"
          value={form.isi}
          onChange={handleChange}
          className="w-full border p-2 rounded h-40"
        />
        <input
          type="file"
          accept="image/*,video/*"
          onChange={(e) => setMediaFile(e.target.files?.[0] || null)}
        />
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Batal
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
