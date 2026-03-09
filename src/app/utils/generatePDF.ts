import jsPDF from 'jspdf';
import { Product, Option } from '@/app/lib/api';
import { WizardState } from '@/app/hooks/useWizardState';
import { trackPDFDownload } from '@/app/utils/analytics';
import { getLogoBase64 } from '@/app/utils/logoBase64';

export interface GeneratePDFOptions {
  wizardState: WizardState;
  matchedProducts: Product[];
  applications: Option[];
  technologies: Option[];
  actions: Option[];
  environments: Option[];
  features: Option[];
  duties: Option[];
  consoleStyles: Option[];
  pedalCounts: Option[];
  medicalTechnicalFeatures: Option[];
  accessories: Option[];
}

// Wrap long text and return how many lines were used
function drawWrappedText(doc: jsPDF, text: string, x: number, y: number, maxWidth: number, lineHeight: number): number {
  const lines = doc.splitTextToSize(text, maxWidth) as string[];
  lines.forEach((line: string, i: number) => {
    doc.text(line, x, y + i * lineHeight);
  });
  return lines.length;
}

// Draw a label: value row in a clean two-column format
function drawRow(doc: jsPDF, label: string, value: string, y: number, contentWidth: number): number {
  const labelX = 20;
  const valueX = 80;
  const maxValueWidth = contentWidth - (valueX - 15);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(label, labelX, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(30, 30, 30);
  const lines = drawWrappedText(doc, value, valueX, y, maxValueWidth, 4.5);

  return Math.max(1, lines) * 4.5 + 3; // row height + padding
}

export async function generatePDF(opts: GeneratePDFOptions) {
  const { wizardState, matchedProducts, applications, technologies, actions, environments, features, duties } = opts;

  const isCustomBuilder = wizardState.flow === 'medical' && wizardState.selectedMedicalPath === 'custom';

  trackPDFDownload(wizardState.flow, {
    application: wizardState.selectedApplication,
    technology: wizardState.selectedTechnology,
    action: wizardState.selectedAction,
    environment: wizardState.selectedEnvironment,
    features: wizardState.selectedFeatures,
  });

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const contentWidth = pageWidth - 30; // 15mm margins

  // Header with logo
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageWidth, 30, 'F');

  // Logo — original is 1323x496, render at ~50x19mm in the header
  const logoW = 50;
  const logoH = logoW * (496 / 1323);
  const logoBase64 = await getLogoBase64();
  doc.addImage(logoBase64, 'PNG', 15, 3, logoW, logoH);

  // Subtitle below logo
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  const subtitle = isCustomBuilder
    ? 'Custom Switch Builder Configuration'
    : wizardState.flow === 'medical'
      ? 'Medical Product Specifications'
      : 'Product Finder Results';
  doc.text(subtitle, 15, 24);

  // Accent line under header
  doc.setDrawColor(99, 102, 241);
  doc.setLineWidth(0.8);
  doc.line(15, 28, pageWidth - 15, 28);

  // Date on right
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  doc.setFontSize(9);
  doc.setTextColor(130, 130, 130);
  doc.text(`Generated: ${date}`, pageWidth - 15, 24, { align: 'right' });

  doc.setTextColor(0, 0, 0);
  let yPos = 36;

  // ── "Not a quote" disclaimer ──
  if (isCustomBuilder) {
    doc.setFillColor(255, 250, 240);
    doc.setDrawColor(220, 160, 60);
    doc.setLineWidth(0.3);
    doc.roundedRect(15, yPos, contentWidth, 12, 2, 2, 'FD');
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(140, 90, 20);
    doc.text('NOTE: This document is not a quote.', 20, yPos + 5);
    doc.setFont('helvetica', 'normal');
    doc.text('It is a summary of your configuration selections. Please contact our engineering team for pricing and availability.', 20, yPos + 9.5);
    doc.setTextColor(0, 0, 0);
    yPos += 18;
  }

  // ── Requirements Section ──
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 30, 30);
  doc.text('Your Configuration', 15, yPos);
  yPos += 3;

  // Thin separator line
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(15, yPos, pageWidth - 15, yPos);
  yPos += 6;

  if (isCustomBuilder) {
    // Custom switch builder — clean table rows
    const builderRows: [string, string][] = [
      ['Channel', wizardState.selectedChannel === 'crescent' ? 'Crescent Channel' : 'Aero Channel'],
      ['Pedal Design', wizardState.selectedPedalDesign === 'single' ? 'Single Pedal' : wizardState.selectedPedalDesign === 'twin' ? 'Twin Pedal' : 'Triple Pedal'],
      ['Buttons', wizardState.selectedButtonCount],
      ['Output Type', wizardState.selectedOutputType === 'on_off' ? 'On / Off' : 'Variable Output'],
      ['Connection', wizardState.selectedWiredWireless === 'wired' ? 'Wired' : 'Wireless'],
      ['Toe Loop', wizardState.selectedToeLoop === 'yes' ? 'Yes' : 'No'],
    ];
    if (wizardState.selectedChannel === 'aero' && wizardState.selectedTreadleType) {
      builderRows.push(['Treadle Type', wizardState.selectedTreadleType === 'flip_up' ? 'Flip Up' : 'Aquiline']);
    }
    builderRows.push(
      ['Custom Labeling', wizardState.selectedCustomLabeling === 'yes' ? 'Yes' : 'No'],
      ['LEDs', wizardState.selectedLEDs === 'yes' ? 'Yes' : 'No'],
    );

    // Draw alternating row backgrounds for readability
    builderRows.forEach(([label, value], idx) => {
      if (!value) return;
      if (idx % 2 === 0) {
        doc.setFillColor(248, 248, 252);
        doc.rect(15, yPos - 4, contentWidth, 8, 'F');
      }
      yPos += drawRow(doc, label, value, yPos, contentWidth);
    });

  } else if (wizardState.flow === 'medical') {
    // Medical stock path
    const rows: [string, string][] = [];
    if (wizardState.selectedConsoleStyle) rows.push(['Console Style', wizardState.selectedConsoleStyle]);
    if (wizardState.selectedPedalCount) rows.push(['Pedal Config', wizardState.selectedPedalCount]);
    if (wizardState.selectedMedicalFeatures.length > 0) rows.push(['Technical Features', wizardState.selectedMedicalFeatures.join(', ')]);
    if (wizardState.selectedAccessories.length > 0) rows.push(['Accessories', wizardState.selectedAccessories.join(', ')]);
    if (wizardState.selectedAction) {
      const actionLabel = actions.find(a => a.id === wizardState.selectedAction)?.label || wizardState.selectedAction;
      rows.push(['Action Type', actionLabel]);
    }
    if (wizardState.selectedEnvironment) {
      const envLabel = environments.find(e => e.id === wizardState.selectedEnvironment)?.label || wizardState.selectedEnvironment;
      rows.push(['Environment', envLabel]);
    }

    rows.forEach(([label, value], idx) => {
      if (idx % 2 === 0) {
        doc.setFillColor(248, 248, 252);
        doc.rect(15, yPos - 4, contentWidth, 8, 'F');
      }
      yPos += drawRow(doc, label, value, yPos, contentWidth);
    });

  } else {
    // Standard flow
    const appLabel = applications.find(a => a.id === wizardState.selectedApplication)?.label || wizardState.selectedApplication;
    const techLabel = technologies.find(t => t.id === wizardState.selectedTechnology)?.label || wizardState.selectedTechnology;
    const actionLabel = actions.find(a => a.id === wizardState.selectedAction)?.label || wizardState.selectedAction;
    const envLabel = environments.find(e => e.id === wizardState.selectedEnvironment)?.label || wizardState.selectedEnvironment;

    const rows: [string, string][] = [
      ['Application', appLabel],
      ['Technology', techLabel],
      ['Action Type', actionLabel],
      ['Environment', envLabel],
    ];

    if (wizardState.selectedDuty) {
      const dutyLabel = duties.find(d => d.id === wizardState.selectedDuty)?.label || wizardState.selectedDuty;
      rows.push(['Duty Class', dutyLabel]);
    }
    if (wizardState.selectedMaterial) rows.push(['Material', wizardState.selectedMaterial]);
    if (wizardState.selectedConnection) rows.push(['Connection', wizardState.selectedConnection]);
    if (wizardState.selectedGuard) rows.push(['Safety Guard', wizardState.selectedGuard === 'yes' ? 'Required' : 'Not needed']);
    if (wizardState.selectedFeatures.length > 0) {
      const featureLabels = wizardState.selectedFeatures
        .map(fId => features.find(f => f.id === fId)?.label || fId)
        .join(', ');
      rows.push(['Features', featureLabels]);
    }

    rows.forEach(([label, value], idx) => {
      if (idx % 2 === 0) {
        doc.setFillColor(248, 248, 252);
        doc.rect(15, yPos - 4, contentWidth, 8, 'F');
      }
      yPos += drawRow(doc, label, value, yPos, contentWidth);
    });
  }

  // ── Matched Products Section (skip for custom builder) ──
  if (!isCustomBuilder && matchedProducts.length > 0) {
    yPos += 6;

    doc.setFillColor(240, 245, 255);
    doc.rect(15, yPos, contentWidth, 8, 'F');
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(99, 102, 241);
    doc.text(`Recommended Products (${matchedProducts.length})`, 20, yPos + 5.5);
    yPos += 14;

    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');

    matchedProducts.slice(0, 5).forEach((product, idx) => {
      if (yPos > 240) {
        doc.addPage();
        yPos = 20;
      }

      // Product title
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 30, 30);
      const title = product.part_number ? `${product.series} (#${product.part_number})` : product.series;
      doc.text(`${idx + 1}. ${title}`, 20, yPos);
      yPos += 6;

      // Description — wrap to avoid overlap
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 80);
      const descLines = drawWrappedText(doc, product.description, 25, yPos, contentWidth - 15, 4);
      yPos += descLines * 4 + 2;

      // Specifications — each on its own line to avoid overlap
      doc.setFontSize(8.5);
      doc.setTextColor(60, 60, 60);
      doc.text(`IP Rating: ${product.ip}  |  Duty: ${product.duty}  |  Material: ${product.material}`, 25, yPos);
      yPos += 4.5;

      if (product.connector_type && product.connector_type !== 'undefined') {
        doc.text(`Connection: ${product.connector_type.replace(/-/g, ' ')}`, 25, yPos);
        yPos += 4.5;
      }

      if (product.features && product.features.length > 0) {
        doc.text(`Features: ${product.features.join(', ')}`, 25, yPos);
        yPos += 4.5;
      }

      doc.setTextColor(99, 102, 241);
      doc.setFontSize(8);
      doc.text(product.link, 25, yPos);
      doc.setTextColor(0, 0, 0);
      yPos += 7;

      // Separator between products
      if (idx < Math.min(matchedProducts.length, 5) - 1) {
        doc.setDrawColor(230, 230, 230);
        doc.setLineWidth(0.2);
        doc.line(25, yPos - 2, pageWidth - 25, yPos - 2);
        yPos += 2;
      }
    });

    if (matchedProducts.length > 5) {
      yPos += 2;
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text(`+ ${matchedProducts.length - 5} more products available`, 20, yPos);
      yPos += 6;
    }
  }

  // Medical Certification Badge
  if (wizardState.flow === 'medical') {
    yPos += 8;
    if (yPos > 240) {
      doc.addPage();
      yPos = 20;
    }
    doc.setFillColor(254, 242, 242);
    doc.roundedRect(15, yPos, contentWidth, 18, 2, 2, 'F');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(220, 38, 38);
    doc.text('ISO Certified Manufacturing', 20, yPos + 7);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('FDA 510(k) Clearance Experience Available', 20, yPos + 13);
    doc.setTextColor(0, 0, 0);
  }

  // Footer
  const footerY = 280;
  doc.setFillColor(245, 245, 245);
  doc.rect(0, footerY, pageWidth, 17, 'F');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(60, 60, 60);
  doc.text('Linemaster Switch Corporation', 15, footerY + 5);

  doc.setFont('helvetica', 'normal');
  doc.text('Tel: (860) 974-1000 | linemaster.com', 15, footerY + 10);

  doc.setTextColor(99, 102, 241);
  doc.text('Contact us: linemaster.com/contact/', 15, footerY + 15);

  const filename = isCustomBuilder
    ? `linemaster-custom-config-${Date.now()}.pdf`
    : `linemaster-${wizardState.flow}-specifications-${Date.now()}.pdf`;
  doc.save(filename);
}
