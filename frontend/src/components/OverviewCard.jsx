import React from 'react';

const OverviewCard = ({ title, value, icon, change, changeType }) => {
  return (
    <div className="bg-white rounded-xl border border-blue-100 shadow-lg p-6 transition-all hover:shadow-xl hover:-translate-y-1">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-blue-600 text-sm font-medium tracking-wider uppercase">{title}</h3>
          <p className="text-2xl font-bold mt-1 text-gray-800">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br ${
          changeType === 'positive' 
            ? 'from-green-400 to-green-600 text-white' 
            : changeType === 'negative' 
              ? 'from-red-400 to-red-600 text-white' 
              : 'from-blue-400 to-blue-600 text-white'
        }`}>
          {icon}
        </div>
      </div>
      
      {change && (
        <div className="mt-2">
          <div className={`inline-flex items-center text-sm ${
            changeType === 'positive' 
              ? 'text-green-600' 
              : changeType === 'negative' 
                ? 'text-red-600' 
                : 'text-blue-600'
          }`}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              {changeType === 'positive' ? (
                <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586l3.293-3.293A1 1 0 0112 7z" clipRule="evenodd" />
              ) : (
                <path fillRule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1v-5a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586l-4.293-4.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414l3.293 3.293A1 1 0 0012 13z" clipRule="evenodd" />
              )}
            </svg>
            <span>{change}</span>
          </div>
        </div>
      )}

      {/* Add futuristic glow effect */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-50 to-white rounded-xl opacity-50 blur-sm"></div>
    </div>
  );
};

export default OverviewCard;
