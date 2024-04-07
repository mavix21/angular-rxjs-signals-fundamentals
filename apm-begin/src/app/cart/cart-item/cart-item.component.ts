import {
  Component,
  Input,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { CurrencyPipe, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CartItem } from '../cart';
import { CartService } from '../cart.service';

@Component({
  selector: 'sw-cart-item',
  standalone: true,
  imports: [CurrencyPipe, FormsModule, NgFor, NgIf],
  templateUrl: './cart-item.component.html',
})
export class CartItemComponent {
  private cartService = inject(CartService);
  // @Input({ required: true }) set cartItem(ci: CartItem) {
  //   this.item.set(ci);
  // }
  // public item = signal<CartItem>(undefined!);
  cartItem = input.required<CartItem>();

  // Quantity available (hard-coded to 8)
  // Mapped to an array from 1-8
  qtyArr = [...Array(8).keys()].map((x) => x + 1);

  // Calculate the extended price
  // exPrice = this.cartItem?.quantity * this.cartItem?.product.price;
  exPrice = computed(
    () => this.cartItem().quantity * this.cartItem().product.price
  );

  public onQuantitySelected(quantity: number): void {
    this.cartService.updateQuantity(this.cartItem(), Number(quantity));
  }

  removeFromCart(): void {
    this.cartService.removeFromCart(this.cartItem());
  }
}
