export default async function handler(req, res) {

  const { type } = req.query;

  let url = "";

  if (type === "data") {
    url = "https://dois.sahur.biz.id/doisxbilxz/ultimate/data.php";
  }

  if (type === "add") {
    url = "https://dois.sahur.biz.id/doisxbilxz/ultimate/add.php";
  }

  if (type === "delete") {
    url = "https://dois.sahur.biz.id/doisxbilxz/ultimate/delete.php";
  }

  try {

    let body = null;

    // 🔥 FIX: ambil body manual (WAJIB)
    if (req.method === "POST") {
      body = new URLSearchParams();

      // loop semua field
      for (const key in req.body) {
        body.append(key, req.body[key]);
      }
    }

    const r = await fetch(url, {
      method: req.method,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: body
    });

    const text = await r.text();

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", "application/json");

    // FIX: jangan cuma ambil array (delete & add itu object)
    let clean;

    try {
      clean = JSON.parse(text);
    } catch {
      const match = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
      clean = match ? JSON.parse(match[0]) : { raw: text };
    }

    res.status(200).json(clean);

  } catch (e) {
    res.status(500).json({ error: "proxy failed", detail: e.toString() });
  }
}