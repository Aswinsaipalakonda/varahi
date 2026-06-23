import { NextRequest, NextResponse } from 'next/server';

const DJANGO_API_URL = 'http://localhost:8000/api/v1';

// In-memory mock DB for demo persistence
let mockCustomers = [
  { id: 'c1', full_name: 'Pavan Kumar', mobile_number: '+919999999999', email: 'pavan@gmail.com', wallet_balance: '150000.00', kyc_status: 'approved', joined_at: '2026-06-01' },
  { id: 'c2', full_name: 'Swetha Reddy', mobile_number: '+919876543210', email: 'swetha@gmail.com', wallet_balance: '45000.00', kyc_status: 'under_review', joined_at: '2026-06-15' },
  { id: 'c3', full_name: 'Rajesh Nair', mobile_number: '+919447012345', email: 'rajesh@gmail.com', wallet_balance: '0.00', kyc_status: 'pending', joined_at: '2026-06-20' },
  { id: 'c4', full_name: 'Ananya Rao', mobile_number: '+919123456789', email: 'ananya@gmail.com', wallet_balance: '200000.00', kyc_status: 'approved', joined_at: '2026-05-10' }
];

let mockPlans = [
  { id: 'p1', name: 'Varahi Alpha Shield', description: 'High yield capital protection fund with quarterly distributions.', min_amount: '50000.00', max_amount: '500000.00', return_rate_percent: '14.50', tenure_months: 12, payout_frequency: 'quarterly', premature_penalty_percent: '2.50', is_active: true },
  { id: 'p2', name: 'Varahi Short-Term Growth', description: 'Quick liquidity investment plan with monthly payouts.', min_amount: '25000.00', max_amount: '200000.00', return_rate_percent: '12.00', tenure_months: 6, payout_frequency: 'monthly', premature_penalty_percent: '3.00', is_active: true },
  { id: 'p3', name: 'Varahi Maturity Booster', description: 'Maximum return plan compounding payouts at tenure end.', min_amount: '100000.00', max_amount: '1000000.00', return_rate_percent: '16.00', tenure_months: 24, payout_frequency: 'on_maturity', premature_penalty_percent: '4.00', is_active: true }
];

