/* eslint-disable */
this.BX = this.BX || {};
(function (exports,main_core,ui_qrauthorization) {
	'use strict';

	class UserStatisticsLink {
	  constructor(props = {}) {
	    this.qrAuth = new ui_qrauthorization.QrAuthorization({
	      title: main_core.Loc.getMessage('STAFFTRACK_USER_STATISTICS_LINK_QRCODE_TITLE'),
	      content: main_core.Loc.getMessage('STAFFTRACK_USER_STATISTICS_LINK_QRCODE_BODY'),
	      intent: props.intent || 'check-in',
	      showFishingWarning: true,
	      showBottom: false
	    });
	  }
	  show() {
	    this.qrAuth.show();
	  }
	}

	exports.UserStatisticsLink = UserStatisticsLink;

}((this.BX.Stafftrack = this.BX.Stafftrack || {}),BX,BX.UI));
//# sourceMappingURL=user-statistics-link.bundle.js.map
