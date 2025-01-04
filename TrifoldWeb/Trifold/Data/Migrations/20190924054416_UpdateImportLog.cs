using Microsoft.EntityFrameworkCore.Migrations;

namespace Trifold.Data.Migrations
{
    public partial class UpdateImportLog : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "UntappdBeer",
                table: "BeerCsvRecords",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UntappdBrewery",
                table: "BeerCsvRecords",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "UntappdBeer",
                table: "BeerCsvRecords");

            migrationBuilder.DropColumn(
                name: "UntappdBrewery",
                table: "BeerCsvRecords");
        }
    }
}
