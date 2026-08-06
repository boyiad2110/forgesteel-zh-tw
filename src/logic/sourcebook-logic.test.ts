import { afterEach, describe, expect, it, vi } from 'vitest';
import { FactoryLogic } from '@/logic/factory-logic';
import { HeroUpdateLogic } from '@/logic/update/hero-update-logic';
import { Sourcebook } from '@/models/sourcebook';
import { SourcebookData } from '@/data/sourcebook-data';
import { SourcebookLogic } from '@/logic/sourcebook-logic';
import { SourcebookType } from '@/enums/sourcebook-type';
import { UpdateLogic } from '@/logic/update/update-logic';

const createSourcebook = (id: string, type: SourcebookType): Sourcebook => {
	const sourcebook = FactoryLogic.createSourcebook();
	sourcebook.id = id;
	sourcebook.name = id;
	sourcebook.type = type;
	return sourcebook;
};

const mockBuiltIns = (sourcebooks: Sourcebook[]) => {
	vi.spyOn(SourcebookData, 'getCached').mockReturnValue(sourcebooks);
};

describe('SourcebookLogic.getSourcebooks sourcebook type policy', () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('keeps every official and homebrew sourcebook', () => {
		mockBuiltIns([
			createSourcebook('core', SourcebookType.Official),
			createSourcebook('orden', SourcebookType.Official)
		]);
		const homebrew = [
			createSourcebook('my-homebrew', SourcebookType.Homebrew),
			createSourcebook('my-other-homebrew', SourcebookType.Homebrew)
		];

		const result = SourcebookLogic.getSourcebooks(homebrew);

		expect(result.map(sb => sb.id)).toEqual([ 'core', 'orden', 'my-homebrew', 'my-other-homebrew' ]);
	});

	it('keeps an additional official sourcebook without it being named anywhere', () => {
		mockBuiltIns([
			createSourcebook('core', SourcebookType.Official),
			createSourcebook('a-brand-new-official-sourcebook', SourcebookType.Official)
		]);

		const result = SourcebookLogic.getSourcebooks();

		expect(result.map(sb => sb.id)).toContain('a-brand-new-official-sourcebook');
	});

	it('excludes community and third party sourcebooks from both the built-ins and storage', () => {
		mockBuiltIns([
			createSourcebook('core', SourcebookType.Official),
			createSourcebook('built-in-community', SourcebookType.Community),
			createSourcebook('built-in-third-party', SourcebookType.ThirdParty)
		]);
		const homebrew = [
			createSourcebook('my-homebrew', SourcebookType.Homebrew),
			createSourcebook('stored-community', SourcebookType.Community),
			createSourcebook('stored-third-party', SourcebookType.ThirdParty)
		];

		const result = SourcebookLogic.getSourcebooks(homebrew);

		expect(result.map(sb => sb.id)).toEqual([ 'core', 'my-homebrew' ]);
	});

	it('keeps a legacy sourcebook with no type once the updater has treated it as homebrew', () => {
		mockBuiltIns([ createSourcebook('core', SourcebookType.Official) ]);
		const legacy = createSourcebook('legacy-homebrew', SourcebookType.Homebrew);
		delete (legacy as Partial<Sourcebook>).type;

		UpdateLogic.updateSourcebook(legacy);

		expect(legacy.type).toBe(SourcebookType.Homebrew);
		expect(SourcebookLogic.getSourcebooks([ legacy ]).map(sb => sb.id)).toEqual([ 'core', 'legacy-homebrew' ]);
	});
});

describe('SourcebookLogic.isSourcebookAllowed', () => {
	it('allows official and homebrew sourcebooks only', () => {
		expect(SourcebookLogic.isSourcebookAllowed(createSourcebook('a', SourcebookType.Official))).toBe(true);
		expect(SourcebookLogic.isSourcebookAllowed(createSourcebook('b', SourcebookType.Homebrew))).toBe(true);
		expect(SourcebookLogic.isSourcebookAllowed(createSourcebook('c', SourcebookType.Community))).toBe(false);
		expect(SourcebookLogic.isSourcebookAllowed(createSourcebook('d', SourcebookType.ThirdParty))).toBe(false);
	});
});

describe('existing hero data', () => {
	it('leaves sourcebookIDs referring to excluded sourcebooks untouched', () => {
		const hero = FactoryLogic.createHero();
		hero.sourcebookIDs = [ 'core', 'community', 'weapons-of-legend' ];

		HeroUpdateLogic.updateHero(hero, [ createSourcebook('core', SourcebookType.Official) ]);

		expect(hero.sourcebookIDs).toEqual([ 'core', 'community', 'weapons-of-legend' ]);
	});
});
