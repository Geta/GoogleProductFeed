using System;
using System.ComponentModel.DataAnnotations;

namespace Geta.GoogleProductFeed.Models
{
    public class FeedData
    {
        public DateTime CreatedUtc { get; set; }
        public byte[] FeedBytes { get; set; }

        [Key]
        public int Id { get; set; }
    }
}
