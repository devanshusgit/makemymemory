/**
 * Delhivery Sandbox API Connection & Credential Verification Script
 * Stored in: scratch/test_delhivery.js
 */

const fs = require("fs");
const path = require("path");

// Manually load env variables from .env.local if exists
function loadEnv() {
  try {
    const envPath = path.join(__dirname, "../.env.local");
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf-8");
      content.split("\n").forEach((line) => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith("#")) {
          const firstEquals = trimmed.indexOf("=");
          if (firstEquals !== -1) {
            const key = trimmed.substring(0, firstEquals).trim();
            const value = trimmed.substring(firstEquals + 1).trim();
            process.env[key] = value;
          }
        }
      });
      console.log("-> Loaded environment variables from .env.local manually.");
    } else {
      console.log("-> No .env.local file found. Using default environment.");
    }
  } catch (err) {
    console.warn("-> Error loading env file:", err.message);
  }
}

loadEnv();

const DELHIVERY_API_TOKEN = process.env.DELHIVERY_API_TOKEN;
const DELHIVERY_BASE_URL = process.env.DELHIVERY_BASE_URL || "https://staging-express.delhivery.com";
const DELHIVERY_PICKUP_NAME = process.env.DELHIVERY_PICKUP_NAME || "MMM Warehouse";

console.log("=================================================");
console.log("   DELHIVERY API CONNECTION AND CREDENTIAL CHECK  ");
console.log("=================================================");
console.log(`Base URL:   ${DELHIVERY_BASE_URL}`);
console.log(`Pickup Location Name: ${DELHIVERY_PICKUP_NAME}`);
console.log(`API Token:  ${DELHIVERY_API_TOKEN ? "✓ Loaded (Starts with " + DELHIVERY_API_TOKEN.substring(0, 5) + "...)" : "✗ NOT CONFIGURED"}`);
console.log("=================================================\n");

if (!DELHIVERY_API_TOKEN) {
  console.log("[TIP] To run actual API queries against Delhivery Sandbox/Production, please add:");
  console.log("DELHIVERY_API_TOKEN=your_token_here");
  console.log("to your .env.local file.\n");
  console.log("Running mock API simulation payload verification...");
}

// 1. Verify tracking request formatting
async function testTracking() {
  const dummyAwb = "1234567890";
  console.log(`[Test 1] Testing waybill tracking lookup for AWB: ${dummyAwb}...`);
  
  if (!DELHIVERY_API_TOKEN) {
    console.log("-> [SKIPPED] Skipped actual fetch due to missing API token.");
    return;
  }

  try {
    const url = `${DELHIVERY_BASE_URL}/api/v1/packages/json/?waybill=${dummyAwb}`;
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": `Token ${DELHIVERY_API_TOKEN}`,
        "Content-Type": "application/json"
      }
    });

    console.log(`-> Status Code: ${res.status} (${res.statusText})`);
    const data = await res.json();
    console.log("-> Response received:", JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("-> [FAILED] Tracking request failed with error:", error.message);
  }
}

// 2. Verify Manifest Shipment API Payload
async function testManifestPayload() {
  console.log("\n[Test 2] Simulating forward shipment creation payload...");
  const dummyPayload = {
    shipments: [
      {
        name: "Devanshu Patel",
        add: "123, Marine Drive, Near Wankhede Stadium",
        pin: "400020",
        city: "Mumbai",
        state: "Maharashtra",
        country: "India",
        phone: "8097486800",
        order: "MMM-2026-000001-KIT",
        payment_mode: "Prepaid",
        cod_amount: 0,
        package_desc: "Make My Memory DIY Crafting Kit (Stage 1)",
        package_weight: 0.5,
        parcel_quantity: 1,
        seller_name: "Make My Memory",
        pickup_location_name: DELHIVERY_PICKUP_NAME,
      }
    ],
    pickup_location: {
      name: DELHIVERY_PICKUP_NAME,
      add: "Mumbai, Maharashtra",
      pin: "400001",
      phone: "918097486800",
    }
  };

  const bodyParams = new URLSearchParams();
  bodyParams.append("format", "json");
  bodyParams.append("data", JSON.stringify(dummyPayload));

  console.log("-> Prepared Form-Urlencoded Body Params:");
  console.log(`   format: json`);
  console.log(`   data: ${JSON.stringify(dummyPayload, null, 2)}`);

  if (!DELHIVERY_API_TOKEN) {
    console.log("-> [SKIPPED] Skipped actual payload submit due to missing API token.");
    return;
  }

  try {
    const url = `${DELHIVERY_BASE_URL}/api/cmu/create.json`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Token ${DELHIVERY_API_TOKEN}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: bodyParams.toString()
    });

    console.log(`-> Status Code: ${res.status} (${res.statusText})`);
    const data = await res.json();
    console.log("-> Response received:", JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("-> [FAILED] Manifest request failed with error:", error.message);
  }
}

async function run() {
  await testTracking();
  await testManifestPayload();
  console.log("\n=================================================");
  console.log("            VERIFICATION PROCESS COMPLETE        ");
  console.log("=================================================");
}

run();
