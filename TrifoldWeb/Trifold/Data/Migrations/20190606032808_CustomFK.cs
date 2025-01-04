using Microsoft.EntityFrameworkCore.Migrations;

namespace Trifold.Data.Migrations
{
    public partial class CustomFK : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Events_CustomContent_CustomContentId",
                table: "Events");

            migrationBuilder.DropIndex(
                name: "IX_Events_CustomContentId",
                table: "Events");

            migrationBuilder.DropColumn(
                name: "CustomContentId",
                table: "Events");

            migrationBuilder.CreateIndex(
                name: "IX_CustomContent_EventId",
                table: "CustomContent",
                column: "EventId",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_CustomContent_Events_EventId",
                table: "CustomContent",
                column: "EventId",
                principalTable: "Events",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CustomContent_Events_EventId",
                table: "CustomContent");

            migrationBuilder.DropIndex(
                name: "IX_CustomContent_EventId",
                table: "CustomContent");

            migrationBuilder.AddColumn<int>(
                name: "CustomContentId",
                table: "Events",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Events_CustomContentId",
                table: "Events",
                column: "CustomContentId");

            migrationBuilder.AddForeignKey(
                name: "FK_Events_CustomContent_CustomContentId",
                table: "Events",
                column: "CustomContentId",
                principalTable: "CustomContent",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
