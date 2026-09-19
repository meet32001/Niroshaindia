import * as React from "react";
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Heading,
  Text,
  Button,
  Hr,
  Link,
  Img,
} from "@react-email/components";

export interface DealEmailItem {
  id: number | string;
  name: string;
  categoryName: string;
  imageUrl: string;
  mrpFormatted: string;
  dealPriceFormatted: string;
  savingsFormatted: string;
  productUrl: string;
}

interface WeeklyDealsEmailProps {
  weekNumber?: number;
  year?: number;
  couponCode?: string;
  deals?: DealEmailItem[];
  dealsUrl?: string;
}

export function WeeklyDealsEmail({
  weekNumber = 38,
  year = 2026,
  couponCode = "VIP-DROP-WK38",
  deals = [],
  dealsUrl = "https://niroshaindia.com/deals",
}: WeeklyDealsEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{`Exclusive Monday Drop: 6 High-Ticket Tech Deals for VIP Members (Week ${weekNumber})`}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={headerSection}>
            <Text style={logoText}>
              NIROSHA<span style={{ color: "#10B981" }}>.</span>
            </Text>
            <Text style={logoBadge}>VIP MONDAY DROP</Text>
          </Section>

          {/* Banner Card */}
          <Section style={bannerCard}>
            <Text style={badgeText}>WEEK {weekNumber} • {year}</Text>
            <Heading style={heading}>6 Hand-Curated High-Ticket Deals</Heading>
            <Text style={subtext}>
              Fresh weekly pricing on flagship smartphones, 4K OLED TVs, gaming laptops, and inverter appliances. Valid until Sunday 11:59 PM IST.
            </Text>

            {/* Coupon Callout */}
            <Section style={couponBox}>
              <Text style={couponLabel}>USE VIP COUPON AT CHECKOUT</Text>
              <Text style={couponCodeStyle}>{couponCode}</Text>
              <Text style={couponDesc}>Extra VIP discount on all 6 drops • Orders above ₹20,000</Text>
            </Section>
          </Section>

          {/* Deals Grid (stacked in email for 100% mobile compatibility) */}
          {deals.map((deal) => (
            <Section key={deal.id} style={productCard}>
              {deal.imageUrl && (
                <div style={{ textAlign: "center", marginBottom: "14px" }}>
                  <Img
                    src={deal.imageUrl}
                    alt={deal.name}
                    width="260"
                    height="180"
                    style={productImage}
                  />
                </div>
              )}
              <Text style={categoryBadge}>{deal.categoryName.toUpperCase()}</Text>
              <Heading as="h3" style={productTitle}>{deal.name}</Heading>

              <div style={priceContainer}>
                <span style={dealPrice}>{deal.dealPriceFormatted}</span>
                {deal.mrpFormatted && <span style={mrpPrice}>MRP: {deal.mrpFormatted}</span>}
              </div>

              <div style={savingsPill}>
                Save {deal.savingsFormatted} This Week
              </div>

              <Section style={{ textAlign: "center", marginTop: "16px" }}>
                <Button style={productButton} href={deal.productUrl}>
                  Claim VIP Deal →
                </Button>
              </Section>
            </Section>
          ))}

          {/* Bottom CTA */}
          <Section style={bottomCtaSection}>
            <Button style={mainCtaButton} href={dealsUrl}>
              View All 6 Deals on Nirosha India →
            </Button>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              🛡️ 100% Genuine Brand Warranty • 🚚 Pan-India Express Delivery • 🔄 7-Day Replacement
            </Text>
            <Hr style={divider} />
            <Text style={footerText}>
              © {year} Nirosha India Retail Ltd. All rights reserved.
            </Text>
            <Text style={footerText}>
              <Link href={dealsUrl} style={footerLink}>View Live Deals</Link> •{" "}
              <Link href="https://niroshaindia.com/privacy" style={footerLink}>Privacy Policy</Link> •{" "}
              <Link href="https://niroshaindia.com/terms" style={footerLink}>Terms of Service</Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default WeeklyDealsEmail;

const main = {
  backgroundColor: "#0B1120",
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  margin: "0 auto",
  padding: "30px 10px",
};

const container = {
  maxWidth: "600px",
  margin: "0 auto",
};

const headerSection = {
  textAlign: "center" as const,
  marginBottom: "20px",
};

const logoText = {
  fontSize: "26px",
  fontWeight: "900",
  color: "#FFFFFF",
  letterSpacing: "-0.5px",
  margin: "0",
  display: "inline-block",
};

const logoBadge = {
  display: "inline-block",
  marginLeft: "8px",
  padding: "2px 8px",
  backgroundColor: "#1E293B",
  color: "#F59E0B",
  fontSize: "10px",
  fontWeight: "800",
  letterSpacing: "1px",
  borderRadius: "4px",
  verticalAlign: "middle",
};

const bannerCard = {
  backgroundColor: "#131D33",
  border: "1px solid #1E293B",
  borderRadius: "16px",
  padding: "28px 24px",
  textAlign: "center" as const,
  marginBottom: "20px",
};

const badgeText = {
  fontSize: "11px",
  fontWeight: "700",
  color: "#10B981",
  letterSpacing: "1px",
  margin: "0 0 8px 0",
};

const heading = {
  fontSize: "22px",
  fontWeight: "800",
  color: "#FFFFFF",
  margin: "0 0 10px 0",
};

const subtext = {
  fontSize: "13px",
  lineHeight: "20px",
  color: "#94A3B8",
  margin: "0 0 16px 0",
};

const couponBox = {
  backgroundColor: "#0B1120",
  border: "1px dashed #F59E0B",
  borderRadius: "10px",
  padding: "16px",
  margin: "12px auto 0 auto",
  maxWidth: "400px",
};

const couponLabel = {
  fontSize: "10px",
  fontWeight: "700",
  letterSpacing: "1.5px",
  color: "#F59E0B",
  margin: "0 0 6px 0",
};

const couponCodeStyle = {
  fontSize: "22px",
  fontWeight: "900",
  color: "#FFFFFF",
  letterSpacing: "2px",
  margin: "0 0 4px 0",
  fontFamily: "monospace",
};

const couponDesc = {
  fontSize: "11px",
  color: "#94A3B8",
  margin: "0",
};

const productCard = {
  backgroundColor: "#131D33",
  border: "1px solid #1E293B",
  borderRadius: "14px",
  padding: "22px",
  marginBottom: "16px",
  textAlign: "center" as const,
};

const productImage = {
  borderRadius: "8px",
  objectFit: "contain" as const,
  margin: "0 auto",
  backgroundColor: "#FFFFFF",
  padding: "8px",
};

const categoryBadge = {
  fontSize: "10px",
  fontWeight: "800",
  letterSpacing: "1px",
  color: "#10B981",
  margin: "0 0 6px 0",
};

const productTitle = {
  fontSize: "16px",
  fontWeight: "700",
  color: "#FFFFFF",
  margin: "0 0 12px 0",
  lineHeight: "22px",
};

const priceContainer = {
  marginBottom: "8px",
};

const dealPrice = {
  fontSize: "20px",
  fontWeight: "900",
  color: "#10B981",
  marginRight: "10px",
};

const mrpPrice = {
  fontSize: "13px",
  color: "#64748B",
  textDecoration: "line-through",
};

const savingsPill = {
  display: "inline-block",
  padding: "3px 10px",
  borderRadius: "9999px",
  backgroundColor: "rgba(16, 185, 129, 0.12)",
  color: "#34D399",
  fontSize: "11px",
  fontWeight: "700",
};

const productButton = {
  backgroundColor: "#10B981",
  color: "#0B1120",
  fontWeight: "800",
  fontSize: "13px",
  borderRadius: "6px",
  padding: "10px 24px",
  textDecoration: "none",
  display: "inline-block",
};

const bottomCtaSection = {
  textAlign: "center" as const,
  margin: "24px 0 20px 0",
};

const mainCtaButton = {
  backgroundColor: "#0B1120",
  border: "1px solid #10B981",
  color: "#10B981",
  fontWeight: "800",
  fontSize: "14px",
  borderRadius: "8px",
  padding: "14px 28px",
  textDecoration: "none",
  display: "inline-block",
};

const footer = {
  textAlign: "center" as const,
  marginTop: "20px",
};

const footerText = {
  fontSize: "11px",
  color: "#64748B",
  margin: "0 0 6px 0",
  lineHeight: "18px",
};

const footerLink = {
  color: "#10B981",
  textDecoration: "underline",
};

const divider = {
  borderColor: "#1E293B",
  margin: "16px 0",
};
