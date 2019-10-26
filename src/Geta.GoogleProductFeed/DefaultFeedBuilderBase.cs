// Copyright (c) Geta Digital. All rights reserved.
// Licensed under Apache-2.0. See the LICENSE file in the project root for more information

using System;
using System.Collections.Generic;
using EPiServer;
using EPiServer.Commerce.Catalog.ContentTypes;
using EPiServer.Logging;
using Geta.GoogleProductFeed.Models;
using Mediachase.Commerce.Catalog;

namespace Geta.GoogleProductFeed
{
    public abstract class DefaultFeedBuilderBase : FeedBuilder
    {
        // ReSharper disable once MemberCanBePrivate.Global
        protected readonly IContentLoader _contentLoader;
        // ReSharper disable once MemberCanBePrivate.Global
        protected readonly ReferenceConverter _referenceConverter;
        // ReSharper disable once MemberCanBePrivate.Global
        protected readonly ILogger _logger;

        public DefaultFeedBuilderBase(IContentLoader contentLoader, ReferenceConverter referenceConverter, ILogger logger)
        {
            _contentLoader = contentLoader;
            _referenceConverter = referenceConverter;
            _logger = logger;
        }

        public override List<Feed> Build()
        {
            var generatedFeeds = new List<Feed>();

            var feed = GenerateFeedEntity() ?? throw new ArgumentNullException($"{nameof(GenerateFeedEntity)} returned null");

            var entries = new List<Entry>();
            var catalogReferences = _contentLoader.GetDescendents(_referenceConverter.GetRootLink());

            foreach (var catalogReference in catalogReferences)
            {
                var catalogContent = _contentLoader.Get<CatalogContentBase>(catalogReference);

                try
                {
                    var entry = GenerateEntry(catalogContent);

                    if (entry != null)
                    {
                        entries.Add(entry);
                    }
                }
                catch (Exception ex)
                {
                    _logger.Error($"Failed to generate GoogleProductFeed entry for ContentGuid={catalogContent.ContentGuid}", ex);
                }
            }

            feed.Entries = entries;
            generatedFeeds.Add(feed);

            return generatedFeeds;
        }

        protected abstract Feed GenerateFeedEntity();

        protected abstract Entry GenerateEntry(CatalogContentBase catalogContent);
    }
}
