// Copyright (c) Geta Digital. All rights reserved.
// Licensed under MIT.
// See the LICENSE file in the project root for more information

using System;
using System.Collections.Generic;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Net.Http.Formatting;
using System.Threading.Tasks;
using System.Xml;
using System.Xml.Serialization;

namespace Geta.GoogleProductFeed
{
    public class NamespacedXmlMediaTypeFormatter : XmlMediaTypeFormatter
    {
        public XmlSerializerNamespaces Namespaces { get; private set; }
        Dictionary<Type, XmlSerializer> Serializers { get; set; }

        public NamespacedXmlMediaTypeFormatter()
        {
            Namespaces = new XmlSerializerNamespaces();
            Namespaces.Add("g", "http://base.google.com/ns/1.0");

            Serializers = new Dictionary<Type, XmlSerializer>();
        }

        public override Task WriteToStreamAsync(Type type, object value, Stream writeStream, HttpContent content, TransportContext transportContext)
        {
            lock (Serializers)
            {
                if (!Serializers.ContainsKey(type))
                {
                    var serializer = new XmlSerializer(type, "http://www.w3.org/2005/Atom");

                    Serializers.Add(type, serializer);
                }
            }

            return Task.Factory.StartNew(() =>
            {
                XmlSerializer serializer;
                lock (Serializers)
                {
                    serializer = Serializers[type];
                }

                var writerSettings = new XmlWriterSettings
                {
                    OmitXmlDeclaration = false
                };

                var xmlWriter = XmlWriter.Create(writeStream, writerSettings);
                serializer.Serialize(xmlWriter, value, Namespaces);
            });
        }
    }
}
