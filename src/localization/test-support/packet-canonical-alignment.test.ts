import {
	calculateCanonicalSha256,
	verifyPacketCanonicalAlignment
} from '@/localization/test-support/packet-canonical-alignment';
import { describe, expect, it } from 'vitest';

const makeRecord = async (identity: string, canonicalEnglish: string, snapshot = canonicalEnglish) => ({
	identity,
	canonicalEnglish: snapshot,
	canonicalSha256: await calculateCanonicalSha256(canonicalEnglish)
});

describe('packet canonical alignment', () => {
	it('aligns a full multi-record packet containing exact whitespace-sensitive text', async () => {
		const markdownCanonicalEnglish = '\n**Prayer.** Wield\na light weapon!  ';
		const liveCanonicalEnglish = {
			'element:alpha/name': 'Alpha',
			'element:prayer/description': markdownCanonicalEnglish
		};
		const result = await verifyPacketCanonicalAlignment({
			packetRecords: await Promise.all([
				makeRecord('element:alpha/name', liveCanonicalEnglish['element:alpha/name']),
				makeRecord('element:prayer/description', markdownCanonicalEnglish)
			]),
			liveCanonicalEnglish
		});

		expect(result).toEqual({
			packetRecordCount: 2,
			liveCanonicalCount: 2,
			alignedCount: 2,
			issues: []
		});
	});

	it('uses the complete UTF-8 canonical value for SHA-256', async () => {
		expect(await calculateCanonicalSha256('abc')).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
	});

	it('reports leading or trailing whitespace, embedded-newline, and SHA drift without normalization', async () => {
		const liveCanonicalEnglish = {
			'element:leading/name': ' Prayer',
			'element:newline/description': 'Wield\na light weapon'
		};
		const result = await verifyPacketCanonicalAlignment({
			packetRecords: [
				await makeRecord('element:leading/name', 'Prayer', 'Prayer'),
				{ identity: 'element:newline/description', canonicalEnglish: 'Wield a light weapon', canonicalSha256: 'not-a-sha-256' }
			],
			liveCanonicalEnglish
		});

		expect(result.alignedCount).toBe(0);
		expect(result.issues).toEqual([
			{ type: 'packet-snapshot-drift', identity: 'element:leading/name' },
			{ type: 'canonical-sha256-drift', identity: 'element:leading/name' },
			{ type: 'packet-snapshot-drift', identity: 'element:newline/description' },
			{ type: 'canonical-sha256-drift', identity: 'element:newline/description' }
		]);
	});

	it('reports duplicate, missing, and unexpected identities in deterministic order', async () => {
		const liveCanonicalEnglish = {
			'element:alpha/name': 'Alpha',
			'element:beta/name': 'Beta'
		};
		const alpha = await makeRecord('element:alpha/name', 'Alpha');
		const result = await verifyPacketCanonicalAlignment({
			packetRecords: [
				{ ...alpha },
				alpha,
				await makeRecord('element:extra/name', 'Extra')
			],
			liveCanonicalEnglish
		});

		expect(result.issues).toEqual([
			{ type: 'duplicate-packet-identity', identity: 'element:alpha/name' },
			{ type: 'missing-packet-identity', identity: 'element:beta/name' },
			{ type: 'unexpected-packet-identity', identity: 'element:extra/name' }
		]);
	});

	it('rejects a stale self-consistent packet snapshot against the live source', async () => {
		const staleSnapshot = 'Old Prayer';
		const result = await verifyPacketCanonicalAlignment({
			packetRecords: [ await makeRecord('element:prayer/name', staleSnapshot) ],
			liveCanonicalEnglish: { 'element:prayer/name': 'New Prayer' }
		});

		expect(result.issues).toEqual([
			{ type: 'packet-snapshot-drift', identity: 'element:prayer/name' },
			{ type: 'canonical-sha256-drift', identity: 'element:prayer/name' }
		]);
	});
});
