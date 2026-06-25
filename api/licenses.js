// Data license hardcode (sama dengan di verify.js)
const LICENSES = [
  {
    key: "BTHVZ-BS34P-3SA2L-WSJJ",
    expiryDate: "2026-07-25T05:58:43.401Z",
    status: "active",
    plan: "premium",
    maxUses: 99999,
    currentUses: 0
  }
];

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== 'Bearer ucgg_super_secret_2024') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    return res.json({ success: true, licenses: LICENSES });
  }
  else if (req.method === 'POST') {
    // Generate new license
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let groups = [];
    for (let i = 0; i < 4; i++) {
      let group = '';
      for (let j = 0; j < 5; j++) {
        group += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      groups.push(group);
    }
    const newKey = groups.join('-');
    
    const newLicense = {
      key: newKey,
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      plan: req.body.plan || 'premium',
      maxUses: req.body.maxUses || 99999,
      currentUses: 0
    };
    
    LICENSES.push(newLicense);
    
    return res.json({ success: true, license: newLicense });
  }
  else if (req.method === 'DELETE') {
    const key = req.query.key;
    const index = LICENSES.findIndex(l => l.key === key);
    if (index !== -1) {
      LICENSES.splice(index, 1);
    }
    return res.json({ success: true });
  }
  else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
};
