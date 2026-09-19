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
  variantId?: number | string;
  name: string;
  categoryName: string;
  imageUrl: string;
  anchorPriceFormatted?: string;
  mrpFormatted: string;
  dealPriceFormatted: string;
  savingsFormatted: string;
  discountPercentage?: number;
  discountPercent?: number;
  isBumperDeal?: boolean;
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
  const bumperDeal = deals.find((d) => d.isBumperDeal);
  const regularDeals = bumperDeal ? deals.filter((d) => d.id !== bumperDeal.id) : deals;

  return (
    <Html>
      <Head />
      <Preview>{`Exclusive Monday Drop: ${bumperDeal ? "🔥 25% Festival Bumper Offer + " : ""}6 High-Ticket Tech Deals (Week ${weekNumber})`}</Preview>
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
            <Heading style={heading}>Hand-Curated High-Ticket Deals</Heading>
            <Text style={subtext}>
              Fresh weekly VIP pricing on flagship smartphones, 4K OLED TVs, gaming laptops, and inverter appliances. Valid until Sunday 11:59 PM IST.
            </Text>

            {/* Coupon Callout */}
            <Section style={couponBox}>
              <Text style={couponLabel}>USE VIP COUPON AT CHECKOUT</Text>
              <Text style={couponCodeStyle}>{couponCode}</Text>
              <Text style={couponDesc}>Instant VIP discount on all drops • Orders above ₹20,000</Text>
            </Section>
          </Section>

          {/* FESTIVAL BUMPER OFFER (If present) */}
          {bumperDeal && (
            <Section style={bumperCard}>
              <div style={{ textAlign: "center", marginBottom: "12px" }}>
                <span style={bumperBadge}>🔥 FESTIVAL BUMPER OFFER — 25% OFF</span>
              </div>

              {bumperDeal.imageUrl && (
                <div style={{ textAlign: "center", marginBottom: "16px" }}>
                  <Img
                    src={bumperDeal.imageUrl}
                    alt={bumperDeal.name}
                    width="280"
                    height="190"
                    style={productImage}
                  />
                </div>
              )}

              <Text style={categoryBadge}>{bumperDeal.categoryName.toUpperCase()}</Text>
              <Heading as="h3" style={bumperTitle}>{bumperDeal.name}</Heading>

              <div style={priceContainer}>
                <span style={bumperPrice}>{bumperDeal.dealPriceFormatted}</span>
                {bumperDeal.anchorPriceFormatted ? (
                  <span style={mrpPrice}>WAS {bumperDeal.anchorPriceFormatted}</span>
                ) : bumperDeal.mrpFormatted ? (
                  <span style={mrpPrice}>WAS {bumperDeal.mrpFormatted}</span>
                ) : null}
              </div>

              <div style={bumperSavingsPill}>
                Save {bumperDeal.savingsFormatted} (FLAT 25% FESTIVAL OFF)
              </div>

              <Section style={{ textAlign: "center", marginTop: "18px" }}>
                <Button
                  style={bumperButton}
                  href={`${dealsUrl}?claim_deal=${encodeURIComponent(couponCode)}&variant_id=${bumperDeal.variantId || bumperDeal.id}`}
                >
                  Claim Festival Bumper Deal ➔
                </Button>
              </Section>
            </Section>
          )}

          {/* Regular Deals Header */}
          {bumperDeal && (
            <Section style={{ marginTop: "24px", marginBottom: "12px", textAlign: "center" }}>
              <Text style={{ fontSize: "14px", fontWeight: "800", color: "#E2E8F0", letterSpacing: "0.5px" }}>
                MORE HAND-CURATED CATEGORY DROPS
              </Text>
            </Section>
          )}

          {/* Regular Deals List */}
          {regularDeals.map((deal) => {
            const claimLink = `${dealsUrl}?claim_deal=${encodeURIComponent(couponCode)}&variant_id=${deal.variantId || deal.id}`;
            return (
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
                  Save {deal.savingsFormatted} {deal.discountPercent ? `(${deal.discountPercent}% VIP OFF)` : "This Week"}
                </div>

                <Section style={{ textAlign: "center", marginTop: "16px" }}>
                  <Button style={productButton} href={claimLink}>
                    Claim VIP Deal ➔
                  </Button>
                </Section>
              </Section>
            );
          })}

          {/* Guarantee Badges */}
          <Section style={guaranteeBox}>
            <Text style={guaranteeText}>
              🛡️ 100% Genuine Brand Warranty • 🚚 Pan-India Express Delivery • 💳 No-Cost EMI
            </Text>
          </Section>

          {/* CTA Footer Link */}
          <Section style={{ textAlign: "center", margin: "24px 0" }}>
            <Link href={dealsUrl} style={viewAllLink}>
              View All Active Drops on Nirosha Deals Page ➔
            </Link>
          </Section>

          <Hr style={divider} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              You received this exclusive weekly dispatch because you are a registered Nirosha VIP member.
            </Text>
            <Text style={footerLinks}>
              <Link href="https://niroshaindia.com/deals" style={footerLink}>Active Deals</Link> •{" "}
              <Link href="https://niroshaindia.com/privacy" style={footerLink}>Privacy Policy</Link> •{" "}
              <Link href="https://niroshaindia.com/terms" style={footerLink}>Terms of Service</Link>
            </Text>
            <Text style={copyright}>
              © {year} Nirosha India Retail Ltd. All rights reserved. Surat, Gujarat, India.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default WeeklyDealsEmail;

// Styles
const main = {
  backgroundColor: "#0B1120",
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
};

const container = {
  maxWidth: "580px",
  margin: "0 auto",
  padding: "32px 16px",
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

// Festival Bumper Offer Spotlight Styling
const bumperCard = {
  backgroundColor: "#1c1917",
  border: "2px solid #F59E0B",
  borderRadius: "16px",
  padding: "26px 20px",
  marginBottom: "20px",
  textAlign: "center" as const,
  boxShadow: "0 10px 25px rgba(245, 158, 11, 0.2)",
};

const bumperBadge = {
  display: "inline-block",
  padding: "4px 14px",
  backgroundColor: "#F59E0B",
  color: "#0F172A",
  fontSize: "11px",
  fontWeight: "900",
  letterSpacing: "1px",
  borderRadius: "999px",
  textTransform: "uppercase" as const,
};

const bumperTitle = {
  fontSize: "18px",
  fontWeight: "800",
  color: "#FEF3C7",
  margin: "0 0 12px 0",
  lineHeight: "24px",
};

const bumperPrice = {
  fontSize: "24px",
  fontWeight: "900",
  color: "#F59E0B",
  marginRight: "10px",
};

const bumperSavingsPill = {
  display: "inline-block",
  padding: "4px 12px",
  backgroundColor: "rgba(245, 158, 11, 0.15)",
  border: "1px solid rgba(245, 158, 11, 0.4)",
  color: "#FCD34D",
  fontSize: "12px",
  fontWeight: "800",
  borderRadius: "20px",
};

const bumperButton = {
  backgroundColor: "#F59E0B",
  color: "#0F172A",
  fontSize: "13px",
  fontWeight: "900",
  letterSpacing: "0.5px",
  padding: "13px 26px",
  borderRadius: "8px",
  textDecoration: "none",
  display: "inline-block",
};

// Regular Product Card Styling
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
  backgroundColor: "#FFFFFF",
  padding: "8px",
  margin: "0 auto",
  display: "block",
};

const categoryBadge = {
  fontSize: "10px",
  fontWeight: "800",
  color: "#10B981",
  letterSpacing: "1px",
  margin: "0 0 6px 0",
};

const productTitle = {
  fontSize: "15px",
  fontWeight: "700",
  color: "#FFFFFF",
  margin: "0 0 10px 0",
  lineHeight: "22px",
};

const priceContainer = {
  margin: "8px 0",
};

const dealPrice = {
  fontSize: "18px",
  fontWeight: "800",
  color: "#10B981",
  marginRight: "8px",
};

const mrpPrice = {
  fontSize: "13px",
  color: "#64748B",
  textDecoration: "line-through",
};

const savingsPill = {
  display: "inline-block",
  padding: "3px 10px",
  backgroundColor: "rgba(16, 185, 129, 0.1)",
  color: "#10B981",
  fontSize: "11px",
  fontWeight: "700",
  borderRadius: "20px",
};

const productButton = {
  backgroundColor: "#10B981",
  color: "#0B1120",
  fontSize: "12px",
  fontWeight: "800",
  letterSpacing: "0.5px",
  padding: "10px 22px",
  borderRadius: "6px",
  textDecoration: "none",
  display: "inline-block",
};

const guaranteeBox = {
  backgroundColor: "#131D33",
  border: "1px solid #1E293B",
  borderRadius: "10px",
  padding: "12px 16px",
  textAlign: "center" as const,
  margin: "20px 0",
};

const guaranteeText = {
  fontSize: "11px",
  fontWeight: "600",
  color: "#94A3B8",
  margin: "0",
};

const viewAllLink = {
  color: "#10B981",
  fontSize: "13px",
  fontWeight: "700",
  textDecoration: "none",
};

const divider = {
  borderColor: "#1E293B",
  margin: "24px 0",
};

const footer = {
  textAlign: "center" as const,
};

const footerText = {
  fontSize: "11px",
  color: "#64748B",
  lineHeight: "18px",
  margin: "0 0 10px 0",
};

const footerLinks = {
  fontSize: "11px",
  margin: "0 0 10px 0",
};

const footerLink = {
  color: "#94A3B8",
  textDecoration: "underline",
};

const copyright = {
  fontSize: "11px",
  color: "#475569",
  margin: "0",
};
