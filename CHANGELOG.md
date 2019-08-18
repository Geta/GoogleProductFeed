# Changelog

All notable changes to this project will be documented in this file.

## [4.0.0]
### Breaking change
- Rename of Entry property from `Availablity` to `Availability`

### Added
- Added Quicksilver demo site
- Code reformat and license update

## [3.0.2]
### Breaking change

- FeedBuilder's abstract method Build return value is changed to List of feeds, which enables generation of multiple feeds for multisite projects.

## [3.0.0]
### Breaking change
- Saving feed in custom SQL table using Entity Framework instead of Episerver Dynamic Data Store. Breaking changes to FeedData class.

## [2.0.1]
### Added
- Filtering of feed data to be in accordance to site on which feed is called for multisite project scenarios.
