using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Trifold.Data.Migrations
{
    public partial class AppsTable : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "AppId",
                table: "EventPromoters",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Apps",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    AppName = table.Column<string>(nullable: true),
                    ApplicationId = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Apps", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_EventPromoters_AppId",
                table: "EventPromoters",
                column: "AppId");

            migrationBuilder.AddForeignKey(
                name: "FK_EventPromoters_Apps_AppId",
                table: "EventPromoters",
                column: "AppId",
                principalTable: "Apps",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_EventPromoters_Apps_AppId",
                table: "EventPromoters");

            migrationBuilder.DropTable(
                name: "Apps");

            migrationBuilder.DropIndex(
                name: "IX_EventPromoters_AppId",
                table: "EventPromoters");

            migrationBuilder.DropColumn(
                name: "AppId",
                table: "EventPromoters");
        }
    }
}
