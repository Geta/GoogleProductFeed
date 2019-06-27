using System.Collections.Generic;
using Geta.GoogleProductFeed.Models;

namespace Geta.GoogleProductFeed
{
    public abstract class FeedBuilder
    {
        public abstract List<Feed> Build();
    }
}
