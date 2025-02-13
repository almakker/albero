/**
 * @module stafftrack/data-managers/settings-manager
 */
jn.define('stafftrack/data-managers/settings-manager', (require, exports, module) => {
	const { SettingsAjax } = require('stafftrack/ajax');
	const { EventEmitter } = require('event-emitter');

	class SettingsManager extends EventEmitter
	{
		constructor()
		{
			super();

			this.setUid('Stafftrack.SettingsManager');
		}

		setEnabledBySettings(enabledBySettings)
		{
			this.enabledBySettings = enabledBySettings;
		}

		isEnabledBySettings()
		{
			return this.enabledBySettings;
		}

		turnCheckInSettingOn()
		{
			void SettingsAjax.turnCheckInSettingOn();

			this.setEnabledBySettings(true);

			this.emit('updated');
		}

		turnCheckInSettingOff()
		{
			void SettingsAjax.turnCheckInSettingOff();

			this.setEnabledBySettings(false);

			this.emit('updated');
		}
	}

	module.exports = { SettingsManager: new SettingsManager() };
});
