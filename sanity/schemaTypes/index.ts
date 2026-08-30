import { type SchemaTypeDefinition } from "sanity";
import { categoryType } from "./categoryType";
import { productType } from "./productType";
import { brandType } from "./brandType";
import { addressType } from "./addressType";
import { orderType } from "./orderType";
import { blockContentType } from "./blockContentType";

export const schemaTypes: SchemaTypeDefinition[] = [
  categoryType,
  productType,
  brandType,
  addressType,
  orderType,
  blockContentType,
];
