# Geta Google Product Feed

![](http://tc.geta.no/app/rest/builds/buildType:(id:TeamFrederik_GoogleProductFeed_CreateAndPublishNuGetPackage)/statusIcon)
[![Platform](https://img.shields.io/badge/Platform-.NET 4.5.2-blue.svg?style=flat)](https://msdn.microsoft.com/en-us/library/w0x726c2%28v=vs.110%29.aspx)


This will create a Google Product Feed based on the [Atom specification](https://support.google.com/merchants/answer/160593?hl=en). For information on what is required and what the different attributes/properties mean, please see the [Product data specification](https://support.google.com/merchants/answer/188494).

## Installation

```
Install-Package Geta.GoogleProductFeed
```

Note that you need to make sure your projects calls config.MapHttpAttributeRoutes(); in order for the feed routing to work.

Default URL is: /googleproductfeed

## FeedBuilder

You need to implement the abstract class FeedBuilder and the method Build. This will provide the feed data.

### Example

```csharp
public class EpiFeedBuilder : FeedBuilder
{
	public override Feed Build()
	{
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
					ImageLink = variationContent.GetDefaultAsset<IContentImage>(), // TODO make external
					Brand = variationContent.Brand,
					MPN = "",
					GTIN = "", // TODO needs to be set
					GoogleProductCategory = "",
					ProductType = "", // Consumer Electronics &gt; TVs &gt; Flat Panel TVs, TODO optional
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

		return feed;
	}
}
```

Note that you should cache this data since the WebAPI controller won`t do that for you and this can be quite a heavy operation.

Then you need to use this as the default implementation for FeedBuilder. Using StructureMap it will look something like this in your registry class:

```csharp
For<FeedBuilder>().Use<EpiFeedBuilder>();
```
