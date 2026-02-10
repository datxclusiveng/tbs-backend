import cron from "node-cron";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

// Use an environment variable for the server URL
// Example: SERVER_URL=https://your-app.onrender.com
const SERVER_URL = process.env.SERVER_URL;

if (SERVER_URL) {
  // Ping every 10 minutes
  cron.schedule("*/10 * * * *", async () => {
    try {
      console.log(`[Cron] Pinging server at ${SERVER_URL}...`);
      const response = await axios.get(`${SERVER_URL}/api/photos/groups`);
      console.log(`[Cron] Ping successful! Status: ${response.status}`);
    } catch (error: any) {
      console.error(`[Cron] Ping failed: ${error.message}`);
    }
  });
  console.log(`[Cron] Scheduled self-ping every 10 minutes for: ${SERVER_URL}`);
} else {
  console.warn("[Cron] SERVER_URL environment variable is not set. Self-ping is disabled.");
}
