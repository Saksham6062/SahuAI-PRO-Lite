/**
 * SahuAI Proxy v2 — STREAMING pass-through CORS proxy
 * ====================================================
 * REASON FOR THIS REWRITE: the previous version of this worker read the whole
 * upstream response (await response.text()) before returning it, which
 * BUFFERED Server-Sent-Events completely — the Manthan Agent app received the
 * entire model answer in a single burst and chat streaming visibly did not
 * work for Saksham Intelligence (NVIDIA) and Z.ai models.
 *
 * This version passes the upstream body through UNREAD (new Response(resp.body)),
 * so Cloudflare streams every SSE chunk to the browser the moment it arrives.
 *
 * INTERFACE (unchanged):  https://<this-worker>/?url=<encoded-target-url>
 *
 * DEPLOY (2 minutes, no tools needed):
 *   1. Go to https://dash.cloudflare.com and log in.
 *   2. Workers & Pages (left sidebar) -> open the worker whose URL is
 *      ancient-tree-1c06.sahusaksham453675.workers.dev
 *      (the app calls it for Saksham Intelligence / NVIDIA and Z.ai requests).
 *   3. Click "Edit code" (top right).
 *   4. Select ALL the code in the editor, delete it, and paste THIS file.
 *   5. Click "Save and deploy".
 *   6. Done — reload the app; model answers now stream token-by-token.
 *      (The app already handles both modes automatically: no app change needed.)
 */

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Max-Age': '86400',
    'Access-Control-Expose-Headers': '*',
};

// Headers worth forwarding to the upstream API (hop-by-hop headers and
// Cloudflare internals must never be forwarded).
const FORWARD_HEADERS = [
    'authorization',
    'content-type',
    'accept',
    'x-api-key',
    'api-key',
    'subscription-key',
    'http-referer',
    'x-title',
    'x-request-id',
];

export default {
    async fetch(request) {
        // CORS preflight
        if (request.method === 'OPTIONS') {
            return new Response(null, { status: 204, headers: CORS_HEADERS });
        }

        const target = new URL(request.url).searchParams.get('url');
        if (!target) {
            return new Response('SahuAI Proxy: Target URL is missing.', {
                status: 400,
                headers: { 'Content-Type': 'text/plain;charset=UTF-8', ...CORS_HEADERS },
            });
        }

        // Build a clean upstream request. The body is passed through as a
        // STREAM (never read into memory) — this is what makes requests
        // (including Whisper multipart audio uploads) efficient.
        const fwd = new Headers();
        for (const h of FORWARD_HEADERS) {
            const v = request.headers.get(h);
            if (v) fwd.set(h, v);
        }
        const init = {
            method: request.method,
            headers: fwd,
            redirect: 'follow',
        };
        if (request.method !== 'GET' && request.method !== 'HEAD') {
            init.body = request.body;
            init.duplex = 'half';  // WHATWG fetch standard: streaming request body
        }

        let resp;
        try {
            resp = await fetch(target, init);
        } catch (err) {
            return new Response('SahuAI Proxy: upstream fetch failed - ' + (err && err.message ? err.message : 'unknown error'), {
                status: 502,
                headers: { 'Content-Type': 'text/plain;charset=UTF-8', ...CORS_HEADERS },
            });
        }

        // Copy upstream headers, then fix what must NOT be passed as-is:
        //  - content-encoding / content-length describe the COMPRESSED body;
        //    resp.body is already decoded inside the worker, so keeping them
        //    would corrupt the streamed response.
        const h = new Headers(resp.headers);
        h.delete('Content-Encoding');
        h.delete('Content-Length');
        h.delete('Transfer-Encoding');
        for (const [k, v] of Object.entries(CORS_HEADERS)) {
            h.set(k, v);
        }

        // THE FIX: return the body UNREAD. Cloudflare streams resp.body
        // chunk-by-chunk to the browser — SSE tokens arrive live.
        return new Response(resp.body, {
            status: resp.status,
            statusText: resp.statusText,
            headers: h,
        });
    },
};
