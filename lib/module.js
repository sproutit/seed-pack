// ==========================================================================
// Project:   Seed Pack
// Copyright: ©2009-2010 Apple Inc. All rights reserved.
// License:   Licened under MIT license (see LICENSE.txt)
// ==========================================================================

var CORE = require('./core'),
    Cs   = require('core-support');

// important: no newlines before actual code starts to keep line numbers 
// correct in debugger
var FUNCTION_WRAPPER = [
  'function(require, exports, module) {',
  null,
  '\n}'];

var STRING_WRAPPER = ["'", null, "'"];

var DEFAULTS = {
  modules: true,
  loader:  true
};

/**
  Invoke callback with the canonical module properly packaged for loading in 
  the browser.  Typically this involves wrapping in a module registration as 
  well as notifying the loader that the associated script has loaded..
  
  Understood options (all can be overloaded by module pragmas):
  
    * __modules__ : true if contents should be wrapped in a module [def true]
    * __loader__  : true if contents should register as loader [def true]
    * __cache__    : true if we can use a build cache to speed up building
    * __packageId__ : universal ID to use for package registration
    * __format__ : 'string' || 'function' - method of encoding def function
    * __sandbox__: sandbox to use when discovering items def to current
*/
exports.pack = function(moduleId, ownerPackage, opts, done) {
  
  var factory, pragmas, sandbox, ret, wrapper;
  
  if ('function' === typeof opts) {
    done = opts;
    opts = {};
  }

  if (opts.cache) {
    // compute cacheKey.  See if said item exists and if it is newer than 
    // the current module file.  If so, then use it...
  }

  sandbox = opts.sandbox || require.sandbox;
  ret     = Cs.mixin({}, opts); // inherit to override with pragmas
  factory = ownerPackage.load(moduleId, sandbox, function(err, factory) {

    if (!factory) {
      return done(new Error(moduleId+' not found in '+ownerPackage.id));
    }

    // overlay pragmas
    pragmas = factory.pragmas;
    ['loader', 'modules', 'imports', 'exports', 'format'].forEach(function(k){
      if (pragmas[k]!==undefined) ret[k] = pragmas[k];
    }, this);

    Object.keys(DEFAULTS).forEach(function(k) {
      if (ret[k]===undefined) ret[k] = DEFAULTS[k];
    }, this);


    if (!ret.packageId) ret.packageId = ownerPackage.id;
    if (!ret.moduleId)  ret.moduleId  = moduleId;
    ret.id = ret.packageId+':'+ret.moduleId;
    ret.text = factory.body(sandbox);
    ret.type = 'module';

    // wrap in a module if needed...
    if (ret.modules) {

      // Compute tiki-form canonicalId

      if (ret.format === 'string') {
        wrapper = STRING_WRAPPER;
        ret.text = ret.text.replace(/\'/g, "\\\'");
      } else wrapper = FUNCTION_WRAPPER;

      wrapper[1] = ret.text;
      ret.text = wrapper.join('');
      wrapper[1] = null;    
      ret.text = ';tiki.module("'+ret.id+'", '+ret.text+');\n';
    }

    // write out to cache if needed...
    if (opts.cache) {
      // TODO: Write Cached Value
    }

    return done(null, ret);
    
  });
  
};
