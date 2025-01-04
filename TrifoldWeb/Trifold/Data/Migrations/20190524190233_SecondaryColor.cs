﻿using Microsoft.EntityFrameworkCore.Migrations;

namespace Trifold.Data.Migrations
{
    public partial class SecondaryColor : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "SecondaryColor",
                table: "Apps",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SecondaryColor",
                table: "Apps");
        }
    }
}
