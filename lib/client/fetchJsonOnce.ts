/**
 * De-duplicates identical GET requests made by several components on the
 * same page (e.g. HomeGallerySection and SocialProofSection both loading
 * /api/gallery). The first caller starts the request; everyone else within
 * `ttlMs` shares the same promise. Failed requests are not cached.
 */
const inflight = new Map<string, { at: number; promise: Promise<any> }>();

export function fetchJsonOnce<T = any>(url: string, ttlMs = 60_000): Promise<T> {
  const hit = inflight.get(url);
  if (hit && Date.now() - hit.at < ttlMs) return hit.promise;

  const promise = fetch(url).then((res) => {
    if (!res.ok) throw new Error(`${url} responded ${res.status}`);
    return res.json();
  });
  inflight.set(url, { at: Date.now(), promise });
  promise.catch(() => inflight.delete(url));
  return promise;
}
