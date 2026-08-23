import DOMPurify from 'dompurify';
import { SheetPageSize } from '@/enums/sheet-page-size';
import { domToImage } from 'modern-screenshot';
import html2canvas from 'html2canvas';
import jspdf from 'jspdf';
import { marked } from 'marked';
import { v4 as uuidv4 } from 'uuid';

// A table delimiter cell in the legacy `=` form the canonical source predates GFM with, and
// the GFM `-` form `marked` actually understands. Both allow the optional alignment colons.
const legacyTableDelimiterCell = /^\s*:?=+:?\s*$/;
const gfmTableDelimiterCell = /^\s*:?-+:?\s*$/;

// A code fence line: up to three spaces of indent, then a run of at least three backticks or
// tildes, then the info string. Which of those runs actually opens or closes a fence is decided
// against the currently active fence below, not by the shape alone.
const codeFenceLine = /^ {0,3}(`{3,}|~{3,})(.*)$/;

/**
 * Rewrites legacy `=` table delimiter rows - `|:============|:=======|` - into their GFM
 * equivalent so `marked` recognises the table instead of leaving the whole block as raw pipe
 * text for the reader. Several canonical sources still carry that shape, notably the Beastheart
 * Rampage table and the Summoner tables.
 *
 * This is deliberately a narrow compatibility shim, not a table dialect. A line is rewritten
 * only when it is, on its own, a complete pipe-delimited row of delimiter cells: every cell must
 * already be a delimiter cell in one of the two forms, and at least one must use the legacy one.
 * Prose containing `=`, standard GFM tables, and any row carrying real content are all returned
 * byte-identical, and nothing here changes what is later sanitized.
 *
 * Lines inside a fenced code block are left alone, since there the pipes are literal text the
 * reader is meant to see. Tracking that boundary needs the fence's actual identity, not a
 * boolean: an open fence is closed only by a fence of the *same* marker character, at least as
 * long as the one that opened it, and carrying no info string. A `~~~` line inside a backtick
 * fence, or a three-backtick line inside a four-backtick fence, is therefore ordinary code
 * content and leaves the block open. A backtick fence's own info string may not contain a
 * backtick, which is what keeps inline code such as `` `a` `` from reading as a fence.
 */
const normalizeLegacyTableDelimiters = (text: string): string => {
	let activeFence: { marker: string, length: number } | undefined = undefined;

	return text
		.split('\n')
		.map(line => {
			const fence = line.match(codeFenceLine);
			if (fence) {
				const marker = fence[1][0];
				const length = fence[1].length;
				const info = fence[2];

				if (activeFence) {
					// Only a matching, long enough, bare closing fence ends the block.
					if ((marker === activeFence.marker) && (length >= activeFence.length) && (info.trim() === '')) {
						activeFence = undefined;
					}
					return line;
				}

				if ((marker !== '`') || !info.includes('`')) {
					activeFence = { marker: marker, length: length };
					return line;
				}
			}

			const trimmed = line.trim();
			if (activeFence || (trimmed.length < 2) || !trimmed.startsWith('|') || !trimmed.endsWith('|')) {
				return line;
			}

			const cells = trimmed.slice(1, -1).split('|');
			const isDelimiterRow = cells.every(cell => legacyTableDelimiterCell.test(cell) || gfmTableDelimiterCell.test(cell));
			if (!isDelimiterRow || !cells.some(cell => legacyTableDelimiterCell.test(cell))) {
				return line;
			}

			return line.replace(/=/g, '-');
		})
		.join('\n');
};

export class Utils {
	static markdownToHtml = (text: string): string => {
		const html = marked(normalizeLegacyTableDelimiters(text), { async: false, gfm: true, breaks: true });
		return DOMPurify.sanitize(html);
	};

	static isDev = () => {
		return window.location.hostname === 'localhost';
	};

	static guid = () => {
		return uuidv4();
	};

	// From: https://github.com/bryc/code/blob/master/jshash/experimental/cyrb53.js
	static hashCode = (str: string, seed: number = 0): number => {
		let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
		for (let i = 0, ch; i < str.length; i++) {
			ch = str.charCodeAt(i);
			h1 = Math.imul(h1 ^ ch, 2654435761);
			h2 = Math.imul(h2 ^ ch, 1597334677);
		}
		h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
		h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
		h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
		h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
		return 4294967296 * (2097151 & h2) + (h1 >>> 0);
	};

	static copy = <T>(object: T) => {
		if (typeof structuredClone === 'function') {
			return structuredClone<T>(object);
		}

		return JSON.parse(JSON.stringify(object)) as T;
	};

	static wait = (ms: number) => {
		return new Promise<void>(resolve => setTimeout(resolve, ms));
	};

	static textMatches = (sources: string[], searchTerm: string) => {
		if (!searchTerm) {
			return true;
		}

		const tokens = searchTerm
			.toLowerCase()
			.split(' ');

		return sources.some(text => tokens.every(token => text.toLowerCase().includes(token)));
	};

	static intersects = (light: { a: { x: number, y: number }, b: { x: number, y: number } }, wall: { a: { x: number, y: number }, b: { x: number, y: number } }) => {
		const det = (light.b.x - light.a.x) * (wall.b.y - wall.a.y) - (wall.b.x - wall.a.x) * (light.b.y - light.a.y);
		if (det === 0) {
			return false;
		} else {
			const lambda = ((wall.b.y - wall.a.y) * (wall.b.x - light.a.x) + (wall.a.x - wall.b.x) * (wall.b.y - light.a.y)) / det;
			const gamma = ((light.a.y - light.b.y) * (wall.b.x - light.a.x) + (light.b.x - light.a.x) * (wall.b.y - light.a.y)) / det;
			return (0 <= lambda && lambda <= 1) && (0 <= gamma && gamma <= 1);
		}
	};

	static getResizedImage = (data: string): Promise<string> => {
		return new Promise(resolve => {
			const img = new Image();
			img.onload = () => {
				const maxSize = 500;
				const canvas = document.createElement('canvas');
				canvas.width = maxSize;
				canvas.height = maxSize;
				const ctx = canvas.getContext('2d');
				if (ctx) {
					const scale = Math.min(maxSize / img.width, maxSize / img.height);
					const scaledWidth = img.width * scale;
					const scaledHeight = img.height * scale;
					const offsetX = (maxSize - scaledWidth) / 2;
					const offsetY = (maxSize - scaledHeight) / 2;
					ctx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight);
					const mime = data.match(/^data:([^;,]+)[;,]/)?.[1] || 'image/png';
					resolve(canvas.toDataURL(mime));
				} else {
					resolve(data);
				}
			};
			img.src = data;
		});
	};

	static exportData = (name: string, obj: unknown, ext: string) => {
		Utils.saveFile(obj, name, ext);
	};

	static exportImage = (elementIDs: string[], name: string) => {
		const elements = elementIDs
			.map(id => document.getElementById(id))
			.filter(element => !!element);

		if (elements.length === 0) {
			return;
		}

		const originalBackgroundColors: { [id: string]: string } = {};
		elements.forEach(element => {
			originalBackgroundColors[element.id] = element.style.backgroundColor;
			if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
				element.style.backgroundColor = 'rgb(55, 55, 55)';
			}
		});

		elements.forEach((element, n) => {
			html2canvas(element)
				.then(canvas => {
					const filename = (elements.length > 1) ? `${name} ${n + 1}.png` : `${name}.png`;
					Utils.saveImage(filename, canvas);
					element.style.backgroundColor = originalBackgroundColors[element.id];
				});
		});
	};

	static elementToImage = (element: HTMLElement, scale: number): Promise<HTMLImageElement> => {
		const width = element.clientWidth;
		const height = element.clientHeight;

		// see: https://github.com/qq15725/modern-screenshot/issues/104
		const fontScaleFix = (node: Node) => {
			if (node instanceof HTMLElement) {
				node.style.fontSize = node.style.fontSize.replace(/(\d+(\.\d+)?(e[+-]?\d+)?)/g, (match, number) => {
					const parsedNumber = parseFloat(number);
					return isNaN(parsedNumber) ? match : (parsedNumber * 0.999).toString();
				});
			}
		};

		return domToImage(element, {
			width: width,
			height: height,
			scale: scale,
			onCloneEachNode: fontScaleFix
		});
	};

	static elementsToPdf = async (elementIDs: string[], filename: string, pdfPaperSize: SheetPageSize, resolution: 'standard' | 'high') => {
		const elements = elementIDs
			.map(id => document.getElementById(id))
			.filter(element => !!element);

		if (elements.length === 0) {
			return;
		}
		let dpi = 150;
		let scale = 1;
		if (resolution === 'high') {
			dpi = 600;
			scale = 4;
		} else {
			dpi = 300;
			scale = 2;
		}

		return Promise.all(elements.map(e => this.elementToImage(e, scale)))
			.then(images => {
				Utils.savePdfPages(`${filename}.pdf`, images, pdfPaperSize, dpi);
			});
	};

	static saveFile = (data: unknown, name: string, type: string) => {
		const json = JSON.stringify(data, null, '\t');
		const blob = new Blob([ json ], { type: 'application/octet-stream' });

		const a = document.createElement('a');
		a.download = `${name}.ds-${type}`;
		a.href = window.URL.createObjectURL(blob);
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
	};

	static saveImage = (filename: string, canvas: HTMLCanvasElement) => {
		const a = document.createElement('a');
		a.download = filename;
		a.href = canvas.toDataURL('image/png').replace(/^data:image\/png/, 'data:application/octet-stream');
		a.click();
	};

	static savePdfPages = async (filename: string, pageCanvases: HTMLImageElement[], pdfPaperSize: SheetPageSize, dpi: number) => {
		const width1 = pageCanvases[0].width || 0;
		const height1 = pageCanvases[0].height || 0;
		const documentOrientation = (height1 >= width1) ? 'portrait' : 'landscape';
		const paperSize = pdfPaperSize.toString().toLowerCase();

		// @ts-expect-error Undocumented
		const pdf = new jspdf({
			orientation: documentOrientation,
			unit: (72 / dpi), // undocumented feature to set arbitrary dpi, see: https://github.com/parallax/jsPDF/issues/1204#issuecomment-1291015995
			format: paperSize,
			hotfixes: [ 'px_scaling' ]
		});
		pageCanvases.forEach((canvas, n) => {
			const orientation = (canvas.height >= canvas.width) ? 'portrait' : 'landscape';
			const page = (n === 0) ? pdf : pdf.addPage(paperSize, orientation);
			page.addImage(canvas, 'PNG', 0, 0, canvas.width, canvas.height, undefined, 'FAST');
		});
		pdf.setDocumentProperties({
			title: filename.slice(0, -4),
			subject: 'Forge Steel Hero sheet',
			creator: 'Forge Steel'
		});
		pdf.save(filename);
	};

	static isNullOrEmpty = (str: string | null | undefined) => {
		return (str === null || str === undefined || str.trim() === '');
	};

	// Returns the given default if the value is:
	//    - null
	//    - undefined
	//    - an empty string
	//    - ZERO (0)
	// Otherwise, returns the value as a string.
	static valueOrDefault = (value: string | number | null | undefined, defaultValue: string): string => {
		let result = defaultValue;

		if (value && !Utils.isNullOrEmpty(value.toString())) {
			result = value.toString();
		}

		return result;
	};

	static fixHostnameUrl = (value: string) => {
		return value.toLowerCase().replace(/\/+$/, '');
	};

	static getErrorMessage = (error: unknown): string => {
		if (error instanceof Error) {
			return error.message;
		}
		return String(error);
	};
}
