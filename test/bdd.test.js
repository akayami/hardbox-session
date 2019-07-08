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
			class: session.MemoryStore,
			//type: 'connect-redis',
			config: {
				client: require('redis-mock').createClient({})
			}
		}
	};

	beforeEach((done) => {
		
		const app = express();
		
		const handler = (req, res) => {
			
			require('../lib/main.js')(app, config);
			
			app.get('/', (req, res, next) => {
				console.log('here');
				res.send('OK');
				//next();
			});
			app.get('/count', (req, res, next) => {
				req.session.views = (req.session.views || 0) + 1;
				res.write(String(req.session.views));
				res.end();
				//next();
			});
			app.use((err, req, res, next) => {
				if(err.code) res.status(err.code);
				res.write(err.message);
				res.end();
				next();
			});
			app(req, res);
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

	it('Basic Counting Using Session', (done) => {
		const j = require('request').jar();
		const request = require('request').defaults({jar: j});
		async.series([
			(cb) => {
				request({
					url: `http://localhost:${port}/count`,
					method: 'GET'
				}, (err, res, body) => {
					expect(res.statusCode).equal(200);
					expect(body).to.equal(String(1));
					return cb(err);
				});
			},
			(cb) => {
				request({
					url: `http://localhost:${port}/count`,
					method: 'GET',
					headers: {
						Cookie: j.getCookieString(`http://localhost:${port}`)
					}
				}, (err, res, body) => {
					expect(res.statusCode).equal(200);
					expect(body).to.equal(String(2));
					return cb(err);
				});
			},
			(cb) => {
				request({
					url: `http://localhost:${port}/count`,
					method: 'GET',
					headers: {
						Cookie: j.getCookieString(`http://localhost:${port}`)
					}
				}, (err, res, body) => {
					expect(res.statusCode).equal(200);
					expect(body).to.equal(String(3));
					return cb(err);
				});
			}
		], (err, res) => {
			if (err) return done(err);
			done();
		});
	});

	it('Trigger Error', (done) => {
		async.series([
			(cb) => {
				require('request')({
					url: `http://localhost:${port}/`,
					method: 'GET',
					headers: {
						'hardbox-trigger-error': 500
					}
				}, (err, res, body) => {
					expect(res.statusCode).equal(500);
					console.log(body);
					//console.log(res.headers);
					//expect(res.headers.location).equal(login_path);
					return cb(err);
				});
			}
		], (err, res) => {
			if (err) {
				return done(err);
			} else {
				return done();
			}
		});
	});
});