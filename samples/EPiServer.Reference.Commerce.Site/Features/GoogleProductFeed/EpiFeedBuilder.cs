using System;
using System.Collections.Generic;
using System.Linq;
using EPiServer.Commerce.Catalog.ContentTypes;
using EPiServer.Core;
using EPiServer.Reference.Commerce.Site.Features.Market.Services;
using EPiServer.Reference.Commerce.Site.Features.Product.Models;
using EPiServer.Reference.Commerce.Site.Features.Shared.Extensions;
using EPiServer.Reference.Commerce.Site.Features.Shared.Services;
using EPiServer.Web;
using Geta.GoogleProductFeed;
using Geta.GoogleProductFeed.Models;
using Mediachase.Commerce.Catalog;

namespace EPiServer.Reference.Commerce.Site.Features.GoogleProductFeed
{
    public class EpiFeedBuilder : FeedBuilder
    {
        private readonly IContentLoader _contentLoader;
        private readonly IPricingService _pricingService;
        private readonly ReferenceConverter _referenceConverter;
        private readonly ISiteDefinitionRepository _siteDefinitionRepository;

        public EpiFeedBuilder(
            IContentLoader contentLoader,
            ReferenceConverter referenceConverter,
            IPricingService pricingService,
            ISiteDefinitionRepository siteDefinitionRepository)
        {
            _contentLoader = contentLoader;
            _referenceConverter = referenceConverter;
            _pricingService = pricingService;
            _siteDefinitionRepository = siteDefinitionRepository;
        }

        public override List<Feed> Build()
        {
            var generatedFeeds = new List<Feed>();
            var siteUrl = _siteDefinitionRepository.List().FirstOrDefault()?.SiteUrl.ToString();

            var feed = new Feed
            {
                Updated = DateTime.UtcNow,
                Title = "My products",
                Link = siteUrl
            };

            var entries = new List<Entry>();
            var catalogReferences = _contentLoader.GetDescendents(_referenceConverter.GetRootLink());

            foreach (var catalogReference in catalogReferences)
            {
                var catalogContent = _contentLoader.Get<CatalogContentBase>(catalogReference);
                var variationContent = catalogContent as FashionVariant;
                if(variationContent != null)
                {
                    var product = _contentLoader.Get<CatalogContentBase>(variationContent.GetParentProducts().FirstOrDefault()) as FashionProduct;
                    var variantCode = variationContent.Code;
                    var defaultPrice = _pricingService.GetDefaultPrice(variantCode);

                    var entry = new Entry
                    {
                        Id = variantCode,
                        Title = variationContent.DisplayName,
                        Description = product?.Description.ToHtmlString(),
                        Link = variationContent.GetUrl(),
                        Condition = "new",
                        Availablity = "in stock",
                        Brand = product?.Brand,
                        MPN = string.Empty,
                        GTIN = "725272730706",
                        GoogleProductCategory = string.Empty,
                        Shipping = new List<Shipping>
                        {
                            new Shipping
                            {
                                Price = "1 USD",
                                Country = "US",
                                Service = "Standard"
                            }
                        }
                    };

                    var image = variationContent.GetDefaultAsset<IContentImage>();
                    if(!string.IsNullOrEmpty(image))
                        entry.ImageLink = Uri.TryCreate(new Uri(siteUrl), image, out var imageUri) ? imageUri.ToString() : image;

                    if(defaultPrice != null)
                    {
                        var discountPrice = _pricingService.GetDiscountPrice(variantCode);

                        entry.Price = defaultPrice.UnitPrice.FormatPrice();
                        entry.SalePrice = discountPrice != null ? discountPrice.UnitPrice.FormatPrice() : string.Empty;
                        entry.SalePriceEffectiveDate = $"{DateTime.UtcNow:yyyy-MM-ddThh:mm:ss}/{DateTime.UtcNow.AddDays(7):yyyy-MM-ddThh:mm:ss}";
                    }

                    entries.Add(entry);
                }
            }

            feed.Entries = entries;
            generatedFeeds.Add(feed);

            return generatedFeeds;
        }
    }
}
