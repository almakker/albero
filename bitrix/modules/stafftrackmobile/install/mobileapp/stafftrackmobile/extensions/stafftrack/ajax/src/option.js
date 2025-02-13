/**
 * @module stafftrack/ajax/option
 */
jn.define('stafftrack/ajax/option', (require, exports, module) => {
	const { BaseAjax } = require('stafftrack/ajax/base');

	const OptionActions = {
		SAVE_SELECTED_DEPARTMENT_ID: 'saveSelectedDepartmentId',
	};

	class OptionAjax extends BaseAjax
	{
		/**
		 * @returns {string}
		 */
		getEndpoint()
		{
			return 'stafftrack.Option';
		}

		/**
		 * @param departmentId {number}
		 * @returns {Promise<Object, void>}
		 */
		saveSelectedDepartmentId(departmentId)
		{
			return this.fetch(OptionActions.SAVE_SELECTED_DEPARTMENT_ID, { departmentId });
		}
	}

	module.exports = { OptionAjax: new OptionAjax() };
});
