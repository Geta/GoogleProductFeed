using System.Data.Entity;
using Geta.GoogleProductFeed.Models;

namespace Geta.GoogleProductFeed.Repositories
{
    public class FeedApplicationDbContext : DbContext
    {
        private const string DatabaseConnectionName = "EPiServerDB";

        public FeedApplicationDbContext() : base(DatabaseConnectionName)
        {
        }

        public DbSet<FeedData> FeedData { get; set; }
    }
}