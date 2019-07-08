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
		saveUninitialized: true
	};

	beforeEach((done) => {
		
		const app = express();
		
		const handler = (req, res) => {
			
			require('../lib/main.js')(app, config);
			
			app.use((req, res, n) => {
				console.log('here');
				n();
			});
			
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
				console.error('hello', err);
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
});