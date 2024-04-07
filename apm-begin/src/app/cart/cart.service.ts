import { Injectable, computed, signal } from '@angular/core';
import { CartItem } from './cart';
import { Product } from '../products/product';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  // !<----- Signals ----->
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

  // *<---- Methods ----->
  public addToCart(product: Product): void {
    this.cartItems.update((currentItems) => [
      ...currentItems,
      { product, quantity: 1 },
    ]);
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
