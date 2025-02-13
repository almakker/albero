/**
 * @module stafftrack/department-statistics/today-statistics
 */
jn.define('stafftrack/department-statistics/today-statistics', (require, exports, module) => {
	const { Loc } = require('loc');
	const { Type } = require('type');
	const { Color, Indent } = require('tokens');
	const { Haptics } = require('haptics');

	const { IconView, Icon } = require('ui-system/blocks/icon');
	const { H3 } = require('ui-system/typography/heading');
	const { Text3 } = require('ui-system/typography/text');

	const { ShiftManager } = require('stafftrack/data-managers/shift-manager');
	const { DateHelper } = require('stafftrack/date-helper');
	const { TableStatisticsView } = require('stafftrack/department-statistics/table-statistics-view');
	const { TableUser } = require('stafftrack/department-statistics/table-user');
	const { ProgressBar } = require('stafftrack/department-statistics/progress-bar');
	const { ShiftView } = require('stafftrack/shift-view');

	const { PureComponent } = require('layout/pure-component');

	class TodayStatistics extends PureComponent
	{
		/**
		 * @param props {{departmentId: number}}
		 */
		constructor(props)
		{
			super(props);

			this.state = {
				users: [],
				statistics: [],
			};

			this.load = this.load.bind(this);

			this.renderStatisticsUser = this.renderStatisticsUser.bind(this);
			this.renderStatisticsValue = this.renderStatisticsValue.bind(this);
			this.onItemClickHandler = this.onItemClickHandler.bind(this);

			void this.load();
		}

		componentDidMount()
		{
			ShiftManager.on('updated', this.load);
		}

		componentWillUnmount()
		{
			ShiftManager.off('updated', this.load);
		}

		get departmentId()
		{
			return this.props.departmentId;
		}

		setDepartmentId(departmentId)
		{
			this.props.departmentId = departmentId;

			void this.load();
		}

		async load()
		{
			const { users, shifts } = await ShiftManager.getDepartmentStatistics(this.departmentId);

			const statistics = shifts
				.filter((shift) => shift.isWorkingStatus())
				.sort((a, b) => b.getDateCreate().getTime() - a.getDateCreate().getTime())
				.map((shift) => ({
					user: users.find((user) => user.id === shift.getUserId()),
					shift,
					time: DateHelper.formatTime(shift.getDateCreate()),
				}))
			;

			this.setState({ users, statistics });
		}

		render()
		{
			const isEmpty = this.state.statistics.length <= 0;

			return View(
				{
					style: {
						flex: 1,
					},
				},
				isEmpty && this.renderEmptyState(),
				!isEmpty && this.renderDaySum(),
				!isEmpty && this.renderTableStatistics(),
			);
		}

		renderEmptyState()
		{
			return View(
				{
					style: {
						flex: 1,
						alignItems: 'center',
						justifyContent: 'center',
						marginBottom: '20%',
					},
				},
				Image(
					{
						svg: {
							content: svg.emptyState,
						},
						style: {
							width: 213,
							height: 117,
						},
					},
				),
				H3({
					text: Loc.getMessage('M_STAFFTRACK_DEPARTMENT_STATISTICS_EMPTY_STATE_TITLE'),
					color: Color.base1,
				}),
				Text3({
					text: Loc.getMessage('M_STAFFTRACK_DEPARTMENT_STATISTICS_EMPTY_STATE_DESCRIPTION'),
					color: Color.base2,
					style: {
						textAlign: 'center',
					},
				}),
			);
		}

		renderDaySum()
		{
			const { users, statistics } = this.state;

			return View(
				{
					style: {
						flexDirection: 'row',
						paddingVertical: Indent.XL4.toNumber(),
					},
				},
				Image(
					{
						svg: {
							content: svg.daySumIcon,
						},
						style: {
							width: 100,
							height: 100,
							marginRight: Indent.XL4.toNumber(),
						},
					},
				),
				View(
					{
						style: {
							flex: 1,
						},
					},
					H3({
						testId: 'stafftrack-today-statistics-count',
						text: Loc.getMessagePlural(
							'M_STAFFTRACK_DEPARTMENT_STATISTICS_N_EMPLOYEES',
							statistics.length,
							{
								'#NUM#': statistics.length,
							},
						),
						color: Color.base0,
					}),
					Text3({
						text: Loc.getMessage('M_STAFFTRACK_DEPARTMENT_STATISTICS_CHECK_INS_ON_WORK'),
						color: Color.base2,
						style: {
							marginTop: Indent.S.toNumber(),
						},
					}),
					Text3({
						testId: 'stafftrack-today-statistics-date',
						text: Loc.getMessage('M_STAFFTRACK_DEPARTMENT_STATISTICS_N_EMPLOYEES_CHECKED_TODAY_DATE', {
							'#DATE#': DateHelper.formatDayMonth(new Date()),
						}),
						color: Color.base2,
						style: {
							marginBottom: Indent.XL3.toNumber(),
						},
					}),
					new ProgressBar({
						percent: statistics.length / users.length * 100,
					}),
				),
			);
		}

		renderTableStatistics()
		{
			return new TableStatisticsView({
				items: this.state.statistics,
				left: {
					title: Loc.getMessage('M_STAFFTRACK_DEPARTMENT_STATISTICS_EMPLOYEES'),
					render: this.renderStatisticsUser,
				},
				right: {
					title: Loc.getMessage('M_STAFFTRACK_DEPARTMENT_STATISTICS_CHECK_IN_TIME'),
					render: this.renderStatisticsValue,
				},
				onItemClick: this.onItemClickHandler,
			});
		}

		onItemClickHandler(item)
		{
			this.openShiftView(item.user, item.shift);
		}

		openShiftView(user, shift)
		{
			new ShiftView({
				user,
				shift,
			}).show(this.props.layoutWidget);

			Haptics.impactLight();
		}

		renderStatisticsUser(item)
		{
			return TableUser(item.user);
		}

		renderStatisticsValue(item)
		{
			return View(
				{
					style: {
						flexDirection: 'row',
					},
				},
				Type.isStringFilled(item.shift.getAddress()) && IconView({
					size: 24,
					icon: Icon.LOCATION,
					color: Color.accentMainPrimary,
				}),
				Text3({
					text: item.time,
					color: Color.accentMainPrimary,
				}),
			);
		}
	}

	const primary = Color.accentMainPrimary.toHex();
	const primaryAlt = Color.accentMainPrimaryalt.toHex();
	const success = Color.accentMainSuccess.toHex();
	const blue = Color.accentSoftBlue1.toHex();
	const baseWhiteFixed = Color.baseWhiteFixed.toHex();

	const svg = {
		daySumIcon: `<svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_442_49218)"><path opacity="0.8" d="M36.5217 18.6169C36.5217 11.8936 42.1508 6.56352 48.8115 6.97987L78.7087 8.84866C84.8104 9.23006 89.5652 14.3267 89.5652 20.4857V98.86C89.5652 104.922 84.9544 109.973 78.9584 110.479L49.0612 113.002C42.312 113.572 36.5217 108.207 36.5217 101.384V18.6169Z" fill="${blue}"/><path opacity="0.24" fill-rule="evenodd" clip-rule="evenodd" d="M78.649 9.81841L48.7518 7.94962C42.6461 7.56797 37.4862 12.4539 37.4862 18.6169V101.384C37.4862 107.638 42.7939 112.556 48.9806 112.034L78.8779 109.51C84.3742 109.047 88.6008 104.417 88.6008 98.86V20.4857C88.6008 14.84 84.2422 10.168 78.649 9.81841ZM48.8115 6.97987C42.1508 6.56352 36.5217 11.8936 36.5217 18.6169V101.384C36.5217 108.207 42.312 113.572 49.0612 113.002L78.9584 110.479C84.9544 109.973 89.5652 104.922 89.5652 98.86V20.4857C89.5652 14.3267 84.8104 9.23006 78.7087 8.84866L48.8115 6.97987Z" fill="${blue}"/><g opacity="0.77" filter="url(#filter0_d_442_49218)"><path d="M14.7826 31.4179C14.7826 25.9221 19.4432 21.5289 25.0432 21.746L41.8234 22.3964C47.1191 22.6016 51.3043 26.8712 51.3043 32.0683V50.9103C51.3043 56.1921 46.9864 60.4988 41.6009 60.5883L24.8206 60.8673C19.3045 60.959 14.7826 56.5992 14.7826 51.1892V31.4179Z" fill="${primary}"/></g><path opacity="0.18" fill-rule="evenodd" clip-rule="evenodd" d="M41.7844 23.3635L25.0042 22.7132C19.9642 22.5178 15.7697 26.4717 15.7697 31.4179V51.1892C15.7697 56.0582 19.8394 59.982 24.8039 59.8995L41.5842 59.6205C46.4311 59.54 50.3173 55.6639 50.3173 50.9103V32.0683C50.3173 27.3909 46.5505 23.5483 41.7844 23.3635ZM25.0432 21.746C19.4432 21.5289 14.7826 25.9221 14.7826 31.4179V51.1892C14.7826 56.5992 19.3045 60.959 24.8206 60.8673L41.6009 60.5883C46.9864 60.4988 51.3043 56.1921 51.3043 50.9103V32.0683C51.3043 26.8712 47.1191 22.6016 41.8234 22.3964L25.0432 21.746Z" fill="${baseWhiteFixed}"/><g opacity="0.9" filter="url(#filter1_d_442_49218)"><path d="M39.9041 36.7531C39.9041 40.6336 37.4849 43.7569 34.4728 43.7323C31.4333 43.7041 28.949 40.4857 28.949 36.5419C28.949 32.5981 31.4642 29.4782 34.4728 29.5663C37.4814 29.6543 39.9041 32.8727 39.9041 36.7531Z" fill="${baseWhiteFixed}"/><path d="M43.4783 53.7926C43.4783 47.8029 39.0064 45.7817 34.4729 45.7571C29.8777 45.7324 25.2174 47.7571 25.2174 53.9123L43.4783 53.7926Z" fill="${baseWhiteFixed}"/></g><g opacity="0.77" filter="url(#filter2_d_442_49218)"><path d="M78.2609 65.332C78.2609 59.8362 82.9214 55.443 88.5214 55.6601L105.302 56.3104C110.597 56.5157 114.783 60.7852 114.783 65.9823V84.8243C114.783 90.1062 110.465 94.4129 105.079 94.5024L88.2989 94.7814C82.7828 94.8731 78.2609 90.5133 78.2609 85.1033V65.332Z" fill="${success}"/></g><g opacity="0.18" filter="url(#filter3_d_442_49218)"><path fill-rule="evenodd" clip-rule="evenodd" d="M105.263 57.2776L88.4824 56.6272C83.4425 56.4319 79.2479 60.3858 79.2479 65.332V85.1033C79.2479 89.9723 83.3177 93.8961 88.2822 93.8136L105.062 93.5346C109.909 93.454 113.796 89.578 113.796 84.8243V65.9823C113.796 61.3049 110.029 57.4623 105.263 57.2776ZM88.5214 55.6601C82.9214 55.443 78.2609 59.8362 78.2609 65.332V85.1033C78.2609 90.5133 82.7828 94.8731 88.2989 94.7814L105.079 94.5024C110.465 94.4129 114.783 90.1062 114.783 84.8243V65.9823C114.783 60.7852 110.597 56.5157 105.302 56.3104L88.5214 55.6601Z" fill="${baseWhiteFixed}"/></g><g opacity="0.9" filter="url(#filter4_d_442_49218)"><path fill-rule="evenodd" clip-rule="evenodd" d="M97.4664 63.4873C92.9414 63.6375 89.2754 67.6376 89.2754 72.4679C89.2754 77.6469 94.3121 84.6185 96.4854 87.378C96.9923 88.0227 97.9358 87.9653 98.4381 87.25C100.583 84.2123 105.507 76.7065 105.507 71.7659C105.507 66.8252 101.945 63.3372 97.4664 63.4829V63.4873ZM97.4664 76.0354C95.3964 76.1325 93.7629 74.4768 93.7629 72.2736C93.7629 70.0704 95.3964 68.2734 97.4664 68.1939C99.5365 68.1145 101.142 69.7702 101.142 71.9601C101.142 74.1501 99.5271 75.9426 97.4664 76.0398V76.0354Z" fill="${baseWhiteFixed}"/></g><g opacity="0.9" filter="url(#filter5_d_442_49218)"><path d="M57.2081 13.0511L71.5951 13.9113C72.8755 13.9989 73.913 14.555 73.913 16.2316C73.913 17.9082 72.879 18.3329 71.5951 18.2572L57.2081 17.5165C55.8687 17.4369 54.7826 16.8489 54.7826 15.1285C54.7826 14.2777 55.8721 12.9595 57.2081 13.0471V13.0511Z" fill="${baseWhiteFixed}"/></g></g><defs><filter id="filter0_d_442_49218" x="0.782593" y="11.7383" width="64.5217" height="67.1309" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/><feOffset dy="4"/><feGaussianBlur stdDeviation="7"/><feComposite in2="hardAlpha" operator="out"/><feColorMatrix type="matrix" values="0 0 0 0 0.114518 0 0 0 0 0.523572 0 0 0 0 1 0 0 0 0.3 0"/><feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_442_49218"/><feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_442_49218" result="shape"/></filter><filter id="filter1_d_442_49218" x="15.2174" y="23.5645" width="38.2609" height="44.3477" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/><feOffset dy="4"/><feGaussianBlur stdDeviation="5"/><feComposite in2="hardAlpha" operator="out"/><feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.05 0"/><feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_442_49218"/><feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_442_49218" result="shape"/></filter><filter id="filter2_d_442_49218" x="64.2609" y="45.6523" width="64.5217" height="67.1309" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/><feOffset dy="4"/><feGaussianBlur stdDeviation="7"/><feComposite in2="hardAlpha" operator="out"/><feColorMatrix type="matrix" values="0 0 0 0 0.345098 0 0 0 0 0.85098 0 0 0 0 0.639216 0 0 0 0.34 0"/><feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_442_49218"/><feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_442_49218" result="shape"/></filter><filter id="filter3_d_442_49218" x="64.2609" y="45.6523" width="64.5217" height="67.1309" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/><feOffset dy="4"/><feGaussianBlur stdDeviation="7"/><feComposite in2="hardAlpha" operator="out"/><feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.02 0"/><feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_442_49218"/><feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_442_49218" result="shape"/></filter><filter id="filter4_d_442_49218" x="77.6087" y="56.4785" width="39.5653" height="47.681" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/><feOffset dy="4.66667"/><feGaussianBlur stdDeviation="5.83333"/><feComposite in2="hardAlpha" operator="out"/><feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.05 0"/><feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_442_49218"/><feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_442_49218" result="shape"/></filter><filter id="filter5_d_442_49218" x="44.7826" y="7.04297" width="39.1305" height="25.2227" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/><feOffset dy="4"/><feGaussianBlur stdDeviation="5"/><feComposite in2="hardAlpha" operator="out"/><feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.05 0"/><feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_442_49218"/><feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_442_49218" result="shape"/></filter><clipPath id="clip0_442_49218"><rect width="120" height="120" fill="${baseWhiteFixed}"/></clipPath></defs></svg>`,
		emptyState: `<svg width="213" height="117" viewBox="0 0 213 117" fill="none" xmlns="http://www.w3.org/2000/svg"><g opacity="0.77" filter="url(#filter0_d_428_51262)"><path d="M14 33.9618C14 26.9641 19.9633 21.4508 26.9396 21.9987L62.2743 24.7738C68.5181 25.2642 73.3348 30.474 73.3348 36.737V71.7427C73.3348 77.8625 68.7295 83.0019 62.6463 83.6708L27.3115 87.556C20.2077 88.3371 14 82.7745 14 75.6279V33.9618Z" fill="${success}"/></g><g opacity="0.18" filter="url(#filter1_d_428_51262)"><path d="M14.5 33.9618C14.5 27.2556 20.2148 21.9721 26.9004 22.4971L62.2352 25.2723C68.2188 25.7422 72.8348 30.7349 72.8348 36.737V71.7427C72.8348 77.6075 68.4214 82.5328 62.5917 83.1738L27.2569 87.059C20.4491 87.8075 14.5 82.4767 14.5 75.6279V33.9618Z" stroke="${baseWhiteFixed}" shape-rendering="crispEdges"/></g><path opacity="0.9" d="M60.5 45.1427C60.5 43.9215 59.7154 42.9607 58.7498 43.0012L48.7436 43.4179C47.8081 43.4585 47.0417 44.4424 47.0417 45.6173C47.0417 46.7922 47.8021 47.7124 48.7436 47.6661L54.7787 47.3883L46.7581 58.408L41.7127 53.6506C40.6626 52.6551 39.1357 52.8692 38.2063 54.1425L31.0185 63.3797C30.3124 64.2825 30.3305 65.6947 31.0547 66.4876C31.7427 67.24 32.8169 67.1532 33.4868 66.2966L40.1798 57.6961L45.213 62.4247C46.2269 63.3739 47.6814 63.1945 48.6048 62.008L57.1626 50.2474V57.8293C57.1626 58.9926 57.9109 59.8955 58.8343 59.8434C59.7577 59.7913 60.5 58.8074 60.5 57.6441V45.1427Z" fill="${baseWhiteFixed}"/><g opacity="0.77" filter="url(#filter2_d_428_51262)"><path d="M62.8679 28.2118C62.8679 21.2141 68.8312 15.7008 75.8075 16.2487L121.169 19.8113C127.413 20.3017 132.23 25.5115 132.23 31.7745V76.3878C132.23 82.5076 127.624 87.647 121.541 88.3159L76.1795 93.3036C69.0756 94.0847 62.8679 88.5222 62.8679 81.3755V28.2118Z" fill="${primaryAlt}"/></g><path opacity="0.18" d="M63.3679 28.2118C63.3679 21.5056 69.0827 16.2221 75.7683 16.7471L121.13 20.3098C127.114 20.7798 131.73 25.7724 131.73 31.7745V76.3878C131.73 82.2526 127.316 87.1779 121.487 87.8189L76.1248 92.8066C69.317 93.5552 63.3679 88.2244 63.3679 81.3755V28.2118Z" stroke="${baseWhiteFixed}"/><path opacity="0.9" fill-rule="evenodd" clip-rule="evenodd" d="M100.153 35.4414C93.4522 35.4513 88 41.5593 88 49.1475C88 57.2833 95.4854 68.4188 98.6955 72.8247C99.4497 73.8558 100.846 73.7917 101.585 72.6915C104.749 68.0142 112 56.4692 112 48.7626C112 41.0561 106.757 35.4266 100.153 35.4414ZM100.153 55.0976C97.0904 55.1667 94.665 52.5024 94.665 49.0439C94.665 45.5853 97.0854 42.8421 100.153 42.8125C103.195 42.7829 105.575 45.4471 105.575 48.8663C105.575 52.2854 103.195 55.0285 100.153 55.0976Z" fill="${baseWhiteFixed}"/><g opacity="0.8" filter="url(#filter3_d_428_51262)"><path d="M120.427 22.9794C120.427 15.9816 126.391 10.4683 133.367 11.0163L187.855 15.2957C194.099 15.7861 198.916 20.9958 198.916 27.2589V80.617C198.916 86.7368 194.311 91.8762 188.227 92.5451L133.739 98.5363C126.635 99.3174 120.427 93.7549 120.427 86.6082V22.9794Z" fill="${blue}"/></g><path opacity="0.64" d="M120.927 22.9794C120.927 16.2732 126.642 10.9896 133.328 11.5147L187.816 15.7942C193.8 16.2641 198.416 21.2568 198.416 27.2589V80.617C198.416 86.4818 194.002 91.4071 188.173 92.0481L133.684 98.0393C126.877 98.7879 120.927 93.4571 120.927 86.6082V22.9794Z" stroke="${blue}"/><g filter="url(#filter4_d_428_51262)"><path d="M156.392 33.0868C148.02 39.2013 150.946 55.7028 162.837 55.3445C173.483 55.0237 176.382 32.9743 162.643 31.008C160.229 30.8146 157.782 32.0715 156.392 33.0868Z" fill="${baseWhiteFixed}"/><path d="M181.036 74.8479C181.045 75.1366 180.812 75.3848 180.523 75.3935L142.521 76.7853C142.694 64.239 152.673 60.0046 161.659 59.7338C170.645 59.463 180.663 62.3181 181.036 74.8479Z" fill="${baseWhiteFixed}"/><path d="M180.523 75.3935L142.521 76.7853C142.517 77.0744 142.753 77.3084 143.042 77.2997L180.523 75.3935Z" fill="${baseWhiteFixed}"/></g><defs><filter id="filter0_d_428_51262" x="0" y="11.9609" width="87.3347" height="93.668" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/><feOffset dy="4"/><feGaussianBlur stdDeviation="7"/><feComposite in2="hardAlpha" operator="out"/><feColorMatrix type="matrix" values="0 0 0 0 0.345098 0 0 0 0 0.85098 0 0 0 0 0.639216 0 0 0 0.34 0"/><feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_428_51262"/><feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_428_51262" result="shape"/></filter><filter id="filter1_d_428_51262" x="0" y="11.9609" width="87.3347" height="93.668" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/><feOffset dy="4"/><feGaussianBlur stdDeviation="7"/><feComposite in2="hardAlpha" operator="out"/><feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.02 0"/><feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_428_51262"/><feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_428_51262" result="shape"/></filter><filter id="filter2_d_428_51262" x="48.8679" y="6.21094" width="97.3618" height="105.166" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/><feOffset dy="4"/><feGaussianBlur stdDeviation="7"/><feComposite in2="hardAlpha" operator="out"/><feColorMatrix type="matrix" values="0 0 0 0 0.114518 0 0 0 0 0.523572 0 0 0 0 1 0 0 0 0.3 0"/><feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_428_51262"/><feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_428_51262" result="shape"/></filter><filter id="filter3_d_428_51262" x="106.427" y="0.978516" width="106.488" height="115.631" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/><feOffset dy="4"/><feGaussianBlur stdDeviation="7"/><feComposite in2="hardAlpha" operator="out"/><feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.04 0"/><feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_428_51262"/><feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_428_51262" result="shape"/></filter><filter id="filter4_d_428_51262" x="132.521" y="24.9883" width="58.516" height="66.3125" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/><feOffset dy="4"/><feGaussianBlur stdDeviation="5"/><feComposite in2="hardAlpha" operator="out"/><feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.05 0"/><feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_428_51262"/><feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_428_51262" result="shape"/></filter></defs></svg>`,
	};

	module.exports = { TodayStatistics };
});
