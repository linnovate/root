'use strict';

module.exports = {
	displayAllSources: false,
	displayAllC19nGroups: false,
	displayAllGroups: false,
	circleTypes: {
		c19n: {
			requiredAllowed: true,
			max: 1,
			sources: true,
			location: 'modal'
		},
		c19nGroups1: {
			requiredAllowed: true,
			max: 1,
			requires: ['c19n'],
			location: 'modal'
		},
		c19nGroups2: {
			requiredAllowed: true,
			max: 1,
			requires: ['c19n'],
			location: 'modal'
		},
		personal: {
			requiredAllowed: false,
			max: 50,
			watchers: true,
			location: 'footer'
		},
		corporate: {
			requiredAllowed: false,
			max: 50,
			watchers: true,
			location: 'footer'
		}
	},
	cacheTime: 5,
	cacheDb: 'mongoose'
};