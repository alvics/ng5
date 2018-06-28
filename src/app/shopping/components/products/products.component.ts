import { ActivatedRoute } from '@angular/router';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ProductService } from 'shared/services/product.service';
import 'rxjs/add/operator/switchMap';
import { ShoppingCartService } from 'shared/services/shopping-cart.service';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit, OnDestroy {
  products;
  filteredProducts;
  category: string;
  cart: any;
  subscription: Subscription;

  constructor(productService: ProductService, route: ActivatedRoute, private shoppingCartService: ShoppingCartService) {

      productService.getAll()
      .switchMap(products => {
        this.products = products;
        return route.queryParamMap;
      })

      .subscribe(params => {
        this.category = params.get('category');

        this.filteredProducts = (this.category) ? 
        this.products.filter(p => p.category === this.category) : 
        this.products;
     });
   }

   async ngOnInit() {
    this.subscription = (await this.shoppingCartService.getCart())
    .subscribe(cart => this.cart = cart);  
   }

   ngOnDestroy() {
    this.subscription.unsubscribe();
   }
}
