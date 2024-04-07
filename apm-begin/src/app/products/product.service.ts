import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import {
  BehaviorSubject,
  Observable,
  catchError,
  combineLatest,
  filter,
  map,
  of,
  shareReplay,
  switchMap,
  tap,
  throwError,
} from 'rxjs';
import { Product, ServiceResult } from './product';
import { HttpErrorService } from '../utilities/http-error.service';
import { ReviewService } from '../reviews/review.service';
import { Review } from '../reviews/review';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  // * Dependencies injection
  private http = inject(HttpClient);
  private errorService = inject(HttpErrorService);
  private reviewService = inject(ReviewService);

  private readonly productsUrl = 'api/products';
  // readonly #productSelectedSubject = new BehaviorSubject<number | undefined>(
  //   undefined
  // );
  // public readonly productSelected$ =
  //   this.#productSelectedSubject.asObservable();

  public selectedProductId = signal<number | undefined>(undefined);

  private readonly productsResult$ = this.http
    .get<Product[]>(this.productsUrl)
    .pipe(
      map((p) => ({ data: p } as ServiceResult<Product[]>)),
      tap((p) => console.log(JSON.stringify(p))),
      shareReplay(1),
      // catchError((err) => this.handleError(err))
      catchError((err) =>
        of({
          data: [],
          error: this.errorService.formatError(err),
        } as ServiceResult<Product[]>)
      )
    );

  readonly #productsResult = toSignal(this.productsResult$, {
    initialValue: { data: [] } as ServiceResult<Product[]>,
  });
  public products = computed(() => this.#productsResult().data);
  public productsError = computed(() => this.#productsResult().error);

  // public products = computed(() => {
  //   try {
  //     return toSignal(this.products$, { initialValue: [] as Product[] })();
  //   } catch (error) {
  //     console.log('An error ocurred while retrieving the list of products.');
  //     return [] as Product[];
  //   }
  // });

  readonly #productResult1$ = toObservable(this.selectedProductId).pipe(
    filter(Boolean),
    switchMap((productId) => {
      const productUrl = this.productsUrl + '/' + productId;
      return this.http.get<Product>(productUrl).pipe(
        switchMap((product) => this.getProductWithReviews(product)),
        catchError((err) =>
          of({
            data: undefined,
            error: this.errorService.formatError(err),
          } as ServiceResult<Product>)
        )
      );
    }),
    map((p) => ({ data: p } as ServiceResult<Product>))
  );

  private readonly foundProduct = computed(() => {
    // Dependant signals
    const products = this.products();
    const selectedProductId = this.selectedProductId();

    if (products && selectedProductId) {
      return products.find((product) => product.id === selectedProductId);
    }

    return undefined;
  });

  readonly #productResult$ = toObservable(this.foundProduct).pipe(
    filter(Boolean),
    switchMap((product) => this.getProductWithReviews(product)),
    map((product) => ({ data: product } as ServiceResult<Product>)),
    catchError((err) =>
      of({
        data: undefined,
        error: this.errorService.formatError(err),
      } as ServiceResult<Product>)
    )
  );

  readonly #productResult = toSignal(this.#productResult$);
  public productResult = computed(() => this.#productResult()?.data);
  public productError = computed(() => this.#productResult()?.error);

  // public readonly product$ = combineLatest([
  //   this.productSelected$,
  //   this.products$,
  // ]).pipe(
  //   map(([selectedProductId, products]) =>
  //     products.find((product) => product.id === selectedProductId)
  //   ),
  //   filter(Boolean),
  //   switchMap((product) => this.getProductWithReviews(product)),
  //   catchError((err) => this.handleError(err))
  // );
  public productSelected(selectedProductId: number): void {
    // this.#productSelectedSubject.next(selectedProductId);
    this.selectedProductId.set(selectedProductId);
  }

  private getProductWithReviews(product: Product): Observable<Product> {
    if (product.hasReviews) {
      return this.http
        .get<Review[]>(this.reviewService.getReviewUrl(product.id))
        .pipe(map((reviews) => ({ ...product, reviews } as Product)));
    }

    return of(product);
  }

  private handleError(err: HttpErrorResponse): Observable<never> {
    const formattedMessage = this.errorService.formatError(err);
    return throwError(() => formattedMessage);
  }
}
