/**
 * /api/invoice-pdf - Generate Invoice PDF with QR Code
 *
 * GET /api/invoice-pdf?invoiceId=xxx - Returns PDF buffer
 */

import React from 'react';
import { Document, Page, Text, View, Image, StyleSheet, pdf } from '@react-pdf/renderer';
import { supabaseAdmin } from './lib/supabase-admin.js';

const styles = StyleSheet.create({
  page: {
    padding: 50,
    fontSize: 11,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  companyName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  companyTagline: {
    fontSize: 10,
    color: '#666',
    marginTop: 4,
  },
  invoiceTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'right',
  },
  invoiceNumber: {
    fontSize: 11,
    color: '#666',
    textAlign: 'right',
    marginTop: 4,
  },
  divider: {
    borderBottomWidth: 2,
    borderBottomColor: '#C8A258',
    marginVertical: 15,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  detailBlock: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#999',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 11,
    color: '#333',
    marginBottom: 2,
  },
  table: {
    marginTop: 10,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f5f0e8',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#C8A258',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tableColDesc: { flex: 3, fontSize: 10 },
  tableColAmount: { flex: 1, fontSize: 10, textAlign: 'right' },
  tableHeaderText: { fontWeight: 'bold', fontSize: 10, color: '#555' },
  totalRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: '#1a1a1a',
  },
  totalLabel: { flex: 3, fontSize: 13, fontWeight: 'bold', color: '#ffffff' },
  totalAmount: { flex: 1, fontSize: 13, fontWeight: 'bold', textAlign: 'right', color: '#C8A258' },
  qrSection: {
    alignItems: 'center',
    marginTop: 30,
    padding: 20,
    backgroundColor: '#f9f7f3',
    borderRadius: 8,
  },
  qrLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  qrSublabel: {
    fontSize: 9,
    color: '#888',
    marginBottom: 12,
  },
  qrImage: {
    width: 180,
    height: 180,
  },
  qrPaymentMethods: {
    fontSize: 9,
    color: '#666',
    marginTop: 10,
  },
  statusBadge: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#22c55e',
    textAlign: 'right',
    marginTop: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 50,
    right: 50,
    textAlign: 'center',
    fontSize: 8,
    color: '#999',
  },
});

const InvoicePDFDocument = ({ invoice }) => {
  const amountFormatted = (invoice.amount_cents / 100).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  });

  const createdDate = new Date(invoice.created_at).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  const dueDate = invoice.due_date
    ? new Date(invoice.due_date).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
      })
    : 'Upon Receipt';

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.companyName}>BuildIt USA</Text>
            <Text style={styles.companyTagline}>Home Improvement Experts</Text>
          </View>
          <View>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <Text style={styles.invoiceNumber}>{invoice.invoice_number}</Text>
            {invoice.status === 'paid' && (
              <Text style={styles.statusBadge}>PAID</Text>
            )}
          </View>
        </View>

        <View style={styles.divider} />

        {/* Bill To / Invoice Details */}
        <View style={styles.detailsRow}>
          <View style={styles.detailBlock}>
            <Text style={styles.detailLabel}>Bill To</Text>
            {invoice.customer_name && (
              <Text style={styles.detailValue}>{invoice.customer_name}</Text>
            )}
            {invoice.customer_email && (
              <Text style={styles.detailValue}>{invoice.customer_email}</Text>
            )}
            {!invoice.customer_name && !invoice.customer_email && (
              <Text style={styles.detailValue}>Customer</Text>
            )}
          </View>
          <View style={[styles.detailBlock, { alignItems: 'flex-end' }]}>
            <Text style={styles.detailLabel}>Invoice Date</Text>
            <Text style={styles.detailValue}>{createdDate}</Text>
            <Text style={[styles.detailLabel, { marginTop: 8 }]}>Due Date</Text>
            <Text style={styles.detailValue}>{dueDate}</Text>
          </View>
        </View>

        {/* Line Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableColDesc, styles.tableHeaderText]}>Description</Text>
            <Text style={[styles.tableColAmount, styles.tableHeaderText]}>Amount</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableColDesc}>{invoice.description}</Text>
            <Text style={styles.tableColAmount}>{amountFormatted}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Due</Text>
            <Text style={styles.totalAmount}>{amountFormatted}</Text>
          </View>
        </View>

        {/* QR Code Payment Section */}
        {invoice.status !== 'paid' && invoice.qr_code_data_url && (
          <View style={styles.qrSection}>
            <Text style={styles.qrLabel}>Scan to Pay</Text>
            <Text style={styles.qrSublabel}>Point your phone camera at the code below</Text>
            <Image style={styles.qrImage} src={invoice.qr_code_data_url} />
            <Text style={styles.qrPaymentMethods}>
              Apple Pay | Google Pay | Credit Card | Debit Card
            </Text>
          </View>
        )}

        {invoice.status === 'paid' && (
          <View style={[styles.qrSection, { backgroundColor: '#f0fdf4' }]}>
            <Text style={[styles.qrLabel, { color: '#22c55e' }]}>Payment Received</Text>
            <Text style={styles.qrSublabel}>
              Paid on {invoice.paid_at ? new Date(invoice.paid_at).toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric',
              }) : 'N/A'}
            </Text>
          </View>
        )}

        {/* Footer */}
        <Text style={styles.footer}>
          BuildIt USA | buildit-usa.com | support@buildit-usa.com
        </Text>
      </Page>
    </Document>
  );
};

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { invoiceId } = req.query;

    if (!invoiceId) {
      return res.status(400).json({ error: 'Missing invoiceId' });
    }

    // Fetch invoice
    const { data: invoice, error } = await supabaseAdmin
      .from('invoices')
      .select('*')
      .eq('id', invoiceId)
      .single();

    if (error || !invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // Generate PDF
    const blob = await pdf(<InvoicePDFDocument invoice={invoice} />).toBlob();
    const buffer = await blob.arrayBuffer();
    const pdfBuffer = Buffer.from(buffer);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${invoice.invoice_number}.pdf"`);
    return res.status(200).send(pdfBuffer);
  } catch (error) {
    console.error('Error generating invoice PDF:', error);
    return res.status(500).json({ error: 'Failed to generate invoice PDF' });
  }
}