let mockInvestments = [
  { id: 'inv1', customer_name: 'Swetha Reddy', customer_mobile: '+919876543210', amount: '120000.00', status: 'pending', upi_txn_ref: 'TXN-A72H92', screenshot: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?q=80&w=600', plan_details: { name: 'Varahi Alpha Shield', return_rate_percent: '14.50', tenure_months: 12 } },
  { id: 'inv2', customer_name: 'Rajesh Nair', customer_mobile: '+919447012345', amount: '50000.00', status: 'pending', upi_txn_ref: 'TXN-M18V99', screenshot: 'https://images.unsplash.com/photo-1616077168079-7e09a677fb2c?q=80&w=600', plan_details: { name: 'Varahi Short-Term Growth', return_rate_percent: '12.00', tenure_months: 6 } },
  { id: 'inv3', customer_name: 'Pavan Kumar', customer_mobile: '+919999999999', amount: '150000.00', status: 'active', upi_txn_ref: 'TXN-K81W12', screenshot: null, plan_details: { name: 'Varahi Maturity Booster', return_rate_percent: '16.00', tenure_months: 24 } }
];

let mockPayouts = [
  { id: 'pay1', customer_name: 'Pavan Kumar', customer_mobile: '+919999999999', plan_name: 'Varahi Alpha Shield', amount: '5437.50', due_date: '2026-06-25', status: 'pending', remarks: 'Quarterly yield payout' },
  { id: 'pay2', customer_name: 'Ananya Rao', customer_mobile: '+919123456789', plan_name: 'Varahi Short-Term Growth', amount: '2000.00', due_date: '2026-06-23', status: 'overdue', remarks: 'Monthly distribution' },
  { id: 'pay3', customer_name: 'Pavan Kumar', customer_mobile: '+919999999999', plan_name: 'Varahi Maturity Booster', amount: '192000.00', due_date: '2028-06-01', status: 'pending', remarks: 'Principal + Returns maturity payout' }
];

let mockKycDocs = [
  { id: 'kyc1', user_name: 'Swetha Reddy', user_mobile: '+919876543210', user_kyc_status: 'under_review', bank_account_number: '9182736452', ifsc_code: 'ICIC0001234', bank_name: 'ICICI Bank', aadhaar_front: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=400', aadhaar_back: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=400', pan: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=400', selfie: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400' },
  { id: 'kyc2', user_name: 'Rajesh Nair', user_mobile: '+919447012345', user_kyc_status: 'pending', bank_account_number: '100293849182', ifsc_code: 'HDFC0000123', bank_name: 'HDFC Bank', aadhaar_front: null, aadhaar_back: null, pan: null, selfie: null }
];

async function handleProxy(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const pathStr = path.join('/');
  const token = req.cookies.get('access_token')?.value;

  const url = `${DJANGO_API_URL}/${pathStr}/${req.nextUrl.search}`;

  const headers = new Headers();
  headers.set('Content-Type', req.headers.get('Content-Type') || 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const method = req.method;
  let body: any = null;

  if (['POST', 'PUT', 'PATCH'].includes(method)) {
    try {
      const contentType = req.headers.get('content-type') || '';
      if (contentType.includes('multipart/form-data')) {
        body = await req.formData();
        headers.delete('Content-Type');
      } else {
        body = await req.text();
      }
    } catch (e) {
      // Body empty or unparseable
    }
  }

  // Attempt backend connection, fall back to mock data on failure/auth removal
  try {
    const response = await fetch(url, {
      method,
      headers,
      body,
    });

    if (response.ok || response.status === 400) {
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
      } else {
        const text = await response.text();
        return new NextResponse(text, {
          status: response.status,
          headers: { 'Content-Type': contentType },
        });
      }
    }
    // If auth error (e.g. 401/403) and user requested bypass, throw error to trigger mock fallback
    throw new Error('Fallback to mock data');
  } catch (error) {
    console.log(`[Demo Proxy] Resolving Mock Data for: ${method} /api/${pathStr}`);

    // Mock response routing
    if (pathStr.includes('admin/analytics')) {
      return NextResponse.json({
        total_aum: 24500000.00,
        active_investors: mockCustomers.filter(c => c.kyc_status === 'approved').length,
        payouts_due_month: mockPayouts.filter(p => p.status === 'pending' || p.status === 'overdue').reduce((a, c) => a + parseFloat(c.amount), 0),
        pending_verifications: mockInvestments.filter(i => i.status === 'pending').length,
        chart_data: [
          { date: '2026-05-25', amount: 21000000.00 },
          { date: '2026-05-30', amount: 21500000.00 },
          { date: '2026-06-05', amount: 22400000.00 },
          { date: '2026-06-10', amount: 23000000.00 },
          { date: '2026-06-15', amount: 23800000.00 },
          { date: '2026-06-23', amount: 24500000.00 }
        ],
        activities: [
          { description: 'New investment of ₹1,20,000 initiated by Swetha Reddy', status: 'pending', created_at: '10 mins ago' },
          { description: 'KYC documents submitted by Rajesh Nair', status: 'pending', created_at: '1 hour ago' },
          { description: 'Payout of ₹2,000 overdue for Ananya Rao', status: 'pending', created_at: '3 hours ago' }
        ]
      });
    }

    if (pathStr === 'customers' || pathStr === 'customers/' || pathStr.includes('admin/reports')) {
      return NextResponse.json(mockCustomers);
    }

    if (pathStr === 'plans' || pathStr === 'plans/') {
      if (method === 'POST') {
        const bodyObj = JSON.parse(body);
        const newPlan = {
          id: 'p' + (mockPlans.length + 1),
          ...bodyObj,
          is_active: true
        };
        mockPlans.push(newPlan);
        return NextResponse.json(newPlan, { status: 201 });
      }
      return NextResponse.json(mockPlans);
    }

    if (pathStr === 'investments' || pathStr === 'investments/') {
      return NextResponse.json(mockInvestments);
    }

    if (pathStr.includes('investments/') && pathStr.includes('/approve')) {
      const parts = pathStr.split('/');
      const id = parts[1];
      mockInvestments = mockInvestments.map(i => i.id === id ? { ...i, status: 'active' } : i);
      return NextResponse.json({ message: 'Investment approved (mock)' });
    }

    if (pathStr.includes('investments/') && pathStr.includes('/reject')) {
      const parts = pathStr.split('/');
      const id = parts[1];
      mockInvestments = mockInvestments.map(i => i.id === id ? { ...i, status: 'rejected' } : i);
      return NextResponse.json({ message: 'Investment rejected (mock)' });
    }

    if (pathStr === 'payouts' || pathStr === 'payouts/') {
      return NextResponse.json(mockPayouts);
    }

    if (pathStr.includes('payouts/') && pathStr.includes('/mark_paid')) {
      const parts = pathStr.split('/');
      const id = parts[1];
      mockPayouts = mockPayouts.map(p => p.id === id ? { ...p, status: 'paid' } : p);
      return NextResponse.json({ message: 'Payout marked paid (mock)' });
    }

    if (pathStr.includes('payouts/bulk-mark-paid') || pathStr.includes('payouts/bulk_mark_paid')) {
      const bodyObj = JSON.parse(body);
      const ids = bodyObj.payout_ids || [];
      mockPayouts = mockPayouts.map(p => ids.includes(p.id) ? { ...p, status: 'paid' } : p);
      return NextResponse.json({ message: `Successfully marked ${ids.length} payouts as paid (mock)` });
    }

    if (pathStr === 'kyc' || pathStr === 'kyc/') {
      return NextResponse.json(mockKycDocs);
    }

    if (pathStr.includes('kyc/') && pathStr.includes('/approve')) {
      const parts = pathStr.split('/');
      const id = parts[1];
      const doc = mockKycDocs.find(k => k.id === id);
      if (doc) {
        mockCustomers = mockCustomers.map(c => c.mobile_number === doc.user_mobile ? { ...c, kyc_status: 'approved' } : c);
        mockKycDocs = mockKycDocs.map(k => k.id === id ? { ...k, user_kyc_status: 'approved' } : k);
      }
      return NextResponse.json({ message: 'KYC approved (mock)' });
    }

    if (pathStr.includes('kyc/') && pathStr.includes('/reject')) {
      const parts = pathStr.split('/');
      const id = parts[1];
      const doc = mockKycDocs.find(k => k.id === id);
      if (doc) {
        mockCustomers = mockCustomers.map(c => c.mobile_number === doc.user_mobile ? { ...c, kyc_status: 'rejected' } : c);
        mockKycDocs = mockKycDocs.map(k => k.id === id ? { ...k, user_kyc_status: 'rejected' } : k);
      }
      return NextResponse.json({ message: 'KYC rejected (mock)' });
    }

    if (pathStr === 'supervisors' || pathStr === 'supervisors/') {
      return NextResponse.json([
        { id: 's1', full_name: 'Compliance Officer A', email: 'compliance.a@varahi.com', mobile_number: '+919999999901' },
        { id: 's2', full_name: 'Audit Supervisor B', email: 'compliance.b@varahi.com', mobile_number: '+919999999902' }
      ]);
    }

    // Default mock response for unhandled endpoints
    return NextResponse.json({ message: 'Mock response success', data: {} });
  }
}

export {
  handleProxy as GET,
  handleProxy as POST,
  handleProxy as PUT,
  handleProxy as DELETE,
  handleProxy as PATCH,
};
