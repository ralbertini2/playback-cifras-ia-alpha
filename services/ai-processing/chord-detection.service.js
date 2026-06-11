// Mock chord-detection — Playback Cifras v13 Alpha.
// Este serviço NÃO executa IA real nesta versão.
export async function process(input = {}){
  return {
    status: 'mocked',
    service: 'chord-detection',
    input,
    message: 'Estrutura preparada para implementação futura de IA.',
    createdAt: new Date().toISOString()
  };
}
