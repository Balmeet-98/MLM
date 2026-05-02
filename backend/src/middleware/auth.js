const { verifyToken } = require('../utils/jwt');
const supabase = require('../config/supabase');

const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, role, is_active')
      .eq('id', decoded.id)
      .single();

    if (error || !user) return res.status(401).json({ error: 'Invalid token' });
    if (!user.is_active) return res.status(403).json({ error: 'Account is deactivated' });

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token expired or invalid' });
  }
};

module.exports = auth;
