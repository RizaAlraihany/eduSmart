// src/shared/components/ui/PageHeader.jsx

/**
 * PageHeader — Header standar semua halaman dashboard
 *
 * Props:
 *   icon        - Lucide icon component
 *   title       - Judul halaman
 *   subtitle    - Deskripsi singkat (opsional)
 *   children    - Slot untuk badge / count / info tambahan (opsional)
 */
const PageHeader = ({ icon: Icon, title, subtitle, children }) => {
  return (
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <Icon className="w-5 h-5 text-indigo-600" />
          </div>
        )}
        <div>
          <h1 className="text-xl font-bold text-slate-900 leading-tight">{title}</h1>
          {subtitle && (
            <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
};

export default PageHeader;
