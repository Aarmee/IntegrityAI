import React, { useEffect, useState } from 'react';
import { authApi } from '../../api/authApi';
import { User, UserRole } from '../../types';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import {
  Users,
  Search,
  Filter,
  Shield,
  GraduationCap,
  Briefcase,
  Mail,
  Calendar,
  RefreshCw,
  Hash,
} from 'lucide-react';

export const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await authApi.getAllUsers();
      setUsers(data);
    } catch (err) {
      console.error('Failed to fetch users from auth-service:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.userId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
            <Shield className="w-3 h-3 text-red-600" />
            ADMIN
          </span>
        );
      case 'FACULTY':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-800 border border-zinc-300">
            <Briefcase className="w-3 h-3 text-zinc-700" />
            FACULTY
          </span>
        );
      case 'STUDENT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-50 text-zinc-700 border border-zinc-200">
            <GraduationCap className="w-3 h-3 text-zinc-600" />
            STUDENT
          </span>
        );
      default:
        return <span>{role}</span>;
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-black">User Management Directory</h1>
              <p className="text-sm text-zinc-600">
                System-wide accounts managed by PostgreSQL Auth Service
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={fetchUsers}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-zinc-50 text-zinc-700 text-xs font-semibold border border-zinc-300 transition-colors shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5 text-zinc-500" />
          Refresh Directory
        </button>
      </div>

      {/* Stats Summary row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-sm">
          <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Total Accounts</span>
          <p className="text-3xl font-extrabold text-black mt-1">{users.length}</p>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-sm">
          <span className="text-xs text-zinc-600 uppercase tracking-wider font-semibold">Students</span>
          <p className="text-3xl font-extrabold text-zinc-900 mt-1">
            {users.filter((u) => u.role === 'STUDENT').length}
          </p>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-sm">
          <span className="text-xs text-zinc-600 uppercase tracking-wider font-semibold">Faculty</span>
          <p className="text-3xl font-extrabold text-zinc-900 mt-1">
            {users.filter((u) => u.role === 'FACULTY').length}
          </p>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-red-200 shadow-sm">
          <span className="text-xs text-red-700 uppercase tracking-wider font-semibold">Admins</span>
          <p className="text-3xl font-extrabold text-red-600 mt-1">
            {users.filter((u) => u.role === 'ADMIN').length}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, email, or user UUID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-zinc-300 rounded-xl text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-100 transition-all shadow-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-zinc-400" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-white border border-zinc-300 rounded-xl px-3 py-2 text-sm text-zinc-700 focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-100 shadow-sm"
          >
            <option value="ALL">All Roles</option>
            <option value="STUDENT">Student Only</option>
            <option value="FACULTY">Faculty Only</option>
            <option value="ADMIN">Admin Only</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSpinner fullPage text="Retrieving registered users..." />
      ) : filteredUsers.length === 0 ? (
        <div className="py-20 text-center space-y-3 rounded-2xl border border-dashed border-zinc-300 bg-white">
          <Users className="w-8 h-8 text-zinc-400 mx-auto" />
          <p className="text-zinc-600 text-sm">No users matched your criteria</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-700">
              <thead className="bg-zinc-50 border-b border-zinc-200 text-xs uppercase font-semibold text-zinc-600 tracking-wider">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Email Address</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">User UUID</th>
                  <th className="px-6 py-4">Registered At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredUsers.map((u) => (
                  <tr key={u.userId} className="hover:bg-zinc-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-black">{u.name}</div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="text-zinc-700 flex items-center gap-1.5 font-mono text-xs">
                        <Mail className="w-3.5 h-3.5 text-zinc-400" />
                        {u.email}
                      </span>
                    </td>

                    <td className="px-6 py-4">{getRoleBadge(u.role)}</td>

                    <td className="px-6 py-4 font-mono text-xs text-zinc-500">
                      <span title={u.userId}>
                        {u.userId ? `${u.userId.substring(0, 16)}...` : 'N/A'}
                      </span>
                    </td>

                    <td className="px-6 py-4 font-mono text-xs text-zinc-500">
                      {formatDate(u.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
