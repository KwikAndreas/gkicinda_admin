import { useState } from "react";
import ArtikelList from "../components/ArtikelList";
import InformasiList from "../components/InformasiList";
import ShalomList from "../components/ShalomList";
import DownloadPage from "./Download";

export default function CMSPage() {
  const tabs = [
    { label: "Shalom", key: "shalom" },
    { label: "Artikel", key: "artikel" },
    { label: "Informasi", key: "informasi" },
    { label: "Download", key: "download" },
  ];
  const [activeTab, setActiveTab] = useState("shalom");

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-10">
      <h1 className="text-2xl font-bold mb-8">Content Management System</h1>
      <div>
        <div className="flex border-b mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={`px-4 py-2 -mb-px border-b-2 font-medium transition-colors ${
                activeTab === tab.key
                  ? "border-blue-600 text-blue-700"
                  : "border-transparent text-gray-500 hover:text-blue-600"
              }`}
              onClick={() => setActiveTab(tab.key)}
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="mt-6 mb-12">
          {activeTab === "shalom" && <ShalomList />}
          {activeTab === "artikel" && <ArtikelList />}
          {activeTab === "informasi" && <InformasiList />}
          {activeTab === "download" && <DownloadPage />}
        </div>
      </div>
    </div>
  );
}
