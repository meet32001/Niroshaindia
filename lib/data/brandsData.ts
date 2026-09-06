export interface BrandDisplay {
  name: string;
  slug: string;
  logoUrl: string;
  isLeading?: boolean;
}

export const BRANDS_LIST: BrandDisplay[] = [
  { name: 'Apple', slug: 'apple', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg', isLeading: true },
  { name: 'Samsung', slug: 'samsung', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg', isLeading: true },
  { name: 'Sony', slug: 'sony', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/ca/Sony_logo.svg', isLeading: true },
  { name: 'LG', slug: 'lg', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/bf/LG_logo_%282015%29.svg', isLeading: true },
  { name: 'Whirlpool', slug: 'whirlpool', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/4e/Whirlpool_Corporation_Logo.svg', isLeading: true },
  { name: 'OnePlus', slug: 'oneplus', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/f8/OP_LU_Reg_1L_RGB_red_pos.svg', isLeading: true },
  { name: 'Xiaomi', slug: 'xiaomi', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/29/Xiaomi_logo.svg', isLeading: true },
  { name: 'Daikin', slug: 'daikin', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/52/Daikin_logo.svg', isLeading: true },
  { name: 'Dell', slug: 'dell', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/18/Dell_logo_2016.svg' },
  { name: 'HP', slug: 'hp', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/ad/HP_logo_2012.svg' },
  { name: 'Voltas', slug: 'voltas', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/b3/Voltas_logo.svg' },
  { name: 'boAt', slug: 'boat', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Boat_logo.svg/512px-Boat_logo.svg.png' },
  { name: 'JBL', slug: 'jbl', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/JBL_logo.svg/512px-JBL_logo.svg.png' },
  { name: 'Bose', slug: 'bose', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Bose_logo.svg/512px-Bose_logo.svg.png' },
  { name: 'Marshall', slug: 'marshall', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Marshall_logo.svg/512px-Marshall_logo.svg.png' },
  { name: 'Carrier', slug: 'carrier', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Carrier_Corporation_logo.svg/512px-Carrier_Corporation_logo.svg.png' },
  { name: 'Blue Star', slug: 'blue-star', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Blue_Star_Logo.svg/512px-Blue_Star_Logo.svg.png' },
  { name: 'Kent', slug: 'kent', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Kent_RO_Systems_logo.svg/512px-Kent_RO_Systems_logo.svg.png' },
  { name: 'Philips', slug: 'philips', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Philips_logo.svg/512px-Philips_logo.svg.png' },
  { name: 'Dyson', slug: 'dyson', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Dyson_logo.svg/512px-Dyson_logo.svg.png' },
  { name: 'Haier', slug: 'haier', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Haier_logo.svg/512px-Haier_logo.svg.png' },
  { name: 'Panasonic', slug: 'panasonic', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Panasonic_logo_%28Blue%29.svg/512px-Panasonic_logo_%28Blue%29.svg.png' },
  { name: 'Oppo', slug: 'oppo', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Oppo_logo_2019.svg/512px-Oppo_logo_2019.svg.png' },
  { name: 'Vivo', slug: 'vivo', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Vivo_mobile_logo.png/512px-Vivo_mobile_logo.png' },
  { name: 'Realme', slug: 'realme', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Realme_logo.svg/512px-Realme_logo.svg.png' },
  { name: 'Godrej', slug: 'godrej', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Godrej_Logo.svg/512px-Godrej_Logo.svg.png' },
  { name: 'Bajaj', slug: 'bajaj', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Bajaj_Group_logo.svg/512px-Bajaj_Group_logo.svg.png' },
  { name: 'Havells', slug: 'havells', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/Havells_Logo.svg/512px-Havells_Logo.svg.png' },
  { name: 'Lenovo', slug: 'lenovo', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Lenovo_logo_2015.svg/512px-Lenovo_logo_2015.svg.png' },
  { name: 'Asus', slug: 'asus', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/ASUS_Logo.svg/512px-ASUS_Logo.svg.png' },
  { name: 'Acer', slug: 'acer', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Acer_Logo.svg/512px-Acer_Logo.svg.png' },
  { name: 'Bosch', slug: 'bosch', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Bosch-logo.svg/512px-Bosch-logo.svg.png' },
  { name: 'IFB', slug: 'ifb', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/IFB_Industries_logo.png/512px-IFB_Industries_logo.png' },
  { name: 'Siemens', slug: 'siemens', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Siemens-logo.svg/512px-Siemens-logo.svg.png' },
  { name: 'Prestige', slug: 'prestige', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/TTK_Prestige_logo.png/512px-TTK_Prestige_logo.png' },
  { name: 'Usha', slug: 'usha', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Usha_International_Logo.svg/512px-Usha_International_Logo.svg.png' }
];
