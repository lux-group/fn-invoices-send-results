export const ENVIRONMENT = process.env.NODE_ENV || "test";

export const PRODUCTION = ENVIRONMENT === "production";

export const APP_NAME = process.env.APP_NAME || "test-fn-stp-textract-results";

export const BUCKET_NAME = process.env.BUCKET_NAME || "";

export const API_HOST = process.env.API_HOST || "";

export const SERVICE_PASSWORD = process.env.SERVICE_PASSWORD || "";

export const VENDOR_DOMAIN_WHITELIST =
  process.env.VENDOR_DOMAIN_WHITELIST || "";
