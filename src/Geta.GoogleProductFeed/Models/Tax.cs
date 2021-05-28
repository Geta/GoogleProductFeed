using System.Xml.Serialization;

namespace Geta.GoogleProductFeed.Models
{
    public class Tax
    {
        [XmlElement("country", Namespace = "http://base.google.com/ns/1.0")]
        public string Country { get; set; }
        
        [XmlElement("region", Namespace = "http://base.google.com/ns/1.0")]
        public string Region { get; set; }
        
        [XmlElement("rate", Namespace = "http://base.google.com/ns/1.0")]
        public double Rate { get; set; }
        
        [XmlElement("tax_ship", Namespace = "http://base.google.com/ns/1.0")]
        public string TaxShip { get; set; }
    }
}