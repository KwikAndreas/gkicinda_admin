const express = require("express");
const cors = require("cors"); // Tambahkan ini
const { BetaAnalyticsDataClient } = require("@google-analytics/data");
const fs = require("fs");
require("dotenv").config();

const app = express();
const port = 5173;

// Tambahkan middleware CORS
app.use(cors());

let analyticsDataClient;
const propertyId = process.env.GA_PROPERTY_ID;

// Inisialisasi client dari file JSON
if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  const credentials = JSON.parse(
    fs.readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS, "utf8")
  );
  analyticsDataClient = new BetaAnalyticsDataClient({
    credentials: {
      client_email: credentials.client_email,
      private_key: credentials.private_key,
    },
  });
} else {
  analyticsDataClient = new BetaAnalyticsDataClient();
}

app.get("/api/analytics", async (req, res) => {
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
        return res.status(400).json({
          error:
            "Invalid 'type' parameter. Expected 'daily', 'weekly', 'monthly', or 'timeseries'.",
        });
    }

    // Pilih metrik berdasarkan parameter 'metric'
    if (metric === "averageEngagementTimePerUser") {
      metricName = "averageEngagementTimePerUser";
    }

    // Bangun permintaan untuk Google Analytics Data API
    const request = {
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
  } catch (error) {
    // Penanganan error yang lebih aman
    let errorMessage = "Failed to fetch analytics data.";
    if (typeof error === "object" && error !== null) {
      if ("details" in error && typeof error.details === "string") {
        errorMessage = `Google Analytics API Error: ${error.details}`;
      } else if ("message" in error && typeof error.message === "string") {
        errorMessage = `Server Error: ${error.message}`;
      } else if ("code" in error && (error.code === 7 || error.code === 16)) {
        // PERMISSION_DENIED (7), UNAUTHENTICATED (16)
        errorMessage =
          "Authentication or permission error with Google Analytics. Check your service account permissions and GOOGLE_APPLICATION_CREDENTIALS.";
      }
      if ("code" in error) {
        console.error(`Google API Error Code: ${error.code}`);
      }
      if ("details" in error) {
        console.error("Google API Error Details:", error.details);
      }
    } else if (typeof error === "string") {
      errorMessage = error;
    }
    console.error("Analytics API call failed:", error);
    return res.status(500).json({ error: errorMessage });
  }
});

app.listen(port, () => {
  console.log(`API server listening at http://localhost:${port}`);
});
