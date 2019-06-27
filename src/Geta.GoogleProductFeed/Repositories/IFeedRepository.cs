using Geta.GoogleProductFeed.Models;

namespace Geta.GoogleProductFeed.Repositories
{
    public interface IFeedRepository
    {
        void RemoveOldVersions(int numberOfGeneratedFeeds);

        FeedData GetLatestFeedData(string siteHost);

        void Save(FeedData feedData);
    }
}
