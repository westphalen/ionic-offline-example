import { Component } from '@angular/core';
import { Cache, CacheService } from 'ionic-cache-observable';
import { PlaceholderProvider } from '../../providers/placeholder/placeholder';
import { Observable } from 'rxjs/Observable';
import { Placeholder } from '../../providers/placeholder/placeholder.model';
import { Refresher } from 'ionic-angular';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/operator/finally';

@Component({
  selector: 'page-about',
  templateUrl: 'about.html'
})
export class AboutPage {

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
   * AboutPage constructor.
   *
   * @param {PlaceholderProvider} placeholderProvider
   * @param {CacheService} cacheService
   */
  constructor(placeholderProvider: PlaceholderProvider, cacheService: CacheService) {
    // Source data for refreshing the cache data and first load.
    const sourceData = placeholderProvider.random();

    // Register the cache instance using 'about' as identifier, so we get the same data on next load.
    cacheService.register('about', sourceData).subscribe((cache) => {
      this.cache = cache;

      this.placeholder$ = cache.get$;
    });
  }

  ionViewWillLeave() {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }

  /**
   * Refresh the cached data.
   *
   * @param {Refresher} refresher
   */
  public onRefresh(refresher: Refresher): void {
    if (this.cache) {
      this.cache.refresh()
        .finally(() => this.refreshSubscription = null)
        .subscribe(() => refresher.complete(), (err) => {
          console.error('Something went wrong!', err);

          refresher.cancel();

          throw err;
        });
    } else {
      console.warn('Cache has not been initialized.');

      refresher.cancel();
    }
  }

}
