using Hangfire;
using Hangfire.Dashboard;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Linq;
using Trifold.Data;
using Trifold.Models;
using Trifold.Services;

namespace Trifold
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            // DbContext
            services.AddDbContext<ApplicationDbContext>(options =>
                options.UseSqlServer(Configuration.GetConnectionString("DefaultConnection")));

            // Identity
            services.AddIdentity<ApplicationUser, IdentityRole>()
                .AddEntityFrameworkStores<ApplicationDbContext>()
                .AddDefaultTokenProviders();

            // Session
            services.AddDistributedMemoryCache();
            services.AddSession(options =>
            {
                options.IdleTimeout = TimeSpan.FromMinutes(20);
            });

            // Require authorization by default
            services.AddMvc(config =>
            {
                var policy = new AuthorizationPolicyBuilder()
                         .RequireAuthenticatedUser()
                         .Build();
                config.Filters.Add(new AuthorizeFilter(policy));
            })
            .SetCompatibilityVersion(CompatibilityVersion.Version_2_1)
            .AddJsonOptions(opt => opt.SerializerSettings.ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore);

            // Cookies (yum)
            services.ConfigureApplicationCookie(options =>
            {
                options.Cookie.Name = "Trifold";
                options.Cookie.HttpOnly = true;
                options.ExpireTimeSpan = System.TimeSpan.FromHours(12);
                options.LoginPath = "/Login";
                options.LogoutPath = "";
                options.SlidingExpiration = true;
            });

            // Auth policies
            services.AddAuthorization(options =>
            {
                options.AddPolicy("EventPolicy", policy =>
                    policy.Requirements.Add(new EventAuthorizationRequirement()));
            });

            // Hangfire
            services.AddHangfire(x => x.UseSqlServerStorage(Configuration.GetConnectionString("DefaultConnection")));

            // Services
            services.AddScoped<IAuthorizationHandler, EventAuthorizationHandler>();

            // Repos
            services.AddScoped<IAdminRepository, AdminRepository>();
            services.AddScoped<IBeerRepository, BeerRepository>();
            services.AddScoped<IUserRepository, UserRepository>();
            services.AddScoped<IEventRepository, EventRepository>();
            services.AddScoped<IMapRepository, MapRepository>();
            services.AddScoped<IHomeRepository, HomeRepository>();
            services.AddScoped<IMobileRepository, MobileRepository>();
            services.AddScoped<IUntappdRepository, UntappdRepository>();
            services.AddScoped<ISharedRepository, SharedRepository>();
            services.AddScoped<ICustomRepository, CustomRepository>();

            services.AddTransient<IUntappdApi, UntappdApi>();
            services.AddTransient<ISendGridService, SendGridService>();
            services.AddTransient<IFirestoreService, FirestoreService>();
            services.AddTransient<IFoursquareApi, FoursquareApi>();
            services.AddTransient<IImageResize, ImageResize>();
            services.AddTransient<IStorageService, StorageService>();
            services.AddTransient<ITwilioService, TwilioService>();
            services.AddTransient<IQRService, QRService>();

            services.AddSingleton<IHttpClient, HttpClientService>();

            //CORS
            services.AddCors(options =>
            {
                options.AddPolicy("Api", builder => builder.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
            });
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env, UserManager<ApplicationUser> userManager, RoleManager<IdentityRole> roleManager, IAdminRepository repository)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                app.UseDatabaseErrorPage();
            }
            else
            {
                app.UseStatusCodePages();
                app.UseHsts();
            }

            app.UseHttpsRedirection();
            app.UseStaticFiles();
            app.UseCookiePolicy();

            app.UseCors();
            app.UseAuthentication();
            app.UseSession();

            app.UseMvc(routes =>
            {
                routes.MapRoute(
                    name: "default",
                    template: "{controller=Home}/{action=Index}/{id?}");
            });

            app.UseHangfireServer();
            app.UseHangfireDashboard(options: new DashboardOptions
            {
                Authorization = new[] { new MyAuthorizationFilter() }
            });

            var seed = new SeedData(userManager, roleManager, repository);
            seed.SeedIdentity();
            seed.SeedTestData();

            RecurringJob.AddOrUpdate<BeerCsvRecordProcessor>(x => x.ProcessNextRecordAsync(), Cron.Minutely);
        }
    }

    public class MyAuthorizationFilter : IDashboardAuthorizationFilter
    {
        public bool Authorize(DashboardContext context)
        {
            // Allow only these users to see the Hangfire dashboard
            string[] authUsers = { "andrew@trifold.app" };

            var httpContext = context.GetHttpContext();
            return authUsers.Contains(httpContext.User.Identity.Name);
        }
    }
}
