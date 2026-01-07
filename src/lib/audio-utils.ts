export class AudioAnalyzer {
  private static instance: AudioAnalyzer;
  private context: AudioContext | null = null;
  private analyzer: AnalyserNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private dataArray: Uint8Array | null = null;
  private constructor() {}
  static getInstance(): AudioAnalyzer {
    if (!AudioAnalyzer.instance) {
      AudioAnalyzer.instance = new AudioAnalyzer();
    }
    return AudioAnalyzer.instance;
  }
  async init(stream: MediaStream): Promise<void> {
    if (!this.context) {
      this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.context.state === 'suspended') {
      await this.context.resume();
    }
    this.analyzer = this.context.createAnalyser();
    this.analyzer.fftSize = 256;
    this.source = this.context.createMediaStreamAudioSource(stream);
    this.source.connect(this.analyzer);
    this.dataArray = new Uint8Array(this.analyzer.frequencyBinCount);
  }
  getFrequencyData(): number[] {
    if (!this.analyzer || !this.dataArray) return new Array(12).fill(0);
    this.analyzer.getByteFrequencyData(this.dataArray);
    // Normalize and downsample to 12 bars for our UI
    const result: number[] = [];
    const step = Math.floor(this.dataArray.length / 12);
    for (let i = 0; i < 12; i++) {
      let sum = 0;
      for (let j = 0; j < step; j++) {
        sum += this.dataArray[i * step + j];
      }
      result.push(sum / step / 255); // Normalize to 0-1
    }
    return result;
  }
  getVolume(): number {
    if (!this.analyzer || !this.dataArray) return 0;
    this.analyzer.getByteFrequencyData(this.dataArray);
    let sum = 0;
    for (let i = 0; i < this.dataArray.length; i++) {
      sum += this.dataArray[i];
    }
    return sum / this.dataArray.length / 255;
  }
  close(): void {
    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }
    this.analyzer = null;
    // We don't close the context to allow reuse, but we could if needed
  }
}
export const audioAnalyzer = AudioAnalyzer.getInstance();