export type AgentState = 'idle' | 'listening' | 'thinking' | 'speaking';
export function generateWaveform(state: AgentState): number[] {
  const length = 12;
  const waveform = Array.from({ length }, () => 0);
  switch (state) {
    case 'idle':
      return waveform.map(() => 0.1 + Math.random() * 0.1);
    case 'listening':
      return waveform.map(() => 0.3 + Math.random() * 0.6);
    case 'thinking':
      return waveform.map((_, i) => 0.2 + Math.sin(Date.now() / 200 + i) * 0.2);
    case 'speaking':
      return waveform.map(() => 0.4 + Math.random() * 0.5);
    default:
      return waveform;
  }
}
export function getStateColor(state: AgentState): string {
  switch (state) {
    case 'idle':
      return 'from-slate-500 to-slate-700';
    case 'listening':
      return 'from-cyan-400 to-blue-600';
    case 'thinking':
      return 'from-indigo-500 to-purple-600';
    case 'speaking':
      return 'from-emerald-400 to-cyan-500';
    default:
      return 'from-slate-500 to-slate-700';
  }
}