export type Role = 'user' | 'admin';

export type Verdict = 'Genuine' | 'Suspicious' | 'Fake';

export type View = 'auth' | 'dashboard' | 'upload' | 'report';

export interface User {
  user_id: string;
  username: string;
  role: Role;
}

export interface ELAAnalysis {
  anomaly_score: number;
  is_tampered: boolean;
}

export interface VerificationDetails {
  ela_analysis: ELAAnalysis;
  extracted_text_count: number;
  extracted_lines: string[];
}

export interface VerificationRecord {
  id: string;
  filename: string;
  verdict: Verdict;
  confidence_score: number;
  created_at: string;
  details?: VerificationDetails;
  user_id?: string;
  username?: string;
}

export interface DashboardStats {
  total: number;
  genuine: number;
  suspicious: number;
  fake: number;
  records: VerificationRecord[];
}

export interface AuthResponse {
  user_id: string;
  username: string;
  role: Role;
}

export interface SignupPayload {
  username: string;
  password: string;
  role: Role;
}

export interface LoginPayload {
  username: string;
  password: string;
}
