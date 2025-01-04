using Microsoft.EntityFrameworkCore.Migrations;

namespace Trifold.Data.Migrations
{
    public partial class AppGuidToken : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EventId",
                table: "MobileTokens");

            migrationBuilder.AddColumn<string>(
                name: "AppGuid",
                table: "MobileTokens",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AppGuid",
                table: "MobileTokens");

            migrationBuilder.AddColumn<int>(
                name: "EventId",
                table: "MobileTokens",
                nullable: false,
                defaultValue: 0);
        }
    }
}
