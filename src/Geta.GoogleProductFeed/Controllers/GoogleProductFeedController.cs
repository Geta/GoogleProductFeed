using System.IO;
using System.Net;
using System.Web.Http;
using System.Xml.Serialization;
using Geta.GoogleProductFeed.Models;
using Geta.GoogleProductFeed.Repositories;

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

            return Content(HttpStatusCode.OK, feed, new NamespacedXmlMediaTypeFormatter());
        }
    }
}
