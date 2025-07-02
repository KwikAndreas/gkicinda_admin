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
    <div className="max-w-5xl mx-auto px-2 sm:px-4 md:px-6 py-4 sm:py-6 space-y-6 sm:space-y-10">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-8 text-center">
        Content Management System
      </h1>
      <div>
        <nav
          className="flex flex-nowrap sm:flex-wrap border-b mb-4 sm:mb-6 overflow-x-auto sm:overflow-x-visible"
          aria-label="CMS Tabs"
        >
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={`px-3 sm:px-4 py-2 -mb-px border-b-2 font-medium transition-colors whitespace-nowrap focus:outline-none ${
                activeTab === tab.key
                  ? "border-blue-600 text-blue-700 bg-blue-50"
                  : "border-transparent text-gray-500"
              }`}
              onClick={() => setActiveTab(tab.key)}
              type="button"
              tabIndex={0}
            >
              {tab.label}
            </button>
          ))}
        </nav>
        <div className="mt-4 sm:mt-6 mb-8 sm:mb-12 min-h-[300px]">
          <div className="w-full">
            {activeTab === "shalom" && (
              <div className="animate-fadein">
                <ShalomList />
              </div>
            )}
            {activeTab === "artikel" && (
              <div className="animate-fadein">
                <ArtikelList />
              </div>
            )}
            {activeTab === "informasi" && (
              <div className="animate-fadein">
                <InformasiList />
              </div>
            )}
            {activeTab === "download" && (
              <div className="animate-fadein">
                <DownloadPage />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
