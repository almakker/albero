/**
 * @module stafftrack/ajax/settings
 */
jn.define('stafftrack/ajax/settings', (require, exports, module) => {
	const { BaseAjax } = require('stafftrack/ajax/base');

	const SettingsActions = {
		TURN_CHECK_IN_SETTING_ON: 'turnCheckInSettingOn',
		TURN_CHECK_IN_SETTING_OFF: 'turnCheckInSettingOff',
	};

	class SettingsAjax extends BaseAjax
	{
		/**
		 * @returns {string}
		 */
		getEndpoint()
		{
			return 'stafftrack.Settings';
		}

		turnCheckInSettingOn()
		{
			return this.fetch(SettingsActions.TURN_CHECK_IN_SETTING_ON);
		}

		turnCheckInSettingOff()
		{
			return this.fetch(SettingsActions.TURN_CHECK_IN_SETTING_OFF);
		}
	}

	module.exports = { SettingsAjax: new SettingsAjax() };
});
