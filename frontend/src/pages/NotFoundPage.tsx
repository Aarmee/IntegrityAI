import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4 bg-white">
      <div className="max-w-md w-full text-center space-y-6 p-8 rounded-3xl bg-white border border-zinc-200 shadow-xl">
        <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-200 text-red-600 mx-auto flex items-center justify-center">
          <FileQuestion className="w-8 h-8" />
        </div>

        <div>
          <span className="text-4xl font-black text-red-600 font-mono">404</span>
          <h1 className="text-2xl font-extrabold text-black mt-2">Page Not Found</h1>
          <p className="text-sm text-zinc-600 mt-2">
            The page you are looking for doesn't exist or has been moved.
          </p>
        </div>

        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition-colors shadow-sm"
        >
          <Home className="w-4 h-4" />
          Return Home
        </Link>
      </div>
    </div>
  );
};
