// Copyright (c) Geta Digital. All rights reserved.
// Licensed under MIT.
// See the LICENSE file in the project root for more information

using EPiServer.PlugIn;
using EPiServer.Scheduler;

namespace Geta.GoogleProductFeed
{
    [ScheduledPlugIn(DisplayName = "Google ProductFeed - Create feed", Description = "Creates and stores Google product feed in database")]
    public class FeedBuilderCreateJob : ScheduledJobBase
    {
        private readonly IFeedHelper _feedHelper;

        public FeedBuilderCreateJob(IFeedHelper feedHelper)
        {
            _feedHelper = feedHelper;
        }

        public override string Execute()
        {
            var result = _feedHelper.GenerateAndSaveData();

            return result ? "Job successfully executed. Feed created and saved to the database." : "Job failed - FeedBuilder.Build() returned null.";
        }
    }
}
