using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Trifold.Data.Migrations
{
    public partial class PromoLinks : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PromotionalUrl",
                table: "Events");

            migrationBuilder.DropColumn(
                name: "ShortPromoUrl",
                table: "Events");

            migrationBuilder.CreateTable(
                name: "PromoLinks",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    EventId = table.Column<int>(nullable: false),
                    PromoUrl = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PromoLinks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PromoLinks_Events_EventId",
                        column: x => x.EventId,
                        principalTable: "Events",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PromoLinks_EventId",
                table: "PromoLinks",
                column: "EventId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PromoLinks");

            migrationBuilder.AddColumn<string>(
                name: "PromotionalUrl",
                table: "Events",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ShortPromoUrl",
                table: "Events",
                nullable: true);
        }
    }
}
