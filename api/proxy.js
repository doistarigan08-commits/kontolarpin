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
    return res.status(400).json({ success: false, message: "Invalid type" });
  }

  const url = BASE + path;

  try {

    // =========================
    // READ BODY (SAFE VERCEL STREAM)
    // =========================
    let body = "";

    if (req.method === "POST") {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      body = Buffer.concat(chunks).toString("utf8");
    }

    // =========================
    // FETCH (FORWARD TO PHP)
    // =========================
    const response = await fetch(url, {
      method: req.method,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept-Encoding": "identity" // 🔥 penting: matiin compression problem
      },
      body: req.method === "POST" ? body : undefined
    });

    // =========================
    // GET RAW TEXT
    // =========================
    let text = await response.text();

    console.log("RAW:", text);

    // =========================
    // CLEAN RESPONSE (ANTI HTML / GARBAGE)
    // =========================
    text = text.replace(/<[^>]*>/g, "").trim();

    // =========================
    // PARSE SAFE JSON
    // =========================
    let result;

    try {
      result = JSON.parse(text);
    } catch (e) {

      const arr = text.match(/\[[\s\S]*\]/);
      const obj = text.match(/\{[\s\S]*\}/);

      if (arr) result = JSON.parse(arr[0]);
      else if (obj) result = JSON.parse(obj[0]);
      else result = [];
    }

    // =========================
    // RESPONSE
    // =========================
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", "application/json");

    return res.status(200).json(result);

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Proxy Error",
      error: err.message
    });
  }
}