import { ProductServiceInterface } from "./product.interface";
import { MockProductService } from "./mock-product.service";

let productService: ProductServiceInterface;

export function getProductService(): ProductServiceInterface {
  if (!productService) {
    productService = new MockProductService();
  }

  return productService;
}
