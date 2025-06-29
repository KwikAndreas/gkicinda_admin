import React, { useEffect, useState } from "react";
import { supabase } from "../api/supabase";
import { parse, isValid } from "date-fns";
import { id } from 'date-fns/locale';

interface DownloadListProps {
  refreshTrigger: number; // Prop untuk memicu refresh data
}

interface PdfFile {
  name: string;
  url: string;
  date: Date | null;
}

const BUCKET_NAME = "download";

const DownloadList: React.FC<DownloadListProps> = ({ refreshTrigger }) => {
  const [pdfFiles, setPdfFiles] = useState<PdfFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPdfUrls = async () => {
      setLoading(true);
      setError(null);

      try {
        // 1. Ambil URL publik untuk Liturgi Kebaktian Umum (statis)
        const liturgiFile: PdfFile[] = [];
        const { data: liturgiData } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl('public/liturgi-kebaktian-umum.pdf');

        if (liturgiData?.publicUrl) {
          liturgiFile.push({
            name: 'Liturgi Kebaktian Umum',
            url: liturgiData.publicUrl,
            date: null
          });
        }

        // 2. Ambil daftar file dari folder 'public/warta-jemaat/'
        const { data: listData, error: listError } = await supabase.storage
          .from(BUCKET_NAME)
          .list('warta-jemaat/');

        if (listError) {
          throw listError;
        }

        const wartaFiles: PdfFile[] = [];
        if (listData) {
          listData.forEach(file => {
            if (file.name.endsWith('.pdf')) {
              // Regex baru untuk mencocokkan "WARTA JEMAAT DD BULAN YYYY.pdf"
              const match = file.name.match(/WARTA JEMAAT (\d{1,2} \w+ \d{4})\.pdf/i); // Tambah 'i' untuk case-insensitivity jika perlu fleksibilitas
              let fileDate: Date | null = null;
              if (match && match[1]) {
                // Pastikan format parsing sesuai dengan format yang digunakan saat mengunggah
                const parsedDate = parse(match[1], 'dd MMMM yyyy', new Date(), { locale: id });
                if (isValid(parsedDate)) {
                  fileDate = parsedDate;
                }
              }

              const { data: publicUrlData } = supabase.storage
                .from(BUCKET_NAME)
                .getPublicUrl(`warta-jemaat/${file.name}`);

              if (publicUrlData?.publicUrl) {
                wartaFiles.push({
                  name: file.name.replace('.pdf', ''),
                  url: publicUrlData.publicUrl,
                  date: fileDate,
                });
              }
            }
          });
        }

        // Urutkan file Warta Jemaat dari yang terbaru (tanggal paling besar)
        wartaFiles.sort((a, b) => {
          if (!a.date && !b.date) return 0;
          if (!a.date) return 1;
          if (!b.date) return -1;
          return b.date.getTime() - a.date.getTime();
        });

        setPdfFiles([...liturgiFile, ...wartaFiles]);

      } catch (err: any) {
        console.error('Error fetching PDF URLs:', err.message);
        setError('Gagal memuat daftar file PDF.');
      } finally {
        setLoading(false);
      }
    };

    fetchPdfUrls();
  }, [refreshTrigger]);

  if (loading) {
    return <p>Memuat daftar file...</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  return (
    <div
      style={{ border: "1px solid #ccc", padding: "20px", borderRadius: "8px" }}
    >
      <h3>File PDF Tersedia</h3>
      {pdfFiles.length === 0 ? (
        <p>Tidak ada file PDF yang ditemukan.</p>
      ) : (
        <ul>
          {pdfFiles.map((file, index) => (
            <li key={index} style={{ marginBottom: "10px" }}>
              <a
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: "none", color: "#007bff" }}
              >
                {file.name}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DownloadList;
