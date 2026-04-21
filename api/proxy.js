export default async function handler(req, res) {
  try {

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

    // =========================
    // SAFE BODY PARSE (NO STREAM)
    // =========================
    let body = null;

    if (req.method === "POST") {
      body = await new Promise((resolve) => {
        let data = "";
        req.on("data", chunk => data += chunk);
        req.on("end", () => resolve(data));
      });
    }

    // =========================
    // FETCH SAFE
    // =========================
    const response = await fetch(url, {
      method: req.method,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "Mozilla/5.0",
        "Accept": "*/*",
        "Accept-Encoding": "identity"
      },
      body: req.method === "POST" ? body : undefined
    });

    const text = await response.text();

    // DEBUG LOG (lihat di Vercel logs)
    console.log("RAW RESPONSE:", text);

    // =========================
    // SAFE PARSE
    // =========================
    let result;

    try {
      result = JSON.parse(text);
    } catch (e) {
      const match = text.match(/\[[\s\S]*\]/);
      result = match ? JSON.parse(match[0]) : [];
    }

    return res.status(200).json(result);

  } catch (err) {

    console.error("PROXY ERROR:", err);

    return res.status(500).json({
      success: false,
      message: "Proxy crashed",
      error: err.message
    });
  }
}