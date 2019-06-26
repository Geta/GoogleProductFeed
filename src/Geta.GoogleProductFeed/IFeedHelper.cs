using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Geta.GoogleProductFeed.Models;

namespace Geta.GoogleProductFeed
{
    public interface IFeedHelper
    {
        bool GenerateAndSaveData();

        Feed GetLatestFeed(string siteHost);

    }
}
