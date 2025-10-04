import React from 'react';

const ConfirmModal = ({ 
  show, 
  onClose, 
  onConfirm, 
  title = "확인", 
  message = "계속하시겠습니까?",
  confirmText = "확인",
  cancelText = "취소",
  isDestructive = false,
  isLoading = false
}) => {
  if (!show) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-slate-900/95 backdrop-blur-lg rounded-2xl p-6 w-full max-w-md shadow-2xl border border-white/20">
        <div className="flex justify-between items-center mb-4">
          <h3 className={`font-bold text-lg ${isDestructive ? 'text-red-400' : 'text-white'}`}>
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-2xl"
          >
            ×
          </button>
        </div>

        <div className="mb-6">
          <p className="text-white text-center" style={{whiteSpace: 'pre-line'}}>{message}</p>
        </div>

        <div className="flex gap-3">
          {cancelText && (
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-medium py-3 px-4 rounded-lg transition-all disabled:opacity-50"
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`${cancelText ? 'flex-1' : 'w-full'} font-medium py-3 px-4 rounded-lg transition-all disabled:opacity-50 ${
              isDestructive 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isLoading ? '처리 중...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
