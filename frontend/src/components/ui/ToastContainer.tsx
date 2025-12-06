import { useToast } from '../../context/ToastContext';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { useEffect, useState } from 'react';

function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg min-w-[300px] transition-all animate-in slide-in-from-right duration-300 ${
            toast.type === 'success' ? 'bg-green-600 text-white' :
            toast.type === 'error' ? 'bg-red-600 text-white' :
            'bg-blue-600 text-white'
          }`}
        >
          {toast.type === 'success' && <CheckCircle size={20} />}
          {toast.type === 'error' && <AlertCircle size={20} />}
          {toast.type === 'info' && <Info size={20} />}
          
          <span className="flex-1 text-sm font-medium">{toast.message}</span>
          
          <button 
            onClick={() => removeToast(toast.id)}
            className="hover:bg-white/20 p-1 rounded-full transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}

export default ToastContainer;
