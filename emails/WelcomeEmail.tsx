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
} from "@react-email/components";

interface WelcomeEmailProps {
  email?: string;
  voucherCode?: string;
  dealsUrl?: string;
}

export function WelcomeEmail({
  email = "VIP Member",
  voucherCode = "WELCOME-NIROSHA-500",
  dealsUrl = "https://niroshaindia.com/deals",
}: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to the Nirosha VIP Club — Weekly High-Ticket Tech Drops Inside</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={headerSection}>
            <Text style={logoText}>
              NIROSHA<span style={{ color: "#10B981" }}>.</span>
            </Text>
            <Text style={logoBadge}>VIP CLUB</Text>
          </Section>

          {/* Hero Section */}
          <Section style={contentCard}>
            <Heading style={heading}>Welcome to the Insider Circle</Heading>
            <Text style={paragraph}>
              Hello, and welcome! You are officially enrolled in the <strong>Nirosha VIP Club</strong>.
            </Text>
            <Text style={paragraph}>
              Every <strong>Monday at 09:00 AM IST</strong>, our automated curation engine hand-picks <strong>6 high-ticket tech drops</strong> across flagship smartphones, 4K OLED entertainment, gaming computing, and inverter appliances—paired with subscriber-only vouchers.
            </Text>

            {/* Voucher Card */}
            <Section style={voucherCard}>
              <Text style={voucherLabel}>YOUR EXCLUSIVE WELCOME GIFT</Text>
              <Text style={voucherCodeStyle}>{voucherCode}</Text>
              <Text style={voucherSubtext}>
                Enjoy flat ₹500 off on your next purchase above ₹10,000. Valid for 14 days.
              </Text>
            </Section>

            {/* CTA Button */}
            <Section style={ctaSection}>
              <Button style={button} href={dealsUrl}>
                Explore Active Weekly Drops →
              </Button>
            </Section>

            {/* Reassurance Grid */}
            <Hr style={divider} />
            <Text style={subheading}>Why Nirosha VIP Members Stay Ahead:</Text>
            <Text style={perkItem}>🛡️ <strong>100% Genuine Brand Warranty:</strong> Direct OEM manufacturer tie-ups</Text>
            <Text style={perkItem}>🚚 <strong>Pan-India Express Delivery:</strong> Free shipping on orders ₹999+ across 19,000+ pincodes</Text>
            <Text style={perkItem}>🔄 <strong>7-Day Replacement Guarantee:</strong> Zero-hassle defect coverage</Text>
            <Text style={perkItem}>💳 <strong>Flexible No-Cost EMI:</strong> With top Indian bank partners</Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              © {new Date().getFullYear()} Nirosha India Retail Ltd. All rights reserved.
            </Text>
            <Text style={footerText}>
              You received this because your email ({email}) was subscribed via Nirosha India.
            </Text>
            <Text style={footerText}>
              <Link href={`${dealsUrl}`} style={footerLink}>View Live Deals</Link> •{" "}
              <Link href="https://niroshaindia.com/privacy" style={footerLink}>Privacy Policy</Link> •{" "}
              <Link href="https://niroshaindia.com/terms" style={footerLink}>Terms of Service</Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default WelcomeEmail;

// Inline CSS styles for bulletproof email rendering across clients
const main = {
  backgroundColor: "#0B1120",
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  margin: "0 auto",
  padding: "40px 10px",
};

const container = {
  maxWidth: "600px",
  margin: "0 auto",
};

const headerSection = {
  textAlign: "center" as const,
  marginBottom: "24px",
};

const logoText = {
  fontSize: "28px",
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
  color: "#10B981",
  fontSize: "11px",
  fontWeight: "700",
  letterSpacing: "1px",
  borderRadius: "4px",
  verticalAlign: "middle",
};

const contentCard = {
  backgroundColor: "#131D33",
  border: "1px solid #1E293B",
  borderRadius: "16px",
  padding: "36px 32px",
  color: "#F8FAFC",
};

const heading = {
  fontSize: "22px",
  fontWeight: "800",
  color: "#FFFFFF",
  margin: "0 0 16px 0",
  textAlign: "center" as const,
};

const paragraph = {
  fontSize: "14px",
  lineHeight: "22px",
  color: "#94A3B8",
  margin: "0 0 16px 0",
};

const voucherCard = {
  backgroundColor: "#0B1120",
  border: "1px dashed #10B981",
  borderRadius: "12px",
  padding: "20px",
  textAlign: "center" as const,
  margin: "24px 0",
};

const voucherLabel = {
  fontSize: "11px",
  fontWeight: "700",
  letterSpacing: "1.5px",
  color: "#10B981",
  margin: "0 0 8px 0",
};

const voucherCodeStyle = {
  fontSize: "24px",
  fontWeight: "900",
  color: "#FFFFFF",
  letterSpacing: "2px",
  margin: "0 0 8px 0",
  fontFamily: "monospace",
};

const voucherSubtext = {
  fontSize: "12px",
  color: "#94A3B8",
  margin: "0",
};

const ctaSection = {
  textAlign: "center" as const,
  margin: "24px 0",
};

const button = {
  backgroundColor: "#10B981",
  color: "#0B1120",
  fontWeight: "800",
  fontSize: "14px",
  borderRadius: "8px",
  padding: "14px 32px",
  textDecoration: "none",
  display: "inline-block",
};

const divider = {
  borderColor: "#1E293B",
  margin: "28px 0 20px 0",
};

const subheading = {
  fontSize: "13px",
  fontWeight: "700",
  color: "#FFFFFF",
  textTransform: "uppercase" as const,
  letterSpacing: "0.5px",
  margin: "0 0 12px 0",
};

const perkItem = {
  fontSize: "13px",
  lineHeight: "20px",
  color: "#94A3B8",
  margin: "0 0 8px 0",
};

const footer = {
  textAlign: "center" as const,
  marginTop: "24px",
};

const footerText = {
  fontSize: "11px",
  color: "#64748B",
  margin: "0 0 6px 0",
};

const footerLink = {
  color: "#10B981",
  textDecoration: "underline",
};
