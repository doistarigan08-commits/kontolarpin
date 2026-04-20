export default async function handler(req, res) {

  const BASE = "https://dois.sahur.biz.id/doisxbilxz/ultimate";

  const map = {
    data: "/data.php",
    add: "/add.php",
    delete: "/delete.php",
    ganti: "/ganti.php"
  };

  const type = req.query.type;
  const path = map[type];

  if (!path) {
    return res.status(400).json({
      success: false,
      message: "Invalid type"
    });
  }

  // =========================
  // CLEAN URL (ANTI // BUG)
  // =========================
  const url = BASE.replace(/\/$/, "") + path;

  try {

    // =========================
    // READ BODY SAFE STREAM
    // =========================
    let body = "";

    if (req.method === "POST") {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      body = Buffer.concat(chunks).toString("utf8");
    }

    // =========================
    // FETCH TO PHP BACKEND
    // =========================
    const response = await fetch(url, {
      method: req.method,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json,text/plain,*/*",
        "Cache-Control": "no-cache",
        "Pragma": "no-cache",
        "Accept-Encoding": "identity"
      },
      body: req.method === "POST" ? body : undefined
    });

    // =========================
    // GET RAW RESPONSE
    // =========================
    let text = await response.text();

    console.log("RAW RESPONSE:", text);

    // =========================
    // CLEAN HTML GARBAGE
    // =========================
    text = text.replace(/<[^>]*>/g, "").trim();

    // =========================
    // SAFE JSON PARSE
    // =========================
    let result;

    try {
      result = JSON.parse(text);
    } catch (e) {

      // fallback array
      const arr = text.match(/\[[\s\S]*\]/);
      const obj = text.match(/\{[\s\S]*\}/);

      if (arr) {
        result = JSON.parse(arr[0]);
      } else if (obj) {
        result = JSON.parse(obj[0]);
      } else {
        result = [];
      }
    }

    // =========================
    // FORCE NO CACHE RESPONSE
    // =========================
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    return res.status(200).json(result);

  } catch (err) {

    console.log("PROXY ERROR:", err);

    return res.status(500).json({
      success: false,
      message: "Proxy Error",
      error: err.message
    });
  }
}