import { type SchemaTypeDefinition } from "sanity";
import { categoryType } from "./categoryType";
import { productType } from "./productType";
import { brandType } from "./brandType";
import { blogType } from "./blogType";
import { blogCategoryType } from "./blogCategoryType";
import { authorType } from "./authorType";
import { addressType } from "./addressType";
import { orderType } from "./orderType";
import { blockContentType } from "./blockContentType";

export const schemaTypes: SchemaTypeDefinition[] = [
  categoryType,
  productType,
  brandType,
  blogType,
  blogCategoryType,
  authorType,
  addressType,
  orderType,
  blockContentType,
];
