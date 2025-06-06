import ArtikelForm from "../components/ArtikelForm";
import ArtikelList from "../components/ArtikelList";

export default function ArtikelPage() {
  return (
    <div className="p-6 space-y-6">
      <ArtikelForm onSuccess={() => window.location.reload()} />
      <ArtikelList />
    </div>
  );
}
