export function formatINR(amount: number | string): string {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numericAmount)) return '₹0.00';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(numericAmount);
}

export function buildUPIDeepLink(params: {
  upiId: string;
  payeeName: string;
  amount: number;
  txnRef: string;
  note?: string;
}): string {
  const { upiId, payeeName, amount, txnRef, note } = params;
  const base = 'upi://pay';
  const query = new URLSearchParams({
    pa: upiId,
    pn: payeeName,
    am: amount.toFixed(2),
    tn: txnRef,
    cu: 'INR',
    ...(note ? { mc: note } : {}),
  });
  return `${base}?${query.toString()}`;
}

export function calculateMaturityValue(
  amount: number,
  returnRatePercent: number,
  tenureMonths: number,
  frequency: 'monthly' | 'quarterly' | 'on_maturity'
): { totalReturns: number; totalPayout: number; periodPayout: number } {
  const rate = returnRatePercent / 100;
  const totalReturns = amount * rate * (tenureMonths / 12);
  const totalPayout = amount + totalReturns;
  
  let periodPayout = 0;
  if (frequency === 'monthly') {
    periodPayout = (amount * rate) / 12;
  } else if (frequency === 'quarterly') {
    periodPayout = (amount * rate) / 4;
  } else if (frequency === 'on_maturity') {
    periodPayout = totalPayout;
  }

  return {
    totalReturns,
    totalPayout,
    periodPayout,
  };
}
