/**
 * @module stafftrack/check-in/pages/settings
 */
jn.define('stafftrack/check-in/pages/settings', (require, exports, module) => {
	const { Loc } = require('loc');
	const { BottomSheet } = require('bottom-sheet');
	const { Color, Indent } = require('tokens');
	const { showToast } = require('toast');
	const { confirmDestructiveAction } = require('alert');
	const { outline: { alert } } = require('assets/icons');
	const { PureComponent } = require('layout/pure-component');
	const { Haptics } = require('haptics');
	const { CheckIn } = require('ava-menu');

	const { Area } = require('ui-system/layout/area');
	const { H3 } = require('ui-system/typography/heading');
	const { IconView, Icon } = require('ui-system/blocks/icon');
	const { Button } = require('ui-system/form/buttons/button');
	const { Link3, LinkMode } = require('ui-system/blocks/link');
	const { StatusBlock } = require('ui-system/blocks/status-block');

	const { HeightManager } = require('stafftrack/check-in/height-manager');
	const { SettingsManager } = require('stafftrack/data-managers/settings-manager');

	/**
	 * @class SettingsPage
	 */
	class SettingsPage extends PureComponent
	{
		constructor(props)
		{
			super(props);

			this.refs = {
				layoutWidget: null,
			};

			this.onAdminChatButtonClick = this.onAdminChatButtonClick.bind(this);
			this.onTurnOnButtonClick = this.onTurnOnButtonClick.bind(this);
			this.onTurnOffButtonClick = this.onTurnOffButtonClick.bind(this);
		}

		get userId()
		{
			return this.props.userInfo?.id || 0;
		}

		show(parentLayout = PageManager)
		{
			void new BottomSheet({ component: this })
				.setParentWidget(parentLayout)
				.setBackgroundColor(Color.bgSecondary.toHex())
				.disableContentSwipe()
				.setMediumPositionHeight(HeightManager.getDefaultHeight())
				.open()
				.then((widget) => {
					this.refs.layoutWidget = widget;
				})
			;
		}

		render()
		{
			return View(
				{},
				this.props.backdrop && this.renderHeader(),
				this.renderContent(),
			);
		}

		renderHeader()
		{
			return Area(
				{
					isFirst: true,
					style: {
						flexDirection: 'row',
						alignItems: 'center',
					},
				},
				IconView({
					icon: Icon.ARROW_TO_THE_LEFT,
					size: 24,
					color: Color.base4,
					onClick: () => this.refs.layoutWidget.close(),
				}),
				H3({
					text: Loc.getMessage('M_STAFFTRACK_CHECK_IN_SETTINGS_HEADER'),
					style: {
						marginLeft: Indent.XL.toNumber(),
					},
				}),
			);
		}

		renderContent()
		{
			return Area(
				{
					isFirst: true,
					style: {
						alignItems: 'center',
						marginBottom: Indent.XL4.toNumber(),
					},
				},
				this.renderStatusBlock(),
				this.renderButtons(),
			);
		}

		renderStatusBlock()
		{
			return StatusBlock({
				testId: 'stafftrack-check-in-settings-status-block',
				image: Image({
					resizeMode: 'contain',
					style: {
						width: 291,
						height: 140,
					},
					svg: {
						content: icons.disabled,
					},
				}),
				title: this.getTitle(),
				description: this.getDescription(),
				buttons: this.getStatusBlockButtons(),
			});
		}

		renderButtons()
		{
			return View(
				{
					style: {
						marginTop: Indent.XL4.toNumber(),
						width: '100%',
						alignItems: 'center',
					},
				},
				this.hasDepartmentHeadId() && this.renderAdminChatButton(),
				this.isUserAdmin() && this.renderTurnOnButton(),
				this.props.backdrop && this.renderTurnOffButton(),
			);
		}

		getTitle()
		{
			if (this.props.backdrop)
			{
				return Loc.getMessage('M_STAFFTRACK_CHECK_IN_SETTINGS_TITLE');
			}

			return Loc.getMessage('M_STAFFTRACK_CHECK_IN_SETTINGS_DISABLED');
		}

		getDescription()
		{
			if (this.props.backdrop)
			{
				return Loc.getMessage('M_STAFFTRACK_CHECK_IN_SETTINGS_TURNED_ON');
			}

			if (this.props.isAdmin)
			{
				return Loc.getMessage('M_STAFFTRACK_CHECK_IN_SETTINGS_TURNED_OFF_ADMIN');
			}

			return Loc.getMessage('M_STAFFTRACK_CHECK_IN_SETTINGS_TURNED_OFF');
		}

		getStatusBlockButtons()
		{
			const result = [];

			if (!this.props.backdrop && !this.props.isAdmin)
			{
				result.push(Link3({
					testId: 'stafftrack-check-in-settings-help-link',
					text: Loc.getMessage('M_STAFFTRACK_CHECK_IN_SETTINGS_HELP'),
					mode: LinkMode.PLAIN,
					useInAppLink: false,
					onClick: this.props.onHelpClick,
				}));
			}

			return result;
		}

		hasDepartmentHeadId()
		{
			if (!this.props.backdrop && !this.props.isAdmin && this.props.departmentHeadId)
			{
				return Number(this.props.departmentHeadId) !== Number(this.userId);
			}

			return false;
		}

		isUserAdmin()
		{
			return !this.props.backdrop && this.props.isAdmin;
		}

		renderAdminChatButton()
		{
			return Button({
				testId: 'stafftrack-check-in-settings-admin-chat',
				text: Loc.getMessage('M_STAFFTRACK_CHECK_IN_SETTINGS_OPEN_CHAT_WITH_ADMIN'),
				color: Color.baseWhiteFixed,
				backgroundColor: Color.accentMainPrimary,
				stretched: true,
				style: {
					marginTop: Indent.XL4.toNumber(),
				},
				onClick: this.onAdminChatButtonClick,
			});
		}

		onAdminChatButtonClick()
		{
			const dialogId = this.props.departmentHeadId;
			BX.postComponentEvent('ImMobile.Messenger.Dialog:open', [{ dialogId }], 'im.messenger');

			if (this.props.onAdminChatButtonClick)
			{
				this.props.onAdminChatButtonClick();
			}
		}

		renderTurnOnButton()
		{
			return Button({
				testId: 'stafftrack-check-in-settings-turn-on',
				text: Loc.getMessage('M_STAFFTRACK_CHECK_IN_SETTINGS_TURN_ON'),
				color: Color.baseWhiteFixed,
				backgroundColor: Color.accentMainPrimary,
				stretched: true,
				style: {
					marginTop: Indent.XL4.toNumber(),
				},
				onClick: this.onTurnOnButtonClick,
			});
		}

		onTurnOnButtonClick()
		{
			this.turnCheckInSettingOn();

			CheckIn.updateItemColor(true);
		}

		turnCheckInSettingOn()
		{
			SettingsManager.turnCheckInSettingOn();
			this.showInfoToast(Loc.getMessage('M_STAFFTRACK_CHECK_IN_SETTINGS_TURNED_ON_TOAST'));
		}

		renderTurnOffButton()
		{
			return Link3({
				testId: 'stafftrack-check-in-settings-turn-off',
				text: Loc.getMessage('M_STAFFTRACK_CHECK_IN_SETTINGS_TURN_OFF'),
				mode: LinkMode.PLAIN,
				color: Color.accentMainAlert,
				style: {
					padding: Indent.XL.toNumber(),
				},
				useInAppLink: false,
				onClick: this.onTurnOffButtonClick,
			});
		}

		onTurnOffButtonClick()
		{
			confirmDestructiveAction({
				title: Loc.getMessage('M_STAFFTRACK_CHECK_IN_SETTINGS_TURN_OFF_TITLE'),
				description: Loc.getMessage('M_STAFFTRACK_CHECK_IN_SETTINGS_TURN_OFF_DESCRIPTION'),
				destructionText: Loc.getMessage('M_STAFFTRACK_CHECK_IN_SETTINGS_TURN_OFF_CONFIRM'),
				onDestruct: () => this.turnCheckInSettingOff(),
			});
		}

		turnCheckInSettingOff()
		{
			SettingsManager.turnCheckInSettingOff();
			this.showInfoToast(Loc.getMessage('M_STAFFTRACK_CHECK_IN_SETTINGS_TURNED_OFF_TOAST'));
			this.refs.layoutWidget.close();

			CheckIn.updateItemColor(false);
		}

		showInfoToast(message)
		{
			showToast({
				message,
				svg: {
					content: alert(),
				},
				backgroundColor: Color.bgContentInapp.toHex(),
			});

			Haptics.notifySuccess();
		}
	}

	const base8 = Color.base8.toHex();
	const baseWhiteFixed = Color.baseWhiteFixed.toHex();
	const primary = Color.accentMainPrimary.toHex();
	const success = Color.accentMainSuccess.toHex();
	const blue = Color.accentSoftBlue1.toHex();

	const icons = {
		disabled: `<svg width="291" height="140" viewBox="0 0 291 140" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M227.999 79.0708C227.999 75.1773 224.823 72.0313 220.93 72.0697L192.931 72.3456C189.092 72.3835 186 75.5062 186 79.3453V102.978C186 107.011 189.4 110.21 193.426 109.965L213.253 108.757L217.468 115.566C217.868 116.212 218.813 116.194 219.188 115.534L223.386 108.14C225.976 107.983 227.996 105.837 227.996 103.242V92.7692L227.999 79.0708Z" fill="${primary}" fill-opacity="0.78"/><path d="M213.678 108.494C213.581 108.338 213.406 108.247 213.222 108.258L193.395 109.466C189.657 109.694 186.5 106.723 186.5 102.978V79.3453C186.5 75.7804 189.371 72.8808 192.936 72.8456L220.934 72.5697C224.55 72.534 227.499 75.4553 227.499 79.0707L227.496 92.7691V92.7692V103.242C227.496 105.572 225.682 107.5 223.355 107.641C223.187 107.652 223.034 107.746 222.951 107.894L218.753 115.287C218.566 115.617 218.093 115.626 217.893 115.303L213.678 108.494Z" stroke="${baseWhiteFixed}" stroke-opacity="0.18" stroke-linejoin="round"/><g filter="url(#filter0_d_943_31187)"><path d="M197.915 83.4217L217.205 83.0003C218.196 82.9801 219 83.9509 219 85.1745C219 86.3948 218.196 87.4094 217.205 87.4398L197.915 87.9993C196.856 88.0297 196 87.0285 196 85.7611C196 84.4936 196.86 83.4486 197.915 83.425V83.4217Z" fill="${baseWhiteFixed}" fill-opacity="0.9" shape-rendering="crispEdges"/></g><g filter="url(#filter1_d_943_31187)"><path d="M197.915 93.6817L217.205 93.001C218.196 92.966 219 93.8726 219 95.0242C219 96.1757 218.196 97.1459 217.205 97.1873L197.915 97.9985C196.856 98.043 196 97.1109 196 95.9149C196 94.7188 196.86 93.7199 197.915 93.6817Z" fill="${baseWhiteFixed}" fill-opacity="0.9" shape-rendering="crispEdges"/></g><path d="M115 18.9354C115 11.9537 120.937 6.44605 127.899 6.96911L165.899 9.82405C172.16 10.2944 177 15.5117 177 21.7903V117.109C177 123.289 172.306 128.458 166.155 129.053L128.155 132.728C121.104 133.41 115 127.867 115 120.784V18.9354Z" fill="${blue}" fill-opacity="0.8"/><path d="M115.5 18.9354C115.5 12.2446 121.19 6.96644 127.862 7.4677L165.862 10.3226C171.862 10.7734 176.5 15.7733 176.5 21.7903V117.109C176.5 123.031 172.002 127.985 166.107 128.555L128.107 132.23C121.35 132.884 115.5 127.572 115.5 120.784V18.9354Z" stroke="${base8}" stroke-opacity="0.24"/><path d="M172 27.4446C172 22.8564 175.851 19.2084 180.432 19.4563L203.432 20.7007C207.676 20.9304 211 24.4387 211 28.689V53.9124C211 58.3647 207.365 61.9604 202.913 61.9119L179.913 61.6615C175.529 61.6137 172 58.0462 172 53.6619V27.4446Z" fill="${primary}" fill-opacity="0.78"/><path d="M172.5 27.4446C172.5 23.1432 176.11 19.7231 180.405 19.9555L203.405 21.2C207.384 21.4153 210.5 24.7044 210.5 28.689V53.9124C210.5 58.0865 207.092 61.4574 202.918 61.412L179.918 61.1615C175.808 61.1167 172.5 57.7722 172.5 53.6619V27.4446Z" stroke="${baseWhiteFixed}" stroke-opacity="0.18"/><path d="M140.056 15.0034L156.057 15.9254C157.132 15.988 158 16.9469 158 18.0681C158 19.1892 157.132 20.0543 156.057 19.9973L140.056 19.1778C138.923 19.1209 138 18.1335 138 16.9782C138 15.8201 138.923 14.938 140.056 15.0034Z" fill="${baseWhiteFixed}" fill-opacity="0.4"/><path d="M135.334 121.564L161.772 119.004C162.452 118.939 163 119.623 163 120.532C163 121.441 162.452 122.234 161.772 122.303L135.334 124.995C134.599 125.068 134 124.361 134 123.413C134 122.466 134.596 121.638 135.334 121.568V121.564Z" fill="${baseWhiteFixed}" fill-opacity="0.4"/><path d="M61 48.3504C61 41.5877 66.5854 36.1608 73.3453 36.3554L109.345 37.3919C115.836 37.5787 121 42.894 121 49.3869V89.5325C121 95.922 115.993 101.191 109.612 101.517L73.6122 103.356C66.7532 103.706 61 98.2393 61 91.3714V48.3504Z" fill="${success}" fill-opacity="0.78"/><path d="M61.5 48.3504C61.5 41.8695 66.8527 36.6687 73.3309 36.8552L109.331 37.8916C115.551 38.0707 120.5 43.1645 120.5 49.3869V89.5325C120.5 95.6557 115.702 100.705 109.587 101.017L73.5867 102.856C67.0135 103.192 61.5 97.9531 61.5 91.3714V48.3504Z" stroke="${baseWhiteFixed}" stroke-opacity="0.18"/><g filter="url(#filter2_d_943_31187)"><path d="M87.2477 49.6532C87.173 49.7085 87.1059 49.7703 87.0424 49.8386H87.0462C83.7286 52.622 82.6053 57.8635 83.5308 62.4353C84.4824 67.1176 87.5201 71.0228 92.3677 70.9643C95.2411 70.9285 97.4615 69.4978 98.9655 67.342C100.484 65.2057 101.275 62.3573 101.328 59.5284C101.38 56.6995 100.697 53.8511 99.2379 51.705V51.6985C97.7676 49.5524 95.5098 48.0665 92.3677 48.0014C91.4944 47.9819 90.5055 48.164 89.5726 48.4827C88.6172 48.8013 87.8112 49.2305 87.2477 49.6532Z" fill="${baseWhiteFixed}" fill-opacity="0.9" shape-rendering="crispEdges"/><path d="M108 87.4857C107.395 77.513 99.5774 75.1068 92.3862 75.2401L92.3825 75.2369C85.0384 75.3734 76.668 78.1958 76 88.6725C76 89.4334 76.5747 90.0252 77.28 89.9992L106.828 88.8449C107.478 88.8188 108 88.2108 108 87.4857Z" fill="${baseWhiteFixed}" fill-opacity="0.9" shape-rendering="crispEdges"/></g><g filter="url(#filter3_d_943_31187)"><path fill-rule="evenodd" clip-rule="evenodd" d="M192.562 53C192.562 53 200 46.3349 200 39.493C200 37.0727 199.223 34.7222 197.834 32.9443C196.44 31.1616 194.547 30.1051 192.562 30.0074C190.576 29.9096 188.647 30.7893 187.227 32.4556C185.802 34.1265 185 36.449 185 38.9112C185 45.8648 192.562 53 192.562 53ZM196.291 38.7762C196.291 41.1453 194.624 43.0117 192.557 42.9419C190.489 42.8721 188.791 40.8753 188.791 38.483C188.791 36.0906 190.478 34.2289 192.557 34.322C194.635 34.4151 196.291 36.4071 196.291 38.7809V38.7762Z" fill="${baseWhiteFixed}" fill-opacity="0.9" shape-rendering="crispEdges"/></g><g filter="url(#filter4_d_943_31187)"><path fill-rule="evenodd" clip-rule="evenodd" d="M142.389 52C140.911 51.9924 139.71 53.3179 139.71 54.9614V55.946H138.578C135.506 55.9421 133 58.7043 133 62.1139V82.039C133 85.4486 135.506 88.1149 138.578 87.9962L159.78 87.1763C162.671 87.0652 165 84.3222 165 81.0467V61.907C165 58.6315 162.671 55.9728 159.78 55.969H158.726V55.0035C158.726 53.3983 157.581 52.0881 156.155 52.0805C154.729 52.0728 153.567 53.3754 153.567 54.992V55.9613L145.051 55.9536V54.9729C145.051 53.3409 143.867 52.0077 142.389 52ZM146.322 71.4117L148.03 73.2778L153.864 66.3261C154.452 65.6262 155.523 65.6087 156.133 66.2891C156.631 66.8444 156.646 67.6811 156.168 68.2537L148.14 77.8731C148.084 77.9407 147.981 77.9441 147.92 77.8803L143.959 73.5814C143.411 72.9866 143.392 72.0766 143.914 71.459C144.539 70.721 145.669 70.6988 146.322 71.4117Z" fill="${baseWhiteFixed}" fill-opacity="0.9" shape-rendering="crispEdges"/></g><defs><filter id="filter0_d_943_31187" x="186" y="77" width="43" height="25" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/><feOffset dy="4"/><feGaussianBlur stdDeviation="5"/><feComposite in2="hardAlpha" operator="out"/><feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.05 0"/><feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_943_31187"/><feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_943_31187" result="shape"/></filter><filter id="filter1_d_943_31187" x="186" y="87" width="43" height="25" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/><feOffset dy="4"/><feGaussianBlur stdDeviation="5"/><feComposite in2="hardAlpha" operator="out"/><feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.05 0"/><feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_943_31187"/><feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_943_31187" result="shape"/></filter><filter id="filter2_d_943_31187" x="66" y="42" width="52" height="62" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/><feOffset dy="4"/><feGaussianBlur stdDeviation="5"/><feComposite in2="hardAlpha" operator="out"/><feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.05 0"/><feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_943_31187"/><feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_943_31187" result="shape"/></filter><filter id="filter3_d_943_31187" x="175" y="24" width="35" height="43" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/><feOffset dy="4"/><feGaussianBlur stdDeviation="5"/><feComposite in2="hardAlpha" operator="out"/><feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.05 0"/><feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_943_31187"/><feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_943_31187" result="shape"/></filter><filter id="filter4_d_943_31187" x="123" y="46" width="52" height="56" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/><feOffset dy="4"/><feGaussianBlur stdDeviation="5"/><feComposite in2="hardAlpha" operator="out"/><feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.05 0"/><feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_943_31187"/><feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_943_31187" result="shape"/></filter></defs></svg>`,
	};

	module.exports = { SettingsPage };
});
