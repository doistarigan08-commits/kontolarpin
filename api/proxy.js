import { request } from "undici";

export const config = {
  runtime: "nodejs"
};

const BASE = "https://dois.sahur.biz.id/doisxbilxz/ultimate";

const map = {
  data: "/data.php",
  add: "/add.php",
  delete: "/delete.php",
  ganti: "/ganti.php"
};

// =========================
// STREAM HELPER
// =========================
function streamToString(stream) {
  return new Promise((resolve, reject) => {
    let data = "";

    stream.on("data", chunk => (data += chunk.toString("utf8")));
    stream.on("end", () => resolve(data));
    stream.on("error", reject);
  });
}

// =========================
// SPOOF HEADERS (BROWSER LIKE)
// =========================
function getSpoofHeaders() {
  return {
    "accept": "text/html,application/json;q=0.9,*/*;q=0.8",
    "accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
    "cache-control": "no-cache",
    "pragma": "no-cache",
    "sec-ch-ua": `"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"`,
    "sec-ch-ua-mobile": "?1",
    "sec-ch-ua-platform": `"Android"`,
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "user-agent":
      "Mozilla/5.0 (Linux; Android 13; SM-G998B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36",
    "referer": BASE + "/",
    "origin": BASE,
    "connection": "keep-alive"
  };
}

// =========================
// RETRY FETCH (ANTI DROP)
// =========================
async function safeRequest(url, options, retry = 2) {
  try {
    return await request(url, options);
  } catch (err) {
    if (retry > 0) {
      return safeRequest(url, options, retry - 1);
    }
    throw err;
  }
}

export default async function handler(req, res) {
  const type = req.query.type;
  const path = map[type];

  if (!path) {
    return res.status(400).json({
      success: false,
      message: "Invalid type"
    });
  }

  const url = BASE + path;

  try {
    // =========================
    // READ RAW BODY (SAFE STREAM)
    // =========================
    let body = "";

    if (req.method === "POST") {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      body = Buffer.concat(chunks).toString("utf8");
    }

    // =========================
    // REQUEST (ANTI WAF SPOOF)
    // =========================
    const { body: stream, statusCode } = await safeRequest(url, {
      method: req.method,
      headers: {
        ...getSpoofHeaders(),
        "content-type": "application/x-www-form-urlencoded",
        "content-length": body ? Buffer.byteLength(body) : undefined
      },
      body: req.method === "POST" ? body : undefined,
      maxRedirections: 5
    });

    // =========================
    // RAW RESPONSE
    // =========================
    let text = await streamToString(stream);

    console.log("RAW RESPONSE:", text);

    // =========================
    // CLEAN HTML JUNK
    // =========================
    text = text.replace(/<[^>]*>/g, "").trim();

    // =========================
    // SAFE JSON PARSE
    // =========================
    let result;

    try {
      result = JSON.parse(text);
    } catch (e) {
      const arr = text.match(/\[[\s\S]*\]/);
      const obj = text.match(/\{[\s\S]*\}/);

      if (arr) result = JSON.parse(arr[0]);
      else if (obj) result = JSON.parse(obj[0]);
      else result = { raw: text };
    }

    // =========================
    // RESPONSE HEADERS
    // =========================
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("X-Proxy-Mode", "ANTI-WAF-SPOOF");

    return res.status(statusCode || 200).json(result);

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Anti-WAF Proxy Failed",
      error: err.message
    });
  }
}