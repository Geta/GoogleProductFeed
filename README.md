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

### Example

```csharp
public class EpiFeedBuilder : FeedBuilder
{
	public override List<Feed> Build()
	{
		var generatedFeeds = new List<Feed>();
		var feed = new Feed
		{
			Updated = DateTime.UtcNow,
			Title = "My products",
			Link = "https://mysite.com"
		};

		var catalogReferences = _contentLoader.GetDescendents(_referenceConverter.GetRootLink());

		var entries = new List<Entry>();
		var market = _currentMarket.GetCurrentMarket();
		var currency = _currencyservice.GetCurrentCurrency();

		foreach (var catalogReference in catalogReferences)
		{
			var catalogContent = _contentLoader.Get<CatalogContentBase>(catalogReference);

			// ReSharper disable once IsExpressionAlwaysFalse
			if (catalogContent is DefaultVariationContent)
			{
				var variationContent = (DefaultVariationContent)catalogContent;
				var defaultPrice = ProductHelper.GetDefaultPrice(variationContent, market, currency);

				var entry = new Entry
				{
					Id = variationContent.Code,
					Title = variationContent.DisplayName,
					Description = variationContent.Description.ToHtmlString(),
					Link = variationContent.ContentLink.GetFriendlyUrl(true),
					Condition = "new",
					Availablity = "in stock",
					Brand = variationContent.Brand,
					MPN = "",
					GTIN = variationContent.GTIN,
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
				    var imageUrl = new Url(image);

				    entry.ImageLink = imageUrl.ToAbsoluteUri().ToString();
				}

				if (defaultPrice != null)
				{
					var discountPrice = ProductHelper.GetDiscountPrice(defaultPrice, market, currency);

					entry.Price = defaultPrice.UnitPrice.ToString();
					entry.SalePrice = discountPrice.ToString();
					entry.SalePriceEffectiveDate = DateTime.UtcNow;
				}

				entries.Add(entry);
			}
		}

		feed.Entries = entries;
		generatedFeeds.Add(feed);

		return generatedFeeds;
	}
}
```

Then you need to use this as the default implementation for FeedBuilder. Using StructureMap it will look something like this in your registry class:

```csharp
For<FeedBuilder>().Use<EpiFeedBuilder>();
```

Make sure dependency injection is setup for Web API. The quickest way to do this is install the package: Foundation.WebApi.

## Feed Generation
Populating the feed is handled through a scheduled job and the result is serialized and stored in the database. See job `Google ProductFeed - Create feed` in admin mode. 

## Troubleshooting
If your request to `/googleproductfeed` returns 404 with message `No feed generated`, make sure you run the job to populate the feed.

## Build & Run Locally
googleproductfeed.getalocaltest.me

172.16.238.51

## Package maintainer

https://github.com/frederikvig

## Changelog

[Changelog](CHANGELOG.md)
