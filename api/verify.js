module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const licenseKey = req.headers['x-license-key'] || req.query.key;
  
  if (!licenseKey) {
    return res.status(401).json({ valid: false, error: 'License key required' });
  }

  if (!global.licenses) {
    return res.status(404).json({ valid: false, error: 'No licenses found' });
  }

  const license = global.licenses.find(l => l.key === licenseKey);
  
  if (!license) {
    return res.status(404).json({ valid: false, error: 'Invalid license key' });
  }

  if (license.status !== 'active') {
    return res.status(403).json({ valid: false, error: 'License is inactive' });
  }

  if (new Date() > new Date(license.expiryDate)) {
    license.status = 'expired';
    return res.status(403).json({ valid: false, error: 'License has expired' });
  }

  if (license.currentUses >= license.maxUses) {
    license.status = 'exhausted';
    return res.status(403).json({ valid: false, error: 'License usage limit exceeded' });
  }

  // Update usage
  license.currentUses += 1;
  license.lastUsed = new Date().toISOString();

  const remainingDays = Math.ceil((new Date(license.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));

  res.json({
    valid: true,
    key: licenseKey,
    plan: license.plan,
    expiresIn: remainingDays,
    maxUses: license.maxUses,
    used: license.currentUses,
    remaining: license.maxUses - license.currentUses,
    message: `License valid for ${remainingDays} days`
  });
};
