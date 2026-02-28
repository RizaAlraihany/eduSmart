// import React, { useEffect } from "react";
// import { X } from "lucide-react";
// import Button from "./Button";

// const Modal = ({
//   isOpen,
//   onClose,
//   title,
//   children,
//   footer,
//   size = "md",
//   showCloseButton = true,
// }) => {
//   useEffect(() => {
//     if (isOpen) {
//       document.body.style.overflow = "hidden";
//     } else {
//       document.body.style.overflow = "unset";
//     }

//     return () => {
//       document.body.style.overflow = "unset";
//     };
//   }, [isOpen]);

//   if (!isOpen) return null;

//   const sizes = {
//     sm: "max-w-md",
//     md: "max-w-2xl",
//     lg: "max-w-4xl",
//     xl: "max-w-6xl",
//     full: "max-w-full mx-4",
//   };

//   return (
//     <div className="fixed inset-0 z-50 overflow-y-auto">
//       {/* Backdrop */}
//       <div
//         className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
//         onClick={onClose}
//       />

//       {/* Modal */}
//       <div className="flex min-h-full items-center justify-center p-4">
//         <div
//           className={`
//           relative bg-white rounded-3xl shadow-2xl w-full ${sizes[size]}
//           transform transition-all
//         `}
//         >
//           {/* Header */}
//           {(title || showCloseButton) && (
//             <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
//               {title && (
//                 <h2 className="text-xl font-black text-gray-900">{title}</h2>
//               )}
//               {showCloseButton && (
//                 <button
//                   onClick={onClose}
//                   className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
//                 >
//                   <X className="w-5 h-5" />
//                 </button>
//               )}
//             </div>
//           )}

//           {/* Content */}
//           <div className="px-6 py-6">{children}</div>

//           {/* Footer */}
//           {footer && (
//             <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
//               {footer}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Modal;
