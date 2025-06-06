import { useState } from "react";
import { supabase } from "../api/supabase";

export default function ArtikelForm({ onSuccess }: { onSuccess: () => void }) {
  const [form, setForm] = useState({
    judul: "",
    penulis: "",
    ringkasan: "",
    isi: "",
  });
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpload = async () => {
    if (!mediaFile) return null;

    const fileExt = mediaFile.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const { error } = await supabase.storage
      .from("media-artikel")
      .upload(fileName, mediaFile);

    if (error) {
      alert("Upload gagal: " + error.message);
      return null;
    }

    const url = supabase.storage.from("media-artikel").getPublicUrl(fileName).data.publicUrl;
    return url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const media_url = await handleUpload();

    const { error } = await supabase.from("artikel").insert({
      ...form,
      media_url,
    });

    setLoading(false);
    if (error) {
      alert("Gagal menyimpan: " + error.message);
    } else {
      setForm({ judul: "", penulis: "", ringkasan: "", isi: "" });
      setMediaFile(null);
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white rounded-xl shadow">
      <h2 className="text-lg font-semibold">Tambah Artikel</h2>
      <input
        name="judul"
        placeholder="Judul"
        value={form.judul}
        onChange={handleChange}
        className="w-full border p-2 rounded"
      />
      <input
        name="penulis"
        placeholder="Nama Penulis"
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
      <button
        type="submit"
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        disabled={loading}
      >
        {loading ? "Menyimpan..." : "Simpan"}
      </button>
    </form>
  );
}
