import { useAuth } from '../context/AuthContext.jsx';

export default function Profile() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Profile</h1>
        <p className="text-sm text-slate-500 mt-0.5">Your account information.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-2xl border border-indigo-200">
            {user?.firstName?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-800">
              {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : 'User'}
            </h2>
            <p className="text-sm text-slate-500 capitalize">
              {user?.role?.replace('_', ' ').toLowerCase() || 'Member'}
            </p>
          </div>
        </div>

        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">Email</dt>
            <dd className="text-sm text-slate-800 mt-0.5">{user?.email || '—'}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">Phone</dt>
            <dd className="text-sm text-slate-800 mt-0.5">{user?.phone || '—'}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
