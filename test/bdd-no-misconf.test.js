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

	it('Needs to fail to initialize when missing secret', () => {
		expect(() => {
			require('../lib/main.js')(express(), {});
		}).to.throw(Error, 'Secret parameter in config is required');
	});

	it('Should initialize with only secret', () => {
		let p = require('../lib/main.js')(express(), {secret: 'keyboard cat'});
	});

	it('Needs to fail to initialize when missing class or type', () => {
		const config = {
			secret: 'keyboard cat',
			resave: false,
			saveUninitialized: true,
			storeConf: {
				//class: session.MemoryStore,
				//type: 'connect-redis',
				config: {
					client: require('redis-mock').createClient({})
				}
			}
		};
		expect(() => {
			require('../lib/main.js')(express(), config);
		}).to.throw(Error, 'When using storeConf, class or type must be provided');
	});
});