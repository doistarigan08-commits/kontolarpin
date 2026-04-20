export default async function handler(req, res) {

  const { type, nick, sender } = req.query;
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
    url = `https://dois.sahur.biz.id/doisxbilxz/ultimate/ganti.php?nick=${encodeURIComponent(nick)}&sender=${encodeURIComponent(sender)}`;
  }

  if (!url) {
    return res.status(400).json({ error: "invalid type" });
  }

  try {
    const options = {
      method: req.method,
      headers: {}
    };

    if (req.method !== "GET") {
      options.headers["Content-Type"] = "application/x-www-form-urlencoded";
      options.body = new URLSearchParams(req.body).toString();
    }

    const r = await fetch(url, options);
    const text = await r.text();

    let clean = text;

    const arr = text.match(/\[[\s\S]*\]/);
    const obj = text.match(/\{[\s\S]*\}/);

    if (arr) clean = arr[0];
    else if (obj) clean = obj[0];

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", "application/json");

    res.status(200).send(clean);

  } catch (e) {
    res.status(500).json({ error: "proxy error" });
  }
}