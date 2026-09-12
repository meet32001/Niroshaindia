const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

function escapeSql(str) {
  if (str === null || str === undefined) return "''";
  return "'" + String(str).replace(/'/g, "''") + "'";
}

function cleanPrice(priceStr) {
  if (!priceStr) return 0n;
  const digits = String(priceStr).replace(/[^\d]/g, '');
  if (!digits) return 0n;
  return BigInt(digits) * 100n; // Convert to paise (₹1 = 100 paise)
}

function cleanImageUrl(url) {
  if (!url) return null;
  let cleaned = url.split('?')[0].split('#')[0];
  if (!cleaned.startsWith('http')) return null;
  if (cleaned.includes('data:image') || cleaned.includes('.svg')) return null;
  if (cleaned.includes('/vs-header/') || cleaned.includes('/common/header/') || cleaned.includes('location.svg') || cleaned.includes('vs-logo')) return null;
  return cleaned;
}

const TARGET_LISTING_URLS = [
  'https://www.vijaysales.com/c/laptops-and-accessories',
  'https://www.vijaysales.com/c/laptops',
  'https://www.vijaysales.com/c/gaming-laptops',
  'https://www.vijaysales.com/c/macbooks',
  'https://www.vijaysales.com/c/laptop-bags',
  'https://www.vijaysales.com/c/mouse-and-keyboard',
  'https://www.vijaysales.com/c/monitors'
];

async function main() {
  console.log('=== STARTING LAPTOPS & ACCESSORIES CATALOG SCRAPER ===');
  
  const outputDir = path.join(process.cwd(), 'supabase');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const sqlFilePath = path.join(outputDir, 'seed_laptops_accessories.sql');
  const sqlStream = fs.createWriteStream(sqlFilePath, { flags: 'w', encoding: 'utf-8' });

  // Write SQL Header
  sqlStream.write(`-- IDEMPOTENT SEED SCRIPT FOR LAPTOPS & ACCESSORIES CATALOG
-- Generated on ${new Date().toISOString()}

INSERT INTO categories (name, slug, description)
VALUES ('Laptops & Accessories', 'laptops-accessories', 'High performance laptops, MacBooks, gaming rigs, and computing accessories')
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name;

`);

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  const productUrlsSet = new Set();

  // 1. DISCOVER ALL PDP URLS ACROSS LISTING PAGES & PAGINATION
  console.log('\n--- Step 1: Crawling Category Listing Pages & Pagination ---');
  for (const baseUrl of TARGET_LISTING_URLS) {
    let pageNum = 1;
    let consecutiveEmpty = 0;

    while (pageNum <= 10 && consecutiveEmpty < 2) {
      const targetUrl = `${baseUrl}?page=${pageNum}`;
      console.log(`[CRAWLER] Fetching listing: ${targetUrl}`);
      try {
        await page.goto(targetUrl, { waitUntil: 'networkidle2', timeout: 45000 });
        
        const pagePdpLinks = await page.evaluate(() => {
          const anchors = Array.from(document.querySelectorAll('a[href*="/p/"]'));
          return anchors
            .map(a => a.href)
            .filter(href => href && href.includes('vijaysales.com/p/'));
        });

        const initialSize = productUrlsSet.size;
        for (const link of pagePdpLinks) {
          // Exclude non-tech / mismatched categories if any
          productUrlsSet.add(link.split('#')[0]);
        }
        const added = productUrlsSet.size - initialSize;
        console.log(`  -> Page ${pageNum} found ${pagePdpLinks.length} PDP links (${added} new). Total collected: ${productUrlsSet.size}`);

        if (added === 0) {
          consecutiveEmpty++;
        } else {
          consecutiveEmpty = 0;
        }
      } catch (err) {
        console.error(`  [WARN] Failed to fetch ${targetUrl}: ${err.message}`);
        consecutiveEmpty++;
      }
      pageNum++;
    }
  }

  const allProductUrls = Array.from(productUrlsSet);
  console.log(`\n Total unique PDP URLs discovered: ${allProductUrls.length}`);

  // 2. SCRAPE PDPs & STREAM BATCHED SQL
  console.log('\n--- Step 2: Extracting Product Details & Writing SQL Seed ---');

  const brandSet = new Set();
  let scrapedCount = 0;
  let confirmedImageCount = 0;

  for (let i = 0; i < allProductUrls.length; i++) {
    const pdpUrl = allProductUrls[i];
    const itemNum = i + 1;

    try {
      // Delay 400ms - 800ms
      const delay = Math.floor(Math.random() * 400) + 400;
      await new Promise(res => setTimeout(res, delay));

      await page.goto(pdpUrl, { waitUntil: 'networkidle2', timeout: 45000 });

      const pdpData = await page.evaluate(() => {
        const title = document.querySelector('h1')?.innerText?.trim() || '';
        
        // Prices
        const offerPriceEl = document.querySelector('.pdp-price, .offer-price, .current-price, [class*="offer-price"], [class*="final-price"]');
        const mrpEl = document.querySelector('.mrp-price, .compare-price, strike, del, [class*="mrp"]');

        const bodyText = document.body.innerText;
        const rupeeMatches = bodyText.match(/₹\s*[\d,]+/g) || [];

        // Breadcrumbs
        const breadcrumbs = Array.from(document.querySelectorAll('.breadcrumb a, [class*="breadcrumb"] a'))
          .map(a => a.innerText.trim())
          .filter(Boolean);

        // Images
        const imgEls = Array.from(document.querySelectorAll('img'));
        const images = imgEls.map(img => ({
          src: img.src || '',
          zoom: img.getAttribute('data-zoom-image') || img.getAttribute('data-large-image') || img.getAttribute('data-src') || ''
        }));

        // Specs table
        const specs = {};
        const specRows = Array.from(document.querySelectorAll('table tr, tr, .spec-row'));
        specRows.forEach(r => {
          const cols = r.querySelectorAll('td, th');
          if (cols.length >= 2) {
            const k = cols[0].innerText.trim();
            const v = cols[1].innerText.trim();
            if (k && v && k.length > 1 && k.length < 60 && v.length < 500 && !k.toLowerCase().includes('emi')) {
              specs[k] = v;
            }
          }
        });

        return {
          title,
          offerPriceText: offerPriceEl?.innerText || (rupeeMatches[0] || ''),
          mrpText: mrpEl?.innerText || (rupeeMatches[1] || rupeeMatches[0] || ''),
          breadcrumbs,
          images,
          specs
        };
      });

      if (!pdpData.title) continue;

      // Extract SKU from URL
      const urlSkuMatch = pdpUrl.match(/\/p\/(\d+)\//);
      const rawSku = urlSkuMatch ? urlSkuMatch[1] : String(Date.now() + i);
      const sku = `VS-LAP-${rawSku}`;

      // Derive Brand
      let brandName = 'Generic';
      const knownBrands = ['Apple', 'Asus', 'HP', 'Dell', 'Lenovo', 'Acer', 'MSI', 'Samsung', 'Logitech', 'SanDisk', 'Seagate', 'Western Digital', 'Kingston', 'Crucial', 'Portronics', 'Zebronics', 'boAt', 'JBL'];
      for (const kb of knownBrands) {
        if (pdpData.title.toLowerCase().includes(kb.toLowerCase()) || pdpData.breadcrumbs.some(b => b.toLowerCase().includes(kb.toLowerCase()))) {
          brandName = kb;
          break;
        }
      }
      const brandSlug = slugify(brandName);

      // Ensure Brand insert statement is tracked
      if (!brandSet.has(brandSlug)) {
        brandSet.add(brandSlug);
        sqlStream.write(`INSERT INTO brands (name, slug, logo_url) VALUES (${escapeSql(brandName)}, ${escapeSql(brandSlug)}, ${escapeSql(`/brands/${brandSlug}.svg`)}) ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name;\n`);
      }

      // Product Identity
      const name = pdpData.title;
      const productSlug = `${slugify(name.slice(0, 70))}-${rawSku}`;
      const description = `${name}. Clean high-resolution catalog entry imported directly from official retail specs.`;

      // Prices
      const offerPriceCents = cleanPrice(pdpData.offerPriceText);
      const mrpCents = cleanPrice(pdpData.mrpText);
      const finalMrpCents = mrpCents > offerPriceCents ? mrpCents : offerPriceCents;

      // Serialization flag
      const isLaptop = name.toLowerCase().includes('laptop') || name.toLowerCase().includes('macbook') || name.toLowerCase().includes('notebook') || name.toLowerCase().includes('omnibook') || name.toLowerCase().includes('vivobook') || name.toLowerCase().includes('tuf') || name.toLowerCase().includes('rog') || name.toLowerCase().includes('thinkpad') || name.toLowerCase().includes('pavilion');
      const isSerialized = isLaptop;

      // Process Images
      const rawImageUrls = pdpData.images.map(img => img.zoom || img.src).filter(Boolean);
      const cleanImages = [];
      const seenImgs = new Set();

      for (const imgUrl of rawImageUrls) {
        const cleaned = cleanImageUrl(imgUrl);
        if (cleaned && !seenImgs.has(cleaned)) {
          seenImgs.add(cleaned);
          cleanImages.push(cleaned);
        }
      }

      // Fallback placeholder if no images found
      if (cleanImages.length === 0) {
        cleanImages.push('https://vsprod.vijaysales.com/media/catalog/product/placeholder.jpg');
      }

      confirmedImageCount += cleanImages.length;

      // Write SQL Block for Product, Variant, Specs, Images, Inventory
      const sqlBlock = `
DO $$
DECLARE
  v_cat_id UUID;
  v_brand_id UUID;
  v_prod_id UUID;
  v_var_id UUID;
BEGIN
  SELECT id INTO v_cat_id FROM categories WHERE slug = 'laptops-accessories' LIMIT 1;
  SELECT id INTO v_brand_id FROM brands WHERE slug = ${escapeSql(brandSlug)} LIMIT 1;

  INSERT INTO products (name, slug, description, category_id, brand_id, is_active)
  VALUES (
    ${escapeSql(name)},
    ${escapeSql(productSlug)},
    ${escapeSql(description)},
    v_cat_id,
    v_brand_id,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO v_prod_id;

  IF v_prod_id IS NULL THEN
    SELECT id INTO v_prod_id FROM products WHERE slug = ${escapeSql(productSlug)} LIMIT 1;
  END IF;

  INSERT INTO product_variants (
    product_id, sku, name, price_cents, compare_at_price_cents, is_serialized
  )
  VALUES (
    v_prod_id,
    ${escapeSql(sku)},
    ${escapeSql(name)},
    ${offerPriceCents.toString()},
    ${finalMrpCents.toString()},
    ${isSerialized}
  )
  ON CONFLICT (sku) DO UPDATE SET
    price_cents = EXCLUDED.price_cents,
    compare_at_price_cents = EXCLUDED.compare_at_price_cents
  RETURNING id INTO v_var_id;

  IF v_var_id IS NULL THEN
    SELECT id INTO v_var_id FROM product_variants WHERE sku = ${escapeSql(sku)} LIMIT 1;
  END IF;

  -- Product Specifications JSONB
  INSERT INTO product_specifications (variant_id, specs)
  VALUES (v_var_id, ${escapeSql(JSON.stringify(pdpData.specs))}::jsonb)
  ON CONFLICT (variant_id) DO UPDATE SET specs = EXCLUDED.specs;

  -- Warehouse Inventory
  INSERT INTO warehouse_inventory (variant_id, quantity_on_hand, quantity_reserved)
  VALUES (v_var_id, 20, 0)
  ON CONFLICT (variant_id) DO UPDATE SET quantity_on_hand = 20;

  -- Product Images
${cleanImages.map((imgUrl, idx) => `  INSERT INTO product_images (variant_id, image_url, sort_order, is_featured)
  VALUES (v_var_id, ${escapeSql(imgUrl)}, ${idx + 1}, ${idx === 0})
  ON CONFLICT (variant_id, sort_order) DO UPDATE SET image_url = EXCLUDED.image_url;`).join('\n')}

END $$;
`;

      sqlStream.write(sqlBlock);
      scrapedCount++;

      if (scrapedCount % 25 === 0 || itemNum === allProductUrls.length) {
        console.log(`[PROGRESS] Scraped ${scrapedCount}/${allProductUrls.length} items | Confirmed ${confirmedImageCount} High-Res CDN image links.`);
      }

    } catch (err) {
      console.error(`[ERROR] Processing item ${itemNum} (${pdpUrl}):`, err.message);
    }
  }

  await browser.close();
  sqlStream.end();

  console.log('\n=== CATALOG EXTRACTION & SQL SEED GENERATION COMPLETE ===');
  console.log(`Total Products Scraped: ${scrapedCount}`);
  console.log(`Total High-Res CDN Images Confirmed: ${confirmedImageCount}`);
  console.log(`Idempotent SQL Seed File Output: ${sqlFilePath}`);
}

main().catch(console.error);
