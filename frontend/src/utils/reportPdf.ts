import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCentsToMXN } from './money';
import type {
  PaymentMethodBreakdown,
  SalesByDay,
  SalesSummary,
  TopProduct,
} from '../features/reports/reports.service';

const PRIMARY: [number, number, number] = [34, 49, 74]; // #22314a
const ACCENT: [number, number, number] = [181, 100, 74]; // #b5644a
const MUTED: [number, number, number] = [107, 111, 118];

interface ReportData {
  summary: SalesSummary;
  byDay: SalesByDay[];
  topProducts: TopProduct[];
  paymentMethods: PaymentMethodBreakdown[];
  range?: { from?: string; to?: string };
}

const PAYMENT_LABEL: Record<string, string> = { CASH: 'Efectivo', CARD: 'Tarjeta' };

export function generateSalesReportPdf(data: ReportData): void {
  const doc = new jsPDF({ unit: 'pt', format: 'letter' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginX = 40;
  let cursorY = 50;

  // Encabezado
  doc.setFillColor(...PRIMARY);
  doc.rect(0, 0, pageWidth, 90, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('BeatStore', marginX, 40);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text('Reporte de ventas', marginX, 60);

  const rangeLabel = data.range?.from || data.range?.to
    ? `Periodo: ${data.range?.from ?? 'inicio'} — ${data.range?.to ?? 'hoy'}`
    : 'Periodo: histórico completo';
  doc.setFontSize(9);
  doc.text(rangeLabel, marginX, 76);
  doc.text(
    `Generado: ${new Date().toLocaleString('es-MX')}`,
    pageWidth - marginX,
    76,
    { align: 'right' },
  );

  cursorY = 120;

  // Resumen
  doc.setTextColor(...PRIMARY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('Resumen general', marginX, cursorY);
  cursorY += 10;

  const summaryRows: [string, string][] = [
    ['Ventas totales', String(data.summary.totalSales)],
    ['Ingresos', formatCentsToMXN(data.summary.totalRevenueInCents)],
    ['Descuentos otorgados', formatCentsToMXN(data.summary.totalDiscountInCents)],
    ['Artículos vendidos', String(data.summary.totalItemsSold)],
    ['Total reembolsado', formatCentsToMXN(data.summary.totalRefundedInCents)],
  ];

  autoTable(doc, {
    startY: cursorY,
    margin: { left: marginX, right: marginX },
    theme: 'plain',
    styles: { fontSize: 10, cellPadding: 4 },
    columnStyles: { 0: { fontStyle: 'bold', textColor: MUTED }, 1: { halign: 'right' } },
    body: summaryRows,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cursorY = (doc as any).lastAutoTable.finalY + 25;

  // Ventas por día
  if (data.byDay.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(...PRIMARY);
    doc.text('Ventas por día', marginX, cursorY);

    autoTable(doc, {
      startY: cursorY + 10,
      margin: { left: marginX, right: marginX },
      head: [['Día', 'Ventas', 'Ingresos']],
      body: data.byDay.map((d) => [
        d.date,
        String(d.totalSales),
        formatCentsToMXN(d.totalRevenueInCents),
      ]),
      headStyles: { fillColor: PRIMARY, textColor: 255 },
      styles: { fontSize: 9, cellPadding: 5 },
      alternateRowStyles: { fillColor: [244, 242, 238] },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cursorY = (doc as any).lastAutoTable.finalY + 25;
  }

  // Salto de página si no cabe lo siguiente
  const pageHeight = doc.internal.pageSize.getHeight();
  if (cursorY > pageHeight - 180) {
    doc.addPage();
    cursorY = 50;
  }

  // Productos más vendidos
  if (data.topProducts.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(...PRIMARY);
    doc.text('Productos más vendidos', marginX, cursorY);

    autoTable(doc, {
      startY: cursorY + 10,
      margin: { left: marginX, right: marginX },
      head: [['Producto', 'Cantidad vendida', 'Ingresos']],
      body: data.topProducts.map((p) => [
        p.name,
        String(p.quantitySold),
        formatCentsToMXN(p.revenueInCents),
      ]),
      headStyles: { fillColor: ACCENT, textColor: 255 },
      styles: { fontSize: 9, cellPadding: 5 },
      alternateRowStyles: { fillColor: [244, 242, 238] },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cursorY = (doc as any).lastAutoTable.finalY + 25;
  }

  if (data.paymentMethods.length > 0) {
    const pageHeight2 = doc.internal.pageSize.getHeight();
    if (cursorY > pageHeight2 - 140) {
      doc.addPage();
      cursorY = 50;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(...PRIMARY);
    doc.text('Métodos de pago', marginX, cursorY);

    autoTable(doc, {
      startY: cursorY + 10,
      margin: { left: marginX, right: marginX },
      head: [['Método', 'Operaciones', 'Total']],
      body: data.paymentMethods.map((m) => [
        PAYMENT_LABEL[m.method] ?? m.method,
        String(m.count),
        formatCentsToMXN(m.totalInCents),
      ]),
      headStyles: { fillColor: PRIMARY, textColor: 255 },
      styles: { fontSize: 9, cellPadding: 5 },
      alternateRowStyles: { fillColor: [244, 242, 238] },
    });
  }

  const fileDate = new Date().toISOString().slice(0, 10);
  doc.save(`beatstore-reporte-ventas-${fileDate}.pdf`);
}
