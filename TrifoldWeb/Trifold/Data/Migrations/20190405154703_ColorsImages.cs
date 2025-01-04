using Microsoft.EntityFrameworkCore.Migrations;

namespace Trifold.Data.Migrations
{
    public partial class ColorsImages : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "EventPrimaryColor",
                table: "Events",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PrimaryColor",
                table: "Apps",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SplashImageUrl",
                table: "Apps",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EventPrimaryColor",
                table: "Events");

            migrationBuilder.DropColumn(
                name: "PrimaryColor",
                table: "Apps");

            migrationBuilder.DropColumn(
                name: "SplashImageUrl",
                table: "Apps");
        }
    }
}
