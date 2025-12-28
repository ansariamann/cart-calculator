import jsPDF from 'jspdf';
import { GroceryItem, BillCalculation } from '@/types/grocery';

export const generateReceiptPDF = (
  items: GroceryItem[],
  calculation: BillCalculation,
  storeName: string = 'QuickMart'
) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [80, 200] // Receipt-style dimensions
  });

  const pageWidth = 80;
  let y = 10;

  // Header
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(storeName, pageWidth / 2, y, { align: 'center' });
  y += 6;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('RECEIPT', pageWidth / 2, y, { align: 'center' });
  y += 4;

  // Date and time
  const now = new Date();
  const dateStr = now.toLocaleDateString();
  const timeStr = now.toLocaleTimeString();
  doc.text(`${dateStr} ${timeStr}`, pageWidth / 2, y, { align: 'center' });
  y += 6;

  // Divider
  doc.setLineWidth(0.1);
  doc.line(5, y, pageWidth - 5, y);
  y += 4;

  // Items header
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('Item', 5, y);
  doc.text('Qty', 45, y, { align: 'center' });
  doc.text('Price', pageWidth - 5, y, { align: 'right' });
  y += 4;

  // Items
  doc.setFont('helvetica', 'normal');
  items.forEach((item) => {
    const itemTotal = item.quantity * item.price;
    
    // Item name (truncate if too long)
    let itemName = item.name;
    if (itemName.length > 20) {
      itemName = itemName.substring(0, 17) + '...';
    }
    
    doc.text(itemName, 5, y);
    doc.text(item.quantity.toString(), 45, y, { align: 'center' });
    doc.text(`$${itemTotal.toFixed(2)}`, pageWidth - 5, y, { align: 'right' });
    y += 4;
  });

  // Divider
  y += 2;
  doc.line(5, y, pageWidth - 5, y);
  y += 4;

  // Summary
  doc.setFontSize(8);
  
  // Subtotal
  doc.text('Subtotal:', 5, y);
  doc.text(`$${calculation.subtotal.toFixed(2)}`, pageWidth - 5, y, { align: 'right' });
  y += 4;

  // Discount
  if (calculation.discountAmount > 0) {
    doc.text(`Discount (${calculation.discountPercent}%):`, 5, y);
    doc.text(`-$${calculation.discountAmount.toFixed(2)}`, pageWidth - 5, y, { align: 'right' });
    y += 4;
  }

  // Tax
  doc.text(`Tax (${calculation.taxRate}%):`, 5, y);
  doc.text(`$${calculation.taxAmount.toFixed(2)}`, pageWidth - 5, y, { align: 'right' });
  y += 4;

  // Divider
  doc.line(5, y, pageWidth - 5, y);
  y += 4;

  // Total
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL:', 5, y);
  doc.text(`$${calculation.total.toFixed(2)}`, pageWidth - 5, y, { align: 'right' });
  y += 8;

  // Footer
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Thank you for shopping!', pageWidth / 2, y, { align: 'center' });
  y += 4;
  doc.text('Visit us again', pageWidth / 2, y, { align: 'center' });

  // Save the PDF
  doc.save(`QuickMart_Receipt_${now.toISOString().split('T')[0]}.pdf`);
};