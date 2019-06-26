const request = require('request');
const http = require('http');
const async = require('async');
const {expect} = require('chai');
const {Console} = require('console');
const express = require('express');
const session = require('express-session');
let ser1, handler, port = 18081;

console = new Console({stdout: process.stdout, stderr: process.stderr});

// console = require('@akayami/console-level')(console);

describe('BDD Tests', () => {

	const config = {
		secret: 'keyboard cat',
		resave: false,
		saveUninitialized: true,
		storeConf: {
			//class: session.MemoryStore,
			type: 'connect-redis',
			config: {
				client: require('redis-mock').createClient({})
			}
		}
	};

	beforeEach((done) => {

		const h = require('../lib/main.js')(config);

		const handler = (req, res) => {

			h(req, res, (err, req, res) => {
				//console.error(err);

				if (err) {
					res.status(err.code);
					res.write(err.message);
					res.end();
				} else {

					const app = express();
					app.get('/', (req, res, next) => {
						res.send('OK');
						next();
					});
					app.get('/count', (req, res, next) => {
						req.session.views = (req.session.views || 0) + 1;
						res.write(String(req.session.views));
						res.end();
						next();
					});
					app.use((err, req, res, next) => {
						//console.error(err);
						next();
					});
					app(req, res);
				}
			});

		};

		ser1 = require('http').createServer(handler).listen(port, (err) => {
			if (err) return done(err);
			done();
		});
	});

	afterEach(() => {
		if (ser1) ser1.close();
	});


	it('Basic', (done) => {
		async.series([
			(cb) => {
				require('request')({
					url: `http://localhost:${port}/`,
					method: 'GET'
				}, (err, res, body) => {
					expect(res.statusCode).equal(200);
					//console.log(res.headers);
					//expect(res.headers.location).equal(login_path);
					return cb(err);
				});
			}
		], (err, res) => {
			if (err) return done(err);
			done();
		});
	});
});