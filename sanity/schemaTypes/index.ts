import { type SchemaTypeDefinition } from "sanity";
import { categoryType } from "./categoryType";
import { productType } from "./productType";
import { productVariantType } from "./productVariantType";
import { brandType } from "./brandType";
import { couponType } from "./couponType";
import { addressType } from "./addressType";
import { orderType } from "./orderType";
import { blockContentType } from "./blockContentType";

export const schemaTypes: SchemaTypeDefinition[] = [
  categoryType,
  productType,
  productVariantType,
  brandType,
  couponType,
  addressType,
  orderType,
  blockContentType,
];
