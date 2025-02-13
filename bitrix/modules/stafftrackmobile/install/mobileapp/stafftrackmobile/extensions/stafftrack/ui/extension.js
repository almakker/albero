/**
 * @module stafftrack/ui
 */
jn.define('stafftrack/ui', (require, exports, module) => {
	const { TextInputWithMaxHeight } = require('stafftrack/ui/text-input-with-max-height');
	const { ScrollViewWithMaxHeight } = require('stafftrack/ui/scroll-view-with-max-height');

	module.exports = {
		TextInputWithMaxHeight,
		ScrollViewWithMaxHeight,
	};
});
