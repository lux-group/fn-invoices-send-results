import fetch from "node-fetch";
import querystring from "querystring";
import { SERVICE_PASSWORD, API_HOST, SERVICE_USERNAME } from "../config";

class AuthServiceHTTPError extends Error {}

export async function getToken(): Promise<string> {
  console.log(`Retrieving access token`);

  const credentials = {
    username: SERVICE_USERNAME,
    password: SERVICE_PASSWORD,
    grant_type: "client_credentials"
  };

  const options = {
    method: "POST",
    body: querystring.stringify(credentials),
    headers: { "Content-Type": "application/x-www-form-urlencoded" }
  };

  const destination = `${API_HOST}/oauth/token`;

  const response = await fetch(destination, options);

  if (!response.ok) {
    throw new AuthServiceHTTPError(
      `${response.status} ${response.statusText} error fetching ${destination}`
    );
  }

  const { access_token } = await response.json();

  return access_token;
}
