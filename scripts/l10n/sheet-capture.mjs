/** Connector-side projection. No Node dependencies: raw drafts stay in memory. */
export const SHEET_ID = '1RAtKBsoL3HdPUZ0WNszdM7t2e_ac_Z3nBlpn7ud-cZ4';
export const TAB_HEADERS = {
	Glossary: [ 'Glossary ID', 'Status', 'Target Term', 'Source Term', 'Last Updated' ],
	Names: [ 'Name ID', 'Status', 'Target Name', 'Source Name', 'Last Updated' ],
	Strings: [ 'String ID', 'Status', 'Target Text', 'Source Text', 'Last Updated',
		'Forge Steel Source Text', 'Forge Steel Target Text', 'Forge Steel Status',
		'Forge Steel Basis Hash', 'Forge Steel Note' ],
	'Forge Steel UI': [ 'UI ID', 'Status', 'Target Text', 'Source Text', 'Last Updated', 'Source Hash' ]
};

/** Shared by capture and export: reject draft templates before any disk write. */
export function parseCalculationDisplay(note, zh) {
	const lines = typeof note === 'string' ? note.split(/\r?\n/).filter(line => line.startsWith('Calculation Display: ')) : [];
	if (lines.length !== 1) throw new Error('expected one Calculation Display record on an approved Forge Steel row');
	const display = JSON.parse(lines[0].slice('Calculation Display: '.length));
	if (!display || typeof display !== 'object' || Array.isArray(display)
		|| Object.keys(display).length !== 3 || display.status !== 'APPROVED'
		|| typeof display.target !== 'string' || !display.target
		|| zh.split(display.target).length !== 2
		|| typeof display.template !== 'string' || display.template.split('{value}').length !== 2
		|| /[{}]/.test(display.template.replace('{value}', ''))) {
		throw new Error('expected an APPROVED { status, target, template } with one unique target and one {value} placeholder');
	}
	return { target: display.target, template: display.template };
}

export function projectCapture(before, tables, after) {
	if (before?.id !== SHEET_ID || after?.id !== SHEET_ID
		|| before.mime_type !== 'application/vnd.google-apps.spreadsheet'
		|| after.mime_type !== before.mime_type
		|| typeof before.modified_time !== 'string' || !Number.isFinite(Date.parse(before.modified_time))
		|| before.modified_time !== after.modified_time) {
		throw new Error('Sheet identity or modified time changed; discard capture and read again');
	}
	const tabs = {};
	for (const [ name, headers ] of Object.entries(TAB_HEADERS)) {
		const values = tables[name]?.values;
		if (!Array.isArray(values) || !Array.isArray(values[0])) {
			throw new Error(`${name}: missing complete range read`);
		}
		const sourceHeaders = values[0];
		const indexes = headers.map(header => {
			const matches = sourceHeaders.flatMap((value, index) => value === header ? [ index ] : []);
			if (matches.length !== 1) throw new Error(`${name}: missing or duplicate header ${header}`);
			return matches[0];
		});
		const rows = [];
		for (const row of values.slice(1)) {
			if (!Array.isArray(row)) throw new Error(`${name}: invalid row`);
			if (row[indexes[1]] !== 'APPROVED') continue;
			const projected = indexes.map(index => row[index] ?? '');
			if (projected.some(value => typeof value !== 'string')) throw new Error(`${name}: expected text cells`);
			// A book-approved row may still have a draft Forge Steel adaptation.
			if (name === 'Strings' && projected[7] !== 'APPROVED') projected.fill('', 5);
			// Only approved dynamic records need the complete Note text in the bundle.
			if (name === 'Strings' && !/(^|\r?\n)\s*Calculation Display:/.test(projected[9])) projected[9] = '';
			if (name === 'Strings' && projected[9]) parseCalculationDisplay(projected[9], projected[6]);
			rows.push(projected);
		}
		tabs[name] = { headers, rows };
	}
	return { sheetFileId: SHEET_ID, modifiedTimeBefore: before.modified_time,
		modifiedTimeAfter: after.modified_time, tabs };
}

/** Adapters must read each entire metadata-bounded tab, joining pages before return. */
export async function captureSheet(readMetadata, readTab) {
	const before = await readMetadata();
	const results = await Promise.all(Object.keys(TAB_HEADERS).map(async name => [ name, await readTab(name) ]));
	const after = await readMetadata();
	return projectCapture(before, Object.fromEntries(results), after);
}
