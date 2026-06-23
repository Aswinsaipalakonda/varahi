export interface User {
  id: string;
  mobile_number: string;
  full_name?: string;
  email?: string;
  role: 'customer' | 'supervisor' | 'owner';
  kyc_status: 'pending' | 'under_review' | 'approved' | 'rejected';
  wallet_balance: number;
  referral_code?: string;
  biometric_enabled: boolean;
}

export interface InvestmentPlan {
  id: string;
  name: string;
  description?: string;
  min_amount: number;
  max_amount: number;
  return_rate_percent: number;
  tenure_months: number;
  payout_frequency: 'monthly' | 'quarterly' | 'on_maturity';
  premature_penalty_percent: number;
  terms_text?: string;
  is_active: boolean;
}

export interface Investment {
  id: string;
  customer_id: string;
  plan_id: string;
  amount: number;
  start_date?: string;
  maturity_date?: string;
  status: 'pending' | 'active' | 'rejected' | 'matured' | 'withdrawn';
  upi_txn_ref: string;
  screenshot?: string;
  approved_by_id?: string;
  approved_at?: string;
  rejection_reason?: string;
  created_at: string;
  plan_details?: Partial<InvestmentPlan>;
  customer_name?: string;
  customer_mobile?: string;
}

export interface Payout {
  id: string;
  investment_id: string;
  due_date: string;
  amount: number;
  status: 'pending' | 'paid' | 'overdue' | 'skipped';
  paid_at?: string;
  processed_by_id?: string;
  remarks?: string;
  created_at: string;
  customer_name?: string;
  customer_mobile?: string;
  plan_name?: string;
}

export interface KycDocument {
  id: string;
  user_id: string;
  aadhaar_front_url?: string;
  aadhaar_back_url?: string;
  pan_url?: string;
  selfie_url?: string;
  bank_account_number: string;
  ifsc_code: string;
  bank_name: string;
  submitted_at: string;
  reviewed_at?: string;
  review_remarks?: string;
}

export interface ReferralBonus {
  id: string;
  referrer_id: string;
  referred_user_id: string;
  investment_id: string;
  bonus_amount: number;
  status: 'pending' | 'credited';
  credited_at?: string;
  created_at: string;
  referred_user_name?: string;
  referred_user_mobile?: string;
}
