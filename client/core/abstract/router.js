import ns from 'imajs/client/core/namespace';
import IMAError from 'imajs/client/core/imaError';

ns.namespace('Core.Abstract');

/**
 * The basic implementation of the {@codelink Core.Interface.Router} interface,
 * providing the common or default functionality for parts of the API.
 *
 * @abstract
 * @class Router
 * @implements Core.Interface.Router
 * @namespace Core.Abstract
 * @module Core
 * @submodule Core.Abstract
 */
export default class Router extends ns.Core.Interface.Router {

	/**
	 * Initializes the router.
	 *
	 * @constructor
	 * @method constructor
	 * @param {Core.Interface.PageManager} pageManager The page manager
	 *        handling UI rendering, and transitions between pages if at the
	 *        client side.
	 * @param {Core.Router.Factory} factory Factory for routes.
	 * @param {Core.Interface.Dispatcher} dispatcher Dispatcher fires events to
	 *        app.
	 * @param {{ROUTE_NAMES: Object<string, string>, EVENTS: Object<string, string>}} ROUTER_CONSTANTS
	 *        The internal router constants. The {@code ROUTE_NAMES} contains
	 *        internal route names. The {@code EVENTS} contains name of events
	 *        which are fired with {@code Core.Interface.Dispatcher}.
	 * @example
	 *      router.link('article', {articleId: 1});
	 * @example
	 *      router.redirect('http://www.example.com/web');
	 * @example
	 *      router.add(
	 *        'home',
	 *        ns.App.Page.Home.Controller,
	 *        ns.App.Page.Home.View,
	 *        {onlyUpdate: false, autoScroll: true}
	 *      );
	 */
	constructor(pageManager, factory, dispatcher, ROUTER_CONSTANTS) {
		super();

		/**
		 * The page manager handling UI rendering, and transitions between
		 * pages if at the client side.
		 *
		 * @private
		 * @property _pageManager
		 * @type {Core.Interface.pageManager}
		 */
		this._pageManager = pageManager;

		/**
		 * Factory for routes.
		 *
		 * @private
		 * @property _factory
		 * @type {Core.Router.Factory}
		 */
		this._factory = factory;

		/**
		 * Dispatcher fires events to app.
		 *
		 * @private
		 * @property _dispatcher
		 * @type {Core.Interface.Dispatcher}
		 */
		this._dispatcher = dispatcher;

		/**
		 * The internal route names.
		 *
		 * @const
		 * @property ROUTE_NAMES
		 * @type {Object<string, string>}
		 */
		this.ROUTE_NAMES = ROUTER_CONSTANTS.ROUTE_NAMES;

		/**
		 * The internal router events.
		 *
		 * @const
		 * @property EVENTS
		 * @type {Object<string, string>}
		 */
		this.EVENTS = ROUTER_CONSTANTS.EVENTS;

		/**
		 * The current protocol used to access the application, terminated by a
		 * colon (for example {@code https:}).
		 *
		 * @private
		 * @property _protocol
		 * @type {string}
		 * @default ''
		 */
		this._protocol = '';

		/**
		 * The application's host.
		 *
		 * @private
		 * @property _host
		 * @type {string}
		 * @default ''
		 */
		this._host = '';

		/**
		 * The URL path pointing to the application's root.
		 *
		 * @private
		 * @property _root
		 * @type {string}
		 * @default ''
		 */
		this._root = '';

		/**
		 * The URL path fragment used as a suffix to the {@code _root} field
		 * that specifies the current language.
		 *
		 * @private
		 * @property _languagePartPath
		 * @type {string}
		 * @default ''
		 */
		this._languagePartPath = '';

		/**
		 * Storage of all known routes. The key are the route names.
		 *
		 * @private
		 * @property _routes
		 * @type {Map<string, Core.Router.Route>}
		 */
		this._routes = new Map();
	}

	/**
	 * @inheritDoc
	 * @override
	 * @method init
	 * @param {{$Protocol: string, $Host: string, $Root: string, $LanguagePartPath: string}} config
	 */
	init(config) {
		this._protocol = config.$Protocol || '';
		this._root = config.$Root || '';
		this._languagePartPath = config.$LanguagePartPath || '';
		this._host = config.$Host;
	}

