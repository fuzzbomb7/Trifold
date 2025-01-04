using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Trifold.Data.Migrations
{
    public partial class PurTime : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "PourTime",
                table: "Beers",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PourTime",
                table: "Beers");
        }
    }
}
