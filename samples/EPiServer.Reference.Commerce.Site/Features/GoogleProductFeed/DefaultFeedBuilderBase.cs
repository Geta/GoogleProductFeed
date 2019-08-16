using System;
using System.Collections.Generic;
using EPiServer.Commerce.Catalog.ContentTypes;
using Geta.GoogleProductFeed;
using Geta.GoogleProductFeed.Models;
using Mediachase.Commerce.Catalog;

namespace EPiServer.Reference.Commerce.Site.Features.GoogleProductFeed
{
    public abstract class DefaultFeedBuilderBase : FeedBuilder
    {
        protected readonly IContentLoader _contentLoader;
        private readonly ReferenceConverter _referenceConverter;

        public DefaultFeedBuilderBase(IContentLoader contentLoader, ReferenceConverter referenceConverter)
        {
            _contentLoader = contentLoader;
            _referenceConverter = referenceConverter;
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
                var entry = GenerateEntry(catalogContent);

                if(entry != null)
                    entries.Add(entry);
            }

            feed.Entries = entries;
            generatedFeeds.Add(feed);

            return generatedFeeds;
        }

        protected abstract Feed GenerateFeedEntity();

        protected abstract Entry GenerateEntry(CatalogContentBase catalogContent);
    }
}
