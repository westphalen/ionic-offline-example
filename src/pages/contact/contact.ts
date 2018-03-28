import { Component } from '@angular/core';
import { Refresher } from 'ionic-angular';
import { Cache, CacheService } from 'ionic-cache-observable';
import { PlaceholderProvider } from '../../providers/placeholder/placeholder';
import { Observable } from 'rxjs/Observable';
import { Placeholder } from '../../providers/placeholder/placeholder.model';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/operator/finally';

@Component({
  selector: 'page-contact',
  templateUrl: 'contact.html'
})
export class ContactPage {

  /**
   * The placeholder data to present.
   *
   * @type {Observable<Placeholder>}
   */
  public placeholder$: Observable<Placeholder>;

  /**
   * The cache instance for refreshing, etc.
   *
   * @type {Cache<Placeholder>}
   */
  public cache: Cache<Placeholder>;

  /**
   * Refresh subscription that can be cancelled when leaving the view.
   *
   * @type {Subscription}
   */
  public refreshSubscription: Subscription;

  /**
   * ContactPage constructor.
   *
   * @param {PlaceholderProvider} placeholderProvider
   * @param {CacheService} cacheService
   */
  constructor(private placeholderProvider: PlaceholderProvider, private cacheService: CacheService) {
    //
  }

  /**
   * We will refresh the data automatically every time the view is entered.
   */
  ionViewWillEnter() {
    // Source data for refreshing the cache data and first load.
    const sourceData = this.placeholderProvider.random();

    // Register the cache instance using 'contact' as identifier, so we get the same data on next load.
    this.cacheService.register('contact', sourceData).subscribe((cache) => {
      this.cache = cache;

      this.placeholder$ = cache.get$;

      this.refresh();
    });
  }

  /**
   * Handle refresh event.
   *
   * @param {Refresher} refresher
   */
  public onRefresh(refresher: Refresher): void {
    this.refresh(refresher);
  }

  /**
   * Perform refresh.
   *
   * @param {Refresher} refresher
   */
  private refresh(refresher?: Refresher): void {
    if (this.refreshSubscription) {
      console.warn('Already refreshing.');

      return;
    }

    if (this.cache) {
      this.refreshSubscription = this.cache.refresh()
        .finally(() => this.refreshSubscription = null)
        .subscribe(() => {
          if (refresher) {
            refresher.complete();
          }
        }, (err) => {
          console.error('Something went wrong!', err);

          if (refresher) {
            refresher.cancel();
          }

          throw err;
        });
    } else {
      console.warn('Cache has not been initialized.');

      if (refresher) {
        refresher.cancel();
      }
    }
  }

}
