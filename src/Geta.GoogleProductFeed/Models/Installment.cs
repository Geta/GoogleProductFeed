using System.Xml.Serialization;

namespace Geta.GoogleProductFeed.Models
{
    public class Installment
    {
        [XmlElement("months", Namespace = "http://base.google.com/ns/1.0")]
        public int Months { get; set; }
        
        [XmlElement("amount", Namespace = "http://base.google.com/ns/1.0")]
        public string Amount { get; set; }

    }
}