/* eslint-disable sort-imports */
import { ReactNode } from 'react';
import { RenderResult, fireEvent, render, screen } from '@testing-library/react';
import { expect } from 'vitest';
import { AbilityPanel } from '@/components/panels/elements/ability-panel/ability-panel';
import { ClassPanel } from '@/components/panels/elements/class-panel/class-panel';
import { FeaturePanel } from '@/components/panels/elements/feature-panel/feature-panel';
import { SubclassPanel } from '@/components/panels/elements/subclass-panel/subclass-panel';
import { LocaleToggle } from '@/components/controls/locale-toggle/locale-toggle';
import { LocalizationProvider } from '@/contexts/localization-context';
import { PanelMode } from '@/enums/panel-mode';
import { FactoryLogic } from '@/logic/factory-logic';
import { Ability } from '@/models/ability';
import { Feature } from '@/models/feature';
import { Hero } from '@/models/hero';
import { HeroClass } from '@/models/class';
import { Sourcebook } from '@/models/sourcebook';
import { SubClass } from '@/models/subclass';

/**
 * Shared scaffolding for the Core class localization presentation tests.
 *
 * Every one of those tests observes the same public surface: a panel rendered inside a real
 * LocalizationProvider next to a real LocaleToggle, read as zh-TW, switched to English by
 * clicking that toggle, and asserted against its rendered text. Only the class data, the
 * denominator and the class-specific readings differ. This module carries the part that does
 * not differ, so a new class slice does not begin by re-deriving a render harness.
 *
 * It deliberately holds no denominator, manifest, catalog or class knowledge, and makes no
 * assertion of its own beyond `expectRendered`. What a given class must read, which Features
 * carry it, and how its calculated grammar is expected to project all stay in that class's own
 * test, where they can be reviewed against the canonical source.
 *
 * The `vi.mock` calls those tests share are intentionally *not* here: `vi.mock` is hoisted per
 * module and its factory participates in that module's own loading, so moving it behind an
 * import would change module-evaluation semantics rather than just remove duplication.
 */

/** jsdom has no ResizeObserver, which antd's popups need before they will draw. */
export const installResizeObserverStub = () => {
	class ResizeObserverStub {
		observe() {}
		unobserve() {}
		disconnect() {}
	}
	globalThis.ResizeObserver = ResizeObserverStub;
};

/**
 * Renders content the way a player meets it: inside the real localization context, with the
 * real toggle mounted so the locale can be switched through public interaction.
 */
export const renderLocalized = (content: ReactNode): RenderResult => render(
	<LocalizationProvider>
		<LocaleToggle />
		{content}
	</LocalizationProvider>
);

export const renderFeaturePanel = (feature: Feature, options: { hero?: Hero, sourcebooks?: Sourcebook[], mode?: PanelMode } = {}): RenderResult => renderLocalized(
	<FeaturePanel feature={feature} hero={options.hero} sourcebooks={options.sourcebooks} mode={options.mode ?? PanelMode.Full} />
);

export const renderClassPanel = (heroClass: HeroClass, options: { sourcebooks: Sourcebook[], hero?: Hero, mode?: PanelMode }): RenderResult => renderLocalized(
	<ClassPanel heroClass={heroClass} sourcebooks={options.sourcebooks} hero={options.hero} mode={options.mode ?? PanelMode.Full} />
);

export const renderSubclassPanel = (subclass: SubClass, options: { sourcebooks: Sourcebook[], hero?: Hero, mode?: PanelMode }): RenderResult => renderLocalized(
	<SubclassPanel subclass={subclass} sourcebooks={options.sourcebooks} hero={options.hero} mode={options.mode ?? PanelMode.Full} />
);

export const renderAbilityPanel = (ability: Ability, options: { hero?: Hero, mode?: PanelMode } = {}): RenderResult => renderLocalized(
	<AbilityPanel ability={ability} hero={options.hero} mode={options.mode ?? PanelMode.Full} />
);

/** Switches locale the way a player does, through the toggle's accessible name. */
export const switchLocale = () => fireEvent.click(screen.getByRole('button', { name: /^Switch to / }));

/** Rendered text with runs of whitespace collapsed, so assertions do not depend on layout. */
export const normalizedText = (container: HTMLElement) => container.textContent?.replace(/\s+/g, ' ').trim() || '';

export const expectRendered = (container: HTMLElement, expected: string) => expect(normalizedText(container)).toContain(expected.replace(/\s+/g, ' ').trim());

/**
 * Reads a labelled field's value. The two lookups are kept apart on purpose: a prefix match is
 * what a label carrying its own trailing content needs, while an exact match is what a test
 * distinguishing similarly-named labels needs, and silently widening one into the other would
 * change which field a test is reading.
 */
export const readFieldByLabelPrefix = (container: HTMLElement, label: string) => {
	const field = Array.from(container.querySelectorAll('.field')).find(node => node.querySelector('.field-label')?.textContent?.trim().startsWith(label));
	return field?.querySelector('.field-value')?.textContent?.trim();
};

export const readFieldByExactLabel = (container: HTMLElement, label: string) => {
	const field = Array.from(container.querySelectorAll('.field')).find(node => node.querySelector('.field-label')?.textContent?.trim() === label);
	return field?.querySelector('.field-value')?.textContent?.trim();
};

/** A class's or subclass's own Level 1 Features. */
export const levelOneFeatures = (owner: { featuresByLevel: { level: number, features: Feature[] }[] }) => owner.featuresByLevel.find(level => level.level === 1)?.features || [];

/** A Hero fixture carrying the class under test, for the Hero-context presentation path. */
export const createHeroWithClass = (heroClass: HeroClass, level: number, characteristics: HeroClass['characteristics']): Hero => {
	const hero = FactoryLogic.createHero();
	hero.class = { ...heroClass, level: level, characteristics: characteristics };
	return hero;
};

/**
 * Binds the class and sourcebooks a single class slice renders with, so that slice's own tests
 * keep calling `renderFeature(feature, hero)` and friends without repeating the binding at every
 * call site. Only classes whose panels are rendered against a sourcebook set need this; a slice
 * that renders Feature panels alone can call `renderFeaturePanel` directly.
 */
export const createClassPresentationHarness = (heroClass: HeroClass, sourcebooks: Sourcebook[]) => ({
	renderFeature: (feature: Feature, hero?: Hero) => renderFeaturePanel(feature, { hero: hero, sourcebooks: sourcebooks }),
	renderClassPanel: (hero?: Hero, mode?: PanelMode) => renderClassPanel(heroClass, { sourcebooks: sourcebooks, hero: hero, mode: mode }),
	renderSubclass: (subclass: SubClass, mode?: PanelMode) => renderSubclassPanel(subclass, { sourcebooks: sourcebooks, mode: mode }),
	renderAbility: (ability: Ability, hero?: Hero) => renderAbilityPanel(ability, { hero: hero })
});
