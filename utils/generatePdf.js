const PDFDocument = require('pdfkit');
const fs = require('fs');

function generatePdf(email, amount, orderId) {
    const doc = new PDFDocument();
    const filePath = `./public/invoices/invoice_${orderId}.pdf`; // Save PDF in public directory

    // Create the PDF file
    doc.pipe(fs.createWriteStream(filePath));
    doc.fontSize(25).text('Payment Receipt', { align: 'center' });
    doc.text(`Thank you for your payment!`, { align: 'center' });
    doc.text(`Email: ${email}`, { align: 'left' });
    doc.text(`Amount: ₹${(amount / 100).toFixed(2)}`, { align: 'left' });
    doc.text(`Order ID: ${orderId}`, { align: 'left' });
    doc.end();

    return filePath; 
}

module.exports = generatePdf;
