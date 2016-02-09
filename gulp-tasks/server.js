/**
 * A testing web-server for Re:view web-site
 */
'use strict';
const connect = require('connect');
const serveStatic = require('serve-static');

module.exports = function(docroot, port) {
	port = port || 8000;
	var app = connect()
	.use((req, res, next) => {
		req.url = req.url.replace(/^\/\-\/\w+/, '');
		next();
	})
	.use(serveStatic(docroot));
	app.listen(port);
	console.log(`Started web-server at http://localhost:${port}`);
	return app;
};
