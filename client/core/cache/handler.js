import ns from 'imajs/client/core/namespace';

ns.namespace('Core.Cache');

/**
 * Configurable generic implementation of the {@codelink Core.Interface.Cache}
 * interface.
 *
 * @class Handler
 * @implements Core.Interface.Cache
 * @namespace Core.Cache
 * @module Core
 * @submodule Core.Cache
 *
 * @requires Core.Interface.Storage
 * @requires Vendor.$Helper
 *
 * @example
 *   if (cache.has('model.articles')) {
 *     return cache.get('model.articles');
 *   } else {
 *     var articles = getArticlesFromStorage();
 *     cache.set('model.articles', articles, 60 * 60 * 1000); // cache for an hour
 *   }
 */
export default class Handler extends ns.Core.Interface.Cache {
	/**
	 * Initializes the cache.
	 *
	 * @method constructor
	 * @constructor
	 * @param {Core.Interface.Storage} cacheStorage The cache entry storage to
	 *        use.
	 * @param {Core.Cache.Factory} factory Which create new instance of cache
	 *        entry.
	 * @param {Vendor.$Helper} Helper The IMA.js helper methods.
	 * @param {{ttl: number, enabled: boolean}} [config={ttl: 30000, enabled: false}]
	 *        The cache configuration.
	 */
	constructor(cacheStorage, factory, Helper,
			config = { ttl: 30000, enabled: false }) {
		super();

		/**
		 * Cache entry storage.
		 *
		 * @property _cache
		 * @private
		 * @type {Core.Interface.Storage}
		 */
		this._cache = cacheStorage;

		/**
		 * @property _factory
		 * @private
		 * @type {Core.Cache.Factory}
		 */
		this._factory = factory;

		/**
		 * Tha IMA.js helper methods.
		 *
		 * @private
		 * @property _Helper
		 * @type {Vendor.$Helper}
		 */
		this._Helper = Helper;

		/**
		 * Default cache entry time to live in milliseconds.
		 *
		 * @property _ttl
		 * @private
		 * @type {number}
		 * @default this._config.ttl
		 */
		this._ttl = config.ttl;

		/**
		 * Flag signalling whether the cache is currently enabled.
		 *
		 * @property _enabled
		 * @private
		 * @type {boolean}
		 */
		this._enabled = config.enabled;
	}

	/**
	 * @inheritDoc
	 * @override
	 * @method clear
	 */
	clear() {
		this._cache.clear();
	}

	/**
	 * @inheritDoc
	 * @override
	 * @method has
	 * @param {string} key
	 * @return
	 */
	has(key) {
		if (!this._enabled || !this._cache.has(key)) {
			return false;
		}

		var cacheEntry = this._cache.get(key);
		if (cacheEntry && !cacheEntry.isExpired()) {
			return true;
		}

		this.delete(key);

		return false;
	}

	/**
	 * @inheritDoc
	 * @override
	 * @method get
	 * @param {string} key
	 * @return {*}
	 */
	get(key) {
		if (this.has(key)) {
			var value = this._cache.get(key).getValue();

			return this._clone(value);
		}

		return null;
	}

	/**
	 * @inheritDoc
	 * @override
	 * @method set
	 * @param {string} key
	 * @param {*} value
	 * @param {?number=} ttl
	 */
	set(key, value, ttl = null) {
		var cacheEntry = this._factory
				.createCacheEntry(this._clone(value), ttl || this._ttl);

		this._cache.set(key, cacheEntry);
	}

	/**
	 * @inheritDoc
	 * @override
	 * @method delete
	 * @param {string} key
	 */
	delete(key) {
		this._cache.delete(key);
	}

	/**
	 * @inheritDoc
	 * @override
	 * @method disable
	 */
	disable() {
		this._enabled = false;
	}

	/**
	 * @inheritDoc
	 * @override
	 * @method enable
	 */
	enable() {
		this._enabled = true;
	}

	/**
	 * @inheritDoc
	 * @override
	 * @method serialize
	 * @return {string}
	 */
	serialize() {
		var dataToSerialize = {};

		for (var key of this._cache.keys()) {
			var serializeEntry = this._cache.get(key).serialize();

			if ($Debug) {
				if (!this._canSerializeValue(serializeEntry.value)) {
					throw new Error(`Core.Cache.Handler:serialize You want ` +
							`to serialize ` +
							`${serializeEntry.value.toString()} for key ` +
							`${key}. Clear value from cache or change their ` +
							`type so that will be serializable with ` +
							`JSON.stringify.`);
				}
			}

			dataToSerialize[key] = serializeEntry;
		}

		return JSON
				.stringify(dataToSerialize)
				.replace(/<\/script/g, '<\\/script');
	}

	/**
	 * @inheritDoc
	 * @override
	 * @method deserialize
	 * @param {Object<string, {value: *, ttl: number}>} serializedData
	 */
	deserialize(serializedData) {
		for (var key of Object.keys(serializedData)) {
			var cacheEntryItem = serializedData[key];
			this.set(key, cacheEntryItem.value, cacheEntryItem.ttl);
		}
	}

	/**
	 * @method _canSerializeValue
	 * @param {string} value
	 * @param {*} value
	 * @return {boolean}
	 */
	_canSerializeValue(value) {
		if (value instanceof Date ||
			value instanceof RegExp ||
			value instanceof Promise ||
			typeof value === 'function'
		) {
			return false;
		}

		if (value && value.constructor === Array) {
			for (var partValue of value) {
				if (!this._canSerializeValue(value[partValue])) {
					return false;
				}
			}
		}

		if (value && typeof value === 'object') {
			for (var valueKey of Object.keys(value)) {
				if (!this._canSerializeValue(value[valueKey])) {
					return false;
				}
			}
		}

		return true;
	}

	/**
	 * Clone only mutable values.
	 *
	 * @method _clone
	 * @param {*} value
	 * @return {*}
	 */
	_clone(value) {
		if (value !== null &&
			typeof value === 'object' &&
			!(value instanceof Promise)
		) {
			return this._Helper.clone(value);
		}

		return value;
	}
}

ns.Core.Cache.Handler = Handler;
