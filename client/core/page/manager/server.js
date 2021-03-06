import ns from 'imajs/client/core/namespace';

ns.namespace('Core.Page.Manager');

/**
 * Page manager for controller on the server side.
 *
 * @class Server
 * @implements Core.Abstract.PageManager
 * @namespace Core.Page.Manager
 * @module Core
 * @submodule Core.Page
 */
export default class Server extends ns.Core.Abstract.PageManager {

	/**
	 * @inheritDoc
	 * @override
	 * @method scrollTo
	 * @param {number} [x=0]
	 * @param {number} [y=0]
	 */
	scrollTo(x = 0, y = 0) {}

}

ns.Core.Page.Manager.Server = Server;
