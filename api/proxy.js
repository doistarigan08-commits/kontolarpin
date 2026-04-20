export default async function handler(req, res) {

  const { type } = req.query;

  const BASE_URL = "https://dois.sahur.biz.id/doisxbilxz/ultimate";

  let target = "";

  switch (type) {
    case "data":
      target = `${BASE_URL}/data.php`;
      break;
    case "add":
      target = `${BASE_URL}/add.php`;
      break;
    case "delete":
      target = `${BASE_URL}/delete.php`;
      break;
    case "ganti":
      target = `${BASE_URL}/ganti.php`;
      break;
    default:
      return res.status(400).json({ success: false, message: "Invalid type" });
  }

  try {
    // ==============================
    // AMBIL BODY POST (Vercel SAFE)
    // ==============================
    let body = "";

    if (req.method === "POST") {
      const chunks = [];

      for await (const chunk of req) {
        chunks.push(chunk);
      }

      body = Buffer.concat(chunks).toString("utf8");
    }

    // ==============================
    // FORWARD REQUEST KE SERVER PHP
    // ==============================
    const response = await fetch(target, {
      method: req.method,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: req.method === "POST" ? body : undefined
    });

    let text = await response.text();

    // ==============================
    // CLEAN RESPONSE (ANTI HTML / CF / ERROR NOISE)
    // ==============================
    text = text
      .replace(/<[^>]*>/g, "") // hapus HTML
      .trim();

    // ambil JSON array atau object
    const arrayMatch = text.match(/\[[\s\S]*\]/);
    const objectMatch = text.match(/\{[\s\S]*\}/);

    let output = null;

    if (arrayMatch) {
      output = JSON.parse(arrayMatch[0]);
    } else if (objectMatch) {
      output = JSON.parse(objectMatch[0]);
    } else {
      // fallback kalau bukan JSON valid
      output = {
        raw: text,
        success: true
      };
    }

    // ==============================
    // CORS + RESPONSE
    // ==============================
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Content-Type", "application/json");

    return res.status(200).json(output);

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Proxy Error",
      error: err.message
    });
  }
}