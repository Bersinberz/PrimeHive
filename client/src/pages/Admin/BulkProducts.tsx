import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, Download, CheckCircle2, XCircle, AlertTriangle, FileText } from 'lucide-react';
import { exportProductsCSV, importProductsCSV, type ImportRow, type ImportResult } from '../../services/Admin/productService';
import { useToast } from '../../context/ToastContext';
import PrimeLoader from '../../components/PrimeLoader';
import styles from '../../components/Admin/admin.module.css';

type PreviewRow = ImportRow & { _rowNum: number; _errors: string[] };

const REQUIRED_COLS = ['name', 'price', 'category'];
const OPTIONAL_COLS = ['description', 'comparePrice', 'sku', 'stock', 'status'];
const ALL_COLS = [...REQUIRED_COLS, ...OPTIONAL_COLS];

function parseCSV(text: string): { rows: PreviewRow[]; parseErrors: string[] } {
  const lines = text.trim().split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length < 2) return { rows: [], parseErrors: ['CSV must have a header row and at least one data row.'] };

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  const missing = REQUIRED_COLS.filter(c => !headers.includes(c));
  if (missing.length) return { rows: [], parseErrors: [`Missing required columns: ${missing.join(', ')}`] };

  const rows: PreviewRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const vals = lines[i].split(',').map(v => v.trim());
    const obj: Record<string, string> = {};
    headers.forEach((h, idx) => { obj[h] = vals[idx] ?? ''; });

    const errors: string[] = [];
    if (!obj.name) errors.push('name is required');
    const price = parseFloat(obj.price);
    if (isNaN(price) || price <= 0) errors.push('price must be a positive number');
    if (!obj.category) errors.push('category is required');

    rows.push({
      _rowNum: i,
      _errors: errors,
      name: obj.name,
      price: isNaN(price) ? 0 : price,
      category: obj.category,
      description: obj.description || undefined,
      comparePrice: obj.compareprice ? parseFloat(obj.compareprice) : undefined,
      sku: obj.sku || undefined,
      stock: obj.stock ? parseInt(obj.stock) : undefined,
      status: (obj.status as any) || undefined,
    });
  }

  return { rows, parseErrors: [] };
}

