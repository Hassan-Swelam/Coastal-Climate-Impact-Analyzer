
using Graduation_Project.Models;
using Graduation_Project.Repository;
using Microsoft.EntityFrameworkCore;

namespace Graduation_Project
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.

            builder.Services.AddControllers();
            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            // Get Connection String
            //builder.Services.AddDbContext<Final_ProjectContext>(options =>
            //{
            //    options.UseSqlServer(builder.Configuration.GetConnectionString("cs"));
            //});
            builder.Services.AddDbContext<Final_ProjectContext>(options =>
                    options.UseSqlServer(
                    builder.Configuration.GetConnectionString("cs"),
                    x => x.UseNetTopologySuite()));

            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowAll",
                    policy => policy.AllowAnyOrigin()
                                    .AllowAnyMethod()
                                    .AllowAnyHeader());
            });

            builder.Services.AddScoped<ISHORELINE_2023_SEGMENTED_PROJECT_Repository, SHORELINE_2023_SEGMENTED_PROJECT_Repository>();
            builder.Services.AddScoped<ISHORELINE_2023_POINTS_100M_Repository, SHORELINE_2023_POINTS_100M_Repository>();
            builder.Services.AddScoped<IUserLocationRepository, UserLocationRepository>();
            builder.Services.AddScoped<ICVIRepository, CVIRepository>();
            builder.Services.AddScoped<ITimeSeriesRepository, TimeSeriesRepository>();

            var app = builder.Build();

            app.UseCors("AllowAll");


            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }
            app.UseHttpsRedirection();
            app.UseAuthorization();


            app.MapControllers();

            app.Run();
        }
    }
}
