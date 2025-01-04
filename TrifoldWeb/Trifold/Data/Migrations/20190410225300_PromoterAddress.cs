using Microsoft.EntityFrameworkCore.Migrations;

namespace Trifold.Data.Migrations
{
    public partial class PromoterAddress : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Address",
                table: "EventPromoters",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "City",
                table: "EventPromoters",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ContactName",
                table: "EventPromoters",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Phone",
                table: "EventPromoters",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "State",
                table: "EventPromoters",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Zip",
                table: "EventPromoters",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsWhiteLabel",
                table: "Apps",
                nullable: false,
                defaultValue: false);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Address",
                table: "EventPromoters");

            migrationBuilder.DropColumn(
                name: "City",
                table: "EventPromoters");

            migrationBuilder.DropColumn(
                name: "ContactName",
                table: "EventPromoters");

            migrationBuilder.DropColumn(
                name: "Phone",
                table: "EventPromoters");

            migrationBuilder.DropColumn(
                name: "State",
                table: "EventPromoters");

            migrationBuilder.DropColumn(
                name: "Zip",
                table: "EventPromoters");

            migrationBuilder.DropColumn(
                name: "IsWhiteLabel",
                table: "Apps");
        }
    }
}
