const { authenticate } = require('./auth');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  await authenticate(req, res, async () => {
    if (req.method === 'POST') {
      const licenseKey = generateLicenseKey();
      const licenseData = {
        key: licenseKey,
        createdAt: new Date().toISOString(),
        expiryDate: new Date(Date.now() + 30*24*60*60*1000).toISOString(),
        status: 'active',
        plan: req.body.plan || 'premium',
        note: req.body.note || '',
        maxUses: req.body.maxUses || 99999,
        currentUses: 0
      };
      
      if (!global.licenses) global.licenses = [];
      global.licenses.push(licenseData);
      
      res.json({ success: true, license: licenseData });
    } 
    else if (req.method === 'GET') {
      res.json({ 
        success: true, 
        licenses: global.licenses || [] 
      });
    }
    else if (req.method === 'DELETE') {
      const key = req.query.key;
      global.licenses = (global.licenses || []).filter(l => l.key !== key);
      res.json({ success: true });
    }
    else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  });
};

function generateLicenseKey() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let groups = [];
  for (let i = 0; i < 4; i++) {
    let group = '';
    for (let j = 0; j < 5; j++) {
      group += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    groups.push(group);
  }
  return groups.join('-');
}
