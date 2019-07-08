//const express = require('express');
const session = require('express-session');
//const app = express();

module.exports = function (app, config) {

	if(config.secret === undefined) throw new Error('Secret parameter in config is required');
	if(config.resave === undefined) config.resave = false;
	if(config.saveUninitialized === undefined) config.saveUninitialized = true;

	app.set('trust proxy', 1);

	app.use((req, res, next) => {
		if(req.headers['hardbox-trigger-error']) {
			const e = new Error('Test Error Triggered: ' + req.headers['hardbox-trigger-error']);
			e.code = req.headers['hardbox-trigger-error'];
			next(e);
		} else {
			next();
		}
	});

	// This needs to be initialized before session (fugly)
	if (config.storeConf) {
		console.debug('Initializing custom store');
		let sessionStore;
		if(config.storeConf.class) {
			sessionStore = config.storeConf.class;
		} else if(config.storeConf.type) {
			sessionStore = require(config.storeConf.type)(session);
		} else {
			throw new Error('When using storeConf, class or type must be provided');
		}
		config.store = new sessionStore(config.storeConf.config);
	}
	app.use(session(config));

	// return function (req, res) {
	//
	// 	// app.use(function (err, req, res, next) {
	// 	// 	cb(err, req, res);
	// 	// });
	// 	//
	// 	// app.use(function (req, res, next) {
	// 	// 	cb(null, req, res);
	// 	// });
	//
	// 	app(req, res);
	// };
};