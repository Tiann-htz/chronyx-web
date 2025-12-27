import { CheckCircle, XCircle, X } from 'lucide-react';

export default function EmployeeAlert({ isOpen, onClose, type, message }) {
  if (!isOpen) return null;

  const styles = {
    success: {
      bg: 'from-green-50 to-emerald-50',
      border: 'border-green-300',
      icon: 'text-green-600',
      title: 'text-green-900',
      IconComponent: CheckCircle
    },
    error: {
      bg: 'from-red-50 to-rose-50',
      border: 'border-red-300',
      icon: 'text-red-600',
      title: 'text-red-900',
      IconComponent: XCircle
    }
  };

  const style = styles[type] || styles.success;
  const Icon = style.IconComponent;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-all duration-300"
        onClick={onClose}
      ></div>

      {/* Alert Card */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all duration-300 animate-slideIn">
        {/* Header with gradient */}
        <div className={`bg-gradient-to-r ${style.bg} border-b-2 ${style.border} px-6 py-5`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg ${style.icon}`}>
                <Icon className="w-7 h-7" />
              </div>
              <h3 className={`text-xl font-bold ${style.title}`}>
                {type === 'success' ? 'Success!' : 'Error'}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/50 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-gray-700 text-base leading-relaxed">
            {message}
          </p>
        </div>

        {/* Footer */}
        <div className="border-t-2 border-gray-100 px-6 py-4 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className={`px-6 py-2.5 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg ${
              type === 'success'
                ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white'
                : 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white'
            }`}
          >
            OK
          </button>
        </div>
      </div>

      {/* Animation Styles */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .animate-slideIn {
          animation: slideIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}