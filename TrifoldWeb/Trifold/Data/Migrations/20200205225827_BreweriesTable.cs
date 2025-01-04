using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Trifold.Data.Migrations
{
    public partial class BreweriesTable : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BreweryCity",
                table: "Beers");

            migrationBuilder.DropColumn(
                name: "BreweryName",
                table: "Beers");

            migrationBuilder.DropColumn(
                name: "BreweryUrl",
                table: "Beers");

            migrationBuilder.AddColumn<int>(
                name: "BreweryId",
                table: "Beers",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Table",
                table: "BeerCsvRecords",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Breweries",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    BreweryName = table.Column<string>(nullable: false),
                    BreweryCity = table.Column<string>(nullable: true),
                    BreweryLogoUrl = table.Column<string>(nullable: true),
                    UntappdBreweryId = table.Column<int>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Breweries", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Beers_BreweryId",
                table: "Beers",
                column: "BreweryId");

            migrationBuilder.AddForeignKey(
                name: "FK_Beers_Breweries_BreweryId",
                table: "Beers",
                column: "BreweryId",
                principalTable: "Breweries",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Beers_Breweries_BreweryId",
                table: "Beers");

            migrationBuilder.DropTable(
                name: "Breweries");

            migrationBuilder.DropIndex(
                name: "IX_Beers_BreweryId",
                table: "Beers");

            migrationBuilder.DropColumn(
                name: "BreweryId",
                table: "Beers");

            migrationBuilder.DropColumn(
                name: "Table",
                table: "BeerCsvRecords");

            migrationBuilder.AddColumn<string>(
                name: "BreweryCity",
                table: "Beers",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "BreweryName",
                table: "Beers",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "BreweryUrl",
                table: "Beers",
                nullable: true);
        }
    }
}
