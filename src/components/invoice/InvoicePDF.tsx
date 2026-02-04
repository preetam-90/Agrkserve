'use client';

import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { Booking, Equipment, UserProfile } from '@/lib/types';

interface InvoicePDFProps {
  booking: Booking & {
    equipment?: Equipment;
    renter?: UserProfile;
    provider?: UserProfile;
  };
  contactInfo?: {
    email: string;
    phone: string;
  };
}

const BRAND_PRIMARY = '#059669';
const BRAND_SECONDARY = '#047857';
const BRAND_ACCENT = '#f59e0b';
const BRAND_LIGHT = '#ecfdf5';
const PAGE_BG = '#ffffff';
const SECTION_BG = '#f8fafc';
const BORDER_COLOR = '#cbd5e1';
const BORDER_LIGHT = '#e2e8f0';
const TEXT_PRIMARY = '#0f172a';
const TEXT_SECONDARY = '#475569';
const TEXT_MUTED = '#64748b';
const TABLE_HEADER_BG = '#f1f5f9';
const SUCCESS_BG = '#d1fae5';
const SUCCESS_TEXT = '#065f46';

function formatCurrencyPDF(amount: number): string {
  if (amount === 0) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDatePDF(date: string | Date): string {
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}

function calculateDaysPDF(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
}

function generateInvoiceNumber(bookingId: string): string {
  const shortId = bookingId.slice(0, 8).toUpperCase();
  const year = new Date().getFullYear();
  return `AS-${year}-${shortId}`;
}

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: PAGE_BG,
    padding: 35,
    fontFamily: 'Helvetica',
    fontSize: 10,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 3,
    borderBottomColor: BRAND_PRIMARY,
  },
  brandSection: {
    flexDirection: 'column',
  },
  logoTextContainer: {
    flexDirection: 'column',
    marginBottom: 6,
  },
  logoBrandName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: TEXT_PRIMARY,
    letterSpacing: -0.5,
  },
  logoBrandHighlight: {
    color: BRAND_PRIMARY,
  },
  logoUnderline: {
    width: 80,
    height: 4,
    backgroundColor: BRAND_ACCENT,
    marginTop: 3,
    borderRadius: 2,
  },
  brandName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: TEXT_PRIMARY,
    marginBottom: 2,
  },
  brandTagline: {
    fontSize: 9,
    color: TEXT_MUTED,
  },
  documentTitleSection: {
    alignItems: 'flex-end',
  },
  documentTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: TEXT_PRIMARY,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  statusBadge: {
    backgroundColor: SUCCESS_BG,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: BRAND_PRIMARY,
  },
  statusText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: SUCCESS_TEXT,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metadataContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
    padding: 14,
    backgroundColor: SECTION_BG,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: BORDER_LIGHT,
  },
  metadataColumn: {
    flexDirection: 'column',
    width: '23%',
  },
  metadataLabel: {
    fontSize: 8,
    color: TEXT_MUTED,
    textTransform: 'uppercase',
    marginBottom: 4,
    letterSpacing: 0.8,
    fontWeight: 'bold',
  },
  metadataValue: {
    fontSize: 10,
    color: TEXT_PRIMARY,
    fontWeight: 'bold',
  },
  partiesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
    gap: 15,
  },
  partyBox: {
    flex: 1,
    padding: 14,
    backgroundColor: SECTION_BG,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: BORDER_LIGHT,
  },
  partyLabel: {
    fontSize: 9,
    color: BRAND_SECONDARY,
    textTransform: 'uppercase',
    marginBottom: 6,
    letterSpacing: 1,
    fontWeight: 'bold',
  },
  partyName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: TEXT_PRIMARY,
    marginBottom: 3,
  },
  partyDetail: {
    fontSize: 9,
    color: TEXT_SECONDARY,
    marginBottom: 2,
    lineHeight: 1.4,
  },
  tableContainer: {
    marginBottom: 18,
  },
  tableTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: TEXT_PRIMARY,
    marginBottom: 8,
  },
  table: {
    width: '100%',
    backgroundColor: PAGE_BG,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: TABLE_HEADER_BG,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 2,
    borderBottomColor: BORDER_COLOR,
  },
  tableHeaderCell: {
    fontSize: 9,
    fontWeight: 'bold',
    color: TEXT_PRIMARY,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: BORDER_LIGHT,
    alignItems: 'center',
  },
  tableCell: {
    fontSize: 9,
    color: TEXT_SECONDARY,
    lineHeight: 1.4,
  },
  tableCellDescription: {
    width: '35%',
  },
  tableCellPeriod: {
    width: '35%',
  },
  tableCellRate: {
    width: '15%',
    textAlign: 'right',
  },
  tableCellTotal: {
    width: '15%',
    textAlign: 'right',
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 15,
  },
  summaryBox: {
    width: 230,
    backgroundColor: SECTION_BG,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    padding: 14,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  summaryLabel: {
    fontSize: 9,
    color: TEXT_SECONDARY,
    fontWeight: 'medium',
  },
  summaryValue: {
    fontSize: 9,
    color: TEXT_PRIMARY,
    fontWeight: 'bold',
  },
  summaryDivider: {
    borderTopWidth: 2,
    borderTopColor: BORDER_COLOR,
    marginVertical: 8,
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: BRAND_PRIMARY,
    marginHorizontal: -14,
    marginBottom: -14,
    marginTop: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  grandTotalLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  grandTotalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  footerContainer: {
    marginTop: 'auto',
    paddingTop: 12,
    borderTopWidth: 2,
    borderTopColor: BORDER_COLOR,
  },
  footerGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    gap: 15,
  },
  footerColumn: {
    flex: 1,
  },
  footerLabel: {
    fontSize: 8,
    color: TEXT_MUTED,
    textTransform: 'uppercase',
    marginBottom: 2,
    letterSpacing: 0.8,
    fontWeight: 'bold',
  },
  footerValue: {
    fontSize: 9,
    color: TEXT_SECONDARY,
    fontWeight: 'medium',
  },
  footerDivider: {
    borderTopWidth: 1,
    borderTopColor: BORDER_LIGHT,
    marginVertical: 8,
  },
  footerNote: {
    fontSize: 7,
    color: TEXT_MUTED,
    textAlign: 'center',
    lineHeight: 1.5,
    paddingHorizontal: 15,
  },
  supportSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 15,
    marginTop: 8,
    marginBottom: 8,
  },
  supportText: {
    fontSize: 8,
    color: TEXT_SECONDARY,
    fontWeight: 'medium',
  },
});

