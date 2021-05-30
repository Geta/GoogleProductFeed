using System.Xml.Serialization;

namespace Geta.GoogleProductFeed.Models
{
    public class LoyaltyPoints
    {
        [XmlElement("name", Namespace = "http://base.google.com/ns/1.0")]
        public string Name { get; set; }
        
        [XmlElement("points_value", Namespace = "http://base.google.com/ns/1.0")]
        public int PointsValue { get; set; }
        
        [XmlElement("ratio", Namespace = "http://base.google.com/ns/1.0")]
        public double Ration { get; set; }

    }
}