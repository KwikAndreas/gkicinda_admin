import { type NextApiRequest, type NextApiResponse } from "next";
import { BetaAnalyticsDataClient } from "@google-analytics/data";
import fs from "fs"; // Digunakan untuk pemeriksaan kredensial

// Inisialisasi client Google Analytics Data API.
// Kredensial akan secara otomatis dicari dari variabel lingkungan GOOGLE_APPLICATION_CREDENTIALS
// atau lingkungan runtime Google Cloud (misalnya, Google Cloud Functions, App Engine).
const analyticsDataClient = new BetaAnalyticsDataClient();

// Ambil GA_PROPERTY_ID dari variabel lingkungan.
// Penting: Pastikan ini diatur di .env.local atau di konfigurasi deployment Anda.
const propertyId = process.env.VITE_GA_PROPERTY_ID;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // --- Validasi Awal ---
  if (!propertyId) {
    console.error("Error: GA_PROPERTY_ID environment variable is not set.");
    return res
      .status(500)
      .json({
        error:
          "Server configuration error: Google Analytics Property ID is missing.",
      });
  }

  // Debugging kredensial saat pengembangan
  // Di produksi, pastikan GOOGLE_APPLICATION_CREDENTIALS disetel dan mengarah ke file JSON yang benar
  if (process.env.NODE_ENV === "development") {
    const credentialsPath = process.env.VITE_GOOGLE_APPLICATION_CREDENTIALS;
    if (credentialsPath) {
      console.log(
        `[DEBUG] GOOGLE_APPLICATION_CREDENTIALS path: ${credentialsPath}`
      );
      try {
        const fileExists = fs.existsSync(credentialsPath);
        console.log(`[DEBUG] Credential file exists: ${fileExists}`);
        if (!fileExists) {
          console.error(
            `[DEBUG] Error: Credential file not found at ${credentialsPath}`
          );
        } else {
          // Coba baca file untuk memastikan bisa diakses
          const fileContent = fs.readFileSync(credentialsPath, "utf8");
          const parsedCredentials = JSON.parse(fileContent);
          console.log(
            `[DEBUG] Credential file parsed. Client Email: ${parsedCredentials.client_email}`
          );
        }
      } catch (e: any) {
        console.error(
          `[DEBUG] Error accessing/parsing credential file: ${e.message}`
        );
      }
    } else {
      console.warn(
        "[DEBUG] GOOGLE_APPLICATION_CREDENTIALS is not set. Assuming default credential lookup (e.g., Cloud Environment)."
      );
    }
  }
  // --- Akhir Validasi Awal ---

  try {
    const { type, metric } = req.query;

    let dateRange;
    let dimension = null; // Default to null, only set if timeseries
    let metricName = "activeUsers"; // Default metric

    switch (type) {
      case "daily":
        dateRange = { startDate: "1daysAgo", endDate: "today" };
        break;
      case "weekly":
        dateRange = { startDate: "7daysAgo", endDate: "today" };
        break;
      case "monthly":
        dateRange = { startDate: "30daysAgo", endDate: "today" };
        break;
      case "timeseries":
        dateRange = { startDate: "30daysAgo", endDate: "today" };
        dimension = "date"; // Add date dimension for timeseries
        break;
      default:
        return res
          .status(400)
          .json({
            error:
              "Invalid 'type' parameter. Expected 'daily', 'weekly', 'monthly', or 'timeseries'.",
          });
    }

    // Pilih metrik berdasarkan parameter 'metric'
    if (metric === "averageEngagementTimePerUser") {
      metricName = "averageEngagementTimePerUser";
    }

    // Bangun permintaan untuk Google Analytics Data API
    const request: any = {
      property: `properties/${propertyId}`, // Format yang benar untuk properti
      dateRanges: [dateRange],
      metrics: [{ name: metricName }],
    };

    if (dimension) {
      request.dimensions = [{ name: dimension }];
    }

    // Log permintaan untuk debugging
    console.log("GA API request:", JSON.stringify(request, null, 2));

    const [response] = await analyticsDataClient.runReport(request);

    // Log respons lengkap dari GA API untuk debugging
    console.log("GA API response:", JSON.stringify(response, null, 2));

    // Periksa apakah ada baris data yang valid
    if (!response || !response.rows || response.rows.length === 0) {
      console.warn(
        `No data found for type: ${type}, metric: ${metricName}, property: ${propertyId}`
      );
      // Kembalikan respons kosong atau nol jika tidak ada data
      if (type === "timeseries") {
        return res.status(200).json({ data: [] });
      }
      return res.status(200).json({ users: 0 });
    }

    if (type === "timeseries") {
      const data = response.rows.map((row) => ({
        // Pastikan dimensionValues dan metricValues ada sebelum mengaksesnya
        date: row.dimensionValues?.[0]?.value || "Unknown Date",
        value: Number(row.metricValues?.[0]?.value) || 0,
      }));
      return res.status(200).json({ data });
    }

    // Untuk daily, weekly, monthly (aggregate metrics)
    // Pastikan struktur respons ada sebelum mengaksesnya
    const users = Number(response.rows[0].metricValues?.[0]?.value) || 0;
    return res.status(200).json({ users });
  } catch (error: any) {
    console.error("Analytics API call failed:", error);
    if (error.code) {
      console.error(`Google API Error Code: ${error.code}`);
    }
    if (error.details) {
      console.error("Google API Error Details:", error.details);
    }
    // Memberikan pesan error yang lebih informatif kepada klien
    let errorMessage = "Failed to fetch analytics data.";
    if (error.details && typeof error.details === "string") {
      errorMessage = `Google Analytics API Error: ${error.details}`;
    } else if (error.message) {
      errorMessage = `Server Error: ${error.message}`;
    } else if (error.code === 7 || error.code === 16) {
      // PERMISSION_DENIED (7), UNAUTHENTICATED (16)
      errorMessage =
        "Authentication or permission error with Google Analytics. Check your service account permissions and GOOGLE_APPLICATION_CREDENTIALS.";
    }

    return res.status(500).json({ error: errorMessage });
  }
}
