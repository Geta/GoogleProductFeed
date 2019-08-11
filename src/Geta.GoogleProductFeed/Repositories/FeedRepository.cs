// Copyright (c) 2019 Geta Digital.
// Permission is hereby granted, free of charge, to any person
// obtaining a copy of this software and associated documentation
// files (the "Software"), to deal in the Software without
// restriction, including without limitation the rights to use,
// copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the
// Software is furnished to do so, subject to the following
// conditions:
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
// OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
// HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
// WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
// OTHER DEALINGS IN THE SOFTWARE.

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
