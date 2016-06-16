'use strict';

module.exports = {
	displayAllSources: false,
	displayAllC19nGroups: true,
	displayAllGroups: true,
	circleTypes: {
		c19n: {
			requiredAllowed: true,
			max: 1
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
		// groups: {
			
		// }
	}
};