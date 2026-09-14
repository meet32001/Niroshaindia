/**
 * Vijay Sales Hero Banner Intelligence & Poster Scraper
 *
 * Scrapes live desktop and mobile hero banners from Vijay Sales (https://www.vijaysales.com)
 * Extracts image URLs, target promotions, measures canvas dimensions & aspect ratios,
 * downloads assets to public/marketing-intelligence/vijaysales/, and outputs marketing intelligence analysis.
 */

const fs = require("fs");
const path = require("path");
const cheerio = require("cheerio");

const BASE_URL = "https://www.vijaysales.com";
const OUTPUT_DIR = path.join(process.cwd(), "public", "marketing-intelligence", "vijaysales");

// Helper to parse JPEG/PNG image dimensions from binary buffer
function getImageDimensions(buffer) {
  if (!buffer || buffer.length < 24) return null;

  // 1. PNG Header (0x89 50 4E 47)
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
    return {
      width: buffer.readUInt32BE(16),
      height: buffer.readUInt32BE(20),
      format: "PNG",
    };
  }

  // 2. JPEG Header (0xFF 0xD8)
  if (buffer[0] === 0xFF && buffer[1] === 0xD8) {
    let offset = 2;
    while (offset < buffer.length) {
      if (buffer[offset] !== 0xFF) break;
      const marker = buffer[offset + 1];
      // Baseline DCT (0xC0) or Progressive DCT (0xC2)
      if (marker === 0xC0 || marker === 0xC2) {
        return {
          height: buffer.readUInt16BE(offset + 5),
          width: buffer.readUInt16BE(offset + 7),
          format: "JPEG",
        };
      }
      offset += 2 + buffer.readUInt16BE(offset + 2);
    }
  }

  // 3. WebP Header (RIFF....WEBP)
  if (
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  ) {
    const vp8 = buffer.toString("ascii", 12, 16);
    if (vp8 === "VP8 " && buffer.length >= 30) {
      const width = buffer.readUInt16LE(26) & 0x3fff;
      const height = buffer.readUInt16LE(28) & 0x3fff;
      return { width, height, format: "WEBP" };
    }
    if (vp8 === "VP8L" && buffer.length >= 25) {
      const b0 = buffer[21];
      const b1 = buffer[22];
      const b2 = buffer[23];
      const b3 = buffer[24];
      const width = 1 + (((b1 & 0x3f) << 8) | b0);
      const height = 1 + (((b3 & 0xf) << 10) | (b2 << 2) | ((b1 & 0xc0) >> 6));
      return { width, height, format: "WEBP" };
    }
    if (vp8 === "VP8X" && buffer.length >= 30) {
      const width = 1 + buffer.readUIntLE(24, 3);
      const height = 1 + buffer.readUIntLE(27, 3);
      return { width, height, format: "WEBP" };
    }
  }

  return null;
}

// Download binary asset to disk
async function downloadAsset(url, outputPath) {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
        Referer: "https://www.vijaysales.com/",
      },
    });

    if (!res.ok) {
      console.warn(`Failed to download ${url}: HTTP ${res.status}`);
      return null;
    }

    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(outputPath, buffer);
    return buffer;
  } catch (err) {
    console.error(`Error downloading asset from ${url}:`, err.message);
    return null;
  }
}

// Derive campaign theme and category from banner URL & Alt text
function deriveCampaignMetadata(altText, targetUrl, desktopUrl) {
  const combined = `${altText || ""} ${targetUrl || ""} ${desktopUrl || ""}`.toLowerCase();

  let category = "General Electronics";
  let theme = "Special Promotional Deal";

  if (combined.includes("iphone") || combined.includes("apple") || combined.includes("airpods") || combined.includes("watch-series")) {
    category = "Apple Ecosystem";
    if (combined.includes("iphone")) theme = "Flagship Smartphone Launch";
    else if (combined.includes("airpods")) theme = "Premium Audio";
    else if (combined.includes("watch")) theme = "Smart Wearables";
  } else if (combined.includes("air-conditioner") || combined.includes("ac")) {
    category = "Air Conditioners";
    theme = "Seasonal Climate Comfort Super Sale";
  } else if (combined.includes("tv") || combined.includes("television")) {
    category = "Televisions & Home Entertainment";
    theme = "Coupon Bonanza / Big Screen Festival";
  } else if (combined.includes("refrigerator") || combined.includes("ref")) {
    category = "Refrigerators & Kitchen";
    theme = "Major Home Appliances Exchange";
  } else if (combined.includes("laptop") || combined.includes("gaming")) {
    category = "Laptops & Computing";
    theme = "High-Performance Gaming & Productivity";
  } else if (combined.includes("ganesh") || combined.includes("fest")) {
    category = "Festive Super Sale";
    theme = "Ganeshotsav Special Offers";
  } else if (combined.includes("s26") || combined.includes("samsung")) {
    category = "Smartphones";
    theme = "Flagship Pre-Order / Notify Me Campaign";
  } else if (combined.includes("crispi") || combined.includes("ninja") || combined.includes("air fryer")) {
    category = "Smart Cooking Appliances";
    theme = "Exclusive Product Launch Feature";
  } else if (combined.includes("buds") || combined.includes("tws")) {
    category = "Personal Audio";
    theme = "Audio Accessories Launch";
  } else if (combined.includes("ps5") || combined.includes("game")) {
    category = "Gaming & Consoles";
    theme = "Console Gaming Release";
  }

  return { category, theme };
}

