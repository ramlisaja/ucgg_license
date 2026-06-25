import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const key = req.headers['x-license-key'] || req.query.key;
  
  if (!key) {
    return res.status(401).json({ valid: false, error: 'License key required' });
  }

  try {
    const license = await redis.get(`license:${key}`);
    
    if (!license) {
      return res.status(404).json({ valid: false, error: 'Invalid license key' });
    }

    if (license.status !== 'active') {
      return res.status(403).json({ valid: false, error: 'License is inactive' });
    }

    if (new Date() > new Date(license.expiryDate)) {
      license.status = 'expired';
      await redis.set(`license:${key}`, license);
      return res.status(403).json({ valid: false, error: 'License has expired' });
    }

    if (license.currentUses >= license.maxUses) {
      license.status = 'exhausted';
      await redis.set(`license:${key}`, license);
      return res.status(403).json({ valid: false, error: 'License usage limit exceeded' });
    }

    license.currentUses += 1;
    await redis.set(`license:${key}`, license);

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
  } catch (error) {
    res.status(500).json({ valid: false, error: 'Server error' });
  }
        }
