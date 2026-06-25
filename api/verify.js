// Data license hardcode (bisa ditambah manual)
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
  
  const key = req.headers['x-license-key'] || req.query.key;
  
  if (!key) {
    return res.status(401).json({ valid: false, error: 'License key required' });
  }

  const license = LICENSES.find(l => l.key === key);
  
  if (!license) {
    return res.status(404).json({ valid: false, error: 'Invalid license key' });
  }

  if (license.status !== 'active') {
    return res.status(403).json({ valid: false, error: 'License is inactive' });
  }

  if (new Date() > new Date(license.expiryDate)) {
    return res.status(403).json({ valid: false, error: 'License has expired' });
  }

  if (license.currentUses >= license.maxUses) {
    return res.status(403).json({ valid: false, error: 'License usage limit exceeded' });
  }

  license.currentUses += 1;

  const remainingDays = Math.ceil((new Date(license.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));

  res.json({
    valid: true,
    key: license.key,
    plan: license.plan,
    expiresIn: remainingDays,
    maxUses: license.maxUses,
    used: license.currentUses,
    remaining: license.maxUses - license.currentUses
  });
};
