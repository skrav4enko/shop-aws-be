export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  count: number;
  logo?: string;
}

export interface ProductServiceInterface {
  getProductById: (id: string) => Promise<Product>;
  getProductsList: () => Promise<Product[]>;
  createProduct: (product: Omit<Product, "id">) => Promise<Product>;
}
