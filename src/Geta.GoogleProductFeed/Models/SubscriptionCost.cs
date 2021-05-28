using System.Xml.Serialization;

namespace Geta.GoogleProductFeed.Models
{
    public class SubscriptionCost
    {
        [XmlElement("period", Namespace = "http://base.google.com/ns/1.0")]
        public string Period { get; set; }
        
        [XmlElement("period_length", Namespace = "http://base.google.com/ns/1.0")]
        public int PeriodLength { get; set; }
        
        [XmlElement("amount", Namespace = "http://base.google.com/ns/1.0")]
        public string Amount { get; set; }
    }
}