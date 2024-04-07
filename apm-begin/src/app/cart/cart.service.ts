import { Injectable, computed, signal } from '@angular/core';
import { CartItem } from './cart';
import { Product } from '../products/product';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  // ! <----- Signals ----->
  public readonly cartItems = signal<CartItem[]>([]);
  public readonly cartCount = computed(() =>
    this.cartItems().reduce((accQty, item) => accQty + item.quantity, 0)
  );
  public readonly subTotal = computed(() =>
    this.cartItems().reduce(
      (accTotal, item) => accTotal + item.quantity * item.product.price,
      0
    )
  );
  public readonly deliveryFee = computed<number>(() =>
    this.subTotal() < 50 ? 5.99 : 0
  );
  public readonly tax = computed(
    () => Math.round(this.subTotal() * 10.75) / 100
  );
  public readonly totalPrice = computed(
    () => this.subTotal() + this.deliveryFee() + this.tax()
  );

  // * <---- Methods ----->
  public addToCart(product: Product): void {
    const index = this.cartItems().findIndex(
      (item) => item.product.id === product.id
    );

    if (index === -1) {
      // * Not already in the cart, so add with default quantity of 1
      this.cartItems.update((items) => [...items, { product, quantity: 1 }]);
    } else {
      // * Already in the cart, so increase the quantity by 1
      this.cartItems.update((items) => [
        ...items.slice(0, index),
        { ...items[index], quantity: items[index].quantity + 1 },
        ...items.slice(index + 1),
      ]);
    }
    // this.cartItems.update((currentItems) => {
    //   if (currentItems.length === 0) {
    //     return [{ product, quantity: 1 }];
    //   }

    //   if (currentItems.find((item) => item.product.id === product.id)) {
    //     return currentItems.map((item) =>
    //       item.product.id === product.id
    //         ? { ...item, quantity: item.quantity + 1 }
    //         : item
    //     );
    //   }

    //   return [...currentItems, { product, quantity: 1 }];
    // });
  }

  public removeFromCart(cartItem: CartItem): void {
    this.cartItems.update((currentItems) =>
      currentItems.filter((item) => item.product.id !== cartItem.product.id)
    );
  }

  public updateQuantity(cartItem: CartItem, quantity: number): void {
    this.cartItems.update((currentItems) =>
      currentItems.map((item) =>
        item.product.id === cartItem.product.id ? { ...item, quantity } : item
      )
    );
  }
}
