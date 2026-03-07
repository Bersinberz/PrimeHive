import React from 'react';
import { type Category } from '../../../services/Admin/categoryService';

interface CategoryListProps {
  categories: Category[];
  isLoading: boolean;
  onAddFirst: () => void;
  onEdit: (category: Category) => void;
  onAssign: (category: Category) => void;
  onDelete: (category: Category) => void;
}

const CategoryList: React.FC<CategoryListProps> = ({ categories, isLoading, onAddFirst, onEdit, onAssign, onDelete }) => {
  if (isLoading) return null; // Controlled by PrimeLoader in parent

  if (categories.length === 0) {
    return (
      <div className="text-center py-5 px-4">
        <div className="mx-auto mb-4 d-flex align-items-center justify-content-center rounded-circle" style={{ width: '80px', height: '80px', background: 'rgba(255,140,66,0.1)' }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--prime-orange)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
        </div>
        <h5 className="fw-bolder text-dark mb-2">No categories yet</h5>
        <p className="text-muted mb-4" style={{ maxWidth: '360px', margin: '0 auto' }}>Your catalog is unorganized. Create collections to help customers find what they need.</p>
        <button onClick={onAddFirst} className="btn text-white fw-bold px-4 py-2 border-0 shadow-sm" style={{ background: 'var(--prime-gradient)', borderRadius: '10px' }}>
          + Create First Category
        </button>
      </div>
    );
  }

  return (
    <div className="table-responsive p-0">
      <table className="table table-hover align-middle mb-0">
        <thead className="bg-light bg-opacity-50">
          <tr>
            <th className="py-3 px-4 border-0 text-uppercase small fw-bold text-secondary">Category Details</th>
            <th className="py-3 px-4 border-0 text-uppercase small fw-bold text-secondary text-center">Products</th>
            <th className="py-3 px-4 border-0 text-uppercase small fw-bold text-secondary text-end">Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((cat) => (
            <tr key={cat._id}>
              <td className="py-4 px-4 border-light">
                <div className="d-flex align-items-center">
                  <div className="bg-light rounded-3 d-flex align-items-center justify-content-center me-3" style={{ width: '45px', height: '45px', color: 'var(--prime-orange)' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                  </div>
                  <div>
                    <h6 className="mb-0 fw-bolder text-dark fs-6">{cat.name}</h6>
                    <small className="text-muted d-block mt-1" style={{ maxWidth: '350px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {cat.description || 'No description available'}
                    </small>
                  </div>
                </div>
              </td>
              <td className="py-4 px-4 border-light text-center">
                <span className="badge rounded-pill bg-light text-dark border fw-bold px-3 py-2 fs-6">
                  {cat.productCount}
                </span>
              </td>
              <td className="py-4 px-4 border-light text-end">
                <div className="d-flex justify-content-end gap-2">
                  <button onClick={() => onAssign(cat)} className="btn btn-sm fw-bold border-0 px-3 d-flex align-items-center rounded-3 transition-all" style={{ backgroundColor: 'rgba(255, 140, 66, 0.1)', color: 'var(--prime-orange)' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="me-1"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
                    Assign
                  </button>
                  <button className="btn btn-sm btn-light rounded-3 p-2 border-0" style={{ color: 'var(--prime-orange)' }} title="Edit" onClick={() => onEdit(cat)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                  </button>
                  <button className="btn btn-sm btn-light rounded-3 p-2 text-danger border-0" title="Delete" onClick={() => onDelete(cat)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CategoryList;