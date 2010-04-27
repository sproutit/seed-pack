// ==========================================================================
// Project:   Seed Pack
// Copyright: ©2009-2010 Apple Inc. All rights reserved.
// License:   Licened under MIT license (see LICENSE.txt)
// ==========================================================================

var Cs    = require('core-support'),
    CACHE = require('./cache'),
    PACK  = require('./pack'); // get the public API

exports.summary = "Generate a javascript to load packages in the browser";
exports.usage = "pack [PACKAGE..PACKAGEn] [SCRIPT] [OPTIONS]";
exports.options = [
  ['-V', '--version VERSION', 'Version of package to install'],
  ['-d', '--dependencies', 'Package dependencies as well'],
  ['-D', '--no-dependencies', 'Do not package dependencies'],
  ['-t', '--tiki', 'Include tiki bootstrap at top of file [default]'],
  ['-T', '--no-tiki', 'Do not include tiki bootstrap at top of file'],
  ['-f', '--format FORMAT', 'encoding format - must be "function" or "string"'],
  ['-o', '--output PATH', 'path to output to. Defaults to stdout'],
  ['-p', '--package PACKAGE', 'Activate module mode.  All args should be modules within the named package'],
  ['-m', '--main MODULE', 'Names a main module that should be required as main'],
  ['-s', '--script [SCRIPTID]', 'Make the final output a loadable script'],
  ['-S', '--no-script', 'Make the final output a object file to pass back into pack'],
  ['-c', '--clean', 'Clean the build cache first']
];

exports.desc = [
"Packs one or more packages and/or scripts into a single js file to load in",
"the web browser.  Usually the simplest way to invoke the pack script is to",
"simply name a package.  If you don't name a package, the current working",
"package will be used instead."
].join(' ');


function processOptions(args, opts) {
  var o;
  
  o = opts.settings = {
    version: null,
    packageId: null,
    dependencies: false,
    tiki: true,
    format: 'function',
    output: null,
    main: null,
    script: true,
    clean: false
  };
  
  // handle regular opts
  ['version', 'format', 'output', 'main'].forEach(function(name) {
    opts.on(name, function(k, v) { o[name] = v; });
  });

  // handle bools
  ['dependencies', 'tiki', 'clean'].forEach(function(name) {
    opts.on(name, function(k,v) { o[name] = true; });
    opts.on('no-'+name, function(k,v) { o[name] = false; });
  });
  
  // package needs a special map because it is a reserved word
  opts.on('package', function(k, v) { o.packageId = v; });
  
  // script takes an optional option
  opts.on('script', function(k, v) { 
    o.script = v || true; 
  });
  
  opts.on('no-script', function(k, v) { o.script = false; });
  
  return opts.parse(args);
}

var savedOpts, workingPackage ;
function openWorkingPackage(done) {
  if (workingPackage) return done(null, workingPackage);
  Cs.async(function() {
    workingPackage = savedOpts.openWorkingPackage();
    return workingPackage;
  })(done);
}

function isFilepath(path) {
  return path.match(/^(\/|\.)/) || path.indexOf('.')>=0;
}

exports.invoke = function(cmd, args, opts, done) {
  var settings;
  
  args = processOptions(args, opts);
  settings = opts.settings;
  savedOpts = opts; // for getting a workingPackage on demand

  // clean cache first if needed..
  (function(done) {
    if (settings.clean) CACHE.clean(done) ;
    else done();
  })(function() {

    // process each argument into an array of jobs, which will be executed 
    // in parallel
    args = args.map(function(a) {
      if (isFilepath(a)) {
        a = Cs.path.normalize(a);
        return function(done) { PACK.file(a, done); };
      } else {
        throw "Only filepaths currently supported";
      }
    });

    // once jobs are complete, finalize into output file through a merge and 
    // then output
    Cs.collect(args, function(a, done) {
      a(done);
    })(function(err, objects) {
      if (err) return done(err);
      PACK.merge(objects, function(err, object) {
        if (err) return done(err);
        
        // either get final script or just return object file itself
        (function(done) {
          if (settings.script) PACK.script(object, settings.script, done);
          else return done(null, PACK.toJSO(object));
          
        // send to proper output
        })(function(err, output) {
          if (err) return done(err);
          
          if (settings.output) {
            var p = Cs.path.normalize(settings.output);
            Cs.fs.writeFile(p, output, Cs.err(done));
            return;
            
          } else {
            Cs.println(output);
            return done();
          }
        });
        
      });
    });
    
  });
  
};

