import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const UnauthorizedPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4 bg-white">
      <div className="max-w-md w-full text-center space-y-6 p-8 rounded-3xl bg-white border border-zinc-200 shadow-xl">
        <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-200 text-red-600 mx-auto flex items-center justify-center">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div>
          <h1 className="text-2xl font-extrabold text-black">Access Denied</h1>
          <p className="text-sm text-zinc-600 mt-2 leading-relaxed">
            Your account ({user?.email}) with role <strong className="text-red-700 font-bold">{user?.role}</strong> does not have permission to access this resource.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link
            to="/dashboard"
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition-colors shadow-sm"
          >
            <Home className="w-4 h-4" />
            Go to My Dashboard
          </Link>
          <button
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-zinc-50 text-zinc-800 font-semibold text-sm transition-colors border border-zinc-300 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};
