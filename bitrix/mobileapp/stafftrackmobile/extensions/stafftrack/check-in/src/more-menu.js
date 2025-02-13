/**
 * @module stafftrack/check-in/more-menu
 */
jn.define('stafftrack/check-in/more-menu', (require, exports, module) => {
	const { Color } = require('tokens');
	const { Loc } = require('loc');
	const { showToast } = require('toast');
	const { outline: { alert } } = require('assets/icons');
	const { Haptics } = require('haptics');

	const { ShiftAjax } = require('stafftrack/ajax');
	const { MuteEnum } = require('stafftrack/model/counter');
	const { BaseMenu, baseSectionType } = require('stafftrack/base-menu');

	const { Icon } = require('ui-system/blocks/icon');

	const { SettingsPage } = require('stafftrack/check-in/pages/settings');
	const { AvaMenu } = require('ava-menu');

	const helpSectionType = 'help';

	/**
	 * @class MoreMenu
	 */
	class MoreMenu extends BaseMenu
	{
		getItems()
		{
			return [
				this.getMutedItem(),
				this.getSettingsButton(),
				this.getHelpItem(),
			];
		}

		getMutedItem()
		{
			if (this.props.isMuted === true)
			{
				return {
					id: itemTypes.remind,
					sectionCode: baseSectionType,
					testId: 'stafftrack-settings-remind-menu',
					title: Loc.getMessage('M_STAFFTRACK_CHECK_IN_REMIND'),
					iconName: Icon.SOUND_ON.getIconName(),
					styles: {
						icon: {
							color: Color.base3.toHex(),
						},
					},
				};
			}

			return {
				id: itemTypes.doNotRemind,
				sectionCode: baseSectionType,
				testId: 'stafftrack-settings-do-not-remind-menu',
				title: Loc.getMessage('M_STAFFTRACK_CHECK_IN_DO_NOT_REMIND'),
				iconName: Icon.SOUND_OFF.getIconName(),
				styles: {
					icon: {
						color: Color.base3.toHex(),
					},
				},
			};
		}

		getSettingsButton()
		{
			if (!this.props.isAdmin)
			{
				return null;
			}

			return {
				id: itemTypes.settings,
				sectionCode: baseSectionType,
				testId: 'stafftrack-settings-settings-menu',
				title: Loc.getMessage('M_STAFFTRACK_CHECK_IN_SETTINGS_MSGVER_1'),
				iconName: Icon.SETTINGS.getIconName(),
				styles: {
					icon: {
						color: Color.base3.toHex(),
					},
				},
			};
		}

		getHelpItem()
		{
			const sectionCode = this.props.isAdmin ? helpSectionType : baseSectionType;

			return {
				id: itemTypes.help,
				sectionCode,
				testId: 'stafftrack-settings-show-help-menu',
				title: Loc.getMessage('M_STAFFTRACK_CHECK_IN_HELP_MSGVER_1'),
				iconName: Icon.QUESTION.getIconName(),
				styles: {
					icon: {
						color: Color.base3.toHex(),
					},
				},
			};
		}

		getSections()
		{
			const sections = [
				{
					id: baseSectionType,
					title: '',
				},
			];

			if (this.props.isAdmin)
			{
				sections.push({
					id: helpSectionType,
					title: '',
				});
			}

			return sections;
		}

		onItemSelected(item)
		{
			switch (item.id)
			{
				case itemTypes.help:
					this.showHelp();
					break;
				case itemTypes.remind:
					this.unmute();
					break;
				case itemTypes.doNotRemind:
					this.mute();
					break;
				case itemTypes.settings:
					this.openSettings();
					break;
				default:
					break;
			}
		}

		mute()
		{
			this.props.isMuted = true;
			ShiftAjax.muteCounter(MuteEnum.PERMANENT.toNumber());
			this.showInfoMuteToast(Loc.getMessage('M_STAFFTRACK_CHECK_IN_DO_NOT_REMIND_TOAST'));

			AvaMenu.setCounter({ elemId: 'check_in', value: '0' });
		}

		unmute()
		{
			this.props.isMuted = false;
			ShiftAjax.muteCounter(MuteEnum.DISABLED.toNumber());
			this.showInfoMuteToast(Loc.getMessage('M_STAFFTRACK_CHECK_IN_REMIND_TOAST'));

			if (this.props.hasShift === false)
			{
				AvaMenu.setCounter({ elemId: 'check_in', value: '1' });
			}
		}

		showInfoMuteToast(message)
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

		showHelp()
		{
			if (this.props.onHelpClick)
			{
				this.props.onHelpClick();
			}
		}

		openSettings()
		{
			new SettingsPage({ backdrop: true }).show(this.layoutWidget);
		}
	}

	const itemTypes = {
		help: 'help',
		settings: 'settings',
		remind: 'remind',
		doNotRemind: 'doNotRemind',
	};

	module.exports = { MoreMenu };
});
