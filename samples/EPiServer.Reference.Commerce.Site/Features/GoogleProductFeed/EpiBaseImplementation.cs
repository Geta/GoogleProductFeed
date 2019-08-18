using System;
using System.Collections.Generic;
using System.Linq;
using EPiServer.Commerce.Catalog.ContentTypes;
using EPiServer.Core;
using EPiServer.Reference.Commerce.Site.Features.Product.Models;
using EPiServer.Reference.Commerce.Site.Features.Shared.Extensions;
using EPiServer.Reference.Commerce.Site.Features.Shared.Services;
using EPiServer.Web;
using Geta.GoogleProductFeed.Models;
using Mediachase.Commerce.Catalog;

namespace EPiServer.Reference.Commerce.Site.Features.GoogleProductFeed
{
    public class EpiBaseImplementation : DefaultFeedBuilderBase
    {
        private readonly IPricingService _pricingService;
        private readonly string _siteUrl;

        public EpiBaseImplementation(
            IContentLoader contentLoader,
            ISiteDefinitionRepository siteDefinitionRepository,
            ReferenceConverter referenceConverter,
            IPricingService pricingService) :
            base(contentLoader, referenceConverter)
        {
            _pricingService = pricingService;
            _siteUrl = siteDefinitionRepository.List().FirstOrDefault()?.SiteUrl.ToString();
        }

        protected override Feed GenerateFeedEntity()
        {
            return new Feed
            {
                Updated = DateTime.UtcNow,
                Title = "My products",
                Link = _siteUrl
            };
        }

        protected override Entry GenerateEntry(CatalogContentBase catalogContent)
        {
            var variationContent = catalogContent as FashionVariant;
            if(variationContent == null)
                return null;

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
                Availability = "in stock",
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
                entry.ImageLink = Uri.TryCreate(new Uri(_siteUrl), image, out var imageUri) ? imageUri.ToString() : image;

            if(defaultPrice != null)
            {
                var discountPrice = _pricingService.GetDiscountPrice(variantCode);

                entry.Price = defaultPrice.UnitPrice.FormatPrice();
                entry.SalePrice = discountPrice != null ? discountPrice.UnitPrice.FormatPrice() : string.Empty;
                entry.SalePriceEffectiveDate = $"{DateTime.UtcNow:yyyy-MM-ddThh:mm:ss}/{DateTime.UtcNow.AddDays(7):yyyy-MM-ddThh:mm:ss}";
            }

            return entry;
        }
    }
}
