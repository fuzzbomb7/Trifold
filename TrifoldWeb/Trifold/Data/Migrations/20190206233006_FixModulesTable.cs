using Microsoft.EntityFrameworkCore.Migrations;

namespace Trifold.Data.Migrations
{
    public partial class FixModulesTable : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Modules_EventId",
                table: "Modules");

            migrationBuilder.CreateIndex(
                name: "IX_Modules_EventId",
                table: "Modules",
                column: "EventId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Modules_EventId",
                table: "Modules");

            migrationBuilder.CreateIndex(
                name: "IX_Modules_EventId",
                table: "Modules",
                column: "EventId",
                unique: true);
        }
    }
}
