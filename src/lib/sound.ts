export class SoundManager {
    private audioContext: AudioContext | null = null;
    private isMuted: boolean = false;

    constructor() {
        // Lazy init
    }

    private getContext() {
        if (typeof window !== 'undefined' && !this.audioContext) {
            this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        return this.audioContext;
    }

    public setMuted(muted: boolean) {
        this.isMuted = muted;
    }

    public toggleMute() {
        this.isMuted = !this.isMuted;
        return this.isMuted;
    }

    public play(type: 'eat' | 'wrong' | 'win' | 'lose' | 'click' | 'combo') {
        if (this.isMuted) return;
        const ctx = this.getContext();
        if (!ctx) return;

        // Resume context if suspended (browser policy)
        if (ctx.state === 'suspended') {
            ctx.resume().catch(() => { });
        }

        const now = ctx.currentTime;

        switch (type) {
            case 'eat':
                this.playTone(600, 'sine', 0.1, now);
                this.playTone(1200, 'sine', 0.1, now + 0.05);
                break;

            case 'wrong':
                this.playTone(150, 'sawtooth', 0.3, now);
                this.playTone(100, 'sawtooth', 0.3, now + 0.1);
                break;

            case 'win':
                // Victory fanfare
                this.playTone(523.25, 'sine', 0.2, now);      // C5
                this.playTone(659.25, 'sine', 0.2, now + 0.1); // E5
                this.playTone(783.99, 'sine', 0.2, now + 0.2); // G5
                this.playTone(1046.50, 'sine', 0.6, now + 0.3); // C6
                break;

            case 'lose':
                // Sad slide down
                this.playTone(400, 'triangle', 0.3, now);
                this.playTone(300, 'triangle', 0.3, now + 0.2);
                this.playTone(200, 'triangle', 0.6, now + 0.4);
                break;

            case 'combo':
                // Exciting rising tone
                this.playTone(400, 'square', 0.1, now);
                this.playTone(800, 'square', 0.2, now + 0.05);
                break;

            case 'click':
                this.playTone(800, 'triangle', 0.05, now);
                break;
        }
    }

    private playTone(freq: number, type: OscillatorType, duration: number, startTime: number) {
        if (this.isMuted) return;
        const ctx = this.getContext();
        if (!ctx) return;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type = type;
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.1, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

        osc.start(startTime);
        osc.stop(startTime + duration);
    }
}

export const soundManager = new SoundManager();
