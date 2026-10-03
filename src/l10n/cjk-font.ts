import { Language } from '@/l10n/language';

let started = false;

/**
 * Pulls in the sliced Noto Sans TC faces. English mode never calls this,
 * so those files stay off the network. A second call does nothing.
 */
export const ensureCjkFont = (language: Language) => {
	if (language !== 'zh-TW' || started) {
		return;
	}
	started = true;
	void import('./fonts/noto-sans-tc.css');
};
