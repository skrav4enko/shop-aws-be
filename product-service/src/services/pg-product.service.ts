import { AppCustomError } from "@libs/app-custom-error";
import { StatusCodes } from "http-status-codes";
import { PoolClient } from "pg";
import { dbClientQuery, dbClientTransaction } from "../db/pg-client";
import { Product, ProductServiceInterface } from "./product.interface";

export class PostgresProductService implements ProductServiceInterface {
  constructor() {}

  async getProductById(id: string): Promise<Product> {
    const query = {
      text: `
              SELECT id, title, description, price, logo, count
              FROM products
              LEFT JOIN stocks ON products.id = stocks.product_id
              WHERE id = $1
            `,
      values: [id],
    };

    const result = await dbClientQuery<Product>(query.text, query.values);

    if (!result.rows?.[0]) {
      throw new AppCustomError("Product not found!", StatusCodes.NOT_FOUND);
    }

    return result.rows?.[0];
  }

  async getProductsList(): Promise<Product[]> {
    const query = `
                    SELECT id, title, description, price, logo, count
                    FROM products
                    LEFT JOIN stocks ON products.id = stocks.product_id
                  `;

    const result = await dbClientQuery<Product>(query);

    return result.rows || [];
  }

  async createProduct(product: Pick<Product, "title" | "description" | "price" | "logo" | "count">) {
    const { title, description, price, count, logo } = product;

    const transaction = async (client: PoolClient) => {
      const queryProduct = {
        text: `
                INSERT INTO products(title, description, price, logo)
                VALUES($1, $2, $3, $4)
                RETURNING id
              `,
        values: [title, description, price, logo],
      };

      const productRes = await client.query<{ id: string }>(queryProduct.text, queryProduct.values);
      const productId = productRes.rows[0].id;

      const queryStock = {
        text: `
                INSERT INTO stocks(product_id, count)
                VALUES($1, $2)
              `,
        values: [productId, count],
      };

      await client.query(queryStock.text, queryStock.values);

      return { id: productId, ...product };
    };

    const result = await dbClientTransaction<Product>(transaction);

    return result || null;
  }
}
