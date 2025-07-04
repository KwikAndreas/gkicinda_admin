import React, { useState } from "react";
import { supabase } from "../api/supabase";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface DownloadFormProps {
  onUploadSuccess: () => void;
}

const DownloadForm: React.FC<DownloadFormProps> = ({ onUploadSuccess }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    } else {
      setSelectedFile(null);
    }
    setMessage("");
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setMessage("Silakan pilih file PDF terlebih dahulu.");
      return;
    }

    if (selectedFile.type !== "application/pdf") {
      setMessage("Hanya file PDF yang diizinkan.");
      return;
    }

    setUploading(true);
    setMessage("Mengunggah file...");

    try {
      const bucketName = "download";
      const today = new Date();
      const formattedDate = format(today, "dd MMMM yyyy", {
        locale: id,
      });
      const fileName = `WARTA JEMAAT ${formattedDate.toUpperCase()}.pdf`;
      const filePath = `public/warta-jemaat/${fileName}`;

      // Upload menggunakan Supabase SDK (reliable)
      const { error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, selectedFile, {
          upsert: true,
          contentType: "application/pdf",
        });

      if (error) {
        throw error;
      }

      setMessage("File Warta Jemaat berhasil diperbarui!");
      setSelectedFile(null);
      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (error: any) {
      console.error("Error saat mengunggah:", error.message);
      setMessage(`Gagal mengunggah file: ${error.message || "Unknown error"}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="border border-gray-300 p-4 rounded-lg mb-4 bg-white flex flex-col gap-2">
      <h3 className="font-semibold mb-2">Unggah Warta Jemaat Baru</h3>
      {/* Spinner upload */}
      {uploading && (
        <div className="mb-2 p-3 bg-blue-50 border border-blue-200 rounded shadow flex flex-col items-center w-full max-w-xs">
          <div className="relative w-full h-6 bg-blue-100 rounded mb-2 overflow-hidden">
            <div
              className="absolute left-0 top-0 h-full bg-blue-600 transition-all duration-200"
              style={{ width: `100%` }}
            ></div>
            <span
              className="absolute w-full text-center text-white font-semibold text-sm z-10 drop-shadow"
              style={{ lineHeight: "1.5rem" }}
            >
              Loading...
            </span>
          </div>
          <span className="text-blue-700 font-medium">Mengunggah file...</span>
        </div>
      )}
      <input
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
        className="mb-2"
      />
      <button
        onClick={handleUpload}
        disabled={!selectedFile || uploading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-60 w-full sm:w-auto"
      >
        {uploading ? "Mengunggah..." : "Unggah PDF"}
      </button>
      {message && (
        <p
          className={`mt-2 text-sm ${
            uploading
              ? "text-blue-600"
              : message.includes("berhasil")
              ? "text-green-600"
              : "text-red-600"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
};

export default DownloadForm;

/*

Tidak ada perubahan kode di sini, pastikan komponen ini diimport dan digunakan di file lain.
Jika ingin menghilangkan warning, gunakan DownloadForm di salah satu halaman, misal:
import DownloadForm from "../components/DownloadForm";
<DownloadForm onUploadSuccess={...} />

*/
