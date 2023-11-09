const ENV = process.env.NODE_ENV;

const DEV_URL = "http://localhost:2999";
const PRODUCTION_URL =
  "https://d93c90d2d85184abc88b57517a180d6b8.clg07azjl.paperspacegradient.com";

export const WATCHDOG_URL = ENV === "development" ? DEV_URL : PRODUCTION_URL;
