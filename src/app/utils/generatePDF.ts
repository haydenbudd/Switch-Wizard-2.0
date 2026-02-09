import jsPDF from 'jspdf';
import { Product, Option } from '@/app/lib/api';
import { WizardState } from '@/app/hooks/useWizardState';
import { trackPDFDownload } from '@/app/utils/analytics';

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

export function generatePDF(opts: GeneratePDFOptions) {
  const { wizardState, matchedProducts, applications, technologies, actions, environments, features, duties, consoleStyles, pedalCounts, medicalTechnicalFeatures, accessories } = opts;

  trackPDFDownload(wizardState.flow, {
    application: wizardState.selectedApplication,
    technology: wizardState.selectedTechnology,
    action: wizardState.selectedAction,
    environment: wizardState.selectedEnvironment,
    features: wizardState.selectedFeatures,
  });

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Enhanced Header with gradient effect
  doc.setFillColor(99, 102, 241); // Indigo
  doc.rect(0, 0, pageWidth, 25, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('LINEMASTER', 15, 12);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  const subtitle = wizardState.flow === 'medical' ? 'Medical Product Specifications' : 'Product Finder Results';
  doc.text(subtitle, 15, 20);

  // Add date
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  doc.setFontSize(9);
  doc.text(`Generated: ${date}`, pageWidth - 15, 20, { align: 'right' });

  doc.setTextColor(0, 0, 0);
  let yPos = 35;

  // Requirements Section
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Your Requirements', 15, yPos);
  yPos += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  if (wizardState.flow === 'medical') {
    doc.text(`Console Style: ${wizardState.selectedConsoleStyle}`, 20, yPos);
    yPos += 6;
    doc.text(`Pedal Configuration: ${wizardState.selectedPedalCount}`, 20, yPos);
    yPos += 6;
    if (wizardState.selectedMedicalFeatures.length > 0) {
      doc.text(`Technical Features: ${wizardState.selectedMedicalFeatures.join(', ')}`, 20, yPos);
      yPos += 6;
    }
    if (wizardState.selectedAccessories.length > 0) {
      doc.text(`Accessories: ${wizardState.selectedAccessories.join(', ')}`, 20, yPos);
      yPos += 6;
    }
  } else {
    const appLabel = applications.find(a => a.id === wizardState.selectedApplication)?.label || wizardState.selectedApplication;
    const techLabel = technologies.find(t => t.id === wizardState.selectedTechnology)?.label || wizardState.selectedTechnology;
    const actionLabel = actions.find(a => a.id === wizardState.selectedAction)?.label || wizardState.selectedAction;
    const envLabel = environments.find(e => e.id === wizardState.selectedEnvironment)?.label || wizardState.selectedEnvironment;

    doc.text(`Application: ${appLabel}`, 20, yPos);
    yPos += 6;
    doc.text(`Technology: ${techLabel}`, 20, yPos);
    yPos += 6;
    doc.text(`Action Type: ${actionLabel}`, 20, yPos);
    yPos += 6;
    doc.text(`Environment: ${envLabel}`, 20, yPos);
    yPos += 6;

    if (wizardState.selectedDuty) {
      const dutyLabel = duties.find(d => d.id === wizardState.selectedDuty)?.label || wizardState.selectedDuty;
      doc.text(`Duty Class: ${dutyLabel}`, 20, yPos);
      yPos += 6;
    }

    if (wizardState.selectedMaterial) {
      doc.text(`Material: ${wizardState.selectedMaterial}`, 20, yPos);
      yPos += 6;
    }

    if (wizardState.selectedConnection) {
      doc.text(`Connection: ${wizardState.selectedConnection}`, 20, yPos);
      yPos += 6;
    }

    if (wizardState.selectedGuard) {
      doc.text(`Safety Guard: ${wizardState.selectedGuard === 'yes' ? 'Required' : 'Not needed'}`, 20, yPos);
      yPos += 6;
    }

    if (wizardState.selectedFeatures.length > 0) {
      const featureLabels = wizardState.selectedFeatures
        .map(fId => features.find(f => f.id === fId)?.label || fId)
        .join(', ');
      doc.text(`Additional Features: ${featureLabels}`, 20, yPos);
      yPos += 6;
    }
  }

  // Matched Products Section
  yPos += 5;

  if (matchedProducts.length > 0) {
    doc.setFillColor(240, 245, 255);
    doc.rect(15, yPos, pageWidth - 30, 8, 'F');
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(99, 102, 241);
    doc.text(`Recommended Products (${matchedProducts.length})`, 20, yPos + 5.5);
    yPos += 12;

    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');

    matchedProducts.slice(0, 5).forEach((product, idx) => {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      const title = product.part_number ? `${product.series} (#${product.part_number})` : product.series;
      doc.text(`${idx + 1}. ${title}`, 20, yPos);
      yPos += 5;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`${product.description}`, 25, yPos);
      yPos += 5;

      // Specifications in columns
      doc.text(`IP Rating: ${product.ip}`, 25, yPos);
      doc.text(`Duty: ${product.duty}`, 80, yPos);
      doc.text(`Material: ${product.material}`, 135, yPos);
      yPos += 5;

      if (product.connector_type && product.connector_type !== 'undefined') {
        doc.text(`Connection: ${product.connector_type.replace(/-/g, ' ')}`, 25, yPos);
        yPos += 5;
      }

      if (product.features && product.features.length > 0) {
        doc.text(`Features: ${product.features.join(', ')}`, 25, yPos);
        yPos += 5;
      }

      doc.setTextColor(99, 102, 241);
      doc.text(`Learn more: ${product.link}`, 25, yPos);
      doc.setTextColor(0, 0, 0);
      yPos += 8;
    });

    if (matchedProducts.length > 5) {
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text(`+ ${matchedProducts.length - 5} more products available`, 20, yPos);
      yPos += 6;
    }
  }

  // Medical Certification Badge
  if (wizardState.flow === 'medical') {
    yPos += 5;
    if (yPos > 240) {
      doc.addPage();
      yPos = 20;
    }
    doc.setFillColor(254, 242, 242);
    doc.rect(15, yPos, pageWidth - 30, 20, 'F');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(220, 38, 38);
    doc.text('ISO Certified Manufacturing', 20, yPos + 7);
    doc.setFont('helvetica', 'normal');
    doc.text('FDA 510(k) Clearance Experience Available', 20, yPos + 14);
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

  doc.save(`linemaster-${wizardState.flow}-specifications-${Date.now()}.pdf`);
}
