# Geta Google Product Feed
![](http://tc.geta.no/app/rest/builds/buildType:(id:TeamFrederik_GoogleProductFeed_CreateAndPublishNuGetPackage)/statusIcon)
[![Platform](https://img.shields.io/badge/Platform-.NET%204.6.1-blue.svg?style=flat)](https://msdn.microsoft.com/en-us/library/w0x726c2%28v=vs.110%29.aspx)
[![Platform](https://img.shields.io/badge/EPiServer-%2011-orange.svg?style=flat)](http://world.episerver.com/cms/)

Credits: [How to make a Google Shopping Feed with C# and serve it through the Web API](http://blog.codenamed.nl/2015/05/14/creating-a-google-shopping-feed-with-c/).

This will create a Google Product Feed based on the [Atom specification](https://support.google.com/merchants/answer/160593?hl=en). For information on what is required and what the different attributes/properties mean, please see the [Product data specification](https://support.google.com/merchants/answer/188494).

## Installation
```
Install-Package Geta.GoogleProductFeed
```

Note that you need to make sure your projects calls config.MapHttpAttributeRoutes(); in order for the feed routing to work.

Default URL is: /googleproductfeed

## FeedBuilder
You need to implement the abstract class FeedBuilder and the method Build. This will provide the feed data. Build method returns List of feeds, this is required so that FeedBuilder can produce feeds for both multisite and singlesite projects. Example bellow can be extended to support multisite projects.

### Default FeedBuilder
You can iherit from default base feed builder class (`DefaultFeedBuilderBase`) which will help you get started.
It contains CatalogEntry enumeration code and sample error handling. You will need to implement following methods:

```csharp
protected abstract Feed GenerateFeedEntity();

protected abstract Entry GenerateEntry(CatalogContentBase catalogContent);
```

So for example:

```csharp
public class EpiFeedBuilder : DefaultFeedBuilderBase
{
    private readonly IPricingService _pricingService;
    private readonly Uri _siteUri;

    public EpiFeedBuilder(
        IContentLoader contentLoader,
        ReferenceConverter referenceConverter,
        IPricingService pricingService,
        ISiteDefinitionRepository siteDefinitionRepository,
        ILogger logger) : base(contentLoader, referenceConverter, logger)
    {
        _pricingService = pricingService;
        _siteUri = siteDefinitionRepository.List().FirstOrDefault()?.Hosts.GetPrimaryHostDefinition().Url;
    }

    protected override Feed GenerateFeedEntity()
    {
        return new Feed
        {
            Updated = DateTime.UtcNow,
            Title = "My products",
            Link = _siteUri.ToString()
        };
    }

    protected override Entry GenerateEntry(CatalogContentBase catalogContent)
    {
        return ...;
    }

    private HostDefinition GetPrimaryHostDefinition(IList<HostDefinition> hosts)
    {
        if (hosts == null)
        {
            throw new ArgumentNullException(nameof(hosts));
        }

        return hosts.FirstOrDefault(h => h.Type == HostDefinitionType.Primary && !h.IsWildcardHost())
               ?? hosts.FirstOrDefault(h => !h.IsWildcardHost());
    }
}
```

### Implement Your Own Builder
If you need more flexible solution to build Google Product Feed - you can implement whole builder yourself.
Below is given sample feed builder (based on Quicksilver demo project). Please use it as starting point and adjust things that you need to customize.
Also keep in mind that for example error handling is not implemented in this sample (which means if variation generation fails - job will be aborted and feed will not be generated at all).

```csharp
public class EpiFeedBuilder : FeedBuilder
{
    private readonly IContentLoader _contentLoader;
    private readonly ReferenceConverter _referenceConverter;
    private readonly IPricingService _pricingService;
    private readonly ILogger _logger;
    private readonly Uri _siteUri;

    public EpiFeedBuilder(
        IContentLoader contentLoader,
        ReferenceConverter referenceConverter,
        IPricingService pricingService,
        ISiteDefinitionRepository siteDefinitionRepository,
        ILogger logger)
    {
        _contentLoader = contentLoader;
        _referenceConverter = referenceConverter;
        _pricingService = pricingService;
        _logger = logger;
        _siteUri = GetPrimaryHostDefinition(siteDefinitionRepository.List().FirstOrDefault()?.Hosts)?.Url;
    }

    public override List<Feed> Build()
    {
        var generatedFeeds = new List<Feed>();
        var feed = new Feed
        {
            Updated = DateTime.UtcNow,
            Title = "My products",
            Link = _siteUri.ToString()
        };

        var catalogReferences = _contentLoader.GetDescendents(_referenceConverter.GetRootLink());
        var entries = new List<Entry>();

        foreach (var catalogReference in catalogReferences)
        {
            var catalogContent = _contentLoader.Get<CatalogContentBase>(catalogReference);
            var variationContent = catalogContent as FashionVariant;

            try
            {
                if (variationContent == null)
                    continue;

                var product = _contentLoader.Get<CatalogContentBase>(variationContent.GetParentProducts().FirstOrDefault()) as FashionProduct;
                var variantCode = variationContent.Code;
                var defaultPrice = _pricingService.GetPrice(variantCode);

                var entry = new Entry
                {
                    Id = variationContent.Code,
                    Title = variationContent.DisplayName,
                    Description = product?.Description.ToHtmlString(),
                    Link = variationContent.GetUrl(),
                    Condition = "new",
                    Availability = "in stock",
                    Brand = product?.Brand,
                    MPN = "",
                    GTIN = "...",
                    GoogleProductCategory = "",
                    Shipping = new List<Shipping>
                    {
                        new Shipping
                        {
                            Price = "Free",
                            Country = "US",
                            Service = "Standard"
                        }
                    }
                };

                string image = variationContent.GetDefaultAsset<IContentImage>();

                if (!string.IsNullOrEmpty(image))
                {
                    entry.ImageLink = Uri.TryCreate(_siteUri, image, out var imageUri) ? imageUri.ToString() : image;
                }

                if (defaultPrice != null)
                {
                    var discountPrice = _pricingService.GetDiscountPrice(variantCode);

                    entry.Price = defaultPrice.UnitPrice.ToString();
                    entry.SalePrice = discountPrice.ToString();
                    entry.SalePriceEffectiveDate = $"{DateTime.UtcNow:yyyy-MM-ddThh:mm:ss}/{DateTime.UtcNow.AddDays(7):yyyy-MM-ddThh:mm:ss}";
                }

                entries.Add(entry);
            }
            catch (Exception ex)
            {
                _logger.Error($"Failed to generate feed item for catalog entry ({catalogContent.ContentGuid})", ex);
            }
        }

        feed.Entries = entries;
        generatedFeeds.Add(feed);

        return generatedFeeds;
    }

    private HostDefinition GetPrimaryHostDefinition(IList<HostDefinition> hosts)
    {
        if (hosts == null)
        {
            throw new ArgumentNullException(nameof(hosts));
        }

        return hosts.FirstOrDefault(h => h.Type == HostDefinitionType.Primary && !h.IsWildcardHost())
                ?? hosts.FirstOrDefault(h => !h.IsWildcardHost());
    }
}
```


### Register Builder in IoC
Then you need to use this as the default implementation for FeedBuilder. Using StructureMap it will look something like this in your registry class:

```csharp
For<FeedBuilder>().Use<EpiFeedBuilder>();
```

Make sure dependency injection is setup for Web API. The quickest way to do this is install the package: Foundation.WebApi.

## Feed Generation
Populating the feed is handled through a scheduled job and the result is serialized and stored in the database. See job `Google ProductFeed - Create feed` in admin mode. 

## Troubleshooting
If your request to `/googleproductfeed` returns 404 with message `No feed generated`, make sure you run the job to populate the feed.

## Local development setup
See description in [shared repository](https://github.com/Geta/package-shared/blob/master/README.md#local-development-set-up) regarding how to setup local development environment.

### Docker hostnames
Instead of using the static IP addresses the following hostnames can be used out-of-the-box.

http://googleproductfeed.getalocaltest.me
http://manager-googleproductfeed.getalocaltest.me


## Package maintainer
https://github.com/frederikvig

## Changelog
[Changelog](CHANGELOG.md)
