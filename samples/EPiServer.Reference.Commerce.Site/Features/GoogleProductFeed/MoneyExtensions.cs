using System;
using Mediachase.Commerce;

namespace EPiServer.Reference.Commerce.Site.Features.GoogleProductFeed
{
    public static class MoneyExtensions
    {
        public static string FormatPrice(this Money target)
        {
            var roundedPrice = Math.Round(target.Amount, 2).ToString("#.##");
            return $"{roundedPrice} {target.Currency.CurrencyCode}";
        }
    }
}
