using Microsoft.EntityFrameworkCore.Migrations;

namespace Trifold.Data.Migrations
{
    public partial class PromoUrl : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "PromotionalUrl",
                table: "Events",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ShortPromoUrl",
                table: "Events",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AndroidAppStoreUrl",
                table: "Apps",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "iOSAppStoreUrl",
                table: "Apps",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PromotionalUrl",
                table: "Events");

            migrationBuilder.DropColumn(
                name: "ShortPromoUrl",
                table: "Events");

            migrationBuilder.DropColumn(
                name: "AndroidAppStoreUrl",
                table: "Apps");

            migrationBuilder.DropColumn(
                name: "iOSAppStoreUrl",
                table: "Apps");
        }
    }
}
