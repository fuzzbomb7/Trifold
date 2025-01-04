using Microsoft.EntityFrameworkCore.Migrations;

namespace Trifold.Data.Migrations
{
    public partial class SecondaryColorContrast : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "EventSecondaryColor",
                table: "Events",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "EventSecondaryTextContrast",
                table: "Events",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "SecondaryTextContrast",
                table: "Apps",
                nullable: false,
                defaultValue: 0);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EventSecondaryColor",
                table: "Events");

            migrationBuilder.DropColumn(
                name: "EventSecondaryTextContrast",
                table: "Events");

            migrationBuilder.DropColumn(
                name: "SecondaryTextContrast",
                table: "Apps");
        }
    }
}
