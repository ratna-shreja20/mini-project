import { useCallback, useRef, useState } from 'react';
import {
  UploadCloud,
  FileText,
  ImageIcon,
  Loader2,
  X,
  Play,
  CheckCircle2,
  ScanLine,
  FileSearch,
  Type,
} from 'lucide-react';
import type { User, VerificationRecord } from '@/types';
import { verifyDocument } from '@/lib/api';

interface Props {
  user: User;
  onResult: (record: VerificationRecord) => void;
}

const ACCEPTED = '.png,.jpg,.jpeg,.pdf';
const MAX_SIZE = 10 * 1024 * 1024;

const STEPS = [
  { label: 'Preprocessing document structure & normalizing resolution...', icon: ScanLine },
  { label: 'Running Error Level Analysis (ELA) for image forgery...', icon: FileSearch },
  { label: 'Performing OCR text extraction & font alignment check...', icon: Type },
];

export default function UploadView({ user, onResult }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [activeStep, setActiveStep] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  const isImage = (f: File) => f.type.startsWith('image/');
  const isPdf = (f: File) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf');

  const handleFile = useCallback((f: File) => {
    setError(null);
    if (!isImage(f) && !isPdf(f)) {
      setError('Only PNG, JPG, JPEG, and PDF files are supported.');
      return;
    }
    if (f.size > MAX_SIZE) {
      setError('File size exceeds 10 MB limit.');
      return;
    }
    setFile(f);
    if (isImage(f)) {
      setPreviewUrl(URL.createObjectURL(f));
    } else {
      setPreviewUrl(null);
    }
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const f = e.dataTransfer.files?.[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );

  const clearFile = () => {
    setFile(null);
    setPreviewUrl(null);
    setError(null);
    setActiveStep(-1);
    if (inputRef.current) inputRef.current.value = '';
  };

  const startVerification = async () => {
    if (!file) return;
    setVerifying(true);
    setError(null);
    setActiveStep(0);

    // Animate through the 3 steps
    const stepInterval = setInterval(() => {
      setActiveStep((prev) => {
        if (prev < STEPS.length - 1) return prev + 1;
        return prev;
      });
    }, 1200);

    try {
      const result = await verifyDocument(file, user.user_id);
      clearInterval(stepInterval);
      setActiveStep(STEPS.length - 1);
      // Small delay so the user sees the final step complete
      setTimeout(() => {
        onResult(result);
      }, 500);
    } catch {
      clearInterval(stepInterval);
      setVerifying(false);
      setActiveStep(-1);
      setError('Verification failed. The backend may be unreachable.');
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Document Upload & Analysis</h1>
        <p className="mt-1 text-sm text-slate-500">
          Upload an academic certificate to run AI-powered forgery detection.
        </p>
      </div>

      {/* Upload zone */}
      {!file && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={`cursor-pointer rounded-2xl border-2 border-dashed p-12 text-center transition-all ${
            dragging
              ? 'border-sky-500 bg-sky-50'
              : 'border-slate-300 bg-white hover:border-sky-400 hover:bg-slate-50'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED}
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
            <UploadCloud className="h-8 w-8 text-slate-500" />
          </div>
          <p className="text-lg font-semibold text-slate-700">
            Drag and drop your document here
          </p>
          <p className="mt-1 text-sm text-slate-400">
            or click to browse — supports PNG, JPG, JPEG, and PDF (max 10 MB)
          </p>
        </div>
      )}

      {error && (
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <X className="h-4 w-4" />
          {error}
        </div>
      )}

      {/* File preview */}
      {file && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt={file.name}
                    className="h-24 w-24 rounded-lg border border-slate-200 object-cover"
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-lg border border-slate-200 bg-rose-50">
                    <FileText className="h-10 w-10 text-rose-500" />
                  </div>
                )}
                <div>
                  <p className="font-semibold text-slate-800">{file.name}</p>
                  <div className="mt-1 flex items-center gap-3 text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      {isImage(file) ? (
                        <ImageIcon className="h-3.5 w-3.5" />
                      ) : (
                        <FileText className="h-3.5 w-3.5" />
                      )}
                      {isImage(file) ? 'Image' : 'PDF Document'}
                    </span>
                    <span>{(file.size / 1024).toFixed(1)} KB</span>
                  </div>
                </div>
              </div>
              {!verifying && (
                <button
                  onClick={clearFile}
                  className="no-print rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>

          {/* Verification steps */}
          {verifying && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-sky-600" />
                <h3 className="text-base font-semibold text-slate-800">
                  Running AI Verification Analysis
                </h3>
              </div>
              <div className="space-y-4">
                {STEPS.map((step, idx) => {
                  const Icon = step.icon;
                  const done = idx < activeStep;
                  const current = idx === activeStep;
                  return (
                    <div
                      key={idx}
                      className={`flex items-center gap-3 rounded-lg border p-4 transition-all ${
                        current
                          ? 'border-sky-300 bg-sky-50'
                          : done
                            ? 'border-emerald-200 bg-emerald-50'
                            : 'border-slate-200 bg-slate-50'
                      }`}
                    >
                      <div
                        className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full ${
                          done
                            ? 'bg-emerald-500 text-white'
                            : current
                              ? 'bg-sky-500 text-white'
                              : 'bg-slate-200 text-slate-400'
                        }`}
                      >
                        {done ? (
                          <CheckCircle2 className="h-5 w-5" />
                        ) : current ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <Icon className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <p
                          className={`text-sm font-medium ${
                            current
                              ? 'text-sky-900'
                              : done
                                ? 'text-emerald-800'
                                : 'text-slate-500'
                          }`}
                        >
                          {idx + 1}. {step.label}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Start button */}
          {!verifying && (
            <button
              onClick={startVerification}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 py-3.5 text-sm font-semibold text-white shadow-md transition-all hover:from-sky-700 hover:to-indigo-700"
            >
              <Play className="h-4 w-4" />
              Start Verification
            </button>
          )}
        </div>
      )}
    </div>
  );
}
