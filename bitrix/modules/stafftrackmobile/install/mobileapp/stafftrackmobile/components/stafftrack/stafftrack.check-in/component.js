(() => {
	const require = (ext) => jn.require(ext);

	const { CheckIn } = require('stafftrack/check-in');

	BX.onViewLoaded(() => {
		const dialogId = BX.componentParameters.get('DIALOG_ID', null);
		const dialogName = BX.componentParameters.get('DIALOG_NAME', null);

		layout.showComponent(
			new CheckIn({
				dialogId,
				dialogName,
				layoutWidget: layout,
			}),
		);
	});
})();