function HeaderSection({ booking }: { booking: InvoicePDFProps['booking'] }) {
  return (
    <View style={styles.headerContainer}>
      <View style={styles.brandSection}>
        <View style={styles.logoTextContainer}>
          <Text style={styles.logoBrandName}>
            Agri<Text style={styles.logoBrandHighlight}>Serve</Text>
          </Text>
          <View style={styles.logoUnderline} />
        </View>
        <Text style={styles.brandTagline}>
          India&apos;s Leading Hyperlocal Agricultural Marketplace
        </Text>
      </View>

      <View style={styles.documentTitleSection}>
        <Text style={styles.documentTitle}>Tax Invoice</Text>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>PAID</Text>
        </View>
      </View>
    </View>
  );
}

function MetadataSection({ booking }: { booking: InvoicePDFProps['booking'] }) {
  const invoiceNumber = generateInvoiceNumber(booking.id);
  const issueDate = formatDatePDF(new Date());
  const transactionDate = booking.created_at ? formatDatePDF(booking.created_at) : issueDate;

  return (
    <View style={styles.metadataContainer}>
      <View style={styles.metadataColumn}>
        <Text style={styles.metadataLabel}>Invoice Number</Text>
        <Text style={styles.metadataValue}>{invoiceNumber}</Text>
      </View>
      <View style={styles.metadataColumn}>
        <Text style={styles.metadataLabel}>Booking ID</Text>
        <Text style={styles.metadataValue}>{booking.id.slice(0, 8).toUpperCase()}</Text>
      </View>
      <View style={styles.metadataColumn}>
        <Text style={styles.metadataLabel}>Date of Issue</Text>
        <Text style={styles.metadataValue}>{issueDate}</Text>
      </View>
      <View style={styles.metadataColumn}>
        <Text style={styles.metadataLabel}>Transaction Date</Text>
        <Text style={styles.metadataValue}>{transactionDate}</Text>
      </View>
    </View>
  );
}

