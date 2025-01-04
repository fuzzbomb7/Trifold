using Microsoft.EntityFrameworkCore.Migrations;

namespace Trifold.Data.Migrations
{
    public partial class BeerForeignKey : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "EventId",
                table: "Beers",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Beers_EventId",
                table: "Beers",
                column: "EventId");

            migrationBuilder.AddForeignKey(
                name: "FK_Beers_Events_EventId",
                table: "Beers",
                column: "EventId",
                principalTable: "Events",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Beers_Events_EventId",
                table: "Beers");

            migrationBuilder.DropIndex(
                name: "IX_Beers_EventId",
                table: "Beers");

            migrationBuilder.DropColumn(
                name: "EventId",
                table: "Beers");
        }
    }
}
