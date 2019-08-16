// Copyright (c) Geta Digital. All rights reserved.
// Licensed under MIT.
// See the LICENSE file in the project root for more information

using System;
using System.ComponentModel.DataAnnotations;

namespace Geta.GoogleProductFeed.Models
{
    public class FeedData
    {
        public DateTime CreatedUtc { get; set; }

        public byte[] FeedBytes { get; set; }

        public string Link { get; set; }

        [Key]
        public int Id { get; set; }
    }
}
