const ENV = process.env.NODE_ENV;

const DEV_URL = "http://localhost:2999";
const PRODUCTION_URL =
  "https://dea6478627e3f46ecb2eeefe0e841eb8f.clg07azjl.paperspacegradient.com";

export const WATCHDOG_URL = ENV === "development" ? DEV_URL : PRODUCTION_URL;
