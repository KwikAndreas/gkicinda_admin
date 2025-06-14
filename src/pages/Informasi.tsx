import InformasiForm from "../components/InformasiForm";
import InformasiList from "../components/InformasiList";

export default function InformasiPage() {
  return (
      <div className="p-6 space-y-6">
        <InformasiForm onSuccess={() => window.location.reload()} />
        <InformasiList />
      </div>
    );
}
