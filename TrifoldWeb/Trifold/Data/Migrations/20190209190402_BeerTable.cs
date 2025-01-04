using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Trifold.Data.Migrations
{
    public partial class BeerTable : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Beers",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    LabelUrl = table.Column<string>(nullable: true),
                    BeerName = table.Column<string>(nullable: true),
                    BreweryName = table.Column<string>(nullable: true),
                    Style = table.Column<string>(nullable: true),
                    Abv = table.Column<float>(nullable: false),
                    Ibu = table.Column<int>(nullable: false),
                    Description = table.Column<string>(nullable: true),
                    UntappdBeerId = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Beers", x => x.Id);
                });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Beers");
        }
    }
}
