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

async function getBody(req) {
  if (req.method !== "POST") return "";
  const chunks = [];
  for await (const c of req) chunks.push(c);
  return Buffer.concat(chunks).toString("utf8");
}

function headers() {
  return {
    "user-agent":
      "Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Mobile Safari/537.36",
    "accept": "*/*",
    "content-type": "application/x-www-form-urlencoded",
    "origin": BASE,
    "referer": BASE + "/",
    "cache-control": "no-cache"
  };
}

function safeJSON(text) {
  try {
    return JSON.parse(text);
  } catch {
    const arr = text.match(/\[[\s\S]*\]/);
    const obj = text.match(/\{[\s\S]*\}/);

    if (arr) return JSON.parse(arr[0]);
    if (obj) return JSON.parse(obj[0]);

    return [];
  }
}

export default async function handler(req, res) {
  const type = req.query.type;
  const path = map[type];

  if (!path) {
    return res.status(400).json({ success: false, message: "Invalid type" });
  }

  try {
    const body = await getBody(req);

    const { body: stream } = await request(BASE + path, {
      method: req.method,
      headers: headers(),
      body: req.method === "POST" ? body : undefined
    });

    let text = await stream.text();
    text = text.replace(/<[^>]*>/g, "").trim();

    const result = safeJSON(text);

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "no-store");

    return res.status(200).json(result);

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "proxy error",
      error: err.message
    });
  }
}