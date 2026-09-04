export interface ToastData {
  message: string;
  type?: 'success' | 'error' | 'info';
}

interface ToastProps {
  toast: ToastData | null;
}

export default function Toast({ toast }: ToastProps) {
  if (!toast) return null;

  return (
    <div
      className={`fixed top-6 right-6 z-[9999] flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border animate-slideIn ${
        toast.type === 'success'
          ? 'bg-emerald-50 border-emerald-100 text-emerald-800'
          : toast.type === 'error'
          ? 'bg-rose-50 border-rose-100 text-rose-800'
          : 'bg-blue-50 border-blue-100 text-blue-800'
      }`}
    >
      {toast.type === 'success' && (
        <svg
          className="w-5 h-5 text-emerald-600 shrink-0"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      )}
      {toast.type === 'error' && (
        <svg
          className="w-5 h-5 text-rose-600 shrink-0"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      )}
      {toast.type === 'info' && (
        <svg
          className="w-5 h-5 text-blue-600 shrink-0"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      )}
      <span className="text-xs font-bold font-sans">{toast.message}</span>
    </div>
  );
}
