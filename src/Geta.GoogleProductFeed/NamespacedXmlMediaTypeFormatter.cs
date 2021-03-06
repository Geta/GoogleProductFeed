﻿// Copyright (c) Geta Digital. All rights reserved.
// Licensed under Apache-2.0. See the LICENSE file in the project root for more information

using System;
using System.Collections.Concurrent;
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
        private readonly XmlSerializerNamespaces _namespaces;
        private readonly ConcurrentDictionary<Type, XmlSerializer> _serializers;

        public NamespacedXmlMediaTypeFormatter()
        {
            _namespaces = new XmlSerializerNamespaces();
            _namespaces.Add("g", "http://base.google.com/ns/1.0");
            _serializers = new ConcurrentDictionary<Type, XmlSerializer>();
        }

        public override Task WriteToStreamAsync(Type type, object value, Stream writeStream, HttpContent content, TransportContext transportContext)
        {
            if (!_serializers.ContainsKey(type))
            {
                _serializers.TryAdd(type, new XmlSerializer(type, "http://www.w3.org/2005/Atom"));
            }

            return Task.Factory.StartNew(() =>
                                         {
                                             if(!_serializers.TryGetValue(type, out XmlSerializer serializer))
                                             {
                                                 return;
                                             }

                                             var writerSettings = new XmlWriterSettings
                                             {
                                                 OmitXmlDeclaration = false
                                             };

                                             XmlWriter xmlWriter = XmlWriter.Create(writeStream, writerSettings);
                                             serializer.Serialize(xmlWriter, value, _namespaces);
                                         });
        }
    }
}
