using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Trifold.Data.Migrations
{
    public partial class AddEventTables : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "EventPromoterId",
                table: "AspNetUsers",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "EventPromoters",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    CompanyName = table.Column<string>(nullable: true),
                    ContactEmail = table.Column<string>(nullable: true),
                    Website = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EventPromoters", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Events",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    EventName = table.Column<string>(nullable: true),
                    EventStartTime = table.Column<DateTime>(nullable: false),
                    EventEndTime = table.Column<DateTime>(nullable: false),
                    EventAddress = table.Column<string>(nullable: true),
                    EventCity = table.Column<string>(nullable: true),
                    EventState = table.Column<string>(nullable: true),
                    EventZip = table.Column<string>(nullable: true),
                    EventUrl = table.Column<string>(nullable: true),
                    EventPromoterId = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Events", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Events_EventPromoters_EventPromoterId",
                        column: x => x.EventPromoterId,
                        principalTable: "EventPromoters",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUsers_EventPromoterId",
                table: "AspNetUsers",
                column: "EventPromoterId");

            migrationBuilder.CreateIndex(
                name: "IX_Events_EventPromoterId",
                table: "Events",
                column: "EventPromoterId");

            migrationBuilder.AddForeignKey(
                name: "FK_AspNetUsers_EventPromoters_EventPromoterId",
                table: "AspNetUsers",
                column: "EventPromoterId",
                principalTable: "EventPromoters",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AspNetUsers_EventPromoters_EventPromoterId",
                table: "AspNetUsers");

            migrationBuilder.DropTable(
                name: "Events");

            migrationBuilder.DropTable(
                name: "EventPromoters");

            migrationBuilder.DropIndex(
                name: "IX_AspNetUsers_EventPromoterId",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "EventPromoterId",
                table: "AspNetUsers");
        }
    }
}
