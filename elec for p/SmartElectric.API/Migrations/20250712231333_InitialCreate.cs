using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartElectric.API.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ElectricDevices",
                columns: table => new
                {
                    DeviceId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Location = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NetworkSignal = table.Column<int>(type: "int", nullable: true),
                    LastKnownVolume = table.Column<long>(type: "bigint", nullable: true),
                    LastReadingTimestamp = table.Column<DateTime>(type: "datetime2", nullable: true),
                    InstallationDate = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ElectricDevices", x => x.DeviceId);
                });

            migrationBuilder.CreateTable(
                name: "DeviceLogs",
                columns: table => new
                {
                    LogId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DeviceId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Timestamp = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Author = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Comment = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    NewStatus = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DeviceLogs", x => x.LogId);
                    table.ForeignKey(
                        name: "FK_DeviceLogs_ElectricDevices_DeviceId",
                        column: x => x.DeviceId,
                        principalTable: "ElectricDevices",
                        principalColumn: "DeviceId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ElectricReadings",
                columns: table => new
                {
                    ReadingId = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DeviceId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Timestamp = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Volume = table.Column<long>(type: "bigint", nullable: false),
                    ConsumptionSinceLast = table.Column<int>(type: "int", nullable: false),
                    NetworkSignal = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ElectricReadings", x => x.ReadingId);
                    table.ForeignKey(
                        name: "FK_ElectricReadings_ElectricDevices_DeviceId",
                        column: x => x.DeviceId,
                        principalTable: "ElectricDevices",
                        principalColumn: "DeviceId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_DeviceLogs_DeviceId",
                table: "DeviceLogs",
                column: "DeviceId");

            migrationBuilder.CreateIndex(
                name: "IX_ElectricReadings_DeviceId",
                table: "ElectricReadings",
                column: "DeviceId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DeviceLogs");

            migrationBuilder.DropTable(
                name: "ElectricReadings");

            migrationBuilder.DropTable(
                name: "ElectricDevices");
        }
    }
}
