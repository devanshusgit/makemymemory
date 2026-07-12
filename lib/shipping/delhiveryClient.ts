/**
 * Delhivery Express API Client
 * Supports Sandbox and Production environments dynamically.
 */

const getBaseUrl = () => {
  return process.env.DELHIVERY_BASE_URL || "https://staging-express.delhivery.com";
};

const getHeaders = () => {
  const token = process.env.DELHIVERY_API_TOKEN;
  if (!token) {
    console.warn("[Delhivery] Warning: DELHIVERY_API_TOKEN is not configured.");
  }
  return {
    "Authorization": `Token ${token}`,
    "Content-Type": "application/json",
  };
};

export interface DelhiveryShipmentData {
  consigneeName: string;
  address: string;
  pincode: string;
  city: string;
  state: string;
  phone: string;
  orderId: string;
  isCOD: boolean;
  amount: number;
  packageDesc: string;
  weight: number; // in kg
}

/**
 * Manifest a shipment (forward order) with Delhivery
 */
export async function createDelhiveryShipment(data: DelhiveryShipmentData) {
  try {
    const baseUrl = getBaseUrl();
    const headers = getHeaders();

    const pickupName = process.env.DELHIVERY_PICKUP_NAME || "MMM Warehouse";

    const payload = {
      shipments: [
        {
          name: data.consigneeName,
          add: data.address,
          pin: data.pincode,
          city: data.city,
          state: data.state,
          country: "India",
          phone: data.phone,
          order: data.orderId,
          payment_mode: data.isCOD ? "COD" : "Prepaid",
          cod_amount: data.isCOD ? data.amount : 0,
          package_desc: data.packageDesc,
          package_weight: data.weight || 0.5,
          parcel_quantity: 1,
          seller_name: "Make My Memory",
          pickup_location_name: pickupName,
        },
      ],
      pickup_location: {
        name: pickupName,
        add: "Mumbai, Maharashtra",
        pin: "400001",
        phone: "918097486800",
      },
    };

    const bodyParams = new URLSearchParams();
    bodyParams.append("format", "json");
    bodyParams.append("data", JSON.stringify(payload));

    const response = await fetch(`${baseUrl}/api/cmu/create.json`, {
      method: "POST",
      headers: {
        ...headers,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: bodyParams.toString(),
    });

    const result = await response.json();
    console.log("[Delhivery createShipment] Response:", JSON.stringify(result));
    return result;
  } catch (error) {
    console.error("[Delhivery createShipment] Error:", error);
    throw error;
  }
}

/**
 * Fetch packing slip HTML markup
 */
export async function getDelhiveryPackingSlip(awb: string): Promise<string> {
  try {
    const baseUrl = getBaseUrl();
    const headers = getHeaders();

    const response = await fetch(`${baseUrl}/api/p/packing_slip?wbns=${awb}`, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch packing slip: ${response.statusText}`);
    }

    const html = await response.text();
    return html;
  } catch (error) {
    console.error("[Delhivery getPackingSlip] Error:", error);
    throw error;
  }
}

/**
 * Fetch shipment tracking status details
 */
export async function trackDelhiveryWaybill(awb: string) {
  try {
    const baseUrl = getBaseUrl();
    const headers = getHeaders();

    const response = await fetch(`${baseUrl}/api/v1/packages/json/?waybill=${awb}`, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to track waybill: ${response.statusText}`);
    }

    const result = await response.json();
    console.log("[Delhivery trackWaybill] Response:", JSON.stringify(result));
    return result;
  } catch (error) {
    console.error("[Delhivery trackWaybill] Error:", error);
    throw error;
  }
}

export interface DelhiveryPickupDetails {
  pickupDate: string; // YYYY-MM-DD
  pickupTime: string; // HH:MM
  packageCount: number;
}

/**
 * Schedule courier pickup
 */
export async function scheduleDelhiveryPickup(details: DelhiveryPickupDetails) {
  try {
    const baseUrl = getBaseUrl();
    const headers = getHeaders();
    const pickupName = process.env.DELHIVERY_PICKUP_NAME || "MMM Warehouse";

    const payload = {
      pickup_date: details.pickupDate,
      pickup_time: details.pickupTime,
      pickup_location_id: pickupName,
      expected_package_count: details.packageCount || 1,
    };

    const response = await fetch(`${baseUrl}/fm/request/new/`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    console.log("[Delhivery schedulePickup] Response:", JSON.stringify(result));
    return result;
  } catch (error) {
    console.error("[Delhivery schedulePickup] Error:", error);
    throw error;
  }
}
