// Copyright (c) 2019 Geta Digital.
// Permission is hereby granted, free of charge, to any person
// obtaining a copy of this software and associated documentation
// files (the "Software"), to deal in the Software without
// restriction, including without limitation the rights to use,
// copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the
// Software is furnished to do so, subject to the following
// conditions:
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
// OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
// HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
// WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
// OTHER DEALINGS IN THE SOFTWARE.

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
            if(!_serializers.ContainsKey(type))
                _serializers.TryAdd(type, new XmlSerializer(type, "http://www.w3.org/2005/Atom"));

            return Task.Factory.StartNew(() =>
                                         {
                                             if(!_serializers.TryGetValue(type, out var serializer))
                                                 return;

                                             var writerSettings = new XmlWriterSettings { OmitXmlDeclaration = false };
                                             var xmlWriter = XmlWriter.Create(writeStream, writerSettings);
                                             serializer.Serialize(xmlWriter, value, _namespaces);
                                         });
        }
    }
}
