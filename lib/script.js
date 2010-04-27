// ==========================================================================
// Project:   Seed Pack
// Copyright: ©2009-2010 Apple Inc. All rights reserved.
// License:   Licened under MIT license (see LICENSE.txt)
// ==========================================================================

var CORE = require('./core'),
    MODULE = require('./module'),
    Cs   = require('core-support');

// collect text and add it to ret
function _text(ret, object, context) {
  if (object.text) {

    var normalizedId = object.id;
    if (normalizedId) {
      normalizedId = normalizedId.replace(/^::\(anonymous\):/, '');
    }
    
    ret.push('// SOURCE: '+normalizedId);
    ret.push(object.text);
  } else if (object.objects) {
    object.objects.forEach(function(o) { _text(ret, o, context); });
  } 
}

exports.pack = function(object, scriptId, done) {
  var ret = [];

  // recursively build text
  _text(ret, object, object); 
  
  // add scriptId if needed...
  if (object.loader) {
    if (!scriptId) {
      return done(new Error('Cannot generate loader without scriptId'));
    } else {
      ret.push('\ntiki.script("'+scriptId+'");\n');
    }
  }
  
  done(null, ret.join('\n'));
};

/**
  Generates a loadable script with the passed array of package/moduleId 
  tuples.  You must also pass a scriptId to generate the script loading at 
  the end.

  Modules are generally included in the script in the order they are 
  included in the descriptors.  However they will be reordered to satisfy
  any import dependencies.  Specifically any imported modules that are not 
  CommonJS modules will be forced in order to ensure they load properly.
  
  @param {Array} desc
    Array of descriptors identifying modules and packages you want to include.
    Each item should be a hash with build options and a pkg and moduleIds 
    property. 
    
  @param {String} scriptId
    The id to register when loading the script.
    
  @param {Function} done
    Callback to invoke when processing is complete
*/
exports.oldPack = function(desc, scriptId, done) {
  // explode into array of build tasks, which we can then kick off in 
  // parallel
  var jobs = [];
  desc.forEach(function(opts) {
    opts = Cs.mixin({}, opts); // independent copy
    
    var moduleIds = opts.moduleIds,
        pkg       = opts.pkg;
        
    delete opts.moduleIds;
    delete opts.pkg;
    
    moduleIds.forEach(function(moduleId) {
      jobs.push({ pkg: pkg, moduleId: moduleId, opts: opts });
    });
  });
  
  var needsLoader = false;

  // now pack each module in parallel.  we will then use this to build the
  // final script
  Cs.collect(jobs, function(job, done) {
    MODULE.pack(job.moduleId, job.pkg, function(err, info) {
      if (err) return done(err);
      if (info.loader) needsLoader = true;
      return done(null, info.text);  
    });
    
  })(function(err, ret) {
    if (err) return done(err);
    if (needsLoader) ret.push('\ntiki.script("'+scriptId+'");\n');
    ret = { id: scriptId, text: ret.join('') } ;
    return done(null, ret);
  });
  
};
