/**
 * Extracts a human-readable message from any thrown value — most commonly an
 * axios error whose response body may have very different shapes:
 *
 *   - our API routes:                    { "error": "Unauthorized" }
 *   - platform-level errors (e.g. Vercel's 413 FUNCTION_PAYLOAD_TOO_LARGE):
 *                                        { "error": { "message": "...", "code": "..." } }
 *   - arrays of details:                 { "error": "Upload failed", "details": ["a.jpg: ..."] }
 *   - non-JSON / HTML bodies             "Request Entity Too Large"
 *
 * Doing `String(someObject)` or `new Error(someObject)` on the object shapes
 * produces the infamous literal "[object Object]", which the admin product
 * form was rendering verbatim. This helper guarantees that never happens.
 */
export function getApiErrorMessage(err: unknown, fallback = "Something went wrong."): string {
  const data = (err as { response?: { data?: unknown } } | null)?.response?.data ?? null;
  const record = (data && typeof data === "object" && !Array.isArray(data))
    ? (data as Record<string, unknown>)
    : null;

  // Priority: the API's `error` field (recursing into nested objects), then
  // its `message`, then any `details` list, then the error's own message.
  const candidates: unknown[] = [
    record?.error,
    record?.message,
    record?.details,
    (err as Error | null)?.message,
  ];

  for (const candidate of candidates) {
    const message = toReadableText(candidate);
    if (message) return message;
  }

  // Thrown strings and other primitives
  if (typeof err === "string") {
    const trimmed = err.trim();
    if (trimmed && trimmed !== "[object Object]") return trimmed;
  }
  if (typeof err === "number" || typeof err === "boolean") {
    return String(err);
  }

  return fallback;
}

/**
 * Raw-size cap for a single file sent through /api/upload. The file is
 * base64-encoded in transit (~1.33x), and Vercel rejects serverless request
 * bodies over 4.5MB (FUNCTION_PAYLOAD_TOO_LARGE) before the route even runs —
 * so anything larger than ~3.3MB raw can never succeed on the deployment.
 * Uploading one file per request keeps each body well under the cap.
 */
export const MAX_UPLOAD_BYTES = 3.25 * 1024 * 1024;

function toReadableText(value: unknown, depth = 0): string | null {
  if (value == null) return null;

  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed && trimmed !== "[object Object]" ? trimmed : null;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (Array.isArray(value)) {
    // e.g. details: ["photo.jpg: File format not allowed", ...]
    const parts = value
      .map((item) => toReadableText(item, depth + 1))
      .filter((part): part is string => !!part);
    return parts.length ? parts.join("; ") : null;
  }

  if (typeof value === "object" && depth < 4) {
    const record = value as Record<string, unknown>;
    // Dig into the most common wrapper keys before falling back to raw JSON.
    for (const key of ["message", "error", "detail", "description", "reason", "msg"]) {
      const nested = toReadableText(record[key], depth + 1);
      if (nested) return nested;
    }
    try {
      const json = JSON.stringify(value);
      return json && json !== "{}" ? json.slice(0, 300) : null;
    } catch {
      return null;
    }
  }

  return null;
}