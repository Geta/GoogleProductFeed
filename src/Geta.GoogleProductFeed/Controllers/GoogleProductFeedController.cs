// Copyright (c) Geta Digital. All rights reserved.
// Licensed under MIT.
// See the LICENSE file in the project root for more information

using System.Linq;
using System.Net;
using System.Web;
using System.Web.Http;

namespace Geta.GoogleProductFeed.Controllers
{
    public class GoogleProductFeedController : ApiController
    {
        private readonly IFeedHelper _feedHelper;

        public GoogleProductFeedController(IFeedHelper feedHelper)
        {
            _feedHelper = feedHelper;
        }

        [Route("googleproductfeed")]
        public IHttpActionResult Get()
        {
            var siteHost = HttpContext.Current.Request.Url.Host;
            var feed = _feedHelper.GetLatestFeed(siteHost);

            if(feed == null)
                return Content(HttpStatusCode.NotFound, "No feed generated", new NamespacedXmlMediaTypeFormatter());

            feed.Entries = feed.Entries.Where(e => e.Link.Contains(Request.RequestUri.Host)).ToList();

            return Content(HttpStatusCode.OK, feed, new NamespacedXmlMediaTypeFormatter());
        }
    }
}
