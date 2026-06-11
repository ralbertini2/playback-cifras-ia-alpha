// Playback Cifras v13 Alpha — camada centralizada de permissões.
// Todas as telas futuras devem consultar este serviço em vez de validar plano diretamente.
export const PLAN_IDS = {
  FREE: 'free',
  ESSENTIAL: 'essential',
  PRO: 'pro'
};

export const PLAN_LIMITS = {
  free: { songs: 25, setlists: 3, ai: false, drive: true, exports: false, backup: false },
  essential: { songs: Infinity, setlists: Infinity, ai: false, drive: true, exports: true, backup: true },
  pro: { songs: Infinity, setlists: Infinity, ai: true, drive: true, exports: true, backup: true }
};

export function getPlanLimits(planId = PLAN_IDS.FREE){
  return PLAN_LIMITS[planId] || PLAN_LIMITS.free;
}

export function canUseAI(user){ return !!getPlanLimits(user?.planId).ai; }
export function canGeneratePDF(user){ return ['essential','pro'].includes(user?.planId); }
export function canExport(user){ return !!getPlanLimits(user?.planId).exports; }
export function canUseDrive(user){ return !!getPlanLimits(user?.planId).drive; }
export function canCreateUnlimitedSetlists(user){ return getPlanLimits(user?.planId).setlists === Infinity; }
export function canAddSong(user, currentSongCount = 0){
  return currentSongCount < getPlanLimits(user?.planId).songs;
}
