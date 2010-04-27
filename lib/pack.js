// ==========================================================================
// Project:   Seed Pack
// Copyright: ©2009-2010 Apple Inc. All rights reserved.
// License:   Licened under MIT license (see LICENSE.txt)
// ==========================================================================

var Cs     = require('core-support'),
    MODULE = require('./module'),
    SCRIPT = require('./script');

/**
  Merges one or more object hashes into a single hash for finalized building.
*/
exports.merge = function(objects, done) {
  var ret ;
  
  if (objects.length>1) {
    
    // construct new summary object with defaults
    ret = { 
      type: 'container',
      loader: false, 
      objects: []
    };
    
    objects.forEach(function(o) {
      ret.objects.push(o);
      if (o.loader) ret.loader   = true;
      if (o.modules) ret.modules = true;
    });

  } else ret = objects[0];
  return done(null, ret);
};

/**
  Finalizes a single object hash, returning the actual script that should be
  output.  This will merge in any external references and generate package
  definitions as required.
*/
exports.script = function(object, scriptId, done) {
  return SCRIPT.pack(object, scriptId, done);
};

/**
  Output an object hash in JSO format to feed back in later
*/
exports.toJSO = function(object) {
  return '#JSO1.0\n'+JSON.stringify(object, null, ' '); // pretty-print
};

exports.readJSO = function(path, done) {
  if (done) {
    Cs.fs.readFile(path, function(err, contents) {
      if (err) return done(err);
      contents = contents.slice(contents.indexOf('\n')); // strip first line
      return done(null, JSON.parse(contents));
    });
    
  } else {
    var contents = Cs.fs.readFile(path);
    contents = contents.slice(contents.indexOf('\n')); // strip first line
    return done(null, JSON.parse(contents));
  }
};


/**
  Accepts an input file and packs it as registered module for loading.  Note
  that this will not handle any dependencies.
*/
exports.file = function(path, done) {
  path = Cs.path.normalize(path);

  // check magic string for JSO
  Cs.async(function() {
    var fd, str ;
    
    if (Cs.fs.exists(path)) {
      fd = Cs.fs.open(path, 'r', 0);
      str = Cs.fs.read(fd, 4, 0, 'utf8')[0];
      Cs.fs.close(fd);
      return str === '#JSO';
    } else throw new Error(path+' not found');
    
  })(function(err, isJSO) {
    if (err) return done(err);
    if (isJSO) {
      return exports.readJSO(path, done);
      
    } else {
      var anonymousPackage = require.loader.anonymousPackage;
      MODULE.pack(path, anonymousPackage, { loader: false }, done);
    }
  });

};

