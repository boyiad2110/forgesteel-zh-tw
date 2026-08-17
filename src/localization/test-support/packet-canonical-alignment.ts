export interface PacketCanonicalRecord {
	identity: string;
	canonicalSha256: string;
	canonicalEnglish?: string;
}

export type PacketCanonicalAlignmentIssueType =
	| 'canonical-sha256-drift'
	| 'duplicate-packet-identity'
	| 'missing-packet-identity'
	| 'packet-snapshot-drift'
	| 'unexpected-packet-identity';

export interface PacketCanonicalAlignmentIssue {
	type: PacketCanonicalAlignmentIssueType;
	identity: string;
}

export interface PacketCanonicalAlignmentResult {
	packetRecordCount: number;
	liveCanonicalCount: number;
	alignedCount: number;
	issues: PacketCanonicalAlignmentIssue[];
}

export interface VerifyPacketCanonicalAlignmentOptions {
	packetRecords: PacketCanonicalRecord[];
	liveCanonicalEnglish: Record<string, string>;
}

const issueTypeOrder: Record<PacketCanonicalAlignmentIssueType, number> = {
	'duplicate-packet-identity': 0,
	'missing-packet-identity': 1,
	'unexpected-packet-identity': 2,
	'packet-snapshot-drift': 3,
	'canonical-sha256-drift': 4
};

const compareStrings = (left: string, right: string) => {
	if (left === right) {
		return 0;
	}
	return left < right ? -1 : 1;
};

const compareIssues = (left: PacketCanonicalAlignmentIssue, right: PacketCanonicalAlignmentIssue) => (
	compareStrings(left.identity, right.identity) || (issueTypeOrder[left.type] - issueTypeOrder[right.type])
);

/** Calculates the lowercase SHA-256 of a complete UTF-8 canonical string without normalization. */
export const calculateCanonicalSha256 = async (canonicalEnglish: string) => {
	const bytes = new TextEncoder().encode(canonicalEnglish);
	const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes);
	return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * Verifies caller-supplied packet evidence against a caller-supplied live canonical slice.
 * It deliberately neither discovers the slice nor normalizes its identity or text values.
 */
export const verifyPacketCanonicalAlignment = async (options: VerifyPacketCanonicalAlignmentOptions): Promise<PacketCanonicalAlignmentResult> => {
	const packetRecords = [ ...options.packetRecords ].sort((left, right) => compareStrings(left.identity, right.identity));
	const liveIdentities = Object.keys(options.liveCanonicalEnglish).sort();
	const packetIdentities = new Set(packetRecords.map(record => record.identity));
	const issues: PacketCanonicalAlignmentIssue[] = [];

	for (const [ identity, count ] of Object.entries(packetRecords.reduce<Record<string, number>>((counts, record) => {
		counts[record.identity] = (counts[record.identity] ?? 0) + 1;
		return counts;
	}, {}))) {
		if (count > 1) {
			issues.push({ type: 'duplicate-packet-identity', identity });
		}
	}

	for (const identity of liveIdentities) {
		if (!packetIdentities.has(identity)) {
			issues.push({ type: 'missing-packet-identity', identity });
		}
	}

	for (const record of packetRecords) {
		const liveCanonicalEnglish = options.liveCanonicalEnglish[record.identity];
		if (liveCanonicalEnglish === undefined) {
			issues.push({ type: 'unexpected-packet-identity', identity: record.identity });
			continue;
		}

		if ((record.canonicalEnglish !== undefined) && (record.canonicalEnglish !== liveCanonicalEnglish)) {
			issues.push({ type: 'packet-snapshot-drift', identity: record.identity });
		}

		if (await calculateCanonicalSha256(liveCanonicalEnglish) !== record.canonicalSha256) {
			issues.push({ type: 'canonical-sha256-drift', identity: record.identity });
		}
	}

	const orderedIssues = issues.sort(compareIssues);
	return {
		packetRecordCount: packetRecords.length,
		liveCanonicalCount: liveIdentities.length,
		alignedCount: orderedIssues.length === 0 ? liveIdentities.length : 0,
		issues: orderedIssues
	};
};
