using Microsoft.EntityFrameworkCore.Migrations;

namespace Trifold.Data.Migrations
{
    public partial class RemoveSecondaryContrast : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EventSecondaryTextContrast",
                table: "Events");

            migrationBuilder.DropColumn(
                name: "SecondaryTextContrast",
                table: "Apps");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
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
    }
}
