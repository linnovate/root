'use strict';

module.exports = {
	displayAllSources: false,
	displayAllC19nGroups: true,
	displayAllGroups: true,
	circleTypes: {
		c19n: {
			max: 1
		},
		c19nGroups1: {
			max: 1,
			requires: ['c19n']
		},
		c19nGroups2: {
			max: 1,
			requires: ['c19n']
		}
	}
};