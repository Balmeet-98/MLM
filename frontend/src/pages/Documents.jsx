import { useEffect, useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function Documents() {
  const [brochure, setBrochure] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/documents/brochure')
      .then((res) => setBrochure(res.data))
      .catch(() => toast.error('Failed to load brochure'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="page-loader">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="page-header mb-0">
        <h1 className="page-title">Brochure</h1>
        <p className="page-subtitle">
          Official Samriddhi Network company brochure
        </p>
      </div>

      {!brochure ? (
        <div className="empty-state card">
          <div className="icon">📄</div>
          <p className="text-slate-500">Brochure not available yet.</p>
          <p className="text-xs text-slate-400 mt-1">
            Upload <strong>brochure.pdf</strong> to the Supabase documents bucket.
          </p>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden flex flex-col">
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-slate-100 bg-slate-50/80">
            <h2 className="font-bold text-slate-800">{brochure.title}</h2>
            <a
              href={brochure.url}
              target="_blank"
              rel="noopener noreferrer"
              download={brochure.name}
              className="btn-outline text-sm"
            >
              Download PDF
            </a>
          </div>
          <iframe
            src={`${brochure.url}#toolbar=1&navpanes=0`}
            title={brochure.title}
            className="w-full border-0"
            style={{ height: 'min(80vh, 900px)' }}
          />
        </div>
      )}
    </div>
  );
}
