import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminAPI } from '../../services/api';
import { Activity } from 'lucide-react';

const RecentActivities = () => {
  // Use adminAPI.getMetrics for dashboard activity/metrics
  const { data, isLoading } = useQuery(['recent-activities'], adminAPI.getMetrics);

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          </div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  const activities = data?.data?.recentActivities || [];

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center mb-6">
        <Activity className="w-5 h-5 text-gray-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
      </div>
      
      <div className="space-y-4">
        {activities.length > 0 ? (
          activities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                <p className="text-sm text-gray-500">{activity.user}</p>
                <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500 py-4">
            No recent activities
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentActivities;
