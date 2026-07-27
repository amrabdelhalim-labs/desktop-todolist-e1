import { describe, expect, it } from 'vitest';
import channels from '../ipcChannels.js';

describe('preload IPC bridge', () => {
    it('exposes the complete, explicit send-channel allowlist', () => {
        expect(channels.sendChannels).toContain('add-normal-task');
        expect(channels.sendChannels).toContain('notify');
        expect(channels.sendChannels).not.toContain('untrusted-channel');
        expect(Object.isFrozen(channels.sendChannels)).toBe(true);
    });

    it('keeps receive channels narrower than send channels', () => {
        expect(channels.receiveChannels).toEqual([
            'add-normal-task',
            'add-timed-task',
            'add-imaged-task',
            'open-file',
        ]);
        expect(channels.receiveChannels).not.toContain('delete-image');
        expect(Object.isFrozen(channels.receiveChannels)).toBe(true);
    });
});
