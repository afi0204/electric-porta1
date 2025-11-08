// This is the structure for one electric meter.
export interface ElectricDevice {
  deviceId: string;
  name: string;
  location?: string;
  status?: string;
  networkSignal?: number;
  lastKnownVolume?: number;
  lastReadingTimestamp?: Date;
  installationDate?: Date;
}

// The ElectricReading interface is correct and does not need changes.
export interface ElectricReading {
  readingId: number;
  deviceId: string;
  timestamp: Date;
  volume: number;
  consumptionSinceLast: number;
  networkSignal: number;
  batteryVoltage?: number;
}
export interface PaginatedList<T> {
  items: T[];
  pageNumber: number;
  totalPages: number;
  totalCount: number;
}
export interface ConsumptionReportItem {
  deviceId: string;
  deviceName: string;
  location?: string;
  totalConsumption: number;
   dailyConsumption: { date: Date; consumption: number }[];
}

export interface DeviceStats {
  totalCount: number;
  activeCount: number;
  maintenanceCount: number;
  alertCount: number;
  otherCount: number;
}

export interface DeviceQueryParams {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  status?: string;
  location?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ReportQuery {
  fromDate: Date;
  toDate: Date;
  location: string;
}

export {}; // Ensures this file is treated as a module

export interface StatCardData {
  title: string;
  value: string;
  icon: string; // e.g., 'fas fa-bolt'
}
export interface DeviceLog {
  logId: number;
  deviceId: string;
  timestamp: Date;
  author: string;
  comment: string;
  newStatus: string;
}
