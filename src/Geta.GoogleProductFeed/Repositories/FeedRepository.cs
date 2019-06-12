using System;
using System.Linq;
using EPiServer.ServiceLocation;
using Geta.GoogleProductFeed.Models;

namespace Geta.GoogleProductFeed.Repositories
{
    [ServiceConfiguration(typeof(IFeedRepository))]
    public class FeedRepository : IFeedRepository
    {
        private readonly FeedApplicationDbContext _applicationDbContext;

        public FeedRepository(FeedApplicationDbContext applicationDbContext)
        {
            _applicationDbContext = applicationDbContext;
        }

        public void RemoveOldVersion()
        {
            var items = _applicationDbContext.FeedData
                    .Select(x => new
                    {
                        Id = x.Id,
                        CreatedUtc = x.CreatedUtc
                    }).OrderByDescending(x => x.CreatedUtc).ToList();

            if (items.Count > 1)
            {
                for (int i = items.Count - 1; i >= 1; i--)
                {
                    var feedData = new FeedData{Id = items[i].Id};

                    _applicationDbContext.FeedData.Attach(feedData);
                    _applicationDbContext.FeedData.Remove(feedData);
                }

                _applicationDbContext.SaveChanges();
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

            _applicationDbContext.FeedData.Add(feedData);
            _applicationDbContext.SaveChanges();
        }
    }
}