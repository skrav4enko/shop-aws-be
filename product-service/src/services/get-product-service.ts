import { ProductServiceInterface } from "./product.interface";
import { PostgresProductService } from "./pg-product.service";
import { MockProductService } from "./mock-product.service";

let productService: ProductServiceInterface;

export function getProductService(): ProductServiceInterface {
  if (!productService) {
    productService = new PostgresProductService();
    // productService = new MockProductService();
  }

  return productService;
}
