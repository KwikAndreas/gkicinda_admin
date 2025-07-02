import React, { useState } from "react";
import { supabase } from "../api/supabase";
import { format } from "date-fns";

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
    setMessage(""); // Bersihkan pesan saat file baru dipilih
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
      const bucketName = "download"; // Ganti dengan nama bucket Supabase Anda

      const today = new Date();
      // Contoh: '29 Juni 2025'
      const formattedDate = format(today, "dd MMMM yyyy", {
        locale: require("date-fns/locale/id"),
      }); // Gunakan locale Indonesia jika perlu
      const fileName = `WARTA JEMAAT ${formattedDate.toUpperCase()}.pdf`;
      const filePath = `public/warta-jemaat/${fileName}`;

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
      setSelectedFile(null); // Reset input file
      if (onUploadSuccess) {
        onUploadSuccess(); // Panggil callback untuk memicu refresh di DownloadList
      }
    } catch (error: any) {
      console.error("Error saat mengunggah:", error.message);
      setMessage(`Gagal mengunggah file: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="border border-gray-300 p-4 rounded-lg mb-4 bg-white flex flex-col gap-2">
      <h3 className="font-semibold mb-2">Unggah Warta Jemaat Baru</h3>
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
