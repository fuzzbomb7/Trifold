using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Trifold.Data.Migrations
{
    public partial class Uploads : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "Style",
                table: "Beers",
                nullable: false,
                oldClrType: typeof(string),
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "BreweryName",
                table: "Beers",
                nullable: false,
                oldClrType: typeof(string),
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "BeerName",
                table: "Beers",
                nullable: false,
                oldClrType: typeof(string),
                oldNullable: true);

            migrationBuilder.AlterColumn<double>(
                name: "Abv",
                table: "Beers",
                nullable: false,
                oldClrType: typeof(float));

            migrationBuilder.CreateTable(
                name: "CsvFileUploads",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    EventId = table.Column<int>(nullable: false),
                    FileName = table.Column<string>(nullable: true),
                    Progress = table.Column<int>(nullable: false),
                    UploadDate = table.Column<DateTime>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CsvFileUploads", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CsvFileUploads_Events_EventId",
                        column: x => x.EventId,
                        principalTable: "Events",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "BeerCsvRecords",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    CsvUploadId = table.Column<int>(nullable: false),
                    Brewery = table.Column<string>(nullable: true),
                    Beer = table.Column<string>(nullable: true),
                    UntappdId = table.Column<string>(nullable: true),
                    City = table.Column<string>(nullable: true),
                    Style = table.Column<string>(nullable: true),
                    ABV = table.Column<string>(nullable: true),
                    IBU = table.Column<string>(nullable: true),
                    Description = table.Column<string>(nullable: true),
                    Processed = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BeerCsvRecords", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BeerCsvRecords_CsvFileUploads_CsvUploadId",
                        column: x => x.CsvUploadId,
                        principalTable: "CsvFileUploads",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_BeerCsvRecords_CsvUploadId",
                table: "BeerCsvRecords",
                column: "CsvUploadId");

            migrationBuilder.CreateIndex(
                name: "IX_CsvFileUploads_EventId",
                table: "CsvFileUploads",
                column: "EventId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BeerCsvRecords");

            migrationBuilder.DropTable(
                name: "CsvFileUploads");

            migrationBuilder.AlterColumn<string>(
                name: "Style",
                table: "Beers",
                nullable: true,
                oldClrType: typeof(string));

            migrationBuilder.AlterColumn<string>(
                name: "BreweryName",
                table: "Beers",
                nullable: true,
                oldClrType: typeof(string));

            migrationBuilder.AlterColumn<string>(
                name: "BeerName",
                table: "Beers",
                nullable: true,
                oldClrType: typeof(string));

            migrationBuilder.AlterColumn<float>(
                name: "Abv",
                table: "Beers",
                nullable: false,
                oldClrType: typeof(double));
        }
    }
}
