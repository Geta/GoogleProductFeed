// Copyright (c) Geta Digital. All rights reserved.
// Licensed under MIT.
// See the LICENSE file in the project root for more information

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

        public void RemoveOldVersions(int numberOfGeneratedFeeds)
        {
            var items = _applicationDbContext.FeedData
                                             .Select(x => new
                                             {
                                                 x.Id, x.CreatedUtc
                                             }).OrderByDescending(x => x.CreatedUtc).ToList();

            if(items.Count > numberOfGeneratedFeeds)
            {
                for (int i = items.Count - 1; i >= numberOfGeneratedFeeds; i--)
                {
                    var feedData = new FeedData { Id = items[i].Id };

                    _applicationDbContext.FeedData.Attach(feedData);
                    _applicationDbContext.FeedData.Remove(feedData);
                }

                _applicationDbContext.SaveChanges();
            }
        }

        public FeedData GetLatestFeedData(string siteHost)
        {
            return _applicationDbContext.FeedData.Where(f => f.Link.Contains(siteHost)).OrderByDescending(f => f.CreatedUtc).FirstOrDefault();
        }

        public void Save(FeedData feedData)
        {
            if(feedData == null)
            {
                return;
            }

            feedData.CreatedUtc = DateTime.UtcNow;

            _applicationDbContext.FeedData.Add(feedData);
            _applicationDbContext.SaveChanges();
        }
    }
}
