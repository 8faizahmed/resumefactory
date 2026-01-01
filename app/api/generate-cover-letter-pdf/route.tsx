import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import { CoverLetterTemplate } from '@/app/components/templates/CoverLetterTemplate';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { renderToStaticMarkup } = await import('react-dom/server');
    const { personalInfo, content } = await req.json();

    const htmlContent = renderToStaticMarkup(
      <CoverLetterTemplate personalInfo={personalInfo} content={content} />
    );

    const fullHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @page { size: Letter; margin: 0; }
            body { margin: 0; -webkit-print-color-adjust: exact; }
          </style>
        </head>
        <body>
          ${htmlContent}
        </body>
      </html>
    `;

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(fullHtml, { waitUntil: 'networkidle0' });
    
    const pdfBuffer = await page.pdf({
      format: 'Letter',
      printBackground: true
    });

    await browser.close();

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Cover_Letter_${personalInfo.name.replace(/\s+/g, '_')}.pdf"`,
      },
    });

  } catch (error) {
    console.error("Cover Letter PDF Error:", error);
    return NextResponse.json({ error: 'Generation Failed' }, { status: 500 });
  }
}