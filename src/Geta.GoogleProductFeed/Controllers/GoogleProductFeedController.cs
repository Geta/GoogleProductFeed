using System.Net;
using System.Web.Http;

namespace Geta.GoogleProductFeed.Controllers
{
    public class GoogleProductFeedController : ApiController
    {
        private readonly FeedBuilder _feedBuilder;

        public GoogleProductFeedController(FeedBuilder feedBuilder)
        {
            _feedBuilder = feedBuilder;
        }

        [Route("googleproductfeed")]
        public IHttpActionResult Get()
        {
            var feed = _feedBuilder.Build();

            return Content(HttpStatusCode.OK, feed, new NamespacedXmlMediaTypeFormatter());
        }
    }
}
