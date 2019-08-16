// Copyright (c) Geta Digital. All rights reserved.
// Licensed under MIT.
// See the LICENSE file in the project root for more information

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
