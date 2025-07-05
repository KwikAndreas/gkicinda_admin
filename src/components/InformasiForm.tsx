import { useState } from "react";
import { supabase } from "../api/supabase";

function getHari(dateStr: string) {
  if (!dateStr) return "";
  const hari = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const d = new Date(dateStr);
  return hari[d.getDay()];
}

export default function InformasiForm({
  onSuccess,
}: {
  onSuccess: () => void;
}) {
  const [form, setForm] = useState({
    judul: "",
    deskripsi: "",
    kategori: "kegiatan",
    tanggal: "",
    jadwal: "",
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
    if (!mediaFile) return null;
    const fileExt = mediaFile.name.split(".").pop();
    const kategori = form.kategori; // "berita" atau "kegiatan"
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${kategori}/${fileName}`;
    const { error } = await supabase.storage
      .from("media-informasi")
      .upload(filePath, mediaFile);
    if (error) {
      alert("Upload gagal: " + error.message);
      return null;
    }
    const url = supabase.storage.from("media-informasi").getPublicUrl(filePath)
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
    const { error } = await supabase.from(table).insert(payload);
    setLoading(false);
    if (error) {
      alert("Gagal menyimpan: " + error.message);
    } else {
      setForm({
        judul: "",
        deskripsi: "",
        kategori: "kegiatan",
        tanggal: "",
        jadwal: "",
      });
      setMediaFile(null);
      onSuccess();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 p-2 sm:p-4 bg-white rounded-xl shadow"
    >
      <h2 className="text-lg font-semibold">Tambah Informasi</h2>
      <select
        name="kategori"
        value={form.kategori}
        onChange={handleChange}
        className="w-full border p-2 rounded"
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
        maxLength={100}
      />
      <textarea
        name="deskripsi"
        placeholder="Deskripsi"
        value={form.deskripsi}
        onChange={handleChange}
        className="w-full border p-2 rounded"
        maxLength={500}
      />
      {/* Input date dinamis */}
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
