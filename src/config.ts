export const ENVIRONMENT = process.env.NODE_ENV || "test";

export const PRODUCTION = ENVIRONMENT === "production";

export const API_HOST = process.env.API_HOST || "";

export const SERVICE_USERNAME = process.env.SERVICE_USERNAME || "";

export const SERVICE_PASSWORD = process.env.SERVICE_PASSWORD || "";

export const VENDOR_DOMAIN_WHITELIST =
  process.env.VENDOR_DOMAIN_WHITELIST || "";
