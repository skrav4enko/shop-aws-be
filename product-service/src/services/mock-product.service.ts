import { randomUUID } from "crypto";
import { StatusCodes } from "http-status-codes";

import { AppCustomError } from "@libs/app-custom-error";
import { mockProducts } from "../data/mock-products";
import { Product, ProductServiceInterface } from "./product.interface";

const products = [...mockProducts];

export class MockProductService implements ProductServiceInterface {
  constructor() {}

  async getProductsList(): Promise<Product[]> {
    return products;
  }

  async getProductById(productId: string): Promise<Product> {
    const product = products.find((item) => item.id === productId);

    if (!product) {
      throw new AppCustomError("Product not found!", StatusCodes.NOT_FOUND);
    }

    return product;
  }

  async createProduct(data: Omit<Product, "id">): Promise<Product> {
    const newProduct: Product = {
      id: randomUUID(),
      ...data,
    };

    products.push(newProduct);

    return newProduct;
  }
}