	/**
	 * @inheritDoc
	 * @override
	 * @chainable
	 * @method add
	 * @param {string} name
	 * @param {string} pathExpression
	 * @param {string} controller
	 * @param {string} view
	 * @param {Object<string, *>=} options
	 * @throws {Core.IMAError} Thrown if a route with the same name is added
	 *         multiple times.
	 */
	add(name, pathExpression, controller, view, options = undefined) {
		if (this._routes.has(name)) {
			throw new IMAError(`Core.Abstract.Router.add: The route with ` +
					`name ${name} is already defined`);
		}

		var factory = this._factory;
		var route = factory.createRoute(
			name,
			pathExpression,
			controller,
			view,
			options
		);
		this._routes.set(name, route);

		return this;
	}

	/**
	 * @inheritDoc
	 * @override
	 * @chainable
	 * @method remove
	 * @param {string} name The route's unique name, identifying the route to
	 *        remove.
	 * @return {Core.Interface.Router} This router.
	 */
	remove(name) {
		this._routes.delete(name);

		return this;
	}

	/**
	 * @inheritDoc
	 * @override
	 * @method getPath
	 * @return {string}
	 */
	getPath() {
		throw new IMAError('The getPath() method is abstract and must be ' +
				'overridden.');
	}

	/**
	 * @inheritDoc
	 * @override
	 * @method getUrl
	 * @return {string}
	 */
	getUrl() {
		return this.getBaseUrl() + this.getPath();
	}

	/**
	 * @inheritDoc
	 * @override
	 * @method getBaseUrl
	 * @return {string}
	 */
	getBaseUrl() {
		return this.getDomain() + this._root + this._languagePartPath;
	}

	/**
	 * @inheritDoc
	 * @override
	 * @method getDomain
	 * @return {string}
	 */
	getDomain() {
		return this._protocol + '//' + this._host;
	}

	/**
	 * @inheritDoc
	 * @override
	 * @method getHost
	 * @return {string}
	 */
	getHost() {
		return this._host;
	}

	/**
	 * @inheritDoc
	 * @override
	 * @method getProtocol
	 * @return {string}
	 */
	getProtocol() {
		return this._protocol;
	}

	/**
	 * @inheritDoc
	 * @override
	 * @method getCurrentRouteInfo
	 * @return {{route: Core.Router.Route, params: Object<string, string>, path: string}}
	 * @throws {Core.IMAError}
	 */
	getCurrentRouteInfo() {
		var path = this.getPath();
		var route = this._getRouteByPath(path);

		if (!route) {
			throw new IMAError(`Core.Abstract.Router.getCurrentRouteInfo: ` +
					`The route for path ${path} is not define.`);
		}

		var params = route.extractParameters(path);

		return { route, params, path };
	}

	/**
	 * @abstract
	 * @inheritDoc
	 * @override
	 * @chainable
	 * @method listen
	 * @return {Core.Interface.Router}
	 */
	listen() {
		throw new IMAError('The listen() method is abstract and must be ' +
				'overridden.');
	}

	/**
	 * @abstract
	 * @inheritDoc
	 * @override
	 * @method redirect
	 * @param {string} url
	 * @param {{httpStatus: number=, onlyUpdate: boolean=, autoScroll: boolean=}} [options={}]
	 */
	redirect(url, options) {
		throw new IMAError('The redirect() method is abstract and must be ' +
				'overridden.');
	}

	/**
	 * @inheritDoc
	 * @override
	 * @method link
	 * @param {string} routeName
	 * @param {Object<string, string>} params
	 * @return {string}
	 */
	link(routeName, params) {
		var route = this._routes.get(routeName);

		if (!route) {
			throw new IMAError(`Core.Router:link has undefined route with ` +
					`name ${routeName}. Add new route with that name.`);
		}

		return this.getBaseUrl() + route.toPath(params);
	}

	/**
	 * @inheritDoc
	 * @override
	 * @method route
	 * @param {string} path
	 * @param {{onlyUpdate: boolean=, autoScroll: boolean=}} [options={}]
	 * @return {Promise<Object<string, ?(number|string)>>}
	 */
	route(path, options = {}) {
		var routeForPath = this._getRouteByPath(path);
		var params = { path };

		if (!routeForPath) {
			return this.handleNotFound(params);
		}

		params = routeForPath.extractParameters(path);

		return this._handle(routeForPath, params, options);
	}

