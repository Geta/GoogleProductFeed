using EPiServer.ServiceLocation;
using Geta.GoogleProductFeed.Models;
using System;
using System.Linq;
using System.Web;

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

            if (items.Count > (items.Count * 2) - 1)
            {
                for (int i = items.Count - 1; i >= i / 2; i--)
                {
                    var feedData = new FeedData { Id = items[i].Id };

                    _applicationDbContext.FeedData.Attach(feedData);
                    _applicationDbContext.FeedData.Remove(feedData);
                }

                _applicationDbContext.SaveChanges();
            }
        }

        public FeedData GetLatestFeedData()
        {
            var siteHost = HttpContext.Current.Request.Url.Host;
            return _applicationDbContext.FeedData.Where(f => f.Link.Contains(siteHost)).OrderByDescending(f => f.CreatedUtc).FirstOrDefault();
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