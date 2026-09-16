import type {
  AuthResponse,
  DashboardStats,
  LoginPayload,
  SignupPayload,
  VerificationRecord,
  Verdict,
} from '@/types';

const now = new Date();
const ts = (offsetMin: number): string => {
  const d = new Date(now.getTime() - offsetMin * 60000);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

export const mockRecords: VerificationRecord[] = [
  {
    id: '65f1a2b3c4d5e6f7a8b9c0d1',
    filename: 'degree_certificate.pdf',
    verdict: 'Genuine',
    confidence_score: 94.2,
    created_at: ts(30),
    user_id: 'u1',
    username: 'alice',
    details: {
      ela_analysis: { anomaly_score: 12.4, is_tampered: false },
      extracted_text_count: 340,
      extracted_lines: [
        'BACHELOR OF TECHNOLOGY',
        'DEPARTMENT OF COMPUTER SCIENCE & ENGINEERING',
        'PASSED WITH FIRST CLASS DISTINCTION',
      ],
    },
  },
  {
    id: '65f1a2b3c4d5e6f7a8b9c0d2',
    filename: 'diploma_scan.png',
    verdict: 'Suspicious',
    confidence_score: 61.5,
    created_at: ts(120),
    user_id: 'u1',
    username: 'alice',
    details: {
      ela_analysis: { anomaly_score: 48.7, is_tampered: true },
      extracted_text_count: 180,
      extracted_lines: [
        'DIPLOMA IN COMPUTER APPLICATIONS',
        'AUTHORIZATION SIGNATURE',
        'DATE OF ISSUE: 2021',
      ],
    },
  },
  {
    id: '65f1a2b3c4d5e6f7a8b9c0d3',
    filename: 'transcript_forged.jpg',
    verdict: 'Fake',
    confidence_score: 88.9,
    created_at: ts(240),
    user_id: 'u2',
    username: 'bob',
    details: {
      ela_analysis: { anomaly_score: 92.3, is_tampered: true },
      extracted_text_count: 95,
      extracted_lines: [
        'ACADEMIC TRANSCRIPT',
        'SEMESTER 1 - GPA 3.9',
        'SEMESTER 2 - GPA 4.0',
      ],
    },
  },
  {
    id: '65f1a2b3c4d5e6f7a8b9c0d4',
    filename: 'masters_degree.pdf',
    verdict: 'Genuine',
    confidence_score: 97.8,
    created_at: ts(360),
    user_id: 'u2',
    username: 'bob',
    details: {
      ela_analysis: { anomaly_score: 5.1, is_tampered: false },
      extracted_text_count: 420,
      extracted_lines: [
        'MASTER OF SCIENCE',
        'DEPARTMENT OF DATA SCIENCE',
        'CONFERRED WITH HONORS',
      ],
    },
  },
  {
    id: '65f1a2b3c4d5e6f7a8b9c0d5',
    filename: 'certified_copy.jpg',
    verdict: 'Suspicious',
    confidence_score: 55.3,
    created_at: ts(480),
    user_id: 'u1',
    username: 'alice',
    details: {
      ela_analysis: { anomaly_score: 52.0, is_tampered: true },
      extracted_text_count: 210,
      extracted_lines: [
        'CERTIFICATE OF COMPLETION',
        'ONLINE COURSE - MACHINE LEARNING',
        'ISSUED BY COURSERA',
      ],
    },
  },
  {
    id: '65f1a2b3c4d5e6f7a8b9c0d6',
    filename: 'fake_diploma.png',
    verdict: 'Fake',
    confidence_score: 91.4,
    created_at: ts(600),
    user_id: 'u3',
    username: 'carol',
    details: {
      ela_analysis: { anomaly_score: 95.8, is_tampered: true },
      extracted_text_count: 60,
      extracted_lines: [
        'BACHELOR OF ARTS',
        'DEPARTMENT OF HUMANITIES',
        'GRADUATION YEAR: 2020',
      ],
    },
  },
  {
    id: '65f1a2b3c4d5e6f7a8b9c0d7',
    filename: 'engineering_degree.pdf',
    verdict: 'Genuine',
    confidence_score: 89.1,
    created_at: ts(720),
    user_id: 'u3',
    username: 'carol',
    details: {
      ela_analysis: { anomaly_score: 18.3, is_tampered: false },
      extracted_text_count: 380,
      extracted_lines: [
        'BACHELOR OF ENGINEERING',
        'MECHANICAL ENGINEERING',
        'FIRST CLASS WITH DISTINCTION',
      ],
    },
  },
];

export function getMockDashboardStats(userId: string, role: string): DashboardStats {
  const records =
    role === 'admin'
      ? mockRecords
      : mockRecords.filter((r) => r.user_id === userId);

  return {
    total: records.length,
    genuine: records.filter((r) => r.verdict === 'Genuine').length,
    suspicious: records.filter((r) => r.verdict === 'Suspicious').length,
    fake: records.filter((r) => r.verdict === 'Fake').length,
    records,
  };
}

export function mockLogin(payload: LoginPayload): AuthResponse {
  const role: 'user' | 'admin' = payload.username.toLowerCase() === 'admin' ? 'admin' : 'user';
  return {
    user_id: role === 'admin' ? 'admin1' : 'u1',
    username: payload.username,
    role,
  };
}

export function mockSignup(payload: SignupPayload): AuthResponse {
  return {
    user_id: `u_${Date.now()}`,
    username: payload.username,
    role: payload.role,
  };
}

export function mockVerify(filename: string, userId: string): VerificationRecord {
  const verdicts: Verdict[] = ['Genuine', 'Suspicious', 'Fake'];
  const verdict = verdicts[Math.floor(Math.random() * verdicts.length)];
  const confidence =
    verdict === 'Genuine'
      ? 85 + Math.random() * 14
      : verdict === 'Suspicious'
        ? 50 + Math.random() * 20
        : 80 + Math.random() * 18;

  const anomaly =
    verdict === 'Genuine'
      ? 5 + Math.random() * 20
      : verdict === 'Suspicious'
        ? 40 + Math.random() * 20
        : 80 + Math.random() * 18;

  const lines = [
    'CERTIFICATE OF ACADEMIC ACHIEVEMENT',
    'DEPARTMENT OF COMPUTER SCIENCE',
    'AWARDED WITH DISTINCTION',
    'DATE OF ISSUE: 2026',
  ];

  return {
    id: `mock_${Date.now()}`,
    filename,
    verdict,
    confidence_score: Math.round(confidence * 10) / 10,
    created_at: ts(0),
    user_id: userId,
    details: {
      ela_analysis: {
        anomaly_score: Math.round(anomaly * 10) / 10,
        is_tampered: verdict !== 'Genuine',
      },
      extracted_text_count: lines.length * 85,
      extracted_lines: lines,
    },
  };
}
