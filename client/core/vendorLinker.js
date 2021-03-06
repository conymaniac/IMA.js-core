import ns from 'imajs/client/core/namespace';

var vendor;
if (typeof window !== 'undefined' && window !== null) {
	vendor = window.$IMA.Vendor;
} else {
	vendor = require('./vendor.server.js');
}

var nsVendor = ns.namespace('Vendor');
for (var [name, lib] of vendor) {
	nsVendor[name] = lib;
}

// bind the vendor libraries to the module system
$IMA.Loader.register('imajs/client/core/vendor', [], (_export) => {
	return {
		setters: [],
		execute: () => {
			_export('$Helper', vendor.get('$Helper'));
		}
	};
});
$IMA.Loader.register('app/vendor', [], (_export) => {
	return {
		setters: [],
		execute: () => {
			for (var [name, lib] of vendor) {
				if (name === '$Helper') {
					continue;
				}

				_export(name, lib);
			}
		}
	};
});

export default vendor;
