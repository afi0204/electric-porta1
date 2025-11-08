# Modifications to Accept @ and 8, S and D, Add Battery Voltage

## Backend Changes
- [x] Modify SmartElectric.API/Models/ElectricReading.cs: Add BatteryVoltage property
- [x] Modify SmartElectric.API/Controllers/ElectricDataController.cs: Update parsing logic to accept '@' or '8' in parts[3], 'S' or 'D' for active status, and parse battery voltage if 7 parts

## Frontend Changes
- [x] Modify smart-electric-dashboard/src/app/models/device.model.ts: Add batteryVoltage to ElectricReading interface
- [x] Update components displaying readings to show battery voltage (e.g., real-time-chart, device-detail-page)

## Followup
- [x] Run database migration if needed
- [x] Test the parsing with sample data
