import React, { useState } from 'react';
import { useNotifications } from '../context/NotificationContext';
import {
  Bell,
  CheckCircle,
  FileCheck,
  CheckCheck,
  Trash2,
  Inbox,
  AlertCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { NotificationType } from '../types';

export const NotificationCenterPage: React.FC = () => {
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');

  const filteredNotifications =
    activeTab === 'unread' ? notifications.filter((n) => !n.read) : notifications;

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'REPORT_READY':
        return <CheckCircle className="w-5 h-5 text-red-600" />;
      case 'SUBMISSION_RECEIVED':
        return <FileCheck className="w-5 h-5 text-zinc-900" />;
      case 'ANALYSIS_COMPLETE':
        return <Sparkles className="w-5 h-5 text-red-600" />;
      default:
        return <Bell className="w-5 h-5 text-zinc-700" />;
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-black">Notification Center</h1>
              <p className="text-sm text-zinc-600">
                Live alerts for submissions, reports, and AI analysis events
              </p>
            </div>
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-zinc-50 text-zinc-800 text-xs font-semibold border border-zinc-300 transition-colors shadow-sm"
          >
            <CheckCheck className="w-4 h-4 text-red-600" />
            Mark all as read
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 my-6">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
            activeTab === 'all'
              ? 'bg-red-600 text-white shadow-sm'
              : 'bg-white text-zinc-600 hover:text-black border border-zinc-200'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setActiveTab('unread')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
            activeTab === 'unread'
              ? 'bg-red-600 text-white shadow-sm'
              : 'bg-white text-zinc-600 hover:text-black border border-zinc-200'
          }`}
        >
          Unread
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.2 bg-white text-red-700 rounded-full text-[10px] font-bold">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Notifications List */}
      {isLoading && notifications.length === 0 ? (
        <div className="py-16 text-center text-zinc-500 animate-pulse">
          Loading notifications...
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="py-20 text-center space-y-3 rounded-2xl border border-dashed border-zinc-300 bg-white">
          <div className="w-12 h-12 rounded-2xl bg-zinc-100 text-zinc-400 mx-auto flex items-center justify-center">
            <Inbox className="w-6 h-6" />
          </div>
          <p className="text-zinc-800 font-bold text-sm">No notifications found</p>
          <p className="text-zinc-500 text-xs">
            {activeTab === 'unread'
              ? 'You have caught up with all notifications.'
              : 'Updates about your submissions and reports will appear here.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((n) => (
            <div
              key={n.notificationId}
              className={`p-4 rounded-2xl border transition-all flex items-start gap-4 ${
                !n.read
                  ? 'bg-white border-red-200 border-l-4 border-l-red-600 shadow-sm'
                  : 'bg-white border-zinc-200 opacity-75'
              }`}
            >
              <div className="mt-1 p-2 rounded-xl bg-zinc-50 border border-zinc-200 shrink-0">
                {getNotificationIcon(n.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-sm font-bold text-black flex items-center gap-2">
                    {n.title}
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-red-600 shrink-0" />
                    )}
                  </h4>
                  <span className="text-[11px] text-zinc-500 shrink-0 font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDate(n.createdAt)}
                  </span>
                </div>
                <p className="text-xs text-zinc-600 mt-1 leading-relaxed">{n.message}</p>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {!n.read && (
                  <button
                    onClick={() => markAsRead(n.notificationId)}
                    title="Mark as read"
                    className="p-1.5 text-zinc-400 hover:text-black rounded-lg hover:bg-zinc-100 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => deleteNotification(n.notificationId)}
                  title="Delete"
                  className="p-1.5 text-zinc-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
