export default async function handler(req, res) {

  const ADMIN_KEY = "DOIS-ADMIN-123";

  const { type, adminKey } = req.query;

  if (!globalThis.__blacklist) {
    globalThis.__blacklist = [];
  }

  const blacklist = globalThis.__blacklist;

  let bodyText = "";
  let params = {};

  try {
    bodyText = await req.text();
    params = Object.fromEntries(new URLSearchParams(bodyText));
  } catch (e) {}

  const email = (params.email || "").trim();
  const isAdmin = adminKey === ADMIN_KEY;

  let url = "";

  /* =========================
     DATA
  ========================= */
  if (type === "data") {
    url = "https://dois.sahur.biz.id/doisxbilxz/ultimate/data.php";
  }

  /* =========================
     ADD (BLOCK IF BLACKLIST)
  ========================= */
  if (type === "add") {

    if (email && blacklist.includes(email) && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Email di blacklist"
      });
    }

    url = "https://dois.sahur.biz.id/doisxbilxz/ultimate/add.php";
  }

  /* =========================
     DELETE (MASUK BLACKLIST)
  ========================= */
  if (type === "delete") {

    url = "https://dois.sahur.biz.id/doisxbilxz/ultimate/delete.php";

    if (email && !blacklist.includes(email)) {
      blacklist.push(email);
    }
  }

  /* =========================
     UNBLOCK (ADMIN ONLY)
  ========================= */
  if (type === "unblock") {

    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Admin only"
      });
    }

    if (email) {
      globalThis.__blacklist = blacklist.filter(e => e !== email);
    }

    return res.json({
      success: true,
      message: "Unblocked"
    });
  }

  if (!url) {
    return res.status(400).json({
      success: false,
      message: "Invalid type"
    });
  }

  /* =========================
     FORWARD
  ========================= */
  try {

    const r = await fetch(url, {
      method: req.method,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: req.method === "POST" ? bodyText : undefined
    });

    const text = await r.text();

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", "application/json");

    return res.status(200).send(text);

  } catch (e) {
    return res.status(500).json({
      success: false,
      message: "proxy error"
    });
  }
}