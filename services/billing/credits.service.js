// Créditos IA — controle estrutural sem processamento real.
export const CREDIT_COSTS = {
  stemSeparation: 1,
  transcription: 1,
  chordDetection: 1,
  keyDetection: 1,
  fullChordSheet: 2,
  pdfGeneration: 1
};

export function getCreditBalance(){
  return Number(localStorage.getItem('pc_ai_credits') || '0');
}

export function setCreditBalance(value){
  localStorage.setItem('pc_ai_credits', String(Math.max(0, Number(value) || 0)));
}

export function canConsumeCredits(action){
  return getCreditBalance() >= (CREDIT_COSTS[action] || 0);
}

export function consumeCredits(action){
  const cost = CREDIT_COSTS[action] || 0;
  if(!canConsumeCredits(action)) return false;
  setCreditBalance(getCreditBalance() - cost);
  const tx = JSON.parse(localStorage.getItem('pc_credit_transactions') || '[]');
  tx.unshift({ id: crypto.randomUUID?.() || String(Date.now()), action, cost, at: new Date().toISOString() });
  localStorage.setItem('pc_credit_transactions', JSON.stringify(tx.slice(0,100)));
  return true;
}
