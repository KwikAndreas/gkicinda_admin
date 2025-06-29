import { useState } from "react";
import DownloadForm from "../components/DownloadForm";
import DownloadList from "../components/DownloadList";

export default function DownloadPage() {
  const [refreshList, setRefreshList] = useState(0);

  const handleUploadSuccess = () => {
    // Tingkatkan nilai refreshList untuk memicu useEffect di DownloadList
    setRefreshList((prev) => prev + 1);
  };
  return (
    <div className="flex flex-col md:flex-row gap-8 py-8 px-4 md:px-8">
      {/* Kolom Kiri untuk Form Upload (Admin) */}
      <div className="md:w-1/2">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          Unggah Dokumen Baru
        </h2>
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <DownloadForm onUploadSuccess={handleUploadSuccess} />
        </div>
      </div>

      {/* Kolom Kanan untuk Daftar Download */}
      <div className="md:w-1/2">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          Daftar Dokumen
        </h2>
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          {/* refreshTrigger akan memicu DownloadList untuk me-load ulang data */}
          <DownloadList refreshTrigger={refreshList} />
        </div>
      </div>
    </div>
  );
}
