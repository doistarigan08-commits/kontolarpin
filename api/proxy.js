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

  if (type === "ganti") {
    url = "https://dois.sahur.biz.id/doisxbilxz/ultimate/ganti.php";
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

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", "application/json");

    const match = text.match(/\[[\s\S]*\]/);
    const clean = match ? match[0] : text;

    res.status(200).send(clean);

  } catch (e) {
    res.status(500).json({ error: "proxy failed" });
  }
}