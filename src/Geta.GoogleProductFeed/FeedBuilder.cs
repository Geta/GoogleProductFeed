// Copyright (c) Geta Digital. All rights reserved.
// Licensed under MIT.
// See the LICENSE file in the project root for more information

using System.Collections.Generic;
using Geta.GoogleProductFeed.Models;

namespace Geta.GoogleProductFeed
{
    public abstract class FeedBuilder
    {
        public abstract List<Feed> Build();
    }
}
