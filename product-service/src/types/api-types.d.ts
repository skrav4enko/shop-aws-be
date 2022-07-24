import { Product } from "@services/product.interface";

export interface helloPostBody {
  name: string;
}

export type productPostBody = Omit<Product, "id">;
