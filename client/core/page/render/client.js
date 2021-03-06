import ns from 'imajs/client/core/namespace';

ns.namespace('Core.Page.Render');

/**
 * Client-side page renderer. The renderer attempts to reuse the markup sent by
 * server if possible.
 *
 * @class Client
 * @extends Core.Abstract.PageRender
 * @namespace Core.Page.Render
 * @module Core
 * @submodule Core.Page
 */
export default class Client extends ns.Core.Abstract.PageRender {

	/**
	 * Initializes the client-side page renderer.
	 *
	 * @method constructor
	 * @constructor
	 * @param {Core.Page.Render.Factory} factory Factory for receive $Utils to
	 *        view.
	 * @param {Vendor.$Helper} Helper The IMA.js helper methods.
	 * @param {Vendor.React} React React framework instance to use to render
	 *        the page.
	 * @param {Object<string, *>} settings The application setting for the
	 *        current application environment.
	 * @param {Core.Interface.Window} window Helper for manipulating the global
	 *        object ({@code window}) regardless of the client/server-side
	 *        environment.
	 */
	constructor(factory, Helper, React, settings, window) {
		super(factory, Helper, React, settings);

		/**
		 * Flag signalling that the page is being rendered for the first time.
		 *
		 * @property _firsTime
		 * @private
		 * @type {boolean}
		 * @default true
		 */
		this._firstTime = true;

		/**
		 * Helper for manipulating the global object ({@code window})
		 * regardless of the client/server-side environment.
		 *
		 * @property _window
		 * @private
		 * @type {Core.Interface.Window}
		 */
		this._window = window;

		/**
		 * @property _viewContainer
		 * @private
		 * @type {HTMLElement}
		 */
		this._viewContainer = this._window.getElementById(
			this._settings.$Page.$Render.masterElementId
		);
	}

	/**
	 * @inheritDoc
	 * @override
	 * @method mount
	 * @abstract
	 * @param {Core.Abstract.Controller} controller
	 * @param {Vendor.React.Component} view
	 * @return {Promise}
	 */
	mount(controller, view) {
		var loadedData = controller.load();
		var separatedData = this._separatePromisesAndValues(loadedData);
		var defaultPageState = separatedData.values;
		var loadedPromises = separatedData.promises;

		if (this._firstTime === false) {
			controller.setState(defaultPageState);
			this._renderToDOM(controller, view);
			this._patchPromisesToState(controller, loadedPromises);
		}

		return (
			this._Helper
				.allPromiseHash(loadedPromises)
				.then((fetchedResources) => {

					if (this._firstTime === true) {
						Object.assign(defaultPageState, fetchedResources);
						controller.setState(defaultPageState);
						this._renderToDOM(controller, view);
						this._firstTime = false;
					}

					controller.setMetaParams(fetchedResources);
					this._updateMetaAttributes(controller.getMetaManager());

					return {
						content: null,
						status: controller.getHttpStatus()
					};
				})
				.catch((error) => this._handleError(error))
		);
	}

	/**
	 * @inheritDoc
	 * @override
	 * @method update
	 * @param {Core.Decorator.Controller} controller
	 * @param {Object<string, string>=} [params={}]
	 * @return {Promise}
	 */
	update(controller, params = {}) {
		var updatedData = controller.update(params);
		var separatedData = this._separatePromisesAndValues(updatedData);
		var defaultPageState = separatedData.values;
		var updatedPromises = separatedData.promises;

		controller.setState(defaultPageState);
		this._patchPromisesToState(controller, updatedPromises);

		return (
			this._Helper
				.allPromiseHash(updatedPromises)
				.then((fetchedResources) => {
					controller.setMetaParams(fetchedResources);
					this._updateMetaAttributes(controller.getMetaManager());
				})
				.catch((error) => this._handleError(error))
		);
	}

	/**
	 * @inheritDoc
	 * @override
	 * @method unmount
	 */
	unmount() {
		if (this._reactiveView) {
			this._React.unmountComponentAtNode(this._viewContainer);
			this._reactiveView = null;
		}
	}

	/**
	 * Show error to console in $Debug mode and re-throw that error
	 * for other error handler.
	 *
	 * @private
	 * @method _handleError
	 * @param {Error} error
	 * @throws {Error} Re-throw handled error.
	 */
	_handleError(error) {
		if ($Debug) {
			console.error('Render Error:', error);
		}

		throw error;
	}

	/**
	 * Patch promise values to controller state.
	 *
	 * @method _patchPromisesToState
	 * @param {Core.Decorator.Controller} controller
	 * @param {Object<string, Promise>} patchedPromises
	 */
	_patchPromisesToState(controller, patchedPromises) {
		for (let resourceName of Object.keys(patchedPromises)) {
			patchedPromises[resourceName]
				.then((resource) => {
					controller.patchState({
						[resourceName]: resource
					});
				})
				.catch((error) => this._handleError(error));
		}
	}

	/**
	 * Render React element to DOM for controller state.
	 *
	 * @private
	 * @method _renderToDOM
	 * @param {Core.Decorator.Controller} controller
	 * @param {Vendor.React.Component} view
	 */
	_renderToDOM(controller, view) {
		var props = this._generateViewProps(controller.getState());
		var reactElementView = this._factory.wrapView(view, props);

		this._reactiveView = this._React.render(
			reactElementView,
			this._viewContainer
		);
	}

	/**
	 * Separate promises and values from provided data map. Values will be use
	 * for default page state. Promises will be patched to state after their
	 * resolve.
	 *
	 * @method _separatePromisesAndValues
	 * @private
	 * @param {Object<string, *>} dataMap A map of data.
	 * @return {{promises: Object<string, Promise>, values: Object<string, *>}}
	 *         Return separated promises and other values.
	 */
	_separatePromisesAndValues(dataMap) {
		var promises = {};
		var values = {};

		for (var field of Object.keys(dataMap)) {
			var value = dataMap[field];

			if (value instanceof Promise) {
				promises[field] = value;
			} else {
				values[field] = value;
			}
		}

		return { promises, values };
	}

	/**
	 * Updates the title and the contents of the meta elements used for SEO.
	 *
	 * @private
	 * @method _updateMetaAttributes
	 * @param {Core.Interface.MetaManager} metaManager meta attributes storage
	 *        providing the new values for page meta elements and title.
	 */
	_updateMetaAttributes(metaManager) {
		var metaTagKey = null;
		var metaTag = null;
		this._window.setTitle(metaManager.getTitle());

		for (metaTagKey of metaManager.getMetaNames()) {
			metaTag = this._window.querySelector(`meta[name="${metaTagKey}"]`);

			if (metaTag) {
				metaTag.content = metaManager.getMetaName(metaTagKey);
			}
		}

		for (metaTagKey of metaManager.getMetaProperties()) {
			metaTag = this._window.querySelector(
				`meta[property="${metaTagKey}"]`
			);

			if (metaTag) {
				metaTag.content = metaManager.getMetaProperty(metaTagKey);
			}
		}
	}
}

ns.Core.Page.Render.Client = Client;
