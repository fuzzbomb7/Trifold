using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Trifold.Data.Migrations
{
    public partial class CustomContent : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CustomContentId",
                table: "Events",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "CustomContent",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    EventId = table.Column<int>(nullable: false),
                    Url = table.Column<string>(nullable: true),
                    HtmlContent = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CustomContent", x => x.Id);
                });

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

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Events_CustomContent_CustomContentId",
                table: "Events");

            migrationBuilder.DropTable(
                name: "CustomContent");

            migrationBuilder.DropIndex(
                name: "IX_Events_CustomContentId",
                table: "Events");

            migrationBuilder.DropColumn(
                name: "CustomContentId",
                table: "Events");
        }
    }
}
