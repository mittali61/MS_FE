import { Reporter, TestCase, TestResult, FullResult } from '@playwright/test/reporter';
import * as fs from 'fs';
import * as path from 'path';

class PortableReporter implements Reporter {
    private results: any[] = [];

    onTestEnd(test: TestCase, result: TestResult) {
        const screenshotAttachment = result.attachments.find(a => a.name === 'screenshot' || a.contentType === 'image/png');
        let base64Image = '';

        if (screenshotAttachment && screenshotAttachment.path) {
            try {
                // Read the image file and convert to Base64 string
                const buffer = fs.readFileSync(screenshotAttachment.path);
                base64Image = `data:image/png;base64,${buffer.toString('base64')}`;
            } catch (e) {
                console.error('Could not read screenshot:', e);
            }
        }

        this.results.push({
            name: test.title,
            status: result.status.toUpperCase(),
            duration: (result.duration / 1000).toFixed(2),
            error: result.error ? result.error.message : '',
            image: base64Image,
            annotations: test.annotations || []
        });
    }

    async onEnd(result: FullResult) {
        const reportDir = path.join(process.cwd(), 'reports');
        if (!fs.existsSync(reportDir)) {
            fs.mkdirSync(reportDir);
        }

        const fileName = `test-report-${Date.now()}.html`;
        const filePath = path.join(reportDir, fileName);

        const envVars = {
            'Base URL': process.env.BASE_URL || process.env.E2E_BASE_URL || 'N/A',
            'Organization Slug': process.env.E2E_SLUG || 'N/A',
            'User Email': process.env.E2E_USER_EMAIL || 'N/A',
            'Environment': process.env.CI ? 'CI / GitHub Actions' : 'Local / Development',
            'Platform': process.platform
        };

        const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>QA Test Execution Report</title>
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 15px; background: #f0f2f5; color: #1a1f36; line-height: 1.4; font-size: 11px; }
                header { background: linear-gradient(135deg, #5469d4 0%, #3f51b5 100%); color: white; padding: 16px 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
                h1 { margin: 0; font-size: 18px; font-weight: 800; letter-spacing: -0.02em; }
                .env-info { background: white; padding: 12px 16px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.06); border-left: 4px solid #5469d4; }
                .env-info h3 { margin: 0 0 8px 0; font-size: 11px; color: #4b5563; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px; }
                .env-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px; }
                .env-item { font-size: 10px; }
                .env-label { font-weight: 700; color: #6b7280; margin-right: 6px; }
                .env-value { color: #111827; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
                
                table { width: 100%; border-collapse: separate; border-spacing: 0; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 1px solid #e5e7eb; }
                th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #e5e7eb; vertical-align: top; }
                th { background-color: #f9fafb; color: #374151; text-transform: uppercase; font-size: 9px; font-weight: 700; letter-spacing: 0.05em; border-bottom: 2px solid #e5e7eb; }
                .status-PASSED { display: inline-flex; align-items: center; padding: 2px 8px; background-color: #ecfdf5; color: #065f46; border-radius: 9999px; font-size: 10px; font-weight: 700; }
                .status-FAILED { display: inline-flex; align-items: center; padding: 2px 8px; background-color: #fef2f2; color: #991b1b; border-radius: 9999px; font-size: 10px; font-weight: 700; }
                .screenshot { width: 100%; max-height: 180px; object-fit: contain; border-radius: 6px; border: 1px solid #e5e7eb; box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
                pre { background: #fee2e2; padding: 8px; border-radius: 6px; color: #b91c1c; font-size: 9px; white-space: pre-wrap; margin: 0; border: 1px solid #fecaca; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
                .case-name { font-weight: 700; color: #111827; font-size: 12px; margin-bottom: 2px; }
                .case-id { color: #6b7280; font-size: 10px; display: flex; align-items: center; gap: 3px; }
                .annotation { margin-top: 6px; padding: 6px 10px; background: #f3f4f6; border-radius: 4px; border: 1px solid #e5e7eb; font-size: 10px; }
                .annotation-title { font-weight: 800; color: #4b5563; font-size: 9px; text-transform: uppercase; margin-bottom: 1px; }
                .annotation-warning { background: #fffbeb; border-color: #fdf6b2; }
                .annotation-warning .annotation-title { color: #92400e; }
                .annotation-passed { background: #ecfdf5; border-color: #a7f3d0; }
                .annotation-passed .annotation-title { color: #065f46; }
                .annotation-failed { background: #fef2f2; border-color: #fecaca; }
                .annotation-failed .annotation-title { color: #991b1b; }
                .ticket-badge { display: inline-flex; align-items: center; margin-top: 6px; padding: 2px 8px; background: #eff6ff; color: #1e40af; border: 1px solid #bfdbfe; border-radius: 4px; font-size: 10px; font-weight: 700; text-decoration: none; transition: background 0.2s; }
                
                .summary-dashboard { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 20px; }
                .summary-card { background: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.06); text-align: left; border: 1px solid #e5e7eb; }
                .summary-card h3 { margin: 0; font-size: 10px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700; }
                .summary-card p { margin: 4px 0 0; font-size: 22px; font-weight: 800; color: #111827; }
                .card-passed { border-bottom: 3px solid #10b981; }
                .card-passed p { color: #059669; }
                .card-failed { border-bottom: 3px solid #ef4444; }
                .card-failed p { color: #dc2626; }
            </style>
        </head>
        <body>
            <header>
                <h1>Execution Summary</h1>
                <p style="margin-top: 8px; opacity: 0.9; font-weight: 500;">Status: ${result.status.toUpperCase()} | Generated: ${new Date().toLocaleString()}</p>
            </header>

            <div class="env-info">
                <h3>Environment Configuration</h3>
                <div class="env-grid">
                    ${Object.entries(envVars).map(([key, value]) => `
                        <div class="env-item">
                            <span class="env-label">${key}:</span>
                            <span class="env-value">${value}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="summary-dashboard">
                <div class="summary-card">
                    <h3>Total Tests</h3>
                    <p>${this.results.length}</p>
                </div>
                <div class="summary-card card-passed">
                    <h3>Passed</h3>
                    <p>${this.results.filter(r => r.status === 'PASSED').length}</p>
                </div>
                <div class="summary-card card-failed">
                    <h3>Failed</h3>
                    <p>${this.results.filter(r => r.status === 'FAILED' || r.status === 'TIMEDOUT').length}</p>
                </div>
            </div>
            <table>
                <thead>
                    <tr>
                        <th style="width: 30%">Test Case</th>
                        <th style="width: 10%">Status</th>
                        <th style="width: 8%">Duration</th>
                        <th style="width: 15%">Notes/Warnings</th>
                        <th style="width: 17%">Error Details</th>
                        <th style="width: 20%">Screenshot</th>
                    </tr>
                </thead>
                <tbody>
                    ${this.results.map(r => {
            const tcAnnotation = r.annotations?.find((a: any) => a.type === 'TC');
            const otherAnnotations = r.annotations?.filter((a: any) => a.type !== 'TC');
            const jiraBaseUrl = 'https://shorelineiot.atlassian.net/browse/';

            return `
                        <tr>
                            <td>
                                <div class="case-name">${r.name}</div>
                                ${tcAnnotation ? `<div class="case-id"> <a href="${jiraBaseUrl}${tcAnnotation.description}" target="_blank" class="ticket-badge">🔗 ${tcAnnotation.description}</a></div>` : ''}
                            </td>
                            <td><span class="status-${r.status}">${r.status}</span></td>
                            <td style="font-weight: 600; color: #4b5563;">${r.duration}s</td>
                            <td>
                                ${otherAnnotations && otherAnnotations.length > 0
                    ? otherAnnotations.map((a: any) => {
                        let typeClass = 'annotation-warning';
                        let icon = '⚠️ ';
                        if (a.type === 'Step Passed') {
                            typeClass = 'annotation-passed';
                            icon = '✅ ';
                        } else if (a.type === 'Step Failed') {
                            typeClass = 'annotation-failed';
                            icon = '❌ ';
                        }
                        return `
                                        <div class="annotation ${typeClass}">
                                            <div class="annotation-title">${icon}${a.type}</div>
                                            <div>${a.description}</div>
                                        </div>
                                    `;
                    }).join('')
                    : '<span style="color: #9ca3af;">-</span>'}
                            </td>
                            <td>${r.error ? `<pre>${r.error}</pre>` : '<span style="color: #9ca3af;">-</span>'}</td>
                            <td>
                                ${r.image ? `<img src="${r.image}" class="screenshot">` : '<span style="color: #9ca3af; font-size: 11px;">NO SCREENSHOT</span>'}
                            </td>
                        </tr>
                    `;
        }).join('')}
                </tbody>
            </table>
        </body>
        </html>`;

        // fs.writeFileSync(filePath, html);

        // Generate PDF from the HTML
        const pdfPath = filePath.replace('.html', '.pdf');
        try {
            const { chromium } = require('@playwright/test');
            const browser = await chromium.launch();
            const page = await browser.newPage();

            // Set content and wait for images to load
            await page.setContent(html, { waitUntil: 'networkidle' });

            await page.pdf({
                path: pdfPath,
                format: 'A4',
                printBackground: true,
                displayHeaderFooter: false,
                margin: { top: '10mm', bottom: '10mm', left: '10mm', right: '10mm' }
            });

            await browser.close();
            console.log(`\n📄 Professional PDF Report Generated: ${pdfPath}`);

            // Automatically open the PDF report
            const { exec } = require('child_process');
            const start = (process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open');
            exec(`${start} "${pdfPath}"`);
        } catch (error) {
            console.error('Failed to generate PDF report:', error);
            // Fallback: open HTML if PDF fails
            const { exec } = require('child_process');
            const start = (process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open');
            exec(`${start} "${filePath}"`);
        }
    }
}

export default PortableReporter;
