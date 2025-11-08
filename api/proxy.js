// Vercel Serverless Function (Node.js) untuk mengatasi CORS
const fetch = require('node-fetch'); // Perlu node-fetch diinstal jika tidak di Vercel

const YOGATEWAY_BASE_URL = 'https://yogateway.yotemp.web.id/api.php';

module.exports = async (req, res) => {
  // Ambil parameter dari query string (action, apikey, amount/trxid)
  const { action, apikey, amount, trxid } = req.query;

  // Pastikan parameter dasar ada
  if (!action || !apikey) {
    res.status(400).json({ error: 'Missing required parameters: action or apikey.' });
    return;
  }
  
  // Tentukan URL tujuan berdasarkan action
  let targetUrl = `${YOGATEWAY_BASE_URL}?action=${action}&apikey=${apikey}`;

  if (action === 'createpayment' && amount) {
    targetUrl += `&amount=${amount}`;
  } else if (action === 'checkstatus' && trxid) {
    targetUrl += `&trxid=${trxid}`;
  } else {
    res.status(400).json({ error: 'Invalid or missing parameters for the specified action.' });
    return;
  }
  
  try {
    // Panggil API YoGateway dari Serverless Function (Sisi server tidak ada masalah CORS)
    const apiResponse = await fetch(targetUrl);
    const data = await apiResponse.json();

    // Set header CORS agar frontend bisa membaca hasilnya
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Kembalikan data dari YoGateway ke frontend
    res.status(200).json(data);
  } catch (error) {
    console.error("YoGateway Proxy Error:", error);
    res.status(500).json({ 
      provider: "Proxy", 
      status: false, 
      error: `Proxy failed to fetch from external API: ${error.message}`
    });
  }
};

