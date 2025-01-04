using Microsoft.EntityFrameworkCore.Migrations;

namespace Trifold.Data.Migrations
{
    public partial class TableNumbers : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Location",
                table: "Locations",
                newName: "AlternateName");

            migrationBuilder.AddColumn<int>(
                name: "TableNumber",
                table: "Locations",
                nullable: false,
                defaultValue: 0);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "TableNumber",
                table: "Locations");

            migrationBuilder.RenameColumn(
                name: "AlternateName",
                table: "Locations",
                newName: "Location");
        }
    }
}
