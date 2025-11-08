import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, timer, switchMap, forkJoin, tap, Subscription } from 'rxjs';
import { ApiService } from './api.service';
import { ElectricDevice, ElectricReading, DeviceStats, DeviceQueryParams, PaginatedList } from '../models/device.model';

@Injectable({ providedIn: 'root' })
export class AppStateService implements OnDestroy {
  // Use BehaviorSubjects to hold the current state. They always have a value.
  private readonly devicesSubject = new BehaviorSubject<PaginatedList<ElectricDevice>>({ items: [], pageNumber: 1, totalPages: 0, totalCount: 0 });
  private readonly statsSubject = new BehaviorSubject<DeviceStats>({ activeCount: 0, maintenanceCount: 0, alertCount: 0, otherCount: 0, totalCount: 0 });
  private readonly readingsSubject = new BehaviorSubject<ElectricReading[]>([]);
  private readonly alertDevicesSubject = new BehaviorSubject<ElectricDevice[]>([]);
  private readonly isLoadingSubject = new BehaviorSubject<boolean>(true);

  // This subject holds the current query parameters for the device list
  private readonly queryParamsSubject = new BehaviorSubject<DeviceQueryParams>({
    pageNumber: 1,
    pageSize: 12,
    sortBy: 'lastReadingTimestamp',
    sortOrder: 'desc'
  });

  private pollingSubscription?: Subscription;

  // Expose the state as read-only observables for components to use.
  public readonly devices$: Observable<PaginatedList<ElectricDevice>> = this.devicesSubject.asObservable();
  public readonly stats$: Observable<DeviceStats> = this.statsSubject.asObservable();
  public readonly readings$: Observable<ElectricReading[]> = this.readingsSubject.asObservable();
  public readonly alertDevices$: Observable<ElectricDevice[]> = this.alertDevicesSubject.asObservable();
  public readonly isLoading$: Observable<boolean> = this.isLoadingSubject.asObservable();

  constructor(private apiService: ApiService) {
    this.startPolling();
  }

  ngOnDestroy(): void {
    this.pollingSubscription?.unsubscribe();
  }

  private startPolling(): void {
    this.pollingSubscription = timer(0, 100000) // Fetch immediately, then every 100 seconds
      .pipe(
        tap(() => this.isLoadingSubject.next(true)),
        // Use the latest query parameters for each fetch
        switchMap(() => forkJoin({
          paginatedDevices: this.apiService.getDevices(this.queryParamsSubject.getValue()),
          stats: this.apiService.getDeviceStats(),
          readings: this.apiService.getReadingsSummary('30d'),
          // Also fetch top 5 alerts for the header notification bell
          alertDevices: this.apiService.getDevices({ status: 'alert', pageSize: 5 })
        }))
      )
      .subscribe(({ paginatedDevices, stats, readings, alertDevices }) => {
        // Push the new data into the subjects. Any component listening will automatically update.
        this.devicesSubject.next(paginatedDevices);
        this.statsSubject.next(stats);
        this.readingsSubject.next(readings);
        this.alertDevicesSubject.next(alertDevices.items);
        this.isLoadingSubject.next(false);
      });
  }

  // Public method for components to trigger a data refresh with new parameters
  public refreshAllData(params: DeviceQueryParams): void {
    // Update the parameters that the polling mechanism will use
    this.queryParamsSubject.next(params);
    // For instant feedback, we can cancel the current poll and restart it immediately
    this.pollingSubscription?.unsubscribe();
    this.startPolling();
  }
}
