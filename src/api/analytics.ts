import { type NextApiRequest, type NextApiResponse } from "next";
import { BetaAnalyticsDataClient } from "@google-analytics/data";
import fs from "fs";

let analyticsDataClient: BetaAnalyticsDataClient;

if (process.env.VERCEL_GOOGLE_APPLICATION_CREDENTIALS) {
  try {
    const credentials = JSON.parse(
      process.env.VERCEL_GOOGLE_APPLICATION_CREDENTIALS
    );
    analyticsDataClient = new BetaAnalyticsDataClient({
      credentials: {
        client_email: credentials.client_email,
        private_key: credentials.private_key,
      },
    });
    console.log(
      "[SERVER] Google Analytics Client initialized from JSON environment variable."
    );
  } catch (e) {
    console.error(
      "[SERVER] Error parsing GOOGLE_APPLICATION_CREDENTIALS_JSON:",
      e
    );
    analyticsDataClient = new BetaAnalyticsDataClient();
  }
} else {
  analyticsDataClient = new BetaAnalyticsDataClient();
  console.warn(
    "[SERVER] GOOGLE_APPLICATION_CREDENTIALS_JSON not found. Relying on default credential lookup."
  );
}

const propertyId = process.env.VERCEL_GA_PROPERTY_ID;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.setHeader("Content-Type", "application/json");
  if (!propertyId) {
    console.error("Error: GA_PROPERTY_ID environment variable is not set.");
    return res.status(500).json({
      error:
        "Server configuration error: Google Analytics Property ID is missing.",
    });
  }

  if (process.env.NODE_ENV === "development") {
    const credentialsPath =
      process.env.VERCEL_GOOGLE_APPLICATION_CREDENTIALS;
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

  try {
    const { type, metric, period } = req.query;

    let dateRange;
    let dimension = null;
    let metricNames: string[] = ["activeUsers"];

    if (type === "last30minutes") {
      const now = new Date();
      const endDate = now.toISOString().slice(0, 10);
      dateRange = { startDate: endDate, endDate: endDate };
      dimension = "minute";
      metricNames = ["activeUsers"];
      let request: any = {
        property: `properties/${propertyId}`,
        dateRanges: [dateRange],
        metrics: metricNames.map((name) => ({ name })),
        dimensions: [{ name: dimension }],
        limit: 60,
        orderBys: [{ desc: true, dimension: { dimensionName: "minute" } }],
      };
      const [response] = await analyticsDataClient.runReport(request);
      let rows = response.rows || [];
      let data = [];
      if (period === "prev") {
        data = rows
          .slice(30, 60)
          .reverse()
          .map((row) => ({
            minute: row.dimensionValues?.[0]?.value || "",
            activeUsers: Number(row.metricValues?.[0]?.value) || 0,
          }));
      } else {
        data = rows
          .slice(0, 30)
          .reverse()
          .map((row) => ({
            minute: row.dimensionValues?.[0]?.value || "",
            activeUsers: Number(row.metricValues?.[0]?.value) || 0,
          }));
      }
      return res.status(200).json({ data });
    }

    switch (type) {
      case "daily":
        if (period === "prev") {
          // Kemarin
          dateRange = { startDate: "2daysAgo", endDate: "1daysAgo" };
        } else {
          dateRange = { startDate: "1daysAgo", endDate: "today" };
        }
        break;
      case "weekly":
        if (period === "prev") {
          dateRange = { startDate: "14daysAgo", endDate: "7daysAgo" };
        } else {
          dateRange = { startDate: "7daysAgo", endDate: "today" };
        }
        break;
      case "monthly":
        if (period === "prev") {
          dateRange = { startDate: "60daysAgo", endDate: "30daysAgo" };
        } else {
          dateRange = { startDate: "30daysAgo", endDate: "today" };
        }
        break;
      case "timeseries":
        if (period === "prev") {
          dateRange = { startDate: "60daysAgo", endDate: "30daysAgo" };
        } else {
          dateRange = { startDate: "30daysAgo", endDate: "today" };
        }
        dimension = "date";
        metricNames = ["activeUsers", "averageEngagementTimePerUser"];
        break;
      default:
        return res.status(400).json({
          error:
            "Invalid 'type' parameter. Expected 'daily', 'weekly', 'monthly', 'timeseries', or 'last30minutes'.",
        });
    }

    if (type !== "timeseries" && metric === "averageEngagementTimePerUser") {
      metricNames = ["averageEngagementTimePerUser"];
    }

    const request: any = {
      property: `properties/${propertyId}`,
      dateRanges: [dateRange],
      metrics: metricNames.map((name) => ({ name })),
    };

    if (dimension) {
      request.dimensions = [{ name: dimension }];
    }

    console.log("GA API request:", JSON.stringify(request, null, 2));

    const [response] = await analyticsDataClient.runReport(request);

    console.log("GA API response:", JSON.stringify(response, null, 2));

    if (!response || !response.rows || response.rows.length === 0) {
      if (type === "timeseries") {
        return res.status(200).json({ data: [] });
      }
      return res.status(200).json({ users: 0 });
    }

    if (type === "timeseries") {
      const data = response.rows.map((row) => ({
        date: row.dimensionValues?.[0]?.value || "Unknown Date",
        activeUsers: Number(row.metricValues?.[0]?.value) || 0,
        averageEngagementTimePerUser: Number(row.metricValues?.[1]?.value) || 0,
      }));
      return res.status(200).json({ data });
    }

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
    let errorMessage = "Failed to fetch analytics data.";
    if (error.details && typeof error.details === "string") {
      errorMessage = `Google Analytics API Error: ${error.details}`;
    } else if (error.message) {
      errorMessage = `Server Error: ${error.message}`;
    } else if (error.code === 7 || error.code === 16) {
      errorMessage =
        "Authentication or permission error with Google Analytics. Check your service account permissions and GOOGLE_APPLICATION_CREDENTIALS.";
    }

    return res.status(500).json({ error: errorMessage });
  }
}
