using System;
using System.Linq;
using EPiServer.Logging;
using EPiServer.ServiceLocation;
using Geta.GoogleProductFeed.Models;

namespace Geta.GoogleProductFeed.Repositories
{
    [ServiceConfiguration(typeof(IFeedRepository))]
    public class FeedRepository : IFeedRepository
    {
        private readonly ILogger _log = LogManager.GetLogger(typeof(FeedRepository));
        private readonly FeedApplicationDbContext _applicationDbContext;

        public FeedRepository(FeedApplicationDbContext applicationDbContext)
        {
            _applicationDbContext = applicationDbContext;
        }

        public void RemoveOldVersion()
        {
            try
            {
                var items = _applicationDbContext.FeedData.OrderByDescending(f => f.CreatedUtc).ToList();
                if (items.Count > 1)
                {
                    for (int i = items.Count - 1; i >= 1; i--)
                    {
                        _applicationDbContext.FeedData.Remove(items[i]);
                    }

                    _applicationDbContext.SaveChanges();
                }
            }
            catch (Exception ex)
            {
                _log.Error("Error removing old Google Product Feed using Entity Framework", ex);
            }
        }

        public FeedData GetLatestFeedData()
        {
            return _applicationDbContext.FeedData.OrderByDescending(f => f.CreatedUtc).FirstOrDefault();
        }

        public void Save(FeedData feedData)
        {
            if (feedData == null)
            {
                return;
            }

            feedData.CreatedUtc = DateTime.UtcNow;

            try
            {
                _applicationDbContext.FeedData.Add(feedData);
                _applicationDbContext.SaveChanges();
            }
            catch (Exception ex)
            {
                _log.Error("Error saving Google Product Feed using entity framework", ex);
            }
        }
    }
}