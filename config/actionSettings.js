'use strict';

module.exports = {
	displayAllSources: false,
	displayAllC19nGroups: false,
	displayAllGroups: false,
	circleTypes: {
		c19n: {
			requiredAllowed: true,
			max: 1,
			sources: true
		},
		c19nGroups1: {
			requiredAllowed: true,
			max: 1,
			requires: ['c19n']
		},
		c19nGroups2: {
			requiredAllowed: true,
			max: 1,
			requires: ['c19n']
		},
		personal: {
			requiredAllowed: false,
			max: 50,
			watchers: true
		}
	},
	cacheTime: 60 * 5
};