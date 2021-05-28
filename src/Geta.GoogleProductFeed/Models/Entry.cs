// Copyright (c) Geta Digital. All rights reserved.
// Licensed under Apache-2.0. See the LICENSE file in the project root for more information

using System;
using System.Collections.Generic;
using System.Xml.Serialization;

namespace Geta.GoogleProductFeed.Models
{
    [XmlType(TypeName = "entry")]
    [Serializable]
    public class Entry
    {
        #region Basic product data

        [XmlElement("id", Namespace = "http://base.google.com/ns/1.0")]
        public string Id { get; set; }

        [XmlElement("title", Namespace = "http://base.google.com/ns/1.0")]
        public string Title { get; set; }
        
        [XmlElement("description", Namespace = "http://base.google.com/ns/1.0")]
        public string Description { get; set; }
        
        [XmlElement("link", Namespace = "http://base.google.com/ns/1.0")]
        public string Link { get; set; }
        
        [XmlElement("image_link", Namespace = "http://base.google.com/ns/1.0")]
        public string ImageLink { get; set; }
        
        [XmlElement("additional_image_link", Namespace = "http://base.google.com/ns/1.0")]
        public string[] AdditionalImageLinks { get; set; }
        
        [XmlElement("mobile_link", Namespace = "http://base.google.com/ns/1.0")]
        public string[] MobileLink { get; set; }
        
        #endregion
        
        #region Price & availability
        
        [XmlElement("availability", Namespace = "http://base.google.com/ns/1.0")]
        public string Availability { get; set; }
        
        [XmlElement("availability_date", Namespace = "http://base.google.com/ns/1.0")]
        public string AvailabilityDate { get; set; }
        
        [XmlElement("cost_of_goods_sold", Namespace = "http://base.google.com/ns/1.0")]
        public string CostOfGoodsSold { get; set; }
        
        [XmlElement("expiration_date", Namespace = "http://base.google.com/ns/1.0")]
        public string ExpirationDate { get; set; }
        
        [XmlElement("price", Namespace = "http://base.google.com/ns/1.0")]
        public string Price { get; set; }
        
        [XmlElement("sale_price", Namespace = "http://base.google.com/ns/1.0")]
        public string SalePrice { get; set; }
        
        // Changed to support the expected date range, https://support.google.com/merchants/answer/6324460
        [XmlElement("sale_price_effective_date", Namespace = "http://base.google.com/ns/1.0")]
        public string SalePriceEffectiveDate { get; set; }
        
        [XmlElement("unit_pricing_measure", Namespace = "http://base.google.com/ns/1.0")]
        public string UnitPricingMeasure { get; set; }
        
        [XmlElement("unit_pricing_base_measure", Namespace = "http://base.google.com/ns/1.0")]
        public string UnitPricingBaseMeasure { get; set; }
        
        [XmlElement("installment", Namespace = "http://base.google.com/ns/1.0")]
        public Installment Installment { get; set; }
        
        [XmlElement("subscription_cost", Namespace = "http://base.google.com/ns/1.0")]
        public SubscriptionCost SubscriptionCost { get; set; }
        
        [XmlElement("loyalty_points", Namespace = "http://base.google.com/ns/1.0")]
        public LoyaltyPoints LoyaltyPoints { get; set; }
        
        #endregion
        
        #region Detailed product description
        
        [XmlElement("condition", Namespace = "http://base.google.com/ns/1.0")]
        public string Condition { get; set; }
        
        [XmlElement("adult", Namespace = "http://base.google.com/ns/1.0")]
        public string Adult { get; set; }
        
        [XmlElement("multipack", Namespace = "http://base.google.com/ns/1.0")]
        public uint Multipack { get; set; }
        
        [XmlElement("is_bundle", Namespace = "http://base.google.com/ns/1.0")]
        public string IsBundle { get; set; }
        
        [XmlElement("energy_efficiency_class", Namespace = "http://base.google.com/ns/1.0")]
        public string EnergyEfficiencyClass { get; set; }
        
        [XmlElement("min_energy_efficiency_class", Namespace = "http://base.google.com/ns/1.0")]
        public string MinEnergyEfficiencyClass { get; set; }
        
        [XmlElement("max_energy_efficiency_class", Namespace = "http://base.google.com/ns/1.0")]
        public string MaxEnergyEfficiencyClass { get; set; }
        
        // Required if item is apparel
        [XmlElement("age_group", Namespace = "http://base.google.com/ns/1.0")]
        public string AgeGroup { get; set; }
        
        // Required if item is apparel
        [XmlElement("color", Namespace = "http://base.google.com/ns/1.0")]
        public string Color { get; set; }
        
        // Required if item is apparel
        [XmlElement("gender", Namespace = "http://base.google.com/ns/1.0")]
        public string Gender { get; set; }
        
        [XmlElement("material", Namespace = "http://base.google.com/ns/1.0")]
        public string Material { get; set; }
        
        [XmlElement("pattern", Namespace = "http://base.google.com/ns/1.0")]
        public string Pattern { get; set; }
        
