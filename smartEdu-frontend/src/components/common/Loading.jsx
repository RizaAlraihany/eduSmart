import React from "react";
import { Loader2 } from "lucide-react";

const Loading = ({ fullScreen = false, text = "Memuat..." }) => {
  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">{text}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-8">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-2" />
        <p className="text-sm text-gray-600">{text}</p>
      </div>
    </div>
  );
};

export default Loading;
