using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartElectric.API.Migrations
{
    /// <inheritdoc />
    public partial class AddBatteryVoltageToElectricReading : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "BatteryVoltage",
                table: "ElectricReadings",
                type: "int",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Status",
                table: "ElectricDevices",
                type: "nvarchar(450)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_ElectricReadings_Timestamp",
                table: "ElectricReadings",
                column: "Timestamp");

            migrationBuilder.CreateIndex(
                name: "IX_ElectricDevices_LastReadingTimestamp",
                table: "ElectricDevices",
                column: "LastReadingTimestamp");

            migrationBuilder.CreateIndex(
                name: "IX_ElectricDevices_Status",
                table: "ElectricDevices",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_DeviceLogs_Timestamp",
                table: "DeviceLogs",
                column: "Timestamp");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ElectricReadings_Timestamp",
                table: "ElectricReadings");

            migrationBuilder.DropIndex(
                name: "IX_ElectricDevices_LastReadingTimestamp",
                table: "ElectricDevices");

            migrationBuilder.DropIndex(
                name: "IX_ElectricDevices_Status",
                table: "ElectricDevices");

            migrationBuilder.DropIndex(
                name: "IX_DeviceLogs_Timestamp",
                table: "DeviceLogs");

            migrationBuilder.DropColumn(
                name: "BatteryVoltage",
                table: "ElectricReadings");

            migrationBuilder.AlterColumn<string>(
                name: "Status",
                table: "ElectricDevices",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(450)",
                oldNullable: true);
        }
    }
}
