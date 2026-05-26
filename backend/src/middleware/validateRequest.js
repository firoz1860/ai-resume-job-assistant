export function requireFields(fields) {
  return (req, res, next) => {
    const missing = fields.filter((field) => !String(req.body[field] || '').trim());
    if (missing.length) {
      return res.status(400).json({ success: false, error: `${missing.join(', ')} required.` });
    }
    next();
  };
}
