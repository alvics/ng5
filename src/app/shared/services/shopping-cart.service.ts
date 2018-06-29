import { Observable } from 'rxjs/Observable';
import { AngularFireDatabase } from 'angularfire2/database';
import { Injectable } from '@angular/core';
import { Product } from 'shared/models/product';
import { ShoppingCart } from 'shared/models/shopping-cart';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/map';

@Injectable()
export class ShoppingCartService {

  constructor(private db: AngularFireDatabase) { }

  async getCart(): Promise<Observable<ShoppingCart>> {
    const cartId = await this.getOrCreateCartId();
  return this.db.object('/shopping-carts/' + cartId)
  .map(x => new ShoppingCart(x.items));
  }

  async addToCart(product: Product) {
    this.updateItem(product, 1);
 }

 async removeFromCart(product: Product) {
    this.updateItem(product, -1);
 }

  private getItem(cartId: string, productId: string) {
  return this.db.object('/shopping-carts/' + cartId + '/items/' + productId);
  }

  async clearCart() { 
    const cartId = await this.getOrCreateCartId();
    this.db.object('/shopping-carts/' + cartId + '/items').remove();
  }

  private create() {
    return this.db.list('/shopping-carts').push({
    dateCreated: new Date().getTime()
    });
    }
  
 private async getOrCreateCartId(): Promise<string> {
  const cartId = localStorage.getItem('cartId');
  if (cartId) { return cartId; }

  const result = await this.create();
  localStorage.setItem('cartId', result.key);
  return result.key;
  }

  private async updateItem(product: Product, change: number) {
    const cartId = await this.getOrCreateCartId();
    const item$ = this.getItem(cartId, product.$key);
    item$.take(1).subscribe(item => {
      const quantity = (item.quantity || 0) + change;
      if (quantity === 0) item$.remove();
      else item$.update({ 
        title: product.title,
        imgUrl: product.imgUrl,
        price: product.price,
        quantity: quantity
    }); 
  });
 }
}
