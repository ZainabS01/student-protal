export async function handler(event, context) {
  const BACKEND_URL = process.env.BACKEND_URL; // e.g., https://your-backend.example.com
  if (!BACKEND_URL) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'BACKEND_URL is not configured on Netlify.' }),
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    };
  }

  // CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
      },
      body: '',
    };
  }

  const { path, httpMethod, headers, body, isBase64Encoded } = event;

  // Extract the part after "/.netlify/functions/api" and map it to backend /api route
  const match = path.match(/\.netlify\/functions\/api\/?(.*)$/);
  const splat = match && match[1] ? match[1] : '';
  const targetUrl = `${BACKEND_URL.replace(/\/$/, '')}/api/${splat}`;

  const forwardHeaders = new Headers();
  for (const [k, v] of Object.entries(headers || {})) {
    // Exclude host-related headers which may cause issues
    if (!['host', 'x-forwarded-host'].includes(k.toLowerCase())) {
      forwardHeaders.set(k, v);
    }
  }

  try {
    const resp = await fetch(targetUrl, {
      method: httpMethod,
      headers: forwardHeaders,
      body: ['GET', 'HEAD'].includes(httpMethod.toUpperCase()) ? undefined : (isBase64Encoded ? Buffer.from(body || '', 'base64') : body),
    });

    const buf = await resp.arrayBuffer();
    const base64Body = Buffer.from(buf).toString('base64');

    // Pass through content-type; add CORS
    const outHeaders = Object.fromEntries(resp.headers.entries());
    outHeaders['Access-Control-Allow-Origin'] = '*';

    return {
      statusCode: resp.status,
      headers: outHeaders,
      isBase64Encoded: true,
      body: base64Body,
    };
  } catch (err) {
    return {
      statusCode: 502,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ message: 'Proxy error', error: String(err), targetUrl }),
    };
  }
}