	/**
	 * @inheritDoc
	 * @override
	 * @method handleError
	 * @param {Object<string, (Error|string)>} params
	 * @param {{onlyUpdate: boolean=, autoScroll: boolean=}} [options={}]
	 * @return {Promise<Object<string, ?(number|string)>>}
	 */
	handleError(params, options = {}) {
		var routeError = this._routes.get(this.ROUTE_NAMES.ERROR);

		if (!routeError) {
			var error = new IMAError(`Core.Router:handleError cannot ` +
					`process the error because no error page route has been ` +
					`configured. Add a new route named ` +
					`'${this.ROUTE_NAMES.ERROR}'.`, params);

			return Promise.reject(error);
		}

		return this._handle(routeError, params, options);
	}

	/**
	 * @inheritDoc
	 * @override
	 * @method handleNotFound
	 * @param {Object<string, (Error|string)>} params
	 * @param {{onlyUpdate: boolean=, autoScroll: boolean=}} [options={}]
	 * @return {Promise<Object<string, ?(number|string)>>}
	 */
	handleNotFound(params, options = {}) {
		var routeNotFound = this._routes.get(this.ROUTE_NAMES.NOT_FOUND);

		if (!routeNotFound) {
			var error = new IMAError(`Core.Router:handleNotFound cannot ` +
					`processes a non-matching route because no not found ` +
					`page route has been configured. Add new route named ` +
					`'${this.ROUTE_NAMES.NOT_FOUND}'.`, params);

			return Promise.reject(error);
		}

		return this._handle(routeNotFound, params, options);
	}

	/**
	 * @inheritDoc
	 * @override
	 * @method isClientError
	 * @param {(Core.IMAError|Error)} reason
	 * @return {boolean}
	 */
	isClientError(reason) {
		return reason instanceof IMAError &&
				reason.getHttpStatus() >= 400 &&
				reason.getHttpStatus() < 500;
	}

	/**
	 * @inheritDoc
	 * @override
	 * @method isRedirection
	 * @param {(Core.IMAError|Error)} reason
	 * @return {boolean}
	 */
	isRedirection(reason) {
		return reason instanceof IMAError &&
				reason.getHttpStatus() >= 300 &&
				reason.getHttpStatus() < 400;
	}

	/**
	 * Strips the URL path part that points to the application's root (base URL)
	 * from the provided path.
	 *
	 * @protected
	 * @method _extractRoutePath
	 * @param {string} path Relative or absolute URL path.
	 * @return {string} URL path relative to the application's base URL.
	 */
	_extractRoutePath(path) {
		return path.replace(this._root + this._languagePartPath, '');
	}

	/**
	 * Handles the provided route and parameters by initializing the route's
	 * controller and rendering its state via the route's view.
	 *
	 * The result is then sent to the client if used at the server side, or
	 * displayed if used as the client side.
	 *
	 * @private
	 * @method _handle
	 * @param {Core.Router.Route} route The route that should have its
	 *        associated controller rendered via the associated view.
	 * @param {Object<string, (Error|string)>} params Parameters extracted from
	 *        the URL path and query.
	 * @param {{onlyUpdate: boolean=, autoScroll: boolean=}} options
	 *        The options overrides route options defined in routes.js.
	 * @return {Promise<undefined>} A promise that resolves when the page is
	 *         rendered and the result is sent to the client, or displayed if
	 *         used at the client side.
	 */
	_handle(route, params, options) {
		var controller = route.getController();
		var view = route.getView();
		options = Object.assign({}, route.getOptions(), options);
		var data = { route, params, path: this.getPath(), options };

		this._dispatcher
			.fire(this.EVENTS.PRE_HANDLE_ROUTE, data, true);

		return this._pageManager
				.manage(controller, view, options, params)
				.then((response) => {
					data.response = response;

					this._dispatcher
						.fire(this.EVENTS.POST_HANDLE_ROUTE, data, true);

					return response;
				});

	}

	/**
	 * Returns the route matching the provided URL path part. The path may
	 * contain a query.
	 *
	 * @private
	 * @method _getRouteByPath
	 * @param {string} path The URL path.
	 * @return {?Core.Router.Route} The route matching the path, or
	 *         {@code null} if no such route exists.
	 */
	_getRouteByPath(path) {
		for (var route of this._routes.values()) {
			if (route.matches(path)) {
				return route;
			}
		}

		return null;
	}
}

ns.Core.Abstract.Router = Router;
