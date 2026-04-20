export default async function handler(req, res) {

  const ADMIN_KEY = "DOIS-ADMIN-123";

  const { type, adminKey } = req.query;

  let url = "";

  // ambil email dari body juga (PENTING)
  let email = "";

  try {
    const body = req.body || {};
    email = body.email || body.sender || "";
  } catch (e) {}

  const isAdmin = adminKey === ADMIN_KEY;

  /* =========================
     ROUTE
  ========================= */
  if (type === "data") {
    url = "https://dois.sahur.biz.id/doisxbilxz/ultimate/data.php";
  }

  if (type === "add") {
    url = "https://dois.sahur.biz.id/doisxbilxz/ultimate/add.php";

    // 🔥 FIX: jangan blok kalau email kosong (hindari PHP error)
    if (email && blacklistHas(email) && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Email di blacklist"
      });
    }
  }

  if (type === "delete") {
    url = "https://dois.sahur.biz.id/doisxbilxz/ultimate/delete.php";

    if (email) {
      addBlacklist(email);
    }
  }

  if (!url) {
    return res.status(400).json({
      success: false,
      message: "Invalid type"
    });
  }

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

    const match = text.match(/\[[\s\S]*\]/);
    const clean = match ? match[0] : text;

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", "application/json");

    return res.status(200).send(clean);

  } catch (e) {
    return res.status(500).json({
      success: false,
      message: "proxy error"
    });
  }
}

/* =========================
   BLACKLIST SAFE STORAGE
========================= */
function blacklistHas(email){
  if (!globalThis.__blacklist) globalThis.__blacklist = [];
  return globalThis.__blacklist.includes(email);
}

function addBlacklist(email){
  if (!globalThis.__blacklist) globalThis.__blacklist = [];

  if (!globalThis.__blacklist.includes(email)) {
    globalThis.__blacklist.push(email);
  }
}