using Microsoft.EntityFrameworkCore;
using BabyfloServer.Models; // Ensure this matches where your models live

namespace BabyfloServer.Data
{
    public class DataContext : DbContext
    {
        public DataContext(DbContextOptions<DataContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<ContactMessage> ContactMessages { get; set; }

        // This method must be inside the curly braces of DataContext
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Product>().HasData(
                new Product { Id = 1, Name = "Pink Fantasy", Price = 150.00, ImageUrl = "images/pink-fantasy.webp" },
                new Product { Id = 2, Name = "Powder Puff", Price = 150.00, ImageUrl = "images/powder-puff.webp" },
                new Product { Id = 3, Name = "Butterfly Kisses", Price = 150.00, ImageUrl = "images/butterfly-kisses.webp" }
            );
        }
    } // <--- The DataContext class ends here

    // Classes can be defined outside the DataContext class, but inside the namespace
    public class User
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class Product
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public double Price { get; set; }
        public string ImageUrl { get; set; } = string.Empty;
    }

    public class ContactMessage
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
    }
}