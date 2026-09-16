import { ShieldCheck, LayoutDashboard, Upload, LogOut, ScanLine } from 'lucide-react';
import type { User, View } from '@/types';
import RoleBadge from './RoleBadge';

interface Props {
  user: User;
  view: View;
  onNavigate: (v: View) => void;
  onLogout: () => void;
}

export default function Navbar({ user, view, onNavigate, onLogout }: Props) {
  const navItems: { id: View; label: string; icon: typeof LayoutDashboard }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'upload', label: 'New Verification', icon: Upload },
  ];

  return (
    <nav className="no-print sticky top-0 z-50 bg-slate-900 text-white shadow-lg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <button
              onClick={() => onNavigate('dashboard')}
              className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-indigo-600 shadow-md">
                <ShieldCheck className="h-5 w-5 text-white" />
              </div>
              <div className="text-left">
                <span className="block text-sm font-bold leading-tight tracking-tight">
                  CertGuard AI
                </span>
                <span className="block text-[10px] leading-tight text-slate-400">
                  Forgery Detection System
                </span>
              </div>
            </button>

            <div className="hidden items-center gap-1 sm:flex">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = view === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      active
                        ? 'bg-slate-800 text-white'
                        : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2.5 sm:flex">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-700 text-sm font-semibold">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{user.username}</span>
                  <RoleBadge role={user.role} />
                </div>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-rose-600 hover:text-white"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1 pb-3 sm:hidden">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = view === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
