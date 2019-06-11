using Geta.GoogleProductFeed.Models;

namespace Geta.GoogleProductFeed.Repositories
{
    public interface IFeedRepository
    {
        void RemoveOldVersion();
        
        FeedData GetLatestFeedData();

        void Save(FeedData feedData);
    }
}
