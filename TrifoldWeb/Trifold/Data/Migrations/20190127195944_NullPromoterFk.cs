using Microsoft.EntityFrameworkCore.Migrations;

namespace Trifold.Data.Migrations
{
    public partial class NullPromoterFk : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AspNetUsers_EventPromoters_EventPromoterId",
                table: "AspNetUsers");

            migrationBuilder.AlterColumn<int>(
                name: "EventPromoterId",
                table: "AspNetUsers",
                nullable: true,
                oldClrType: typeof(int));

            migrationBuilder.AddForeignKey(
                name: "FK_AspNetUsers_EventPromoters_EventPromoterId",
                table: "AspNetUsers",
                column: "EventPromoterId",
                principalTable: "EventPromoters",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AspNetUsers_EventPromoters_EventPromoterId",
                table: "AspNetUsers");

            migrationBuilder.AlterColumn<int>(
                name: "EventPromoterId",
                table: "AspNetUsers",
                nullable: false,
                oldClrType: typeof(int),
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_AspNetUsers_EventPromoters_EventPromoterId",
                table: "AspNetUsers",
                column: "EventPromoterId",
                principalTable: "EventPromoters",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
