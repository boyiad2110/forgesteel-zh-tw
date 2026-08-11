/* eslint-disable sort-imports */

import { getV1AncestryNestedFeatureElements, v1HeroCreationSourcebooks } from '@/localization/v1-localization-manifest';
import { elementFieldIdentity } from '@/localization/catalog';
import { productionLocalizationEntries } from '@/localization/catalog-data';
import { describe, expect, it } from 'vitest';

// A leading '\n' (a template literal starting on its own line) is not a paragraph break; only
// a blank line ('\n\n') inside the body separates paragraphs.
const countParagraphs = (text: string) => text.replace(/^\n+/, '').split('\n\n').length;

describe('V1 Ancestry nested Feature description paragraph formatting', () => {
	it('finds exactly the 3 multi-paragraph descriptions in this Ancestry nested Feature slice', () => {
		const elements = getV1AncestryNestedFeatureElements(v1HeroCreationSourcebooks);
		const multiParagraphIDs = elements
			.filter(element => element.description.includes('\n\n'))
			.map(element => element.id)
			.sort();

		expect(multiParagraphIDs).toEqual([
			'dwarf-feature-1',
			'hakaan-feature-2-5',
			'revenant-feature-4-5-1'
		]);
	});

	it('gives the zh-TW catalog entry the same paragraph count as its canonical English for every multi-paragraph description in this slice', () => {
		const elements = getV1AncestryNestedFeatureElements(v1HeroCreationSourcebooks);
		const multiParagraphElements = elements.filter(element => element.description.includes('\n\n'));

		expect(multiParagraphElements).toHaveLength(3);

		multiParagraphElements.forEach(element => {
			const identity = elementFieldIdentity(element.id, 'description');
			const entry = productionLocalizationEntries.find(candidate => (candidate.kind === 'element-field') && (candidate.elementID === element.id) && (candidate.field === 'description'));

			expect(entry, `missing catalog entry for ${identity}`).toBeDefined();
			expect(entry!.canonicalEnglish).toBe(element.description);

			const canonicalParagraphs = countParagraphs(element.description);
			const zhTWParagraphs = countParagraphs(entry!.zhTW);

			expect(zhTWParagraphs).toBe(canonicalParagraphs);
		});
	});

	it('gives Dwarf Runic Carving and Revenant Vengeance Mark exactly 2 paragraphs, and Hakaan Doomsight exactly 3', () => {
		const byID = new Map(productionLocalizationEntries
			.filter(entry => (entry.kind === 'element-field') && (entry.field === 'description'))
			.map(entry => [ (entry as { elementID: string }).elementID, entry ])
		);

		expect(countParagraphs(byID.get('dwarf-feature-1')!.zhTW)).toBe(2);
		expect(countParagraphs(byID.get('revenant-feature-4-5-1')!.zhTW)).toBe(2);
		expect(countParagraphs(byID.get('hakaan-feature-2-5')!.zhTW)).toBe(3);
	});

	it('did not change any zh-TW wording while inserting the paragraph breaks', () => {
		const byID = new Map(productionLocalizationEntries
			.filter(entry => (entry.kind === 'element-field') && (entry.field === 'description'))
			.map(entry => [ (entry as { elementID: string }).elementID, entry ])
		);

		// Stripping the inserted blank lines must reproduce the exact Stage 1 approved wording.
		expect(byID.get('dwarf-feature-1')!.zhTW.replace(/\n\n/g, '')).toBe('你可以花費 10 分鐘不間斷地在皮膚上銘刻符文，這些符文會透過你體內的魔力啟動。你銘刻的符文類型會決定你獲得的效果。你同時只能啟動 1 種符文。更改或移除符文都需要 10 分鐘不間斷的時間。');
		expect(byID.get('revenant-feature-4-5-1')!.zhTW.replace(/\n\n/g, '')).toBe('使用機動動作，你可以在 10 格內的 1 個生物身上放置 1 個魔法符印。放置符印時，你可以決定符印出現在生物身體的哪個位置，以及符印是只有你看得見，還是所有生物都看得見。你始終知道相同世界中帶有你符印之生物的位置方向。你最多可以擁有數量等於你等級的符印，並且可以隨意解除生物身上的符印（無需動作）。若你在符印數量已滿的情況下放置新的符印，最舊的符印就會消失，不會產生任何效果。');
		expect(byID.get('hakaan-feature-2-5')!.zhTW.replace(/\n\n/g, '')).toBe('與你的 GM 合作，你可以預先決定哪場遭遇你將會死亡。當該遭遇開始時，你會進入「命定」狀態。處於命定狀態時，你進行的任何考驗和招式檢定都會自動獲得 T3 結果，而且無論你的體力降到多低都不會死亡。然而，你會在遭遇結束時立刻死亡，而且無法透過任何方式復活。若你沒有預先決定死亡遭遇，你也可以在陷入瀕死時進入命定狀態（無需動作，但需經 GM 同意）。這種選擇應該保留給因為英勇行為而瀕死的情況，例如與首領殊死一戰、拯救平民，或因為先前的行為而遭遇相應的後果，而不是單純因為你只玩一場冒險而沒有顧忌。此外，若你的體力降至疲態值的負數，但未處於命定狀態，你會變成碎石，而非死亡。在這種情況下，你無法感知周圍環境，也無法以任何方式恢復體力或復原。在 12 小時後，你會恢復等於你復元值的體力。');
	});
});
