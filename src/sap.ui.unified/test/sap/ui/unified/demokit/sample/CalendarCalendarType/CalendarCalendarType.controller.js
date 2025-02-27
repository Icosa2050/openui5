sap.ui.define([
		'sap/base/i18n/date/CalendarType',
		'sap/ui/core/mvc/Controller',
		'sap/ui/core/format/DateFormat',
		'sap/ui/core/date/UI5Date',
		// load all required calendars in advance
		'sap/ui/core/date/Islamic'
	], function(CalendarType, Controller, DateFormat, UI5Date) {
	"use strict";

	return Controller.extend("sap.ui.unified.sample.CalendarCalendarType.CalendarCalendarType", {
		oFormatYyyymmdd: null,

		onInit: function() {
			this.oFormatYyyymmdd = DateFormat.getInstance({pattern: "yyyy-MM-dd", calendarType: CalendarType.Gregorian});
		},

		handleCalendarSelect: function(oEvent) {
			var oCalendar = oEvent.getSource();
			this._updateText(oCalendar);
		},

		_updateText: function(oCalendar) {
			var oText = this.byId("selectedDate"),
				aSelectedDates = oCalendar.getSelectedDates(),
				oDate = aSelectedDates[0].getStartDate();

			oText.setText(this.oFormatYyyymmdd.format(oDate));
		},

		handleFocusToday: function() {
			var oCalendar = this.byId("calendar");
			oCalendar.focusDate(UI5Date.getInstance());
		}
	});

});
