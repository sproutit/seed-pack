// ==========================================================================
// Project:   Seed Pack
// Copyright: ©2009-2010 Apple Inc. All rights reserved.
// License:   Licened under MIT license (see LICENSE.txt)
// ==========================================================================

/**
  @file
  
  Implements a simple write-on-read cache for storing built assets.
*/

/**
  Computes a revision for the passed argument values.  Each argument be either
  an array, hash, or a filepath - which will be checked for its mtime.
  
  The returned revision can be used to test for cache validity.
*/
exports.revisionFor = function() {
  return '(n/a)'; // not working just yet
};

/**
  Retrieves JSON object from the cache.  If the cache is not valid, the passed
  callback will be invoked to compute the cache value (which will then be 
  saved on disk).
*/
exports.read = function(cacheKey, revision, compute) {
  // not working just yet ... always compute
  return compute();
};

/*
  Clears the cache, invoking the passed callback when complete. 
*/
exports.clear = function(done) {
  // nothing to do just yet
  return done(); 
};