        // Required if item is apparel
        [XmlElement("size", Namespace = "http://base.google.com/ns/1.0")]
        public string Size { get; set; }
        
        [XmlElement("size_type", Namespace = "http://base.google.com/ns/1.0")]
        public string SizeType { get; set; }
        
        [XmlElement("size_system", Namespace = "http://base.google.com/ns/1.0")]
        public string SizeSystem { get; set; }
        
        [XmlElement("item_group_id", Namespace = "http://base.google.com/ns/1.0")]
        public string ItemGroupId { get; set; }
        
        [XmlElement("product_detail", Namespace = "http://base.google.com/ns/1.0")]
        public ProductDetail ProductDetail { get; set; }
        
        [XmlElement("product_highlight", Namespace = "http://base.google.com/ns/1.0")]
        public string ProductHighlight { get; set; }
        
        #endregion

        #region Product identifiers
        
        [XmlElement("brand", Namespace = "http://base.google.com/ns/1.0")]
        public string Brand { get; set; }

        [XmlElement("gtin", Namespace = "http://base.google.com/ns/1.0")]
        public string GTIN { get; set; }
        
        [XmlElement("mpn", Namespace = "http://base.google.com/ns/1.0")]
        public string MPN { get; set; }
        
        [XmlElement("identifier_exists", Namespace = "http://base.google.com/ns/1.0")]
        public string IdentifierExists { get; set; }
        
        #endregion

        #region Shipping

        [XmlElement("shipping", Namespace = "http://base.google.com/ns/1.0")]
        public List<Shipping> Shipping { get; set; }
        
        [XmlElement("shipping_label", Namespace = "http://base.google.com/ns/1.0")]
        public string ShippingLabel { get; set; }
        
        [XmlElement("shipping_weight", Namespace = "http://base.google.com/ns/1.0")]
        public string ShippingWeight { get; set; }
        
        [XmlElement("shipping_length", Namespace = "http://base.google.com/ns/1.0")]
        public string ShippingLength { get; set; }
        
        [XmlElement("shipping_width", Namespace = "http://base.google.com/ns/1.0")]
        public string ShippingWidth { get; set; }
        
        [XmlElement("shipping_height", Namespace = "http://base.google.com/ns/1.0")]
        public string ShippingHeight { get; set; }
        
        [XmlElement("ships_from_country", Namespace = "http://base.google.com/ns/1.0")]
        public string ShipsFromCountry { get; set; }
        
        [XmlElement("transit_time_label", Namespace = "http://base.google.com/ns/1.0")]
        public string TransitTimeLabel { get; set; }
        
        [XmlElement("max_handling_time", Namespace = "http://base.google.com/ns/1.0")]
        public uint MaxHandlingTime { get; set; }
        
        [XmlElement("min_handling_time", Namespace = "http://base.google.com/ns/1.0")]
        public uint MinHandlingTime { get; set; }

        #endregion
        
        #region Product category
        
        [XmlElement("google_product_category", Namespace = "http://base.google.com/ns/1.0")]
        public string GoogleProductCategory { get; set; }

        [XmlElement("product_type", Namespace = "http://base.google.com/ns/1.0")]
        public string ProductType { get; set; }
        
        #endregion
        
        #region Shopping campaigns and other configurations
    
        [XmlElement("ads_redirect", Namespace = "http://base.google.com/ns/1.0")]
        public string AdsRedirect { get; set; }
        
        [XmlElement("custom_label_0", Namespace = "http://base.google.com/ns/1.0")]
        public string CustomLabel0 { get; set; }
        
        [XmlElement("custom_label_1", Namespace = "http://base.google.com/ns/1.0")]
        public string CustomLabel1 { get; set; }
        
        [XmlElement("custom_label_2", Namespace = "http://base.google.com/ns/1.0")]
        public string CustomLabel2 { get; set; }
        
        [XmlElement("custom_label_3", Namespace = "http://base.google.com/ns/1.0")]
        public string CustomLabel3 { get; set; }
        
        [XmlElement("custom_label_4", Namespace = "http://base.google.com/ns/1.0")]
        public string CustomLabel4 { get; set; }
        
        [XmlElement("promotion_id", Namespace = "http://base.google.com/ns/1.0")]
        public string PromotionId { get; set; }
        
        #endregion

        #region Tax

        [XmlElement("tax", Namespace = "http://base.google.com/ns/1.0")]
        public Tax Tax { get; set; }
        
        [XmlElement("tax_category", Namespace = "http://base.google.com/ns/1.0")]
        public string TaxCategory { get; set; }

        #endregion

        #region Destinations

        [XmlElement("excluded_destination", Namespace = "http://base.google.com/ns/1.0")]
        public string ExcludedDestination { get; set; }
        
        [XmlElement("included_destination", Namespace = "http://base.google.com/ns/1.0")]
        public string IncludedDestination { get; set; }
        
        [XmlElement("shopping_ads_excluded_country", Namespace = "http://base.google.com/ns/1.0")]
        public string ShoppingAdsExcludedCountry { get; set; }

        #endregion
    }
}
