// Copyright (c) Geta Digital. All rights reserved.
// Licensed under MIT.
// See the LICENSE file in the project root for more information

using System;
using System.Collections.Generic;
using System.Xml.Serialization;

namespace Geta.GoogleProductFeed.Models
{
    [XmlRoot("feed")]
    [Serializable]
    public class Feed
    {
        [XmlElement("title")]
        public string Title { get; set; }

        [XmlElement("link")]
        public string Link { get; set; }

        [XmlElement("updated")]
        public DateTime Updated { get; set; }

        [XmlElement("entry")]
        public List<Entry> Entries { get; set; }
    }
}
