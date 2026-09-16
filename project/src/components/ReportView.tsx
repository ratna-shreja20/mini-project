import {
  ArrowLeft,
  Printer,
  FileText,
  ShieldCheck,
  AlertTriangle,
  ShieldAlert,
  ScanLine,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import type { VerificationRecord, Verdict } from '@/types';
import { verdictBgGradient } from '@/lib/utils';
import VerdictBadge from './VerdictBadge';

interface Props {
  record: VerificationRecord;
  onBack: () => void;
}

export default function ReportView({ record, onBack }: Props) {
  const v: Verdict = record.verdict;
  const details = record.details;

  const verdictIcon =
    v === 'Genuine' ? ShieldCheck : v === 'Suspicious' ? AlertTriangle : ShieldAlert;

  const Icon = verdictIcon;

  const elaScore = details?.ela_analysis?.anomaly_score ?? 0;
  const isTampered = details?.ela_analysis?.is_tampered ?? false;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Top action bar */}
      <div className="no-print mb-6 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Return to Dashboard
        </button>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-800"
        >
          <Printer className="h-4 w-4" />
          Download / Print Report
        </button>
      </div>

      {/* Report content */}
      <div className="print-area space-y-6">
        {/* Banner summary */}
        <div className={`overflow-hidden rounded-2xl bg-gradient-to-br ${verdictBgGradient(v)} shadow-lg`}>
          <div className="p-8 text-white">
            <div className="flex items-center gap-2 text-sm font-medium uppercase tracking-wide text-white/80">
              <FileText className="h-4 w-4" />
              Verification Report
            </div>
            <div className="mt-4 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                  <Icon className="h-9 w-9 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">{v}</h1>
                  <p className="mt-1 text-sm text-white/80">{record.filename}</p>
                </div>
              </div>
              <div className="flex gap-8">
                <div>
                  <p className="text-xs uppercase tracking-wide text-white/70">
                    Confidence
                  </p>
                  <p className="text-3xl font-bold">
                    {record.confidence_score.toFixed(1)}%
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-white/70">
                    ELA Anomaly
                  </p>
                  <p className="text-3xl font-bold">{elaScore.toFixed(1)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
              <ScanLine className="h-4 w-4" />
              ELA Forensic Analysis
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-2xl font-bold text-slate-900">
                {elaScore.toFixed(1)}
              </span>
              <span
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                  isTampered
                    ? 'bg-rose-50 text-rose-700'
                    : 'bg-emerald-50 text-emerald-700'
                }`}
              >
                {isTampered ? (
                  <XCircle className="h-3.5 w-3.5" />
                ) : (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                )}
                {isTampered ? 'Tampered' : 'Clean'}
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
              <FileText className="h-4 w-4" />
              Verdict Status
            </div>
            <div className="mt-3">
              <VerdictBadge verdict={v} size="md" />
            </div>
          </div>
        </div>

        {/* Report metadata */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
          <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Record ID
              </p>
              <p className="mt-1 truncate font-mono text-slate-600">{record.id}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Filename
              </p>
              <p className="mt-1 truncate text-slate-600">{record.filename}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Confidence
              </p>
              <p className="mt-1 text-slate-600">
                {record.confidence_score.toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Timestamp
              </p>
              <p className="mt-1 text-slate-600">{record.created_at}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}