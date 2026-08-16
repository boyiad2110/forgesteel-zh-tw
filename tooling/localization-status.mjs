import { createServer } from 'vite';

const json = process.argv.slice(2).includes('--json');
const server = await createServer({ appType: 'custom', server: { hmr: false, middlewareMode: true } });

try {
	const { getLiveLocalizationStatusReport } = await server.ssrLoadModule('/tooling/localization-status-live.ts');
	const { formatLocalizationStatusReport } = await server.ssrLoadModule('/tooling/localization-status-report.ts');
	const report = getLiveLocalizationStatusReport();

	console.log(json ? JSON.stringify(report, null, 2) : formatLocalizationStatusReport(report));
	if (!report.integrityHealthy) {
		process.exitCode = 1;
	}
} finally {
	await server.close();
}
