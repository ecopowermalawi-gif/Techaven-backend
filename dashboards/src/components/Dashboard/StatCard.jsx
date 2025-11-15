import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, change, trend }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value.toLocaleString()}</p>
        </div>
        <div className="p-3 bg-blue-50 rounded-lg">
          <Icon className="w-6 h-6 text-blue-600" />
        </div>
      </div>
      <div className="flex items-center mt-4">
        {trend === 'up' ? (
          <TrendingUp className="w-4 h-4 text-green-500" />
        ) : (
          <TrendingDown className="w-4 h-4 text-red-500" />
        )}
        <span className={`text-sm font-medium ml-1 ${
          trend === 'up' ? 'text-green-600' : 'text-red-600'
        }`}>
          {change}%
        </span>
        <span className="text-sm text-gray-500 ml-2">from last month</span>
      </div>
    </div>
  );
};

export default StatCard;