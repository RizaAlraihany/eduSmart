// src/shared/components/ui/SkeletonLoader.jsx

/**
 * SkeletonLoader — Skeleton untuk baris tabel
 *
 * Props:
 *   rows    - jumlah baris skeleton (default: 5)
 *   cols    - jumlah kolom (default: 6)
 */
export const TableSkeletonRow = ({ cols = 6 }) => (
  <tr className="animate-pulse">
    {[...Array(cols)].map((_, i) => (
      <td key={i} className="px-5 py-4">
        <div
          className={`h-3.5 bg-slate-100 rounded-full ${
            i === 0 ? "w-20" : i === 1 ? "w-36" : "w-24"
          }`}
        />
      </td>
    ))}
  </tr>
);

/**
 * CardSkeleton — Skeleton untuk card
 */
export const CardSkeleton = ({ className = "" }) => (
  <div className={`animate-pulse rounded-xl bg-slate-100 ${className}`} />
);

/**
 * TextSkeleton — Skeleton satu baris teks
 */
export const TextSkeleton = ({ width = "w-32", height = "h-3.5" }) => (
  <div className={`animate-pulse ${height} ${width} bg-slate-100 rounded-full`} />
);

const SkeletonLoader = { TableSkeletonRow, CardSkeleton, TextSkeleton };
export default SkeletonLoader;
