import { Component, inject } from '@angular/core';
import { NgIf, CurrencyPipe } from '@angular/common';
import { CartService } from '../cart.service';

@Component({
  selector: 'sw-cart-total',
  templateUrl: './cart-total.component.html',
  standalone: true,
  imports: [NgIf, CurrencyPipe],
})
export class CartTotalComponent {
  private cartService = inject(CartService);

  public readonly cartItems = this.cartService.cartItems;
  public readonly subTotal = this.cartService.subTotal;
  public readonly deliveryFee = this.cartService.deliveryFee;
  public readonly tax = this.cartService.tax;
  public readonly totalPrice = this.cartService.totalPrice;
}
