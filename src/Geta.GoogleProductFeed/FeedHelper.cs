using System.IO;
using System.Xml.Serialization;
using EPiServer.ServiceLocation;
using Geta.GoogleProductFeed.Models;
using Geta.GoogleProductFeed.Repositories;

namespace Geta.GoogleProductFeed
{
    [ServiceConfiguration(typeof(IFeedHelper))]
    public class FeedHelper : IFeedHelper
    {
        private readonly FeedBuilder _feedBuilder;
        private readonly IFeedRepository _feedRepository;
        private const string Ns = "http://www.w3.org/2005/Atom";

        public FeedHelper(FeedBuilder feedBuilder, IFeedRepository feedRepository)
        {
            _feedBuilder = feedBuilder;
            _feedRepository = feedRepository;
        }

        public bool GenerateAndSaveData()
        {
            var feed = _feedBuilder.Build();

            if (feed == null)
                return false;

            var feedData = new FeedData
            {
                CreatedUtc = feed.Updated
            };

            using (var ms = new MemoryStream())
            {
                var serializer = new XmlSerializer(typeof(Feed), Ns);
                serializer.Serialize(ms, feed);
                feedData.FeedBytes = ms.ToArray();
            }

            _feedRepository.Save(feedData);

            // we only need to keep one version - remove older ones to avoid filling up the database
            _feedRepository.RemoveOldVersion();

            return true;
        }

        public Feed GetLatestFeed()
        {
            var feedData = _feedRepository.GetLatestFeedData();

            if (feedData == null)
                return null;

            var serializer = new XmlSerializer(typeof(Feed), Ns);

            using (MemoryStream ms = new MemoryStream(feedData.FeedBytes))
            {
                return serializer.Deserialize(ms) as Feed;
            }
        }
    }
}