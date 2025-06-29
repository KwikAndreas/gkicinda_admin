// Dashboard.tsx
import { useEffect, useState } from "react";
import axios from "axios";
import { Chart } from "react-google-charts";

export default function Dashboard() {
  const [dailyUsers, setDailyUsers] = useState<number | null>(null);
  const [weeklyUsers, setWeeklyUsers] = useState<number | null>(null);
  const [monthlyUsers, setMonthlyUsers] = useState<number | null>(null);
  const [last30Min, setLast30Min] = useState<
    { minute: string; activeUsers: number }[]
  >([]);

  const [userActivity, setUserActivity] = useState<
    { date: string; value: number }[]
  >([]);
  const [avgEngagement, setAvgEngagement] = useState<
    { date: string; value: number }[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tambahan state untuk growth/trend
  const [dailyPrev, setDailyPrev] = useState<number | null>(null);
  const [weeklyPrev, setWeeklyPrev] = useState<number | null>(null);
  const [monthlyPrev, setMonthlyPrev] = useState<number | null>(null);
  const [engagementPrev, setEngagementPrev] = useState<number | null>(null);
  const [last30MinPrev, setLast30MinPrev] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const baseUrl = "/api/analytics";

        console.log("Fetching daily users...");
        const dailyRes = await axios.get(`${baseUrl}?type=daily`, {
          headers: { "Cache-Control": "no-cache" },
        });
        console.log("Daily Users Raw Response:", dailyRes.data);
        setDailyUsers(Number(dailyRes.data.users) || 0); // Konversi eksplisit ke Number, default 0

        console.log("Fetching weekly users...");
        const weeklyRes = await axios.get(`${baseUrl}?type=weekly`, {
          headers: { "Cache-Control": "no-cache" },
        });
        console.log("Weekly Users Raw Response:", weeklyRes.data);
        setWeeklyUsers(Number(weeklyRes.data.users) || 0); // Konversi eksplisit ke Number, default 0

        console.log("Fetching monthly users...");
        const monthlyRes = await axios.get(`${baseUrl}?type=monthly`, {
          headers: { "Cache-Control": "no-cache" },
        });
        console.log("Monthly Users Raw Response:", monthlyRes.data);
        setMonthlyUsers(Number(monthlyRes.data.users) || 0); // Konversi eksplisit ke Number, default 0

        // Fetch last 30 minutes active users
        console.log("Fetching active users in last 30 minutes...");
        const last30MinRes = await axios.get(`${baseUrl}?type=last30minutes`, {
          headers: { "Cache-Control": "no-cache" },
        });
        setLast30Min(last30MinRes.data.data || []);

        console.log(
          "Fetching user activity & average engagement (combined)..."
        );
        const timeseriesRes = await axios.get(`${baseUrl}?type=timeseries`, {
          headers: { "Cache-Control": "no-cache" },
        });
        console.log("Timeseries Raw Response:", timeseriesRes.data);

        // Pisahkan data menjadi dua array: userActivity dan avgEngagement
        const timeseriesData: {
          date: string;
          activeUsers: any;
          averageEngagementTimePerUser: any;
        }[] = timeseriesRes.data.data || [];

        const processedUserActivity = timeseriesData.map((d) => ({
          date: d.date,
          value: Number(d.activeUsers) || 0,
        }));
        setUserActivity(processedUserActivity);

        const processedAvgEngagement = timeseriesData.map((d) => ({
          date: d.date,
          value: Number(d.averageEngagementTimePerUser)
            ? Math.round(Number(d.averageEngagementTimePerUser))
            : 0,
        }));
        setAvgEngagement(processedAvgEngagement);

        // Fetch previous day users
        const dailyPrevRes = await axios.get(
          `${baseUrl}?type=daily&period=prev`,
          { headers: { "Cache-Control": "no-cache" } }
        );
        setDailyPrev(Number(dailyPrevRes.data.users) || 0);

        // Fetch previous week users
        const weeklyPrevRes = await axios.get(
          `${baseUrl}?type=weekly&period=prev`,
          { headers: { "Cache-Control": "no-cache" } }
        );
        setWeeklyPrev(Number(weeklyPrevRes.data.users) || 0);

        // Fetch previous month users
        const monthlyPrevRes = await axios.get(
          `${baseUrl}?type=monthly&period=prev`,
          { headers: { "Cache-Control": "no-cache" } }
        );
        setMonthlyPrev(Number(monthlyPrevRes.data.users) || 0);

        // Fetch previous average engagement (ambil 30 hari sebelum 30 hari terakhir)
        const engagementPrevRes = await axios.get(
          `${baseUrl}?type=timeseries&period=prev`,
          { headers: { "Cache-Control": "no-cache" } }
        );
        const prevEngagementData: {
          date: string;
          activeUsers: any;
          averageEngagementTimePerUser: any;
        }[] = engagementPrevRes.data.data || [];
        setEngagementPrev(
          prevEngagementData.length > 0
            ? Math.round(
                prevEngagementData.reduce(
                  (a, b) => a + (Number(b.averageEngagementTimePerUser) || 0),
                  0
                ) / prevEngagementData.length
              )
            : 0
        );

        // Fetch previous 30min active users (ambil 31-60 menit lalu)
        const last30MinPrevRes = await axios.get(
          `${baseUrl}?type=last30minutes&period=prev`,
          { headers: { "Cache-Control": "no-cache" } }
        );
        const prev30MinData: { minute: string; activeUsers: number }[] =
          last30MinPrevRes.data.data || [];
        setLast30MinPrev(
          prev30MinData.length > 0
            ? prev30MinData[prev30MinData.length - 1].activeUsers
            : 0
        );
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

  // Grafik Active Users 30 hari (untuk hero chart)
  const activeUsers30dChartData = [
    ["Tanggal", "Active Users"],
    ...userActivity.map((d) => [
      d.date.length === 8
        ? `${d.date.slice(6, 8)}/${d.date.slice(4, 6)}`
        : d.date,
      d.value,
    ]),
  ];

  // Grafik Engagement 30 hari
  const engagement30dChartData = [
    ["Tanggal", "Avg Engagement (s)"],
    ...avgEngagement.map((d) => [
      d.date.length === 8
        ? `${d.date.slice(6, 8)}/${d.date.slice(4, 6)}`
        : d.date,
      d.value,
    ]),
  ];

  // Grafik mini 30 menit
  const last30MinChartData = [
    ["Menit", "Active Users"],
    ...last30Min.map((d, idx) => [
      `${30 - last30Min.length + idx + 1}`,
      d.activeUsers,
    ]),
  ];

  // Utility untuk badge tren
  function TrendBadge({ trend }: { trend: ReturnType<typeof getTrend> }) {
    if (trend.percent === null) return null;
    return (
      <span
        className={
          "inline-flex items-center ml-2 " +
          (trend.up === true
            ? "text-green-600"
            : trend.up === false
            ? "text-red-600"
            : "text-gray-500")
        }
      >
        {trend.up === true ? (
          <svg
            width="14"
            height="14"
            className="mr-1"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M10 4l6 8H4l6-8z" />
          </svg>
        ) : trend.up === false ? (
          <svg
            width="14"
            height="14"
            className="mr-1"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M10 16l-6-8h12l-6 8z" />
          </svg>
        ) : null}
        {trend.percent}%
      </span>
    );
  }

  // Fungsi utilitas untuk growth/trend
  function getTrend(current: number | null, prev: number | null) {
    if (prev === null || prev === 0) return { percent: null, up: null };
    const percent = ((current! - prev) / prev) * 100;
    return {
      percent: Math.abs(percent).toFixed(1),
      up: percent > 0 ? true : percent < 0 ? false : null,
    };
  }

  // Hitung trend untuk setiap metrik
  const trendDaily = getTrend(dailyUsers, dailyPrev);
  const trendWeekly = getTrend(weeklyUsers, weeklyPrev);
  const trendMonthly = getTrend(monthlyUsers, monthlyPrev);
  const avgEngagementValue =
    avgEngagement.length > 0
      ? Math.round(
          avgEngagement.reduce((a, b) => a + b.value, 0) / avgEngagement.length
        )
      : 0;
  const trendEngagement = getTrend(avgEngagementValue, engagementPrev);
  const last30MinValue =
    last30Min.length > 0 ? last30Min[last30Min.length - 1].activeUsers : 0;
  const trendLast30Min = getTrend(last30MinValue, last30MinPrev);

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
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-800 text-center">
          Analytics Dashboard
        </h1>
        {/* Hero Active Users Chart */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-700 mb-2">
                Active Users (30 Hari Terakhir)
              </h2>
              <div className="flex items-center mb-2">
                <span className="text-4xl font-bold text-blue-700">
                  {monthlyUsers ?? 0}
                </span>
                <TrendBadge trend={trendMonthly} />
              </div>
              <div className="text-gray-500 text-sm mb-2">
                {trendMonthly.percent !== null && (
                  <>
                    {trendMonthly.up === true
                      ? "Naik"
                      : trendMonthly.up === false
                      ? "Turun"
                      : "Stabil"}{" "}
                    dibanding 30 hari sebelumnya
                  </>
                )}
              </div>
            </div>
            <div className="w-full md:w-2/3 h-40">
              {activeUsers30dChartData.length > 1 ? (
                <Chart
                  width={"100%"}
                  height={"100%"}
                  chartType="LineChart"
                  loader={<div>Loading Chart...</div>}
                  data={activeUsers30dChartData}
                  options={{
                    legend: { position: "none" },
                    hAxis: { title: "", textStyle: { fontSize: 10 } },
                    vAxis: { minValue: 0 },
                    chartArea: {
                      left: 40,
                      top: 10,
                      width: "90%",
                      height: "75%",
                    },
                    colors: ["#1976d2"],
                    lineWidth: 3,
                  }}
                />
              ) : (
                <div className="text-center text-gray-400">No data</div>
              )}
            </div>
          </div>
        </div>
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* 1 Day */}
          <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-center">
            <span className="text-gray-500 text-xs mb-1">
              Active Users (1 Day)
            </span>
            <span className="text-2xl font-bold text-blue-700">
              {dailyUsers ?? 0}
            </span>
            <TrendBadge trend={trendDaily} />
            <span className="text-xs text-gray-400 mt-1">vs kemarin</span>
          </div>
          {/* 7 Days */}
          <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-center">
            <span className="text-gray-500 text-xs mb-1">
              Active Users (7 Days)
            </span>
            <span className="text-2xl font-bold text-blue-700">
              {weeklyUsers ?? 0}
            </span>
            <TrendBadge trend={trendWeekly} />
            <span className="text-xs text-gray-400 mt-1">
              vs 7 hari sebelumnya
            </span>
          </div>
          {/* Last 30 Minutes */}
          <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-center">
            <span className="text-gray-500 text-xs mb-1">
              Active Users (Last 30 Min)
            </span>
            <span className="text-2xl font-bold text-blue-700">
              {last30MinValue}
            </span>
            <TrendBadge trend={trendLast30Min} />
            <span className="text-xs text-gray-400 mt-1">
              vs 30 menit sebelumnya
            </span>
            <div className="w-full h-10 mt-2">
              {last30MinChartData.length > 1 ? (
                <Chart
                  width={"100%"}
                  height={"40px"}
                  chartType="LineChart"
                  loader={<div>Loading...</div>}
                  data={last30MinChartData}
                  options={{
                    legend: { position: "none" },
                    hAxis: { textPosition: "none", gridlines: { count: 0 } },
                    vAxis: {
                      minValue: 0,
                      textPosition: "none",
                      gridlines: { count: 0 },
                    },
                    chartArea: {
                      left: 0,
                      top: 0,
                      width: "100%",
                      height: "80%",
                    },
                    colors: ["#1976d2"],
                    lineWidth: 2,
                    pointSize: 0,
                  }}
                />
              ) : (
                <div className="text-xs text-gray-400 text-center">No data</div>
              )}
            </div>
          </div>
          {/* Engagement */}
          <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-center">
            <span className="text-gray-500 text-xs mb-1">
              Avg Engagement (30d, detik)
            </span>
            <span className="text-2xl font-bold text-green-700">
              {avgEngagementValue}
            </span>
            <TrendBadge trend={trendEngagement} />
            <span className="text-xs text-gray-400 mt-1">
              vs 30 hari sebelumnya
            </span>
          </div>
        </div>
        {/* Engagement Chart */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Average Engagement Time per Active User (30 Hari)
          </h2>
          <div className="w-full h-40">
            {engagement30dChartData.length > 1 ? (
              <Chart
                width={"100%"}
                height={"100%"}
                chartType="LineChart"
                loader={<div>Loading Chart...</div>}
                data={engagement30dChartData}
                options={{
                  legend: { position: "none" },
                  hAxis: { title: "", textStyle: { fontSize: 10 } },
                  vAxis: { minValue: 0 },
                  chartArea: { left: 40, top: 10, width: "90%", height: "75%" },
                  colors: ["#43a047"],
                  lineWidth: 3,
                }}
              />
            ) : (
              <div className="text-center text-gray-400">No data</div>
            )}
          </div>
        </div>
        {/* Grafik utama */}
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          {/* User Activity */}
          <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col flex-1 md:basis-2/3">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              User Activity (30 Hari Terakhir)
            </h2>
            <div className="flex-1 h-72">
              {userActivityChartData.length > 1 ? (
                <Chart
                  width={"100%"}
                  height={"100%"}
                  chartType="LineChart"
                  loader={<div>Loading Chart...</div>}
                  data={userActivityChartData}
                  options={{
                    legend: { position: "bottom" },
                    hAxis: { title: "Tanggal" },
                    vAxis: { title: "Active Users", minValue: 0 },
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
          {/* Engagement */}
          <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col flex-1 md:basis-1/3">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              Average Engagement Time per Active User (detik)
            </h2>
            <div className="flex-1 h-32 md:h-40">
              {avgEngagementChartData.length > 1 ? (
                <Chart
                  width={"100%"}
                  height={"100%"}
                  chartType="LineChart"
                  loader={<div>Loading Chart...</div>}
                  data={avgEngagementChartData}
                  options={{
                    legend: { position: "bottom" },
                    hAxis: { title: "Tanggal" },
                    vAxis: { title: "Avg Engagement (s)", minValue: 0 },
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
        </div>
      </div>
    </div>
  );
}
