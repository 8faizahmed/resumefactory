import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import { ResumeData } from '@/types/resume';
import { ModernTemplate } from '@/app/components/templates/ModernTemplate';
import { ClassicTemplate } from '@/app/components/templates/ClassicTemplate';
import { CreativeTemplate } from '@/app/components/templates/CreativeTemplate';

// FORCE NODE.JS RUNTIME
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { renderToStaticMarkup } = await import('react-dom/server');

    const { data, theme, settings }: { 
      data: ResumeData; 
      theme: 'modern' | 'classic' | 'creative';
      settings: { educationFirst: boolean } 
    } = await req.json();

    let Component;
    let pageMargin = "0.5in"; 
    let extraCss = "";

    switch (theme) {
      case 'classic': 
        Component = ClassicTemplate; 
        break;
      case 'creative': 
        Component = CreativeTemplate; 
        pageMargin = "0"; 
        extraCss = `
          body {
            background: linear-gradient(to right, #0f172a 0%, #0f172a 32%, white 32%, white 100%);
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        `;
        break;
      case 'modern':
      default: 
        Component = ModernTemplate; 
        break;
    }

    const resumeHtml = renderToStaticMarkup(<Component data={data} educationFirst={settings?.educationFirst} />);

    const fullHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <script src="https://cdn.tailwindcss.com"></script>
          <script>
            tailwind.config = {
              theme: {
                extend: {
                  colors: {
                    slate: { 900: '#0f172a' }
                  }
                }
              }
            }
          </script>
          <style>
            @page { 
              size: Letter; 
              margin: ${pageMargin}; 
            }
            body { 
              margin: 0; 
              font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
              -webkit-print-color-adjust: exact;
            }
            
            p, li { orphans: 3; widows: 3; }
            h1, h2, h3 { break-after: avoid; }
            
            ${extraCss}
          </style>
        </head>
        <body>
          ${resumeHtml}
        </body>
      </html>
    `;

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    await page.setContent(fullHtml, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'Letter',
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' } 
    });

    await browser.close();

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${data.personalInfo.name.replace(/\s+/g, '_')}_Resume.pdf"`,
      },
    });

  } catch (error) {
    console.error("PDF Gen Error:", error);
    return NextResponse.json({ error: 'PDF Generation Failed' }, { status: 500 });
  }
}