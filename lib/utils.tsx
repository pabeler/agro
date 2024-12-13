export function priceWithTrailingZerosAndDollar(price: number): string {
    return "$" + (Math.round(price * 100) / 100).toFixed(2)
  }

export const PRODUCTS_STORAGE_KEY : string = 'PRODUCTS_STORAGE_KEY';

export type ProductType = {
  productId: number,
  quantity: number,
  price?: number
}
