const supabase = require('../config/supabase');

const BUCKET = process.env.SUPABASE_DOCUMENTS_BUCKET || 'documents';
const BROCHURE_FILE = process.env.SUPABASE_BROCHURE_FILE || 'brochure.pdf';
const SIGNED_URL_TTL = 60 * 60; // 1 hour

const getBrochure = async (req, res, next) => {
  try {
    const { data: signed, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(BROCHURE_FILE, SIGNED_URL_TTL);

    if (error) {
      if (error.message?.includes('not found') || error.message?.includes('Object not found')) {
        return res.status(404).json({ error: 'Brochure not uploaded yet' });
      }
      throw error;
    }

    res.json({
      title: 'Samriddhi Network Brochure',
      name: BROCHURE_FILE,
      url: signed.signedUrl,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getBrochure };
