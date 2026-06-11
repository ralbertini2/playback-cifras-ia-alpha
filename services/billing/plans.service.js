// Estrutura de planos — sem cobrança real nesta fase.
export const PLANS = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    features: ['Biblioteca limitada', 'Setlists limitadas', 'Google Drive básico', 'Sem IA'],
    limits: { songs: 25, setlists: 3, aiCredits: 0 }
  },
  essential: {
    id: 'essential',
    name: 'Essencial',
    price: null,
    features: ['Biblioteca ilimitada', 'Backup', 'Google Drive', 'Setlists ilimitadas', 'Sem IA'],
    limits: { songs: Infinity, setlists: Infinity, aiCredits: 0 }
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: null,
    features: ['Tudo do Essencial', 'Recursos IA', 'Exportações avançadas', 'Geração automática de cifras', 'Processamento musical'],
    limits: { songs: Infinity, setlists: Infinity, aiCredits: null }
  }
};

export function getCurrentPlan(){
  return localStorage.getItem('pc_plan_id') || 'free';
}

export function setDemoPlan(planId){
  if(!PLANS[planId]) throw new Error('Plano inválido');
  localStorage.setItem('pc_plan_id', planId);
  return PLANS[planId];
}
