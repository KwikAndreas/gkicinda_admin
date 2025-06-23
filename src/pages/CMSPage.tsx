import ArtikelList from "../components/ArtikelList";
import InformasiList from "../components/InformasiList";
import ShalomList from "../components/ShalomList";
import DownloadPage from "./Download";

export default function CMSPage() {
  return (
    <div className="max-w-5xl mx-auto p-6 space-y-10">
      <h1 className="text-2xl font-bold mb-8">Content Management System</h1>

      <section>
        <ShalomList />
      </section>

      <section>
        <ArtikelList />
      </section>

      <section>
        <InformasiList />
      </section>

      <section>
        <DownloadPage />
      </section>
    </div>
  );
}