const BulkProducts: React.FC = () => {
  const { showToast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<PreviewRow[] | null>(null);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const text = ev.target?.result as string;
      const { rows, parseErrors: errs } = parseCSV(text);
      setParseErrors(errs);
      setPreview(rows);
      setResult(null);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleImport = async () => {
    if (!preview) return;
    const validRows = preview.filter(r => r._errors.length === 0);
    if (!validRows.length) {
      showToast({ type: 'error', title: 'No valid rows', message: 'Fix errors before importing' });
      return;
    }
    setImporting(true);
    try {
      const rows: ImportRow[] = validRows.map(({ _rowNum: _r, _errors: _e, ...rest }) => rest);
      const res = await importProductsCSV(rows);
      setResult(res);
      setPreview(null);
      showToast({ type: 'success', title: 'Import complete', message: res.message });
    } catch (err: any) {
      showToast({ type: 'error', title: 'Import failed', message: err?.response?.data?.message || 'Something went wrong' });
    } finally {
      setImporting(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportProductsCSV();
      showToast({ type: 'success', title: 'Exported', message: 'CSV download started' });
    } catch {
      showToast({ type: 'error', title: 'Export failed', message: 'Could not export products' });
    } finally {
      setExporting(false);
    }
  };

  const validCount = preview?.filter(r => r._errors.length === 0).length ?? 0;
  const errorCount = preview?.filter(r => r._errors.length > 0).length ?? 0;

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={{ maxWidth: 1200, margin: '0 auto' }}>
      <PrimeLoader isLoading={importing || exporting} />

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <p className={styles.pageLabel}>Products</p>
        <h2 className={styles.pageTitle}>Bulk Operations</h2>
        <p className={styles.pageSubtitle}>Import products via CSV or export your entire catalog.</p>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
        <button onClick={handleExport} disabled={exporting}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 50, border: 'none', background: '#f5f5f5', color: '#333', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer' }}>
          <Download size={16} /> Export CSV
        </button>
        <button onClick={() => fileRef.current?.click()}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 50, border: 'none', background: 'var(--prime-gradient)', color: '#fff', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer' }}>
          <Upload size={16} /> Import CSV
        </button>
        <input ref={fileRef} type="file" accept=".csv" className="d-none" onChange={handleFile} />
      </div>

      {/* CSV format hint */}
      <div style={{ background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 14, padding: '16px 20px', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <FileText size={15} style={{ color: '#6b7280' }} />
          <span style={{ fontWeight: 800, fontSize: '0.82rem', color: '#374151' }}>Expected CSV Format</span>
        </div>
        <code style={{ fontSize: '0.78rem', color: '#6b7280', display: 'block' }}>
          {ALL_COLS.join(',')}
        </code>
        <p style={{ margin: '8px 0 0', fontSize: '0.78rem', color: '#9ca3af' }}>
          Required: <strong>name, price, category</strong> — Optional: description, comparePrice, sku, stock, status (active/draft/archived)
        </p>
      </div>

      {/* Parse errors */}
      {parseErrors.length > 0 && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 14, padding: '16px 20px', marginBottom: 20 }}>
          {parseErrors.map((e, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#dc2626', fontWeight: 600, fontSize: '0.88rem' }}>
              <XCircle size={14} /> {e}
            </div>
          ))}
        </div>
      )}

      {/* Preview table */}
      {preview && preview.length > 0 && (
        <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #f0f0f2', overflow: 'hidden', marginBottom: 20 }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid #f0f0f2', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', gap: 16 }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#059669' }}>
                <CheckCircle2 size={13} className="me-1" />{validCount} valid
              </span>
              {errorCount > 0 && (
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#dc2626' }}>
                  <XCircle size={13} className="me-1" />{errorCount} with errors (will be skipped)
                </span>
              )}
            </div>
            <button onClick={handleImport} disabled={importing || validCount === 0}
              style={{ padding: '10px 24px', borderRadius: 50, border: 'none', background: 'var(--prime-gradient)', color: '#fff', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', opacity: validCount === 0 ? 0.5 : 1 }}>
              Import {validCount} Products
            </button>
          </div>
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.82rem' }}>
              <thead style={{ background: '#fafafa' }}>
                <tr>
                  {['Row', 'Name', 'Price', 'Category', 'SKU', 'Stock', 'Status', ''].map(h => (
                    <th key={h} className="py-3 px-3 border-0"
                      style={{ fontSize: '0.68rem', fontWeight: 800, color: '#bbb', textTransform: 'uppercase', letterSpacing: '1px' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.map(row => (
                  <tr key={row._rowNum} style={{ background: row._errors.length ? '#fef2f2' : undefined }}>
                    <td className="py-2 px-3 border-light" style={{ color: '#aaa', fontFamily: 'monospace' }}>{row._rowNum}</td>
                    <td className="py-2 px-3 border-light" style={{ fontWeight: 600, color: '#1a1a1a', maxWidth: 180 }}>{row.name || '—'}</td>
                    <td className="py-2 px-3 border-light">₹{row.price}</td>
                    <td className="py-2 px-3 border-light">{row.category || '—'}</td>
                    <td className="py-2 px-3 border-light" style={{ color: '#aaa' }}>{row.sku || '—'}</td>
                    <td className="py-2 px-3 border-light">{row.stock ?? '—'}</td>
                    <td className="py-2 px-3 border-light">
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                        background: row.status === 'active' ? 'rgba(16,185,129,0.1)' : 'rgba(107,114,128,0.1)',
                        color: row.status === 'active' ? '#059669' : '#6b7280' }}>
                        {row.status || 'draft'}
                      </span>
                    </td>
                    <td className="py-2 px-3 border-light">
                      {row._errors.length > 0 && (
                        <div title={row._errors.join(', ')} style={{ cursor: 'help' }}>
                          <AlertTriangle size={14} style={{ color: '#dc2626' }} />
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Import result */}
      {result && (
        <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #f0f0f2', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <CheckCircle2 size={20} style={{ color: '#059669' }} />
            <span style={{ fontWeight: 800, fontSize: '1rem', color: '#1a1a1a' }}>{result.message}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {result.results.map((r, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem' }}>
                {r.success
                  ? <CheckCircle2 size={13} style={{ color: '#059669', flexShrink: 0 }} />
                  : <XCircle size={13} style={{ color: '#dc2626', flexShrink: 0 }} />}
                <span style={{ color: r.success ? '#059669' : '#dc2626', fontWeight: 600 }}>
                  Row {r.row}: {r.success ? (r.product?.name || 'Imported') : r.error}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default BulkProducts;
