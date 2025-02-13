import { Loc } from 'main.core';
import { QrAuthorization } from 'ui.qrauthorization';

export class UserStatisticsLink
{
	constructor(props = {})
	{
		this.qrAuth = new QrAuthorization({
			title: Loc.getMessage('STAFFTRACK_USER_STATISTICS_LINK_QRCODE_TITLE'),
			content: Loc.getMessage('STAFFTRACK_USER_STATISTICS_LINK_QRCODE_BODY'),
			intent: props.intent || 'check-in',
			showFishingWarning: true,
			showBottom: false,
		});
	}

	show()
	{
		this.qrAuth.show();
	}
}
