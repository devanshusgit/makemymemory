/**
 * Delhivery Express API Client
 * Supports Sandbox and Production environments dynamically.
 */

const getBaseUrl = () => {
  // No staging fallback: an unset variable used to send real shipments to
  // Delhivery's test server, where they silently never ship.
  const baseUrl = process.env.DELHIVERY_BASE_URL;
  if (!baseUrl) {
    throw new Error("DELHIVERY_BASE_URL is not configured — set it to the Delhivery API environment you intend to use.");
  }
  return baseUrl.replace(/\/+$/, "");
};

const getHeaders = () => {
  const token = process.env.DELHIVERY_API_TOKEN;
  if (!token) {
    throw new Error("DELHIVERY_API_TOKEN is not configured — shipment requests would be rejected by Delhivery.");
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
  amount: number;          // cash to collect (COD only)
  packageDesc: string;     // what's in the box — printed on the label
  weight: number;          // in kg
  declaredValue?: number;  // invoice value printed on the label (Price/Total)
  quantity?: number;       // number of items printed on the label
}

// Our studio — printed as the seller address on Delhivery's label.
const SELLER_ADDRESS =
  process.env.DELHIVERY_SELLER_ADDRESS ||
  "Shop No. 12, A-5, Swapnil Shantinagar Chs. Ltd, Shanti Nagar Sector 7, Mira Road (E), Mumbai, Maharashtra 401107";

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
          // Delhivery's field names. We used to send package_desc /
          // package_weight / parcel_quantity, which Delhivery ignores — so
          // labels showed its default "<client> package" text and ₹0.00.
          products_desc: data.packageDesc,
          total_amount: Math.round((data.declaredValue ?? data.amount ?? 0) * 100) / 100,
          quantity: data.quantity && data.quantity > 0 ? data.quantity : 1,
          weight: Math.round((data.weight || 0.5) * 1000), // grams
          seller_name: "Make My Memory",
          seller_add: SELLER_ADDRESS,
          seller_inv: data.orderId,
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
 * Did Delhivery actually accept the manifest? A rejected package can still
 * carry a waybill (e.g. {status:"Fail", waybill:"…", remarks:"Duplicate order
 * id"}), so the waybill alone is not proof of success.
 */
export function delhiveryManifestResult(res: any): { ok: true; waybill: string } | { ok: false; error: string } {
  const pkg = res?.packages?.[0];
  const pkgStatus = typeof pkg?.status === "string" ? pkg.status.toLowerCase() : "";
  const failed =
    res?.success === false ||
    (pkgStatus !== "" && pkgStatus !== "success") ||
    !pkg?.waybill;
  if (failed) {
    const remarks = Array.isArray(pkg?.remarks) ? pkg.remarks.join(", ") : pkg?.remarks;
    return { ok: false, error: String(remarks || res?.rmk || res?.error || "Delhivery did not accept the shipment") };
  }
  return { ok: true, waybill: String(pkg.waybill) };
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
 * Ask Delhivery for its own printable label PDF (the same one Delhivery One
 * prints). Returns the PDF link, or null if this account/API version doesn't
 * return one — callers then render the label from the JSON instead.
 */
export async function getDelhiveryLabelPdfLink(awb: string): Promise<string | null> {
  try {
    const baseUrl = getBaseUrl();
    const headers = getHeaders();
    const response = await fetch(
      `${baseUrl}/api/p/packing_slip?wbns=${encodeURIComponent(awb)}&pdf=true&pdf_size=4R`,
      { method: "GET", headers }
    );
    if (!response.ok) return null;
    const data = await response.json().catch(() => null);
    const link = data?.packages?.[0]?.pdf_download_link;
    return typeof link === "string" && /^https:\/\//.test(link) ? link : null;
  } catch {
    return null;
  }
}

/**
 * Edit an already-manifested shipment (Delhivery Edit Order API).
 * Delhivery only allows this before pickup (Manifested / Pending / Scheduled /
 * In Transit) and only for: name, add, phone, cod, gm, dimensions,
 * product_details, pt. The declared price can NOT be edited.
 */
export async function editDelhiveryShipment(
  awb: string,
  fields: { product_details?: string; gm?: number }
) {
  const baseUrl = getBaseUrl();
  const headers = getHeaders();
  const response = await fetch(`${baseUrl}/api/p/edit`, {
    method: "POST",
    headers,
    body: JSON.stringify({ waybill: awb, ...fields }),
  });
  const text = await response.text();
  let result: unknown = text;
  try { result = JSON.parse(text); } catch {}
  console.log("[Delhivery editShipment]", response.status, text.slice(0, 500));
  return { ok: response.ok, status: response.status, result };
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

    // Delhivery wants the registered warehouse name in `pickup_location` and
    // the time as hh:mm:ss. We used to send `pickup_location_id` and "14:00",
    // which Delhivery rejects ("Insufficient parameters specified").
    const t = String(details.pickupTime || "").trim();
    const payload = {
      pickup_date: details.pickupDate,
      pickup_time: /^\d{2}:\d{2}$/.test(t) ? `${t}:00` : t,
      pickup_location: pickupName,
      expected_package_count: details.packageCount || 1,
    };

    const response = await fetch(`${baseUrl}/fm/request/new/`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    const text = await response.text();
    let result: any = null;
    try { result = JSON.parse(text); } catch {}
    console.log("[Delhivery schedulePickup] Response:", response.status, text.slice(0, 500));
    if (!response.ok || !result || result.error || result.pickup_id == null) {
      const msg = result?.error || result?.prepaid || result?.message || text.slice(0, 200) || `HTTP ${response.status}`;
      throw new Error(`Delhivery did not book the pickup: ${typeof msg === "string" ? msg : JSON.stringify(msg)}`);
    }
    return result;
  } catch (error) {
    console.error("[Delhivery schedulePickup] Error:", error);
    throw error;
  }
}
