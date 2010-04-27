// ==========================================================================
// Project:   Seed Pack
// Copyright: ©2009-2010 Apple Inc. All rights reserved.
// License:   Licened under MIT license (see LICENSE.txt)
// ==========================================================================


var Ct = require('core-test'),
    MODULE = require('pack:module');

Ct.module('pack:module');

function expectSuccess(t, moduleId, opts, overlay, done) {
  var pkg = module.ownerPackage,
      packageId = overlay.packageId || pkg.id,
      canonicalId = packageId+':'+moduleId;
      
  var expected = {
    id:        canonicalId,
    packageId: pkg.id,
    moduleId:  moduleId,
    loader:    true,
    modules:   true,
    imports:   [],
    exports:   []
  };
  
  Object.keys(overlay).forEach(function(k) {
    expected[k] = overlay[k];
  }, this);
  
  // wrap text if needed
  var text = expected.text;
  if (text) {
    if (expected.modules) {
      if (expected.format === 'string') {
        text = "'"+text.replace(/'/g,"\\'")+"'";
      } else {
        text = 'function(require, exports, module) {\n'+text+'\n}';
      }
      
      text = ';tiki.module("'+expected.id+'", '+text+');\n';
    }
  }
  expected.text = text;
  
  
  MODULE.pack(moduleId, pkg, opts, function(err, res) {
    t.equal(err, null, 'should not have an error');
    t.equal(res.text, expected.text, 'module text');
    
    res.text = expected.text = null;
    t.deepEqual(res, expected, 'test options');

    done();
  });
}

// BASIC OPTIONS

Ct.test('pack with default options', function(t, done) {
  expectSuccess(t, '~fixtures/module/basic', {}, {
    text: '// no directives\nexports.helloWorld = "Hello World";\n'
  }, done);
});

Ct.test('pack with module imports', function(t, done) {
  expectSuccess(t, '~fixtures/module/with_import', {}, {
    imports: ['./has_exports'],
    text: 'var $m__;$m__=require("./has_exports"); var foo=$m__.foo;"import ./has_exports";\nexports.helloWorld = foo;\n'
  }, done);
});

Ct.test('package with custom packageId', function(t, done) {
  expectSuccess(t, '~fixtures/module/basic', { packageId: '::foo' }, {
    packageId: '::foo',
    text: '// no directives\nexports.helloWorld = "Hello World";\n'
  }, done);
});


// ..........................................................
// NO MODULE
// 

Ct.test('pack with no module option', function(t, done) {
  expectSuccess(t, '~fixtures/module/basic', { modules: false }, {
    modules: false,
    text: '// no directives\nexports.helloWorld = "Hello World";\n'
  }, done);
});

Ct.test('pack with no module pragma', function(t, done) {
  expectSuccess(t, '~fixtures/module/no_module', { }, {
    modules: false,
    text: '"use modules false";\nexports.helloWorld = "Hello World";\n'
  }, done);
});


// ..........................................................
// STRING FORMAT
// 

Ct.test('pack with string format option', function(t, done) {
  expectSuccess(t, '~fixtures/module/basic', { format: 'string' }, {
    format: 'string',
    text: '// no directives\nexports.helloWorld = "Hello World";\n'
  }, done);
});

Ct.test('pack with string format pragma', function(t, done) {
  expectSuccess(t, '~fixtures/module/string_format', { }, {
    format: 'string',
    text: '"use format string";\nexports.hello = \'world\\\'s\'; // important: use single quotes\nexports.goodbye = "world"; // important: use double quotes\n'
  }, done);
});

Ct.run();
