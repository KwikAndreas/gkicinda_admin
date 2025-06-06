import { type NextApiRequest, type NextApiResponse } from "next";
import { BetaAnalyticsDataClient } from "@google-analytics/data";

const analyticsDataClient = new BetaAnalyticsDataClient();
const propertyId = process.env.GA_PROPERTY_ID;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { type, metric } = req.query;

    let dateRange;
    let dimension = null;
    if (type === "daily") {
      dateRange = { startDate: "1daysAgo", endDate: "today" };
    } else if (type === "weekly") {
      dateRange = { startDate: "7daysAgo", endDate: "today" };
    } else if (type === "monthly") {
      dateRange = { startDate: "30daysAgo", endDate: "today" };
    } else if (type === "timeseries") {
      dateRange = { startDate: "30daysAgo", endDate: "today" };
      dimension = "date";
    } else {
      return res.status(400).json({ error: "Invalid type parameter" });
    }

    // Pilih metrik
    let metricName = "activeUsers";
    if (metric === "averageEngagementTimePerUser") {
      metricName = "averageEngagementTimePerUser";
    }

    const request: any = {
      property: propertyId,
      dateRanges: [dateRange],
      metrics: [{ name: metricName }],
    };
    if (dimension) {
      request.dimensions = [{ name: dimension }];
    }

    const [response] = await analyticsDataClient.runReport(request);

    if (type === "timeseries") {
      // Kembalikan array data per hari
      const data = (response.rows || []).map((row) => ({
        date: row.dimensionValues?.[0]?.value,
        value: Number(row.metricValues?.[0]?.value) || 0,
      }));
      return res.status(200).json({ data });
    }

    let users = 0;
    if (
      response.rows &&
      response.rows[0] &&
      response.rows[0].metricValues &&
      response.rows[0].metricValues[0] &&
      response.rows[0].metricValues[0].value
    ) {
      users = Number(response.rows[0].metricValues[0].value) || 0;
    }
    return res.status(200).json({ users });
  } catch (error) {
    console.error("Analytics error:", error);
    return res.status(500).json({ error: "Failed to fetch analytics data" });
  }
}
