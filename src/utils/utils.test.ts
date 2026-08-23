// @vitest-environment jsdom
import { describe, expect, test } from 'vitest';
import { Utils } from '@/utils/utils';

describe('Utils', () => {
	describe('isNullOrEmpty', () => {
		test.each([
			[ '', true ],
			[ null, true ],
			[ undefined, true ],
			[ 'a', false ],
			[ '     ', true ],
			[ '  a   ', false ]
		])('returns the expected result', (value, expected) => {
			expect(Utils.isNullOrEmpty(value)).toBe(expected);
		});
	});

	describe('valueOrDefault', () => {
		test.each([
			[ '', 'default' ],
			[ null, 'default' ],
			[ undefined, 'default' ],
			[ 'a', 'a' ],
			[ '     ', 'default' ],
			[ '  a   ', '  a   ' ],
			[ 42, '42' ],
			[ 0, 'default' ],
			[ '0', '0' ]
		])('returns the expected result', (value, expected) => {
			expect(Utils.valueOrDefault(value, 'default')).toBe(expected);
		});
	});

	describe('fixHostnameUrl', () => {
		test.each([
			[ 'HTTPS://SoMe.Url', 'https://some.url' ]
		])('converts the value to lowercase', (url, expected) => {
			expect(Utils.fixHostnameUrl(url)).toBe(expected);
		});

		test.each([
			[ 'https://some.url/', 'https://some.url' ],
			[ 'https://some.url///', 'https://some.url' ],
			[ 'https://some.url', 'https://some.url' ],
			[ 'https://some.url/path/', 'https://some.url/path' ]
		])('removes trailing slash if present', (url, expected) => {
			expect(Utils.fixHostnameUrl(url)).toBe(expected);
		});
	});

	describe('getErrorMessage', () => {
		test.each([
			[ 'Just a string', 'Just a string' ],
			[ new Error('an error message'), 'an error message' ],
			[ { msg: 'an object' }, '[object Object]' ]
		])('Returns reasonable messages for various things that are error-like', (err, expected) => {
			expect(Utils.getErrorMessage(err)).toBe(expected);
		});
	});

	describe('markdownToHtml', () => {
		const legacyTable = [ '| Rampage | Effect |', '|:============|:=======|', '| 8 | Free maneuver |' ].join('\n');
		const gfmTable = [ '| Roll | Effect |', '|:--------|:------|', '| 12 - 16 | Told |' ].join('\n');

		test('renders a legacy `=` delimiter table as a real table', () => {
			const html = Utils.markdownToHtml(legacyTable);

			expect(html).toContain('<table>');
			expect(html).toContain('<th align="left">Rampage</th>');
			expect(html).toContain('<th align="left">Effect</th>');
			expect(html).toContain('<td align="left">8</td>');
			expect(html).toContain('<td align="left">Free maneuver</td>');
			// The legacy delimiter itself never reaches the reader.
			expect(html).not.toContain(':====');
			expect(html).not.toContain('|');
		});

		test('keeps rendering a standard GFM `-` delimiter table', () => {
			const html = Utils.markdownToHtml(gfmTable);

			expect(html).toContain('<table>');
			expect(html).toContain('<th align="left">Roll</th>');
			// A hyphen inside a content cell is not a delimiter and is left alone.
			expect(html).toContain('<td align="left">12 - 16</td>');
		});

		test.each([
			[ 'A blast radius of 3 = three squares.' ],
			[ 'The Rampage table uses |:====| as its delimiter, which is legacy syntax.' ],
			[ '| 8 | damage = 2 + M |' ],
			[ '|====' ],
			[ '```\n|:====|:====|\n```' ]
		])('leaves unrelated equals-sign content alone: %s', markdown => {
			const html = Utils.markdownToHtml(markdown);

			expect(html).not.toContain('<table>');
			expect(html).toContain('=');
		});

		describe('code fence boundaries', () => {
			const legacyDelimiter = '|:====|:====|';

			test('a tilde line inside a backtick fence does not close it', () => {
				const html = Utils.markdownToHtml([ '```text', '~~~', legacyDelimiter, '```' ].join('\n'));

				// The whole block is still literal code, so the delimiter keeps its `=`.
				expect(html).toContain(legacyDelimiter);
				expect(html).not.toContain('|:----|:----|');
				expect(html).not.toContain('<table>');
			});

			test('a backtick line inside a tilde fence does not close it', () => {
				const html = Utils.markdownToHtml([ '~~~text', '```', legacyDelimiter, '~~~' ].join('\n'));

				expect(html).toContain(legacyDelimiter);
				expect(html).not.toContain('|:----|:----|');
				expect(html).not.toContain('<table>');
			});

			test('a shorter fence line does not close a longer fence', () => {
				const html = Utils.markdownToHtml([ '````', '```', legacyDelimiter, '````' ].join('\n'));

				expect(html).toContain(legacyDelimiter);
				expect(html).not.toContain('|:----|:----|');
				expect(html).not.toContain('<table>');
			});

			test('a closing fence carrying an info string does not close the block', () => {
				const html = Utils.markdownToHtml([ '```', '``` still code', legacyDelimiter, '```' ].join('\n'));

				expect(html).toContain(legacyDelimiter);
				expect(html).not.toContain('|:----|:----|');
				expect(html).not.toContain('<table>');
			});

			test('a legacy table after a properly closed fence is still normalized', () => {
				const html = Utils.markdownToHtml([
					'````',
					'~~~',
					legacyDelimiter,
					'````',
					'',
					'| Rampage | Effect |',
					'|:============|:=======|',
					'| 8 | Free maneuver |'
				].join('\n'));

				// The fenced content stayed literal ...
				expect(html).toContain(legacyDelimiter);
				// ... and the real table outside it still renders.
				expect(html).toContain('<table>');
				expect(html).toContain('<th align="left">Rampage</th>');
				expect(html).toContain('<td align="left">Free maneuver</td>');
				expect(html).not.toContain(':============');
			});

			test('a longer fence line closes a shorter fence, and normalization resumes after it', () => {
				const html = Utils.markdownToHtml([
					'```',
					legacyDelimiter,
					'````',
					'',
					'| Rampage | Effect |',
					'|:============|:=======|',
					'| 8 | Free maneuver |'
				].join('\n'));

				expect(html).toContain(legacyDelimiter);
				expect(html).toContain('<table>');
				expect(html).toContain('<td align="left">Free maneuver</td>');
			});
		});

		test('does not weaken sanitization', () => {
			expect(Utils.markdownToHtml('<img src=x onerror="alert(1)">')).not.toContain('onerror');
			expect(Utils.markdownToHtml('<script>alert(1)</script>')).not.toContain('<script>');
			// Sanitization still applies to content carried inside a normalized legacy table.
			const html = Utils.markdownToHtml([ '| A | B |', '|:====|:====|', '| 1 | <img src=x onerror="alert(1)"> |' ].join('\n'));
			expect(html).toContain('<table>');
			expect(html).not.toContain('onerror');
		});
	});

	describe('hashCode', () => {
		test.each([
			[ 'some medium string', 'another medium string' ],
			[ '01234567890123456', 'another medium string' ]
		])('does not collide on medium-length strings', (a, b) => {
			expect(Utils.hashCode(a)).not.toEqual(Utils.hashCode(b));
		});
	});
});
