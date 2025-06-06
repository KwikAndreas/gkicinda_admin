import { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function Dashboard() {
  const [dailyUsers, setDailyUsers] = useState<number | null>(null);
  const [weeklyUsers, setWeeklyUsers] = useState<number | null>(null);
  const [monthlyUsers, setMonthlyUsers] = useState<number | null>(null);

  // Tambahan state untuk timeseries
  const [userActivity, setUserActivity] = useState<
    { date: string; value: number }[]
  >([]);
  const [avgEngagement, setAvgEngagement] = useState<
    { date: string; value: number }[]
  >([]);

  useEffect(() => {
    axios
      .get("/api/analytics?type=daily")
      .then((res) => setDailyUsers(Number(res.data.users) || 0));
    axios
      .get("/api/analytics?type=weekly")
      .then((res) => setWeeklyUsers(Number(res.data.users) || 0));
    axios
      .get("/api/analytics?type=monthly")
      .then((res) => setMonthlyUsers(Number(res.data.users) || 0));

    // Ambil data timeseries user activity
    axios
      .get("/api/analytics?type=timeseries")
      .then((res) => setUserActivity(res.data.data || []));

    // Ambil data timeseries average engagement time per user
    axios
      .get("/api/analytics?type=timeseries&metric=averageEngagementTimePerUser")
      .then((res) => setAvgEngagement(res.data.data || []));
  }, []);

  const data = [
    { name: "Harian", Pengguna: dailyUsers ?? 0 },
    { name: "Mingguan", Pengguna: weeklyUsers ?? 0 },
    { name: "Bulanan", Pengguna: monthlyUsers ?? 0 },
  ];

  // Format tanggal untuk chart
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    // dateStr: YYYYMMDD
    return `${dateStr.slice(6, 8)}/${dateStr.slice(4, 6)}`;
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-800 text-center">
          Statistik Website GKI Cipinang Indah
        </h1>
        {/* Bento Layout */}
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          {/* User Activity - kiri */}
          <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col flex-1 md:basis-2/3">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              User Activity (30 Hari Terakhir)
            </h2>
            <div className="flex-1 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={userActivity.map((d) => ({
                    ...d,
                    date: formatDate(d.date),
                  }))}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#8884d8"
                    name="Active Users"
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          {/* Kanan: Engagement & Grafik Pengguna */}
          <div className="flex flex-col gap-6 flex-1 md:basis-1/3">
            {/* Engagement */}
            <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col flex-1">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">
                Average Engagement Time per Active User (detik)
              </h2>
              <div className="flex-1 h-32 md:h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={avgEngagement.map((d) => ({
                      ...d,
                      date: formatDate(d.date),
                      value: Math.round(d.value),
                    }))}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#82ca9d"
                      name="Avg Engagement (s)"
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            {/* Grafik Pengguna Ringkasan */}
            <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col flex-1">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">
                Grafik Pengguna
              </h2>
              <div className="flex-1 h-32 md:h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={data}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="Pengguna"
                      stroke="#8884d8"
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              {/* Ringkasan angka */}
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
