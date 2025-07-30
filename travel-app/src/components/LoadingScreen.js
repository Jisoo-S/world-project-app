import React from 'react';

const LoadingScreen = ({ isLoading, loadingStatus }) => {
  if (!isLoading) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/90 backdrop-blur-sm z-50">
      <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 p-12 rounded-3xl backdrop-blur-lg border border-white/20 text-center max-w-md">
        <div className="relative mb-8">
          <div className="w-20 h-20 border-4 border-blue-400 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          <div className="absolute inset-0 w-20 h-20 border-4 border-purple-400 border-b-purple-600 rounded-full animate-spin mx-auto opacity-50" style={{ animationDirection: 'reverse', animationDelay: '0.5s' }}></div>
        </div>
        <div className="text-blue-300 font-medium text-lg mb-2">{loadingStatus}</div>
      </div>
    </div>
  );
};

export default LoadingScreen;
