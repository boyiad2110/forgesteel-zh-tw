// @vitest-environment jsdom
/* eslint-disable sort-imports */

import { Markdown } from '@/components/controls/markdown/markdown';
import { localizeElementField } from '@/localization/resolver';
import { AncestryData } from '@/data/ancestry-data';
import { Feature } from '@/models/feature';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('Hakaan Doomsight description rendered public behavior', () => {
	it('renders the zh-TW description as 3 separate paragraphs, not one block', () => {
		const doomsight = AncestryData.hakaan.features
			.flatMap(f => (f.type === 'Choice' ? f.data.options.map(o => o.feature) : []))
			.find(f => f.id === 'hakaan-feature-2-5') as Feature;

		const zhTW = localizeElementField('zh-TW', doomsight.id, 'description', doomsight.description);
		expect(zhTW).not.toBe(doomsight.description);

		const { container } = render(<Markdown text={zhTW} />);
		const paragraphs = container.querySelectorAll('p');

		expect(paragraphs.length).toBe(3);
		expect(paragraphs[0].textContent).toContain('與你的 GM 合作');
		expect(paragraphs[1].textContent).toContain('若你沒有預先決定死亡遭遇');
		expect(paragraphs[2].textContent).toContain('此外，若你的體力降至疲態值的負數');

		// Canonical English always rendered as 3 paragraphs; zh-TW now matches it instead of
		// collapsing into a single block.
		const englishHtml = render(<Markdown text={doomsight.description} />);
		expect(englishHtml.container.querySelectorAll('p').length).toBe(3);
	});
});
