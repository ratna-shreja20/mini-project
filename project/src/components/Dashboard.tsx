import { useEffect, useState } from 'react';
import {
  FileCheck2,
  ShieldCheck,
  AlertTriangle,
  ShieldAlert,
  Loader2,
  Upload,
  FileText,
  History,
} from 'lucide-react';
import type { DashboardStats, User, VerificationRecord } from '@/types';
import { fetchDashboardStats } from '@/lib/api';
import VerdictBadge from './VerdictBadge';
import RoleBadge from './RoleBadge';

interface Props {
  user: User;
  onViewReport: (record: VerificationRecord) => void;
  onNavigateUpload: () => void;
  refreshKey: number;
}

export default function Dashboard({ user, onViewReport, onNavigateUpload, refreshKey }: Props) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchDashboardStats(user.user_id, user.role)
      .then((data) => {
        if (!cancelled) setStats(data);
      })
      .catch(() => {
        if (!cancelled) setError('Failed to load dashboard data.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user.user_id, user.role, refreshKey]);

  const cards = [
    {
      label: 'Total Verifications',
      value: stats?.total ?? 0,
      icon: FileCheck2,
      bg: 'bg-slate-700',
      ring: 'ring-slate-200',
      text: 'text-white',
    },
    {
      label: 'Genuine',
      value: stats?.genuine ?? 0,
      icon: ShieldCheck,
      bg: 'bg-emerald-50',
      ring: 'ring-emerald-200',
      text: 'text-emerald-700',
    },
    {
      label: 'Suspicious',
      value: stats?.suspicious ?? 0,
      icon: AlertTriangle,
      bg: 'bg-amber-50',
      ring: 'ring-amber-200',
      text: 'text-amber-700',
    },
    {
      label: 'Fake / High Risk',
      value: stats?.fake ?? 0,
      icon: ShieldAlert,
      bg: 'bg-rose-50',
      ring: 'ring-rose-200',
      text: 'text-rose-700',
    },
  ];

  const headerTitle =
    user.role === 'admin'
      ? 'System-Wide Audit Logs & Verification History'
      : 'My Verification History';

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Page header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Analytics Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">
            Overview of certificate verification activity and detection results.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <RoleBadge role={user.role} />
          <button
            onClick={onNavigateUpload}
            className="no-print flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-800"
          >
            <Upload className="h-4 w-4" />
            New Verification
          </button>
        </div>
      </div>

      {/* Metric cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className={`rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">{card.label}</p>
                  <p className="mt-2 text-3xl font-bold text-slate-900">
                    {loading ? '--' : card.value}
                  </p>
                </div>
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.bg} ring-1 ${card.ring}`}
                >
                  <Icon className={`h-6 w-6 ${card.text}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* History table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-200 px-5 py-4">
          <History className="h-5 w-5 text-slate-600" />
          <h2 className="text-base font-semibold text-slate-800">{headerTitle}</h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-slate-400">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">Loading verification records...</span>
          </div>
        ) : error ? (
          <div className="py-16 text-center text-sm text-rose-500">{error}</div>
        ) : !stats || stats.records.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-slate-400">
            <FileText className="h-10 w-10" />
            <p className="text-sm">No verification records found.</p>
            <button
              onClick={onNavigateUpload}
              className="no-print rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Run your first verification
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3">#</th>
                  <th className="px-5 py-3">Filename</th>
                  {user.role === 'admin' && <th className="px-5 py-3">User</th>}
                  <th className="px-5 py-3">Verdict</th>
                  <th className="px-5 py-3">Confidence</th>
                  <th className="px-5 py-3">Timestamp</th>
                  <th className="no-print px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats.records.map((record, idx) => (
                  <tr
                    key={record.id}
                    className="group transition-colors hover:bg-slate-50"
                  >
                    <td className="px-5 py-3.5 text-slate-400">{idx + 1}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-slate-400" />
                        <span className="font-medium text-slate-700">
                          {record.filename}
                        </span>
                      </div>
                    </td>
                    {user.role === 'admin' && (
                      <td className="px-5 py-3.5 text-slate-600">
                        {record.username ?? record.user_id ?? '--'}
                      </td>
                    )}
                    <td className="px-5 py-3.5">
                      <VerdictBadge verdict={record.verdict} />
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-semibold text-slate-700">
                        {record.confidence_score.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">{record.created_at}</td>
                    <td className="no-print px-5 py-3.5 text-right">
                      <button
                        onClick={() => onViewReport(record)}
                        className="rounded-lg px-3 py-1.5 text-xs font-semibold text-sky-600 opacity-0 transition-opacity hover:bg-sky-50 group-hover:opacity-100"
                      >
                        View Report
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
