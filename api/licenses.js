// ========== LICENSES DI MEMORY (RAM) ==========
let licenses = [];

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== 'Bearer ucgg_super_secret_2024') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // GET - Lihat semua license
    if (req.method === 'GET') {
      return res.json({ success: true, licenses });
    }

    // POST - Buat license baru
    if (req.method === 'POST') {
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

      const expiryDays = parseInt(req.body?.expiryDays) || 30;
      const newLicense = {
        key: newKey,
        createdAt: new Date().toISOString(),
        expiryDate: new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        plan: req.body?.plan || 'premium',
        note: req.body?.note || '',
        maxUses: parseInt(req.body?.maxUses) || 99999,
        currentUses: 0
      };

      licenses.push(newLicense);

      return res.status(201).json({ success: true, license: newLicense });
    }

    // DELETE - Hapus license
    if (req.method === 'DELETE') {
      const key = req.query.key;
      if (!key) {
        return res.status(400).json({ error: 'License key required' });
      }
      licenses = licenses.filter(l => l.key !== key);
      return res.json({ success: true });
    }

    // PUT - Update license
    if (req.method === 'PUT') {
      const key = req.query.key;
      const { status, note } = req.body || {};

      if (!key) {
        return res.status(400).json({ error: 'License key required' });
      }

      const license = licenses.find(l => l.key === key);
      if (!license) {
        return res.status(404).json({ error: 'License not found' });
      }

      if (status) license.status = status;
      if (note) license.note = note;

      return res.json({ success: true, license });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
