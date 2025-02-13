/**
 * @module stafftrack/data-managers/option-manager
 */
jn.define('stafftrack/data-managers/option-manager', (require, exports, module) => {
	const { OptionAjax } = require('stafftrack/ajax');

	class OptionManager
	{
		getOptions()
		{
			return this.options;
		}

		setOptions(options)
		{
			this.options = options;
		}

		saveSelectedDepartmentId(selectedDepartmentId)
		{
			void OptionAjax.saveSelectedDepartmentId(selectedDepartmentId);
			this.setOptions({ ...this.getOptions(), selectedDepartmentId });
		}
	}

	module.exports = { OptionManager: new OptionManager() };
});
