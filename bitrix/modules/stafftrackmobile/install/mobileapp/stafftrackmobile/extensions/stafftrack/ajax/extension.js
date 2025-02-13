/**
 * @module stafftrack/ajax
 */
jn.define('stafftrack/ajax', (require, exports, module) => {
	const { ShiftAjax } = require('stafftrack/ajax/shift');
	const { DepartmentStatisticsAjax } = require('stafftrack/ajax/department-statistics');
	const { UserLinkStatisticsAjax } = require('stafftrack/ajax/user-link-statistics');
	const { OptionAjax } = require('stafftrack/ajax/option');
	const { SettingsAjax } = require('stafftrack/ajax/settings');

	module.exports = {
		ShiftAjax,
		DepartmentStatisticsAjax,
		UserLinkStatisticsAjax,
		OptionAjax,
		SettingsAjax,
	};
});
