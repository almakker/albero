/**
 * @module stafftrack/check-in/pages/check-in
 */
jn.define('stafftrack/check-in/pages/check-in', (require, exports, module) => {
	const { Loc } = require('loc');
	const { Color, Indent, Component } = require('tokens');
	const { showToast } = require('toast');
	const { outline: { check, cross } } = require('assets/icons');
	const { Haptics } = require('haptics');

	const { Button, Icon } = require('ui-system/form/buttons/button');
	const { Card, CardDesign } = require('ui-system/layout/card');
	const { Area } = require('ui-system/layout/area');
	const { Link3, LinkDesign, LinkMode } = require('ui-system/blocks/link');
	const { Text3, Text2 } = require('ui-system/typography/text');
	const { BadgeCounter, BadgeCounterDesign } = require('ui-system/blocks/badges/counter');

	const { Message } = require('stafftrack/check-in/message');
	const { CancelReasonView } = require('stafftrack/check-in/cancel-reason-view');
	const { CancelReasonMenu } = require('stafftrack/check-in/cancel-reason-menu');
	const { MapView } = require('stafftrack/map');
	const { DateHelper } = require('stafftrack/date-helper');
	const { ShiftManager } = require('stafftrack/data-managers/shift-manager');
	const { ShiftModel, StatusEnum } = require('stafftrack/model/shift');
	const { MuteEnum } = require('stafftrack/model/counter');
	const { Analytics, CheckinSentEnum } = require('stafftrack/analytics');
	const { AvaMenu } = require('ava-menu');
	const { CancelReason } = require('stafftrack/check-in/pages/cancel-reason');

	const { PureComponent } = require('layout/pure-component');

	/**
	 * @class CheckInPage
	 */
	class CheckInPage extends PureComponent
	{
		constructor(props)
		{
			super(props);

			this.state = {
				shift: props.shift,
			};

			this.refs = {
				cancelDay: null,
				message: null,
				location: null,
			};

			this.previousToast = null;

			this.showCancelReasonMenu = this.showCancelReasonMenu.bind(this);
			this.startWorkingDay = this.startWorkingDay.bind(this);
			this.startNotWorkingDay = this.startNotWorkingDay.bind(this);
			this.cancelWorkingDay = this.cancelWorkingDay.bind(this);
			this.closeLayout = this.closeLayout.bind(this);

			this.update = this.update.bind(this);
		}

		get layoutWidget()
		{
			return this.props.layoutWidget;
		}

		/**
		 * @return {HeightManager}
		 */
		get heightManager()
		{
			return this.props.heightManager;
		}

		/**
		 * @returns {Object}
		 */
		get user()
		{
			return this.props.userInfo ?? {};
		}

		/**
		 * @return {ShiftModel}
		 */
		get shift()
		{
			return this.state.shift;
		}

		/**
		 * @returns {Object}
		 */
		get options()
		{
			return this.props.options ?? {};
		}

		/**
		 * @returns {string}
		 */
		get defaultMessage()
		{
			return this.options.defaultMessage || Loc.getMessage('M_STAFFTRACK_CHECK_IN_DEFAULT_MESSAGE');
		}

		/**
		 * @returns {Object}
		 */
		get dialogInfo()
		{
			return this.props.dialogInfo;
		}

		/**
		 *
		 * @returns {Boolean}
		 */
		get isGeoByDefaultZone()
		{
			return this.props.isGeoByDefaultZone;
		}

		/**
		 * @returns {string|null}
		 */
		get defaultLocation()
		{
			return this.options?.defaultLocation;
		}

		/**
		 * @returns {string|null}
		 */
		get defaultCustomLocation()
		{
			return this.options?.defaultCustomLocation;
		}

		isCounterMuted()
		{
			return this.props.counter?.muteStatus !== MuteEnum.DISABLED.toNumber();
		}

		componentDidMount()
		{
			ShiftManager.on('updated', this.update);
		}

		componentWillUnmount()
		{
			ShiftManager.off('updated', this.update);
		}

		async update()
		{
			const { currentShift } = await ShiftManager.getMain(DateHelper.getCurrentDayCode());

			const shift = new ShiftModel(currentShift);

			this.heightManager.setStatus(shift.getStatus());

			this.setState({ shift }, () => this.heightManager.updateSheetHeight());
		}

		render()
		{
			return ScrollView(
				{
					style: {
						flex: 1,
					},
				},
				Area(
					{
						isFirst: true,
						excludePaddingSide: {
							horizontal: true,
						},
					},
					this.shift.getStatus() && this.renderShiftStatus(),
					this.shift.isCancelOrNotWorkingStatus() && this.renderCancelReason(),
					!this.shift.isCancelOrNotWorkingStatus() && this.renderMessage(),
					!this.shift.isCancelOrNotWorkingStatus() && this.renderLocation(),
					!this.shift.isCancelOrNotWorkingStatus() && this.renderButtons(),
				),
			);
		}

		renderShiftStatus()
		{
			return View(
				{
					style: {
						paddingBottom: Indent.XL3.toNumber(),
						paddingHorizontal: Component.paddingLr.toNumber(),
					},
				},
				Card(
					{
						testId: 'stafftrack-shift-status-card',
						design: this.shift.isCancelOrNotWorkingStatus()
							? CardDesign.WARNING
							: CardDesign.ACCENT
						,
					},
					this.renderShiftStatusContent(),
				),
			);
		}

		renderShiftStatusContent()
		{
			return View(
				{
					style: {
						flexDirection: 'row',
						justifyContent: 'space-between',
					},
				},
				Text2({
					text: this.getShiftStatusTitle(),
					color: Color.base1,
				}),
				Text3({
					text: this.shift.isCancelOrNotWorkingStatus()
						? DateHelper.formatTime(this.shift.getDateCancel())
						: DateHelper.formatTime(this.shift.getDateCreate()),
					color: this.shift.isCancelOrNotWorkingStatus()
						? Color.accentMainWarning
						: Color.accentMainPrimary
					,
				}),
			);
		}

		getShiftStatusTitle()
		{
			if (this.shift.isWorkingStatus())
			{
				return Loc.getMessage('M_STAFFTRACK_CHECK_IN_WORKING_STATUS');
			}

			if (this.shift.isNotWorkingStatus())
			{
				return Loc.getMessage('M_STAFFTRACK_CHECK_IN_NOT_WORKING_STATUS');
			}

			return Loc.getMessage('M_STAFFTRACK_CHECK_IN_CANCEL_STATUS');
		}

		renderCancelReason()
		{
			return View(
				{
					style: {
						paddingHorizontal: Component.paddingLr.toNumber(),
					},
				},
				CancelReasonView({
					userInfo: this.user,
					cancelReason: this.shift.getCancelReason(),
				}),
			);
		}

		renderMessage()
		{
			return new Message({
				readOnly: this.shift.isWorkingStatus() || this.shift.isCancelOrNotWorkingStatus(),
				sendMessage: this.options.sendMessage,
				layoutWidget: this.layoutWidget,
				userInfo: this.user,
				isCancelReason: false,
				defaultValue: this.defaultMessage,
				placeholder: Loc.getMessage('M_STAFFTRACK_CHECK_IN_MESSAGE_PLACEHOLDER'),
				dialogId: this.dialogInfo.dialogId,
				dialogName: this.dialogInfo.dialogName,
				diskFolderId: this.props.diskFolderId,
				onFocusText: this.heightManager.onFocusText,
				onBlurText: this.heightManager.onBlurText,
				ref: (ref) => {
					this.refs.message = ref;
				},
			});
		}

		renderLocation()
		{
			return Area(
				{},
				new MapView({
					sendGeo: this.options.sendGeo,
					isFirstHelpViewed: this.options?.isFirstHelpViewed,
					readOnly: this.shift.isWorkingStatus() || this.shift.isCancelOrNotWorkingStatus(),
					location: this.shift.getLocation() || this.defaultLocation,
					customLocation: this.defaultCustomLocation,
					geoImageUrl: this.shift.getGeoImageUrl(),
					address: this.shift.getAddress(),
					isGeoByDefaultZone: this.isGeoByDefaultZone,
					onFocusText: this.heightManager.onFocusText,
					onBlurText: this.heightManager.onBlurText,
					ref: (ref) => {
						this.refs.location = ref;
					},
				}),
			);
		}

		renderButtons()
		{
			const dayStarted = this.shift.isWorkingStatus();
			const cancelledDay = this.shift.isCancelOrNotWorkingStatus();

			return Area(
				{
					isFirst: true,
				},
				!dayStarted && !cancelledDay && this.renderStartDayButton(),
				!dayStarted && !cancelledDay && this.renderNotWorkingButton(),
				dayStarted && !cancelledDay && this.renderCancelButton(),
			);
		}

		renderStartDayButton()
		{
			return Button({
				leftIcon: Icon.PLAY,
				text: Loc.getMessage('M_STAFFTRACK_CHECK_IN_START_WORKDAY'),
				onClick: this.startWorkingDay,
				color: Color.baseWhiteFixed,
				backgroundColor: Color.accentMainPrimary,
				stretched: true,
				testId: 'stafftrack-start-day-button',
				badge: this.isCounterMuted()
					? null
					: BadgeCounter({
						testId: 'stafftrack-start-day-button-badge',
						value: 1,
						design: BadgeCounterDesign.ALERT,
					})
				,
			});
		}

		renderNotWorkingButton()
		{
			return View(
				{
					style: {
						alignItems: 'center',
						justifyContent: 'center',
						height: 50,
					},
					ref: (ref) => {
						this.refs.cancelDay = ref;
					},
				},
				Link3({
					text: Loc.getMessage('M_STAFFTRACK_CHECK_IN_NOT_WORKING'),
					design: LinkDesign.GREY,
					mode: LinkMode.DASH,
					size: 3,
					useInAppLink: false,
					testId: 'stafftrack-not-working-button',
					onClick: () => this.showCancelReasonMenu(this.startNotWorkingDay),
				}),
			);
		}

		renderCancelButton()
		{
			return View(
				{
					style: {
						alignItems: 'center',
						justifyContent: 'center',
						height: 50,
					},
					ref: (ref) => {
						this.refs.cancelDay = ref;
					},
				},
				Link3({
					text: Loc.getMessage('M_STAFFTRACK_CHECK_IN_CANCEL'),
					design: LinkDesign.GREY,
					mode: LinkMode.DASH,
					useInAppLink: false,
					testId: 'stafftrack-cancel-day-button',
					onClick: () => this.showCancelReasonMenu(this.cancelWorkingDay),
				}),
			);
		}

		// eslint-disable-next-line consistent-return
		async startWorkingDay()
		{
			this.refs.message?.blur();

			if (this.hasEmptyDialogId())
			{
				return this.refs.message.openChatSelector();
			}

			if (this.hasEmptyCustomLocation())
			{
				return this.showCheckInToast(Loc.getMessage('M_STAFFTRACK_CHECK_IN_EMPTY_LOCATION_TOAST'), true);
			}

			const shiftDto = {
				status: StatusEnum.WORKING.getValue(),
				shiftDate: DateHelper.getCurrentDayCode(),
				timezoneOffset: DateHelper.getTimezoneOffset(),
				location: this.refs.location?.getLocation(),
				geoImageUrl: this.refs.location?.getGeoImage(),
				address: this.refs.location?.getAddress(),
				dialogId: this.refs.message?.getDialogId(),
				message: this.refs.message?.getMessage(),
				imageFileId: this.refs.message?.getFileId(),
			};

			this.showCheckInToast();
			this.removeCounterFromAvaMenu();
			this.layoutWidget.close();

			void ShiftManager.addShift(shiftDto, this.user.departments);

			Analytics.sendCheckIn(CheckinSentEnum.DONE, {
				geoSent: Boolean(shiftDto.address),
				chatSent: Boolean(shiftDto.dialogId),
				imageSent: Boolean(shiftDto.imageFileId),
			});
		}

		// eslint-disable-next-line consistent-return
		startNotWorkingDay(cancelReason)
		{
			this.openCancelReasonPage(cancelReason, StatusEnum.NOT_WORKING);
		}

		cancelWorkingDay(cancelReason)
		{
			if (!this.shift.getId())
			{
				return;
			}

			this.openCancelReasonPage(cancelReason, StatusEnum.CANCEL_WORKING);
		}

		hasEmptyDialogId()
		{
			return this.refs.message
				&& this.refs.message.canTypeMessage()
				&& !this.refs.message.getDialogId()
			;
		}

		hasEmptyCustomLocation()
		{
			return this.refs.location
				&& this.refs.location.isCustomLocationSelected()
				&& !this.refs.location.getLocation()
			;
		}

		showCheckInToast(message = Loc.getMessage('M_STAFFTRACK_CHECK_IN_SENT_TOAST'), alert = false)
		{
			this.previousToast?.close();

			this.previousToast = showToast({
				message,
				svg: {
					content: alert ? cross() : check(),
				},
				backgroundColor: alert
					? Color.accentMainAlert.toHex()
					: Color.bgContentInapp.toHex()
				,
			});

			if (alert)
			{
				Haptics.notifyFailure();
			}
			else
			{
				Haptics.notifySuccess();
			}
		}

		removeCounterFromAvaMenu()
		{
			AvaMenu.setCounter({ elemId: 'check_in', value: '0' });
		}

		closeLayout()
		{
			this.layoutWidget?.close();
		}

		showCancelReasonMenu(callback)
		{
			this.cancelReasonMenu ??= new CancelReasonMenu({
				layoutWidget: this.layoutWidget,
				onItemSelected: callback,
			});

			this.cancelReasonMenu.show(this.refs.cancelDay);
		}

		openCancelReasonPage(selectedReason, cancelType)
		{
			Haptics.impactMedium();

			const cancelReason = new CancelReason({
				userInfo: this.user,
				shift: this.shift,
				selectedReason,
				cancelType,
				dialogId: this.refs.message?.getCurrentDialogId(),
				dialogName: this.refs.message?.getCurrentDialogName(),
				onLayoutClose: this.closeLayout,
			});

			cancelReason.show(this.layoutWidget);
		}
	}

	module.exports = { CheckInPage };
});
