using Microsoft.EntityFrameworkCore.Migrations;

namespace Trifold.Data.Migrations
{
    public partial class EventsPromotion : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_PromoLinks_EventId",
                table: "PromoLinks");

            migrationBuilder.CreateIndex(
                name: "IX_PromoLinks_EventId",
                table: "PromoLinks",
                column: "EventId",
                unique: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_PromoLinks_EventId",
                table: "PromoLinks");

            migrationBuilder.CreateIndex(
                name: "IX_PromoLinks_EventId",
                table: "PromoLinks",
                column: "EventId");
        }
    }
}
