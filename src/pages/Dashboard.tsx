// Dashboard.tsx
import { useEffect, useState } from "react";
import axios from "axios";
import { Chart } from "react-google-charts";

export default function Dashboard() {
  const [dailyUsers, setDailyUsers] = useState<number | null>(null);
  const [weeklyUsers, setWeeklyUsers] = useState<number | null>(null);
  const [monthlyUsers, setMonthlyUsers] = useState<number | null>(null);

  const [userActivity, setUserActivity] = useState<
    { date: string; value: number }[]
  >([]);
  const [avgEngagement, setAvgEngagement] = useState<
    { date: string; value: number }[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // PASTIKAN INI ADALAH URL RELATIF UNTUK DEPLOYMENT VERCEL!
        // Jika masih 'http://localhost...', ubah menjadi '/api/analytics'
        const baseUrl = "/api/analytics";

        console.log("Fetching daily users...");
        const dailyRes = await axios.get(`${baseUrl}?type=daily`);
        console.log("Daily Users Raw Response:", dailyRes.data);
        setDailyUsers(Number(dailyRes.data.users) || 0); // Konversi eksplisit ke Number, default 0

        console.log("Fetching weekly users...");
        const weeklyRes = await axios.get(`${baseUrl}?type=weekly`);
        console.log("Weekly Users Raw Response:", weeklyRes.data);
        setWeeklyUsers(Number(weeklyRes.data.users) || 0); // Konversi eksplisit ke Number, default 0

        console.log("Fetching monthly users...");
        const monthlyRes = await axios.get(`${baseUrl}?type=monthly`);
        console.log("Monthly Users Raw Response:", monthlyRes.data);
        setMonthlyUsers(Number(monthlyRes.data.users) || 0); // Konversi eksplisit ke Number, default 0

        console.log("Fetching user activity...");
        const userActivityRes = await axios.get(`${baseUrl}?type=timeseries`);
        console.log("User Activity Raw Response:", userActivityRes.data);
        // Pastikan setiap 'value' dalam array adalah Number
        const processedUserActivity = (userActivityRes.data.data || []).map(
          (d: { date: string; value: any }) => ({
            date: d.date,
            value: Number(d.value) || 0, // Pastikan ini angka
          })
        );
        setUserActivity(processedUserActivity);

        console.log("Fetching average engagement...");
        const avgEngagementRes = await axios.get(
          `${baseUrl}?type=timeseries&metric=averageEngagementTimePerUser`
        );
        console.log("Avg Engagement Raw Response:", avgEngagementRes.data);
        // Pastikan setiap 'value' dalam array adalah Number
        const processedAvgEngagement = (avgEngagementRes.data.data || []).map(
          (d: { date: string; value: any }) => ({
            date: d.date,
            value: Number(d.value) ? Math.round(Number(d.value)) : 0, // Pastikan ini angka, bulatkan
          })
        );
        setAvgEngagement(processedAvgEngagement);
      } catch (err: any) {
        console.error("Failed to fetch analytics data:", err);
        setError(err.message || "Gagal memuat data analitik.");
        // Log respons error dari server jika ada
        if (err.response) {
          console.error("Server Error Response:", err.response.data);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Data untuk Google Chart harus array 2 dimensi: [header, ...data]
  const userActivityChartData = [
    ["Tanggal", "Active Users"],
    ...userActivity.map((d) => [
      // Pastikan format tanggal sesuai kebutuhan Anda (misal: "DD/MM")
      d.date.length === 8 // Format YYYYMMDD
        ? `${d.date.slice(6, 8)}/${d.date.slice(4, 6)}`
        : d.date, // Untuk format lain yang mungkin sudah benar
      d.value, // d.value sudah Number karena diproses di useEffect
    ]),
  ];

  const avgEngagementChartData = [
    ["Tanggal", "Avg Engagement (s)"],
    ...avgEngagement.map((d) => [
      // Pastikan format tanggal
      d.date.length === 8
        ? `${d.date.slice(6, 8)}/${d.date.slice(4, 6)}`
        : d.date,
      d.value, // d.value sudah Number karena diproses di useEffect
    ]),
  ];

  const summaryChartData = [
    ["Periode", "Pengguna"],
    ["Harian", dailyUsers ?? 0],
    ["Mingguan", weeklyUsers ?? 0],
    ["Bulanan", monthlyUsers ?? 0],
  ];

  // Debugging akhir sebelum render chart
  useEffect(() => {
    console.log(
      "Final userActivityChartData for Chart:",
      userActivityChartData
    );
    console.log(
      "Final avgEngagementChartData for Chart:",
      avgEngagementChartData
    );
    console.log("Final summaryChartData for Chart:", summaryChartData);
    // Anda bisa tambahkan validasi di sini, misalnya:
    // if (userActivityChartData.length > 1 && typeof userActivityChartData[1][1] !== 'number') {
    //    console.error("DEBUG: userActivityChartData has non-numeric value!", userActivityChartData[1][1]);
    // }
  }, [userActivityChartData, avgEngagementChartData, summaryChartData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-6 flex justify-center items-center">
        <p className="text-xl text-gray-700">Memuat data analitik...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-6 flex justify-center items-center">
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
          <p className="text-sm mt-2">
            Pastikan server backend berjalan dan variabel lingkungan
            GA_PROPERTY_ID serta GOOGLE_APPLICATION_CREDENTIALS telah diatur
            dengan benar. Cek log Vercel untuk detail error.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-800 text-center">
          Statistik Website GKI Cipinang Indah
        </h1>
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          {/* User Activity */}
          <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col flex-1 md:basis-2/3">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              User Activity (30 Hari Terakhir)
            </h2>
            <div className="flex-1 h-72">
              {userActivityChartData.length > 1 ? ( // Render chart hanya jika ada data
                <Chart
                  width={"100%"}
                  height={"100%"}
                  chartType="LineChart"
                  loader={<div>Loading Chart...</div>}
                  data={userActivityChartData}
                  options={{
                    legend: { position: "bottom" },
                    hAxis: { title: "Tanggal" },
                    vAxis: { title: "Active Users", minValue: 0 }, // Tambahkan minValue
                    colors: ["#8884d8"],
                  }}
                />
              ) : (
                <p className="text-center text-gray-500 mt-10">
                  Tidak ada data aktivitas pengguna untuk ditampilkan.
                </p>
              )}
            </div>
          </div>
          {/* Engagement & Ringkasan */}
          <div className="flex flex-col gap-6 flex-1 md:basis-1/3">
            <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col flex-1">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">
                Average Engagement Time per Active User (detik)
              </h2>
              <div className="flex-1 h-32 md:h-40">
                {avgEngagementChartData.length > 1 ? ( // Render chart hanya jika ada data
                  <Chart
                    width={"100%"}
                    height={"100%"}
                    chartType="LineChart"
                    loader={<div>Loading Chart...</div>}
                    data={avgEngagementChartData}
                    options={{
                      legend: { position: "bottom" },
                      hAxis: { title: "Tanggal" },
                      vAxis: { title: "Avg Engagement (s)", minValue: 0 }, // Tambahkan minValue
                      colors: ["#82ca9d"],
                    }}
                  />
                ) : (
                  <p className="text-center text-gray-500 mt-5">
                    Tidak ada data engagement untuk ditampilkan.
                  </p>
                )}
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col flex-1">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">
                Grafik Pengguna
              </h2>
              <div className="flex-1 h-32 md:h-40">
                {summaryChartData.length > 1 ? ( // Render chart hanya jika ada data
                  <Chart
                    width={"100%"}
                    height={"100%"}
                    chartType="ColumnChart"
                    loader={<div>Loading Chart...</div>}
                    data={summaryChartData}
                    options={{
                      legend: { position: "none" },
                      hAxis: { title: "Periode" },
                      vAxis: { title: "Pengguna", minValue: 0 }, // Tambahkan minValue
                      colors: ["#8884d8"],
                    }}
                  />
                ) : (
                  <p className="text-center text-gray-500 mt-5">
                    Tidak ada data ringkasan pengguna.
                  </p>
                )}
              </div>
              <div className="grid grid-cols-1 gap-2 mt-4">
                <div className="flex justify-between text-gray-600">
                  <span>Harian</span>
                  <span className="font-bold">{dailyUsers ?? 0}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Mingguan</span>
                  <span className="font-bold">{weeklyUsers ?? 0}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Bulanan</span>
                  <span className="font-bold">{monthlyUsers ?? 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
