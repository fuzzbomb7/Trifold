using Microsoft.EntityFrameworkCore.Migrations;

namespace Trifold.Data.Migrations
{
    public partial class EngagementEventProperty : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Engagement_EventId",
                table: "Engagement");

            migrationBuilder.CreateIndex(
                name: "IX_Engagement_EventId",
                table: "Engagement",
                column: "EventId",
                unique: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Engagement_EventId",
                table: "Engagement");

            migrationBuilder.CreateIndex(
                name: "IX_Engagement_EventId",
                table: "Engagement",
                column: "EventId");
        }
    }
}