function PartyDetailsSection({ booking }: { booking: InvoicePDFProps['booking'] }) {
  const provider = booking.provider || booking.equipment?.owner;
  const renter = booking.renter;

  return (
    <View style={styles.partiesContainer}>
      <View style={styles.partyBox}>
        <Text style={styles.partyLabel}>Bill From (Provider)</Text>
        <Text style={styles.partyName}>{provider?.name || 'Equipment Provider'}</Text>
        {provider?.phone && <Text style={styles.partyDetail}>Phone: {provider.phone}</Text>}
        {provider?.address && <Text style={styles.partyDetail}>{provider.address}</Text>}
        <Text style={styles.partyDetail}>GST: Not Applicable</Text>
      </View>

      <View style={styles.partyBox}>
        <Text style={styles.partyLabel}>Bill To (Renter)</Text>
        <Text style={styles.partyName}>{renter?.name || 'Equipment Renter'}</Text>
        {renter?.phone && <Text style={styles.partyDetail}>Phone: {renter.phone}</Text>}
        {booking.delivery_address && (
          <Text style={styles.partyDetail}>{booking.delivery_address}</Text>
        )}
      </View>
    </View>
  );
}

function ServiceTable({ booking }: { booking: InvoicePDFProps['booking'] }) {
  const equipment = booking.equipment;
  const equipmentName = equipment?.name || 'Equipment Rental';
  const pricePerDay = equipment?.price_per_day || 0;
  const totalDays = calculateDaysPDF(booking.start_date, booking.end_date);
  const subtotal = pricePerDay * totalDays;
  const platformFee = Math.round(subtotal * 0.05);
  const gst = Math.round(platformFee * 0.18);

  return (
    <View style={styles.tableContainer}>
      <Text style={styles.tableTitle}>Service Breakdown</Text>

      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderCell, styles.tableCellDescription]}>Description</Text>
          <Text style={[styles.tableHeaderCell, styles.tableCellPeriod]}>Period/Quantity</Text>
          <Text style={[styles.tableHeaderCell, styles.tableCellRate]}>Rate</Text>
          <Text style={[styles.tableHeaderCell, styles.tableCellTotal]}>Total</Text>
        </View>

        <View style={styles.tableRow}>
          <Text style={[styles.tableCell, styles.tableCellDescription]}>{equipmentName}</Text>
          <Text style={[styles.tableCell, styles.tableCellPeriod]}>
            {formatDatePDF(booking.start_date)} - {formatDatePDF(booking.end_date)} ({totalDays}{' '}
            Days)
          </Text>
          <Text style={[styles.tableCell, styles.tableCellRate]}>
            {formatCurrencyPDF(pricePerDay)}/day
          </Text>
          <Text style={[styles.tableCell, styles.tableCellTotal]}>
            {formatCurrencyPDF(subtotal)}
          </Text>
        </View>

        <View style={styles.tableRow}>
          <Text style={[styles.tableCell, styles.tableCellDescription]}>Platform Fee (5%)</Text>
          <Text style={[styles.tableCell, styles.tableCellPeriod]}>5% of subtotal</Text>
          <Text style={[styles.tableCell, styles.tableCellRate]}>5%</Text>
          <Text style={[styles.tableCell, styles.tableCellTotal]}>
            {formatCurrencyPDF(platformFee)}
          </Text>
        </View>

        <View style={styles.tableRow}>
          <Text style={[styles.tableCell, styles.tableCellDescription]}>GST (18%)</Text>
          <Text style={[styles.tableCell, styles.tableCellPeriod]}>18% of platform fee</Text>
          <Text style={[styles.tableCell, styles.tableCellRate]}>18%</Text>
          <Text style={[styles.tableCell, styles.tableCellTotal]}>{formatCurrencyPDF(gst)}</Text>
        </View>

        <View style={styles.tableRow}>
          <Text style={[styles.tableCell, styles.tableCellDescription]}>Labour/Operator Fee</Text>
          <Text style={[styles.tableCell, styles.tableCellPeriod]}>Included</Text>
          <Text style={[styles.tableCell, styles.tableCellRate]}>₹0</Text>
          <Text style={[styles.tableCell, styles.tableCellTotal]}>₹0</Text>
        </View>

        <View style={[styles.tableRow, { borderBottomWidth: 0 }]}>
          <Text style={[styles.tableCell, styles.tableCellDescription]}>Security Deposit</Text>
          <Text style={[styles.tableCell, styles.tableCellPeriod]}>Refundable</Text>
          <Text style={[styles.tableCell, styles.tableCellRate]}>—</Text>
          <Text style={[styles.tableCell, styles.tableCellTotal]}>₹0</Text>
        </View>
      </View>
    </View>
  );
}

