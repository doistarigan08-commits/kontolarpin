export default async function handler(req, res) {

  const ADMIN_KEY = "DOIS-ADMIN-123";

  const {
    type,
    email,
    jumlahResult,
    adminKey
  } = req.query;

  let url = "";

  /* =========================
     SIMPLE BLACKLIST MEMORY
     (⚠️ reset kalau server restart)
  ========================= */
  if (!globalThis.__blacklist) {
    globalThis.__blacklist = [];
  }

  const blacklist = globalThis.__blacklist;
  const isAdmin = adminKey === ADMIN_KEY;

  /* =========================
     ROUTING TYPE
  ========================= */
  if (type === "data") {
    url = "https://dois.sahur.biz.id/doisxbilxz/ultimate/data.php";
  }

  if (type === "add") {

    // 🚫 BLOCK kalau blacklist & bukan admin
    if (email && blacklist.includes(email) && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Email di blacklist"
      });
    }

    url = "https://dois.sahur.biz.id/doisxbilxz/ultimate/add.php";
  }

  if (type === "delete") {

    url = "https://dois.sahur.biz.id/doisxbilxz/ultimate/delete.php";

    // 🔥 masuk blacklist
    if (email && !blacklist.includes(email)) {
      blacklist.push(email);
    }
  }

  if (!url) {
    return res.status(400).json({
      success: false,
      message: "Invalid type"
    });
  }

  /* =========================
     FORWARD REQUEST
  ========================= */
  try {

    const r = await fetch(url, {
      method: req.method,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: req.method === "POST"
        ? new URLSearchParams(req.body).toString()
        : undefined
    });

    const text = await r.text();

    // ambil JSON dari response PHP
    const match = text.match(/\[[\s\S]*\]/);
    const clean = match ? match[0] : text;

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", "application/json");

    return res.status(200).send(clean);

  } catch (e) {
    return res.status(500).json({
      success: false,
      message: "Proxy error"
    });
  }
}