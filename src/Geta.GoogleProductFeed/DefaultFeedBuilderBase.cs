// Copyright (c) Geta Digital. All rights reserved.
// Licensed under Apache-2.0. See the LICENSE file in the project root for more information

using System;
using System.Collections.Generic;
using System.Linq;
using EPiServer;
using EPiServer.Commerce.Catalog.ContentTypes;
using EPiServer.Core;
using EPiServer.Logging;
using Geta.GoogleProductFeed.Models;
using Mediachase.Commerce.Catalog;

namespace Geta.GoogleProductFeed
{
    public abstract class DefaultFeedBuilderBase : FeedBuilder
    {
        private readonly IContentLoader _contentLoader;
        private readonly ReferenceConverter _referenceConverter;
        private readonly IContentLanguageAccessor _languageAccessor;
        private readonly ILogger _logger;

        public DefaultFeedBuilderBase(IContentLoader contentLoader, ReferenceConverter referenceConverter, IContentLanguageAccessor languageAccessor)
        {
            _contentLoader = contentLoader;
            _referenceConverter = referenceConverter;
            _languageAccessor = languageAccessor;
            _logger = LogManager.GetLogger(typeof(DefaultFeedBuilderBase));
        }

        public override List<Feed> Build()
        {
            List<Feed> generatedFeeds = new List<Feed>();
            Feed feed = GenerateFeedEntity() ?? throw new ArgumentNullException($"{nameof(GenerateFeedEntity)} returned null");
            IEnumerable<ContentReference> catalogReferences = _contentLoader.GetDescendents(_referenceConverter.GetRootLink());
            IEnumerable<CatalogContentBase> items = _contentLoader.GetItems(catalogReferences, CreateDefaultLoadOption()).OfType<CatalogContentBase>();

            List<Entry> entries = new List<Entry>();
            foreach (CatalogContentBase catalogContent in items)
            {
                try
                {
                    Entry entry = GenerateEntry(catalogContent);

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

        private LoaderOptions CreateDefaultLoadOption()
        {
            LoaderOptions loaderOptions = new LoaderOptions
            {
                LanguageLoaderOption.FallbackWithMaster(_languageAccessor.Language)
            };

            return loaderOptions;
        }
    }
}
