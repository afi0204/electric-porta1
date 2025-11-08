import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ElectricDevice, ElectricReading, PaginatedList, DeviceStats, ConsumptionReportItem, DeviceQueryParams, ReportQuery, DeviceLog } from '../models/device.model';
@Injectable({ providedIn: 'root' })
export class ApiService {
 //
 //
 //private readonly apiUrl = 'https://196.190.251.194:9091/api/ElectricData'; // Make sure port is correct
 private readonly apiUrl = 'https://localhost:9091/api/ElectricData'; // Make sure port is correct

  constructor(private http: HttpClient) { }

  getDevices(queryParams: DeviceQueryParams): Observable<PaginatedList<ElectricDevice>> {
  let params = new HttpParams();
  // Use Object.keys for a type-safe loop over the query parameters.
  for (const key of Object.keys(queryParams) as Array<keyof DeviceQueryParams>) {
    const value = queryParams[key];
    if (value) { // Filters out null, undefined, and empty strings
      params = params.set(key, value);
    }
  }
  return this.http.get<PaginatedList<ElectricDevice>>(`${this.apiUrl}/devices`, { params });
}

  updateDevice(device: ElectricDevice): Observable<any> {
    return this.http.put(`${this.apiUrl}/devices/${device.deviceId}`, device);
  }

  getDeviceStats(): Observable<DeviceStats> {
    return this.http.get<DeviceStats>(`${this.apiUrl}/stats`);
  }

  getDeviceReadings(deviceId: string, period: '24h' | '7d' | '30d' | '90d'): Observable<ElectricReading[]> {
  const params = new HttpParams().set('period', period);
  return this.http.get<ElectricReading[]>(`${this.apiUrl}/devices/${deviceId}/readings`, { params });
}
  getReadingsSummary(period: '7d' | '30d' | '90d'): Observable<ElectricReading[]> {
    const params = new HttpParams().set('period', period);
    return this.http.get<ElectricReading[]>(`${this.apiUrl}/readings/summary`, { params });
  }
  getNetworkSignal(deviceId: string): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/devices/${deviceId}/network-signal`);
  }
  getLastReadingTimestamp(deviceId: string): Observable<Date> {
    return this.http.get<Date>(`${this.apiUrl}/devices/${deviceId}/last-reading-timestamp`);
  }
  getLastKnownVolume(deviceId: string): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/devices/${deviceId}/last-known-volume`);
  }

  generateReport(query: ReportQuery): Observable<ConsumptionReportItem[]> {
    return this.http.post<ConsumptionReportItem[]>(`${this.apiUrl}/reports`, query);
  }
  getDeviceDailyDetail(deviceId: string, date: string): Observable<ElectricReading[]> {
  const params = new HttpParams().set('date', date);
  return this.http.get<ElectricReading[]>(`${this.apiUrl}/devices/${deviceId}/daily-detail`, { params });
}
getDeviceById(id: string): Observable<ElectricDevice> {
  return this.http.get<ElectricDevice>(`${this.apiUrl}/devices/${id}`);
}
resolveAlert(deviceId: string): Observable<ElectricDevice> {
  // We send an empty body with the POST request
  return this.http.post<ElectricDevice>(`${this.apiUrl}/devices/${deviceId}/resolve-alert`, {});
}
getDeviceLogs(deviceId: string): Observable<DeviceLog[]> {
  return this.http.get<DeviceLog[]>(`${this.apiUrl}/devices/${deviceId}/logs`);
}

addDeviceLog(deviceId: string, log: any): Observable<DeviceLog> {
  return this.http.post<DeviceLog>(`${this.apiUrl}/devices/${deviceId}/logs`, log);
}

}
