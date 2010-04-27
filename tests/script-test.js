// ==========================================================================
// Project:   Seed Pack
// Copyright: ©2009-2010 Apple Inc. All rights reserved.
// License:   Licened under MIT license (see LICENSE.txt)
// ==========================================================================


var Ct = require('core-test'),
    SCRIPT = require('pack:script');

Ct.module('pack:script');

Ct.test('basic', function(t, done) {
  
  // build some descriptors...
  var pkg = module.ownerPackage,
      moduleIds = pkg.catalogModules(),
      opts = { pkg: pkg, moduleIds: moduleIds };
      
  SCRIPT.pack([opts], 'test:scriptId', function(err, res) {
    t.equal(err, null, 'should not have an error');
    t.deepEqual(res, res);
    done();
  });
});

Ct.run();