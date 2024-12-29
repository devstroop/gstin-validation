/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run "npm run dev" in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run "npm run deploy" to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import { load } from "cheerio";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    // Example: https://your-worker.your-username.workers.dev/?gstin=29AAAAA0000A1Z5
    const gstin = url.searchParams.get("gstin");

    if (!gstin || !isValidGSTIN(gstin)) {
      return new Response("Invalid GSTIN format.", { status: 400 });
    }

    try {
      const csrfToken = await getCsrfToken();
      const responseBody = await postGstinDetails(gstin, csrfToken);
      const gstinDetails = parseGstinDetails(responseBody);

      return new Response(JSON.stringify(gstinDetails), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      return new Response(`Failed to fetch GSTIN details: ${error.message}`, {
        status: 500,
      });
    }
  },
};

function isValidGSTIN(gstin) {
  const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[A-Z0-9]{1}[Z]{1}[A-Z0-9]{1}$/;
  return gstinRegex.test(gstin);
}

async function getCsrfToken() {
  const response = await fetch("https://www.knowyourgst.com/gst-number-search/", {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch CSRF token.");
  }

  const setCookie = response.headers.get("Set-Cookie") || "";
  const csrfToken = setCookie.match(/csrftoken=([^;]+)/)?.[1];
  if (!csrfToken) {
    throw new Error("CSRF token not found.");
  }

  return csrfToken;
}

async function postGstinDetails(gstin, csrfToken) {
  const response = await fetch("https://www.knowyourgst.com/gst-number-search/", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Cookie": `csrftoken=${csrfToken}`,
      "Origin": "https://www.knowyourgst.com",
      "Referer": "https://www.knowyourgst.com/gst-number-search/",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    },
    body: new URLSearchParams({
      gstnum: gstin,
      csrfmiddlewaretoken: csrfToken,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch GSTIN details.");
  }

  return await response.text();
}

function parseGstinDetails(responseBody) {
  const $ = load(responseBody);

  return {
    "businessName": $("tr:nth-child(1) td:nth-child(2)").text().trim(),
    "paNNumber": $("tr:nth-child(2) td:nth-child(2)").text().trim(),
    "legalName": $("tr:nth-child(3) td:nth-child(2)").text().trim(),
    "address": $("tr:nth-child(4) td:nth-child(2)").text().trim(),
    "entityType": $("tr:nth-child(5) td:nth-child(2)").text().trim(),
    "registrationType": $("tr:nth-child(6) td:nth-child(2)").text().trim(),
    "departmentCodeAndType": $("tr:nth-child(7) td:nth-child(2)").text().trim(),
    "natureOfBusiness": $("tr:nth-child(8) td:nth-child(2)").text().trim(),
    "registrationDate": $("tr:nth-child(9) td:nth-child(2)").text().trim(),
  };
}