function FinancialSummary({ booking }: { booking: InvoicePDFProps['booking'] }) {
  const equipment = booking.equipment;
  const pricePerDay = equipment?.price_per_day || 0;
  const totalDays = calculateDaysPDF(booking.start_date, booking.end_date);
  const subtotal = pricePerDay * totalDays;

  const platformFee = Math.round(subtotal * 0.05);
  const gst = Math.round(platformFee * 0.18);
  const grandTotal = subtotal + platformFee + gst;

  return (
    <View style={styles.summaryContainer}>
      <View style={styles.summaryBox}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>{formatCurrencyPDF(subtotal)}</Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Platform Fee (5%)</Text>
          <Text style={styles.summaryValue}>{formatCurrencyPDF(platformFee)}</Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>GST (18% on platform fee)</Text>
          <Text style={styles.summaryValue}>{formatCurrencyPDF(gst)}</Text>
        </View>

        <View style={styles.summaryDivider} />

        <View style={styles.grandTotalRow}>
          <Text style={styles.grandTotalLabel}>Grand Total</Text>
          <Text style={styles.grandTotalValue}>{formatCurrencyPDF(grandTotal)}</Text>
        </View>
      </View>
    </View>
  );
}

function FooterSection() {
  return (
    <View style={styles.footerContainer}>
      <View style={styles.footerGrid}>
        <View style={styles.footerColumn}>
          <Text style={styles.footerLabel}>Payment Method</Text>
          <Text style={styles.footerValue}>UPI / Net Banking / Credit Card</Text>
        </View>
        <View style={styles.footerColumn}>
          <Text style={styles.footerLabel}>Transaction Status</Text>
          <Text style={styles.footerValue}>Successful</Text>
        </View>
      </View>

      <View style={styles.footerDivider} />

      <View style={styles.supportSection}>
        <Text style={styles.supportText}>
          Need help? Contact {contactInfo?.email || 'support@agriserve.com'}
        </Text>
        <Text style={styles.supportText}>|</Text>
        <Text style={styles.supportText}>
          Call: {contactInfo?.phone || '+91-1800-AGR-SERVE'}
        </Text>
      </View>

      <Text style={styles.footerNote}>
        Terms & Conditions: Equipment must be returned in the same condition as received. Any damage
        caused by improper operation is the renter&apos;s financial responsibility. This is a
        computer-generated invoice and does not require a signature.
      </Text>
    </View>
  );
}

export function InvoicePDF({ booking, contactInfo }: InvoicePDFProps) {
  if (!booking) {
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <Text style={{ color: TEXT_PRIMARY, fontSize: 14 }}>No booking data available.</Text>
        </Page>
      </Document>
    );
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <HeaderSection booking={booking} />
        <MetadataSection booking={booking} />
        <PartyDetailsSection booking={booking} />
        <ServiceTable booking={booking} />
        <FinancialSummary booking={booking} />
        <FooterSection />
      </Page>
    </Document>
  );
}

export default InvoicePDF;
export type { InvoicePDFProps };
