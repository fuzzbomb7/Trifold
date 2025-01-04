using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Trifold.Data.Migrations
{
    public partial class SyncWithProd : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_EventPromoters_Apps_AppId",
                table: "EventPromoters");

            migrationBuilder.DropTable(
                name: "Apps");

            migrationBuilder.DropTable(
                name: "Ticketing");

            migrationBuilder.DropIndex(
                name: "IX_EventPromoters_AppId",
                table: "EventPromoters");

            migrationBuilder.DropColumn(
                name: "AddToProst",
                table: "Events");

            migrationBuilder.DropColumn(
                name: "AppId",
                table: "EventPromoters");

            migrationBuilder.AlterColumn<int>(
                name: "TableNumber",
                table: "Locations",
                nullable: true,
                oldClrType: typeof(int));

            migrationBuilder.AlterColumn<string>(
                name: "BreweryName",
                table: "Breweries",
                nullable: false,
                oldClrType: typeof(string),
                oldNullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<int>(
                name: "TableNumber",
                table: "Locations",
                nullable: false,
                oldClrType: typeof(int),
                oldNullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "AddToProst",
                table: "Events",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "AppId",
                table: "EventPromoters",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "BreweryName",
                table: "Breweries",
                nullable: true,
                oldClrType: typeof(string));

            migrationBuilder.CreateTable(
                name: "Apps",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    AndroidAppStoreUrl = table.Column<string>(nullable: true),
                    AppIconUrl = table.Column<string>(nullable: true),
                    AppName = table.Column<string>(nullable: true),
                    ApplicationId = table.Column<string>(nullable: true),
                    IsPublished = table.Column<bool>(nullable: false),
                    IsWhiteLabel = table.Column<bool>(nullable: false),
                    PrimaryColor = table.Column<string>(nullable: true),
                    SecondaryColor = table.Column<string>(nullable: true),
                    SplashImageUrl = table.Column<string>(nullable: true),
                    TextContrast = table.Column<int>(nullable: false),
                    iOSAppStoreUrl = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Apps", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Ticketing",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    EndDate = table.Column<DateTime>(nullable: false),
                    EventId = table.Column<int>(nullable: false),
                    SoldOut = table.Column<bool>(nullable: false),
                    StartDate = table.Column<DateTime>(nullable: false),
                    TicketUrl = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Ticketing", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Ticketing_Events_EventId",
                        column: x => x.EventId,
                        principalTable: "Events",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_EventPromoters_AppId",
                table: "EventPromoters",
                column: "AppId");

            migrationBuilder.CreateIndex(
                name: "IX_Ticketing_EventId",
                table: "Ticketing",
                column: "EventId",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_EventPromoters_Apps_AppId",
                table: "EventPromoters",
                column: "AppId",
                principalTable: "Apps",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