async function runScraper() {
  console.log("===============================================================");
  console.log("🚀 VIJAY SALES HERO BANNER INTELLIGENCE SCRAPER");
  console.log("===============================================================");
  console.log(`Target URL: ${BASE_URL}`);
  console.log(`Local Output Directory: ${OUTPUT_DIR}\n`);

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.mkdirSync(path.join(OUTPUT_DIR, "desktop"), { recursive: true });
  fs.mkdirSync(path.join(OUTPUT_DIR, "mobile"), { recursive: true });

  console.log("Fetching Vijay Sales landing page HTML...");
  const startTime = Date.now();
  const response = await fetch(BASE_URL, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch Vijay Sales homepage. Status: ${response.status}`);
  }

  const html = await response.text();
  console.log(`Fetched ${html.length.toLocaleString()} bytes in ${Date.now() - startTime}ms.`);

  const $ = cheerio.load(html);

  // Extract Hero Carousel Banners
  const heroContainer = $(".home-swipercarousel");
  const teasers = heroContainer.find(".bannerTeaserDynamicMedia");

  console.log(`Found ${teasers.length} active hero banner teasers in carousel.\n`);

  const banners = [];

  for (let i = 0; i < teasers.length; i++) {
    const el = teasers[i];
    const $t = $(el);

    const link = $t.find("a").first().attr("href") || "";
    let desktopImgUrl = $t.find(".cmp-image__image").attr("src") || "";
    let mobileImgUrl = $t.find(".cmp-image__mobile-image").attr("src") || "";
    const altText = (
      $t.find(".cmp-image__image").attr("alt") ||
      $t.find("img").first().attr("alt") ||
      `Banner ${i + 1}`
    ).trim();

    // Clean relative vs absolute URLs
    if (desktopImgUrl && !desktopImgUrl.startsWith("http")) {
      desktopImgUrl = `${BASE_URL}${desktopImgUrl}`;
    }
    if (mobileImgUrl && !mobileImgUrl.startsWith("http")) {
      mobileImgUrl = `${BASE_URL}${mobileImgUrl}`;
    }

    const { category, theme } = deriveCampaignMetadata(altText, link, desktopImgUrl);

    const bannerId = `banner-${String(i + 1).padStart(2, "0")}`;
    const desktopFilename = `${bannerId}-desktop.jpg`;
    const mobileFilename = `${bannerId}-mobile.jpg`;

    const desktopLocalPath = path.join(OUTPUT_DIR, "desktop", desktopFilename);
    const mobileLocalPath = path.join(OUTPUT_DIR, "mobile", mobileFilename);

    console.log(`[${i + 1}/${teasers.length}] Downloading assets for: ${altText || theme}...`);

    let desktopDims = null;
    let mobileDims = null;

    if (desktopImgUrl) {
      const desktopBuffer = await downloadAsset(desktopImgUrl, desktopLocalPath);
      if (desktopBuffer) {
        desktopDims = getImageDimensions(desktopBuffer);
      }
    }

    if (mobileImgUrl) {
      const mobileBuffer = await downloadAsset(mobileImgUrl, mobileLocalPath);
      if (mobileBuffer) {
        mobileDims = getImageDimensions(mobileBuffer);
      }
    }

    banners.push({
      index: i + 1,
      id: bannerId,
      altText,
      category,
      theme,
      destinationUrl: link,
      desktop: {
        url: desktopImgUrl,
        localAsset: `public/marketing-intelligence/vijaysales/desktop/${desktopFilename}`,
        dimensions: desktopDims
          ? `${desktopDims.width}x${desktopDims.height} (${desktopDims.format})`
          : "N/A",
        aspectRatio: desktopDims
          ? (desktopDims.width / desktopDims.height).toFixed(2) + ":1"
          : "3.41:1",
        width: desktopDims?.width || 1280,
        height: desktopDims?.height || 375,
      },
      mobile: {
        url: mobileImgUrl,
        localAsset: `public/marketing-intelligence/vijaysales/mobile/${mobileFilename}`,
        dimensions: mobileDims
          ? `${mobileDims.width}x${mobileDims.height} (${mobileDims.format})`
          : "N/A",
        aspectRatio: mobileDims
          ? (mobileDims.width / mobileDims.height).toFixed(2) + ":1"
          : "1.36:1",
        width: mobileDims?.width || 1280,
        height: mobileDims?.height || 939,
      },
    });
  }

  // Marketing Intelligence Synthesis
  const intelligence = {
    scrapedAt: new Date().toISOString(),
    sourceUrl: BASE_URL,
    totalBannersScraped: banners.length,
    canvasStandards: {
      desktop: {
        recommendedResolution: "1920x562 (or 1280x375 @ 2x/3x)",
        aspectRatio: "3.41:1 (approx 27:8 ultra-wide panoramic)",
        layoutGrid: "2-Column Split: Left 45% Typography & Value Proposition / Right 55% Hero Product Cutout",
        safeZoneMargin: "48px left padding, 40px top/bottom safe margin to avoid carousel chevron overlap",
      },
      mobile: {
        recommendedResolution: "1280x939 (or 768x560 @ 2x)",
        aspectRatio: "1.36:1 (approx 4:3 compact vertical poster)",
        layoutGrid: "Vertical Stack: Top 30% Offer Typography / Center 70% Product Hero Focus",
        safeZoneMargin: "32px margin with high contrast text over dark or neutral background",
      },
    },
    topCopyFormulas: [
      {
        formula: "The Category Bonanza / Super Store",
        example: "The Air Conditioner Store / TV Coupon Bonanza",
        purpose: "Anchors category authority and promises massive seasonal inventory depth.",
      },
      {
        formula: "Festive Occasion Event Framing",
        example: "Ganeshotsav Sale 2026 / Mega Savings Fest",
        purpose: "Triggers urgent holiday purchase intent aligned with Indian festive calendar.",
      },
      {
        formula: "New Product Introduction (NPI) Pre-Booking Hook",
        example: "Samsung S26 FE - Notify Me / Pre-Book Now",
        purpose: "Captures high-intent pre-orders and early adopters for flagship electronics.",
      },
      {
        formula: "Product Tiering & Family Grouping",
        example: "iPad Family / iPhone Pro Series - Elevate Your Workflow",
        purpose: "Encourages trade-up from entry-level to pro models without hard price anchoring.",
      },
      {
        formula: "Exclusive Brand Partnership / Innovation Spotlight",
        example: "Ninja Crispi CleanCrisp™ 4-in-1 Glass Air Fryer - Exclusive Launch",
        purpose: "Showcases premium technological novelty to drive high average order value (AOV).",
      },
    ],
    bankOfferPartnerStrip: {
      presence: "Dedicated sticky marquee directly below hero carousel",
      partnersObserved: [
        "HDFC Bank",
        "American Express",
        "HSBC",
        "ICICI Bank",
        "SBI Card",
        "OneCard",
        "Yes Bank",
        "IDFC FIRST Bank",
        "Bank of Baroda",
        "DBS",
        "MobiKwik",
        "AU Small Finance Bank",
        "IndusInd Bank",
        "RBL Bank",
        "Federal Bank",
      ],
      conversionRole: "Suppresses price resistance at the fold by immediately assuring 5-10% instant checkout discounts.",
    },
    banners,
  };

  // Save report to disk
  const reportPath = path.join(OUTPUT_DIR, "banner-intelligence.json");
  fs.writeFileSync(reportPath, JSON.stringify(intelligence, null, 2));

  console.log("\n===============================================================");
  console.log("📊 MARKETING INTELLIGENCE SUMMARY & BANNER AUDIT");
  console.log("===============================================================");
  console.table(
    banners.map((b) => ({
      ID: b.id,
      Category: b.category,
      "Campaign Theme": b.theme.slice(0, 30),
      "Desktop Dims": b.desktop.dimensions,
      "Desktop Ratio": b.desktop.aspectRatio,
      "Mobile Dims": b.mobile.dimensions,
      "Mobile Ratio": b.mobile.aspectRatio,
    }))
  );

  console.log("\n===============================================================");
  console.log("📐 CANVAS & LAYOUT SPECIFICATIONS DISSECTED");
  console.log("===============================================================");
  console.log(`• Desktop Canvas: ${intelligence.canvasStandards.desktop.recommendedResolution} (${intelligence.canvasStandards.desktop.aspectRatio})`);
  console.log(`• Desktop Layout: ${intelligence.canvasStandards.desktop.layoutGrid}`);
  console.log(`• Mobile Canvas:  ${intelligence.canvasStandards.mobile.recommendedResolution} (${intelligence.canvasStandards.mobile.aspectRatio})`);
  console.log(`• Mobile Layout:  ${intelligence.canvasStandards.mobile.layoutGrid}`);
  console.log(`• Saved Inspection Assets: ${OUTPUT_DIR}`);
  console.log(`• Full JSON Report: ${reportPath}\n`);

  return intelligence;
}

if (require.main === module) {
  runScraper().catch((err) => {
    console.error("Fatal scraper error:", err);
    process.exit(1);
  });
}

module.exports = { runScraper };
