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

using System.Collections.Generic;
using System.IO;
using System.Xml.Serialization;
using Castle.Core.Internal;
using EPiServer.ServiceLocation;
using Geta.GoogleProductFeed.Models;
using Geta.GoogleProductFeed.Repositories;

namespace Geta.GoogleProductFeed
{
    [ServiceConfiguration(typeof(IFeedHelper))]
    public class FeedHelper : IFeedHelper
    {
        private const string Ns = "http://www.w3.org/2005/Atom";
        private readonly FeedBuilder _feedBuilder;
        private readonly IFeedRepository _feedRepository;

        public FeedHelper(FeedBuilder feedBuilder, IFeedRepository feedRepository)
        {
            _feedBuilder = feedBuilder;
            _feedRepository = feedRepository;
        }

        public bool GenerateAndSaveData()
        {
            var feeds = _feedBuilder.Build();

            if(feeds.IsNullOrEmpty())
                return false;

            var numberOfGeneratedFeeds = feeds.Count;

            foreach (var feed in feeds)
            {
                var feedData = new FeedData
                {
                    CreatedUtc = feed.Updated,
                    Link = feed.Link
                };

                using (var ms = new MemoryStream())
                {
                    var serializer = new XmlSerializer(typeof(Feed), Ns);
                    serializer.Serialize(ms, feed);
                    feedData.FeedBytes = ms.ToArray();
                }

                _feedRepository.Save(feedData);
            }

            // we only need to keep one version of each feed - remove older ones to avoid filling up the database
            _feedRepository.RemoveOldVersions(numberOfGeneratedFeeds);
            return true;
        }

        public Feed GetLatestFeed(string siteHost)
        {
            var feedData = _feedRepository.GetLatestFeedData(siteHost);

            if(feedData == null)
                return null;

            var serializer = new XmlSerializer(typeof(Feed), Ns);
            using (var ms = new MemoryStream(feedData.FeedBytes))
            {
                return serializer.Deserialize(ms) as Feed;
            }
        }
    }
}
