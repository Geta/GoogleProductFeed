﻿using System.Linq;
using System.Net;
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
            var feed = _feedHelper.GetLatestFeed();

            if (feed == null)
                return Content(HttpStatusCode.NotFound, "No feed generated", new NamespacedXmlMediaTypeFormatter());

            feed.Entries = feed.Entries.Where(e => e.Link.Contains(Request.RequestUri.Host)).ToList();

            return Content(HttpStatusCode.OK, feed, new NamespacedXmlMediaTypeFormatter());
        }
    }
}
