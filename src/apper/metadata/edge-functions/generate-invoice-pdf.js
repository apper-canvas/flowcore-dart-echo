import apper from "https://cdn.apper.io/actions/apper-actions.js";
import jsPDF from "npm:jspdf";

export default apper.serve(async (req) => {
  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({
        success: false,
        error: 'Method not allowed'
      }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { order, customer } = await req.json();

    if (!order || !customer) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Order and customer data required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Create new PDF document
    const pdf = new jsPDF();
    
    // Set font
    pdf.setFont("helvetica");
    
    // Company Header
    pdf.setFontSize(20);
    pdf.setTextColor(40, 40, 40);
    pdf.text("FlowCore ERP", 20, 30);
    
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.text("1234 Business Street", 20, 40);
    pdf.text("Business City, BC 12345", 20, 45);
    pdf.text("Phone: (555) 123-4567", 20, 50);
    pdf.text("Email: billing@flowcore-erp.com", 20, 55);
    
    // Invoice Title
    pdf.setFontSize(24);
    pdf.setTextColor(37, 99, 235); // Primary blue
    pdf.text("INVOICE", 140, 30);
    
    // Invoice Details
    pdf.setFontSize(10);
    pdf.setTextColor(40, 40, 40);
    pdf.text(`Invoice #: INV-${order.orderNumber}`, 140, 45);
    pdf.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 140, 50);
    pdf.text(`Order #: ${order.orderNumber}`, 140, 55);
    
    // Bill To Section
    pdf.setFontSize(12);
    pdf.setTextColor(40, 40, 40);
    pdf.text("Bill To:", 20, 75);
    
    pdf.setFontSize(10);
    pdf.text(customer.name || 'N/A', 20, 85);
    pdf.text(customer.email || 'N/A', 20, 90);
    if (customer.phone) {
      pdf.text(customer.phone, 20, 95);
    }
    
    // Table Header
    const tableStartY = 110;
    pdf.setFillColor(37, 99, 235);
    pdf.rect(20, tableStartY, 170, 8, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(9);
    pdf.text("Description", 25, tableStartY + 5);
    pdf.text("Qty", 120, tableStartY + 5);
    pdf.text("Price", 140, tableStartY + 5);
    pdf.text("Total", 165, tableStartY + 5);
    
    // Table Rows
    let currentY = tableStartY + 15;
    pdf.setTextColor(40, 40, 40);
    
    const items = order.items || [];
    let subtotal = 0;
    
    items.forEach((item, index) => {
      const itemTotal = (item.quantity || 0) * (item.price || 0);
      subtotal += itemTotal;
      
      // Alternate row colors
      if (index % 2 === 1) {
        pdf.setFillColor(248, 250, 252);
        pdf.rect(20, currentY - 3, 170, 8, 'F');
      }
      
      pdf.text(item.name || 'N/A', 25, currentY);
      pdf.text(String(item.quantity || 0), 120, currentY);
      pdf.text(`$${(item.price || 0).toFixed(2)}`, 140, currentY);
      pdf.text(`$${itemTotal.toFixed(2)}`, 165, currentY);
      
      currentY += 10;
    });
    
    // Totals Section
    const totalsY = currentY + 10;
    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + tax;
    
    pdf.line(120, totalsY - 5, 190, totalsY - 5);
    
    pdf.setFontSize(10);
    pdf.text("Subtotal:", 140, totalsY);
    pdf.text(`$${subtotal.toFixed(2)}`, 175, totalsY);
    
    pdf.text("Tax (10%):", 140, totalsY + 8);
    pdf.text(`$${tax.toFixed(2)}`, 175, totalsY + 8);
    
    pdf.setFont("helvetica", "bold");
    pdf.text("Total:", 140, totalsY + 18);
    pdf.text(`$${total.toFixed(2)}`, 175, totalsY + 18);
    
    // Footer
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(100, 100, 100);
    pdf.text("Thank you for your business!", 20, 270);
    pdf.text("Payment due within 30 days", 20, 275);
    
    // Generate PDF buffer
    const pdfBuffer = pdf.output('arraybuffer');
    
    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${order.orderNumber}.pdf"`
      }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: `PDF generation failed: ${error.message}`
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});