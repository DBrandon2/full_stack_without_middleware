import React, { useEffect } from "react";
import { CheckCircle, AlertCircle, X } from "lucide-react";

const NotificationToast = ({ message, type, isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const bgColor = type === "success" ? "bg-emerald-50" : "bg-red-50";
  const textColor = type === "success" ? "text-emerald-800" : "text-red-800";
  const borderColor =
    type === "success" ? "border-emerald-200" : "border-red-200";
  const Icon = type === "success" ? CheckCircle : AlertCircle;

  return (
    <div
      className={`fixed top-4 right-4 z-50 flex items-center p-4 mb-4 w-full max-w-xs ${bgColor} ${textColor} ${borderColor} rounded-lg border shadow-md transition-opacity duration-300 ease-in-out`}
      role="alert"
    >
      <div className="inline-flex flex-shrink-0 justify-center items-center w-8 h-8">
        <Icon size={20} />
      </div>
      <div className="ml-3 text-sm font-medium">{message}</div>
      <button
        type="button"
        className={`ml-auto -mx-1.5 -my-1.5 ${bgColor} ${textColor} rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex h-8 w-8`}
        onClick={onClose}
        aria-label="Close"
      >
        <span className="sr-only">Close</span>
        <X size={18} />
      </button>
    </div>
  );
};

export default NotificationToast;
