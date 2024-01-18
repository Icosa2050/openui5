/*global QUnit, sinon */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/m/DateTimePicker",
	"sap/m/Label",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/type/DateTime",
	"sap/ui/model/odata/type/DateTime",
	"sap/ui/Device",
	"sap/m/TimePickerSliders",
	"sap/ui/core/Popup",
	"sap/ui/core/format/DateFormat",
	"sap/ui/thirdparty/jquery",
	"sap/ui/events/KeyCodes",
	"sap/ui/unified/DateRange"
], function(
	qutils,
	createAndAppendDiv,
	DateTimePicker,
	Label,
	JSONModel,
	DateTime,
	ODataDateTime,
	Device,
	TimePickerSliders,
	Popup,
	DateFormat,
	jQuery,
	KeyCodes,
	DateRange
) {
	"use strict";

	createAndAppendDiv("uiArea1");
	createAndAppendDiv("uiArea2");
	createAndAppendDiv("uiArea3");
	createAndAppendDiv("uiArea4");
	createAndAppendDiv("uiArea5").style.width = "200px";
	createAndAppendDiv("uiArea6");
	createAndAppendDiv("uiArea7");
	createAndAppendDiv("uiArea8");


	var sValue = "";
	var bValid = false;
	var sId = "";

	function handleChange(oEvent){
			var oDTP = oEvent.oSource;
			sValue = oEvent.getParameter("newValue");
			bValid = oEvent.getParameter("valid");
			sId = oDTP.getId();
		}

	var oDTP1 = new DateTimePicker("DTP1", {
		change: handleChange
		}).placeAt("uiArea1");

	var oDTP2 = new DateTimePicker("DTP2", {
		width: "250px",
		value: "2016-02-17,10-11-12",
		valueFormat: "yyyy-MM-dd,HH-mm-ss",
		displayFormat: "dd+MM+yyyy:HH+mm",
		change: handleChange
		}).placeAt("uiArea2");

	var oDTP3 = new DateTimePicker("DTP3", {
		dateValue: new Date("2016", "01", "17", "10", "11", "12"),
		displayFormat: "short",
		change: handleChange
		}).placeAt("uiArea3");

	var oModel = new JSONModel();
	oModel.setData({
		dateValue: new Date("2016", "01", "17", "10", "11", "12")
	});
	sap.ui.getCore().setModel(oModel);

	sap.ui.getCore().attachParseError(
			function(oEvent) {
				sId = oEvent.getParameter("element").getId();
				sValue = oEvent.getParameter('newValue');
				bValid = false;
			});

	sap.ui.getCore().attachValidationSuccess(
			function(oEvent) {
				sId = oEvent.getParameter("element").getId();
				sValue = oEvent.getParameter('newValue');
				bValid = true;
			});

	var oDTP4 = new DateTimePicker("DTP4", {
		width: "250px",
		value: {
			path: "/dateValue",
			type: new DateTime({style: "medium", strictParsing: true})}
		}).placeAt("uiArea4");

	//BCP: 	1970509170
	var oDTP6 = new DateTimePicker("oDTP6", {
		dateValue: new Date("2019", "9", "25", "11", "12", "13")
	}).placeAt("uiArea6");


	QUnit.module("initialization");

	QUnit.test("Date formatter", function(assert) {
		assert.ok(!oDTP1.getValue(), "DTP1: no value");
		assert.ok(!oDTP1.getDateValue(), "DTP1: no DateValue");
		assert.equal(oDTP2.getValue(), "2016-02-17,10-11-12", "DTP2: Value in internal format set");
		assert.equal(oDTP2.getDateValue().getTime(), new Date("2016", "01", "17", "10", "11", "12").getTime(), "DTP2: DateValue set");
		assert.equal(oDTP3.getValue(), "Feb 17, 2016, 10:11:12 AM", "DTP3: Value in internal format set");
		assert.equal(oDTP3.getDateValue().getTime(), new Date("2016", "01", "17", "10", "11", "12").getTime(), "DTP3: DateValue set");
		assert.equal(oDTP4.getValue(), "Feb 17, 2016, 10:11:12 AM", "DTP4: Value in internal format set");
		assert.equal(oDTP4.getDateValue().getTime(), new Date("2016", "01", "17", "10", "11", "12").getTime(), "DTP4: DateValue set");
		assert.equal(oDTP6.getValue(), "Oct 25, 2019, 11:12:13 AM", "oDTP6: Default Value Format Set");
	});


	QUnit.test("Calendar instance is created poroperly", function(assert) {
		//Prepare
		var oDTP = new DateTimePicker().placeAt("uiArea1"),
			oCalendar;

		//Act
		oDTP._createPopup();
		oDTP._createPopupContent();
		oCalendar = oDTP._getCalendar();

		//Assert
		assert.ok(oDTP._getCalendar()._bPoupupMode, "Popup mode is set");
		assert.ok(oCalendar.hasListeners("cancel"), "Cancel event listener is added");

		//Clean
		oDTP.destroy();
	});

	QUnit.test("Popover instance is properly configured on desktop", function(assert) {
		// Prepare
		var oDTP = new DateTimePicker().placeAt("qunit-fixture"),
			oSetDurationsSpy = this.spy(Popup.prototype, "setDurations");

		// Act
		oDTP._createPopup();

		// Assert
		assert.ok(oSetDurationsSpy.calledOnce, "Popup opening and closing animation durations are set.");
	});

	QUnit.module("API");

	QUnit.test("setMinDate/setMaxDate preserve the time part for internal oMinDate/oMaxDate properties", function (assert) {
		//Prepare
		var oDateTime1 = new Date(2017, 0, 1, 13, 12, 3),
			oDateTime2 = new Date(2017, 0, 10, 13, 3, 12),
			oSut;

		//Act
		oSut = new DateTimePicker({
			minDate: oDateTime1,
			maxDate: oDateTime2
		});

		//Assert
		assert.equal(oSut._oMinDate.toString(), oDateTime1.toString(), "Time part of _oMinDate should be as given by the app");
		assert.equal(oSut._oMaxDate.toString(), oDateTime2.toString(), "Time part of _oMaxDate should be as given by the app");

		//Cleanup - redundant
	});

	QUnit.test("maxDate being yesterday should not throw error on open", function (assert) {
		// Arrange
		var oYesterdayDate = new Date(),
			oDP = new DateTimePicker("DatePicker").placeAt("qunit-fixture");

		oYesterdayDate.setDate(oYesterdayDate.getDate() - 1);

		// Act
		oDP.setMaxDate(oYesterdayDate);
		sap.ui.getCore().applyChanges();
		qutils.triggerEvent("click", "DatePicker-icon");

		// Assert
		assert.ok(true, "No error is thrown when DateTimePicker opens and maxDate is yesterday");

		// Clean
		oDP.destroy();
	});

	QUnit.test("Overwriting the user input with model updates will be prevented", function (assert) {
		// Prepare
		var oDTP = new DateTimePicker(),
			oHandleInputValueConcurrencySpy = this.spy(oDTP, "handleInputValueConcurrency");

		oDTP._setPreferUserInteraction(true);
		oDTP.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// Act
		oDTP.setValue("test value");

		// Assert
		assert.ok(oHandleInputValueConcurrencySpy.calledOnce, "Model update is prevented");

		// Clean
		oDTP.destroy();
	});

	QUnit.module("Rendering");

	QUnit.test("date format", function(assert) {
		assert.ok(!jQuery("#DTP1").find("input").val(), "DTP1: empty date");
		assert.equal(jQuery("#DTP2").find("input").val(), "17+02+2016:10+11", "DTP2: defined output format used");
		assert.equal(jQuery("#DTP3").find("input").val(), "2/17/16, 10:11 AM", "DTP3: defined output format used");
		assert.equal(jQuery("#DTP4").find("input").val(), "Feb 17, 2016, 10:11:12 AM", "DTP4: defined output format from binding used");
	});

	QUnit.test("placeholder", function(assert) {
		var oCore = sap.ui.getCore();
		var sPlaceholderPrefix = oCore.getLibraryResourceBundle("sap.ui.core").getText("date.placeholder").split("{")[0];
		if (Device.support.input.placeholder) {
			assert.ok(jQuery("#DTP1").find("input").attr("placeholder").includes(sPlaceholderPrefix), "DTP1: placeholder");
			assert.ok(jQuery("#DTP2").find("input").attr("placeholder").includes(sPlaceholderPrefix), "DTP2: placeholder");
			assert.ok(jQuery("#DTP3").find("input").attr("placeholder").includes(sPlaceholderPrefix), "DTP3: placeholder");
			assert.ok(jQuery("#DTP4").find("input").attr("placeholder").includes(sPlaceholderPrefix), "DTP4: placeholder from binding used");
		} else {
			assert.ok(!jQuery("#DTP1").find("input").attr("placeholder"), "No placeholder attribute");
		}
	});

	QUnit.test("Time sliders are updated right after popup is open", function(assert) {
		var done = assert.async();
		//Prepare
		var oDTP = new DateTimePicker().placeAt("uiArea1"),
			oTPS,
			oSpyUpdateSlidersFn;
		sap.ui.getCore().applyChanges();

		oDTP._createPopup();
		oDTP._createPopupContent();
		oTPS = oDTP._oPopup.getContent()[1].getTimeSliders();
		oSpyUpdateSlidersFn = sinon.spy(oTPS, "_updateSlidersValues");

		//Act
		oDTP._openPopup();
		setTimeout(function() {
			//Assert
			assert.equal(oSpyUpdateSlidersFn.callCount, 1, "Once picker is opened, function updateSlidersValues should be called");
			assert.ok(!oTPS._getFirstSlider().getIsExpanded(), "Once picker is opened, the first slider is expanded");

			//Cleanup
			oSpyUpdateSlidersFn.restore();
			oDTP.destroy();
			done();
		}, 400);
	});

	QUnit.test("_fillDateRange works with min date when the current date is out of range", function(assert) {
		var oDateTimePicker = new DateTimePicker("DTPMinMax").placeAt("uiArea1"),
			oNewMinDate = new Date(2014, 0, 1),
			oNewMaxDate = new Date(2014, 11, 31),
			oNewMinDateUTC = new Date(Date.UTC(oNewMinDate.getFullYear(), oNewMinDate.getMonth(), oNewMinDate.getDate())),
			oFocusedDate;

		//arrange
		oDateTimePicker.setMinDate(oNewMinDate);
		oDateTimePicker.setMaxDate(oNewMaxDate);
		sap.ui.getCore().applyChanges();



		//act
		oDateTimePicker.focus();
		qutils.triggerEvent("click", "DTPMinMax-icon");

		oFocusedDate = oDateTimePicker._oCalendar._getFocusedDate().toUTCJSDate();

		//assert
		assert.equal(oFocusedDate.toString(), oNewMinDateUTC.toString(), "oDateTimePicker: focused date equals min date when current date is out of the min/max range");

		//clean
		oDateTimePicker.destroy();
	});

	QUnit.test("Swticher is rendered and visible on small screen size", function(assert) {
		// Arrange
		var done = assert.async(),
			oDTP7 = new DateTimePicker("DTP7", {}),
			oAfterRenderingDelegate,
			oCalendar;

		oDTP7.placeAt("uiArea8");
		sap.ui.getCore().applyChanges();
		oDTP7.focus();

		qutils.triggerEvent("click", "DTP7-icon");
		sap.ui.getCore().applyChanges();
		oCalendar = oDTP7._getCalendar();
		oAfterRenderingDelegate = {
			onAfterRendering: function() {
				assert.ok(jQuery("#DTP7-PC-Switch")[0], "Swicher rendered");
				assert.ok(jQuery("#DTP7-PC-Switch").is(":visible"), "Swicher is visible");
				oCalendar.removeDelegate(oCalendar);
				oDTP7.destroy();
				done();
			}
		};

		// Assert
		oCalendar.addDelegate(oAfterRenderingDelegate);

		// Act
		oDTP7._handleWindowResize({name: "Phone"});
	});

	QUnit.test("Swticher is rendered and hidden on large screen size", function(assert) {
		// Arrange
		var done = assert.async(),
			oDTP8 = new DateTimePicker("DTP8", {}),
			oAfterRenderingDelegate,
			oCalendar;

		oDTP8.placeAt("uiArea8");
		sap.ui.getCore().applyChanges();
		oDTP8.focus();

		qutils.triggerEvent("click", "DTP8-icon");
		sap.ui.getCore().applyChanges();
		oCalendar = oDTP8._getCalendar();
		oAfterRenderingDelegate = {
			onAfterRendering: function() {
				assert.ok(jQuery("#sap-ui-invisible-DTP8-PC-Switch")[0], "Swicher rendered");
				assert.ok(jQuery("#sap-ui-invisible-DTP8-PC-Switch").is(":hidden"), "Swicher is hidden");
				oCalendar.removeDelegate(oCalendar);
				oDTP8.destroy();
				done();
			}
		};

		// Assert
		oCalendar.addDelegate(oAfterRenderingDelegate);

		// Act
		oDTP8._handleWindowResize({name: "Tablet"});
	});

	QUnit.test("Year picker rendered with year 1", function(assert) {
		//Prepare
		var oCalendar,
			clock = sinon.useFakeTimers(new Date("0001-01-01")),
			oDTPy = new DateTimePicker({
				maxDate: new Date()
			}).placeAt("qunit-fixture");

		sap.ui.getCore().applyChanges();

		// act
		oDTPy.toggleOpen();
		sap.ui.getCore().applyChanges();
		clock.tick(100);
		oCalendar = oDTPy._getCalendar();
		oCalendar._showYearPicker();
		sap.ui.getCore().applyChanges();
		clock.tick(100);

		// assert
		assert.ok(true, "There is no thrown error and year picker is opened");
		assert.deepEqual(oCalendar.getAggregation("header").getTextButton2(), "0001 - 0020", "text is correct");

		// cleanup
		oDTPy.destroy();
		clock.restore();
	});

	QUnit.module("initialFocusedDate property", {
		beforeEach: function () {
			this.oDTp = new DateTimePicker();
			this.oDTp.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},

		afterEach: function () {
			this.oDTp.destroy();
			this.oDTp = null;
		}
	});

	QUnit.test("_fillDateRange should call Calendar's focusDate method and sliders _setTimeValues with initialFocusedDateValue if no value is set", function (assert) {
		// prepare
		var oExpectedDateValue = new Date(2017, 4, 5, 6, 7, 8);
		this.oDTp._oCalendar = { focusDate: this.spy(), destroy: function () {} };
		this.oDTp._oOKButton = { setEnabled: function() {} };
		this.oDTp._oDateRange = { getStartDate: function () {}, setStartDate: function () {} };
		this.oDTp._oSliders = new TimePickerSliders(this.oDTp.getId() + "-Sliders", {
			displayFormat: "hh:mm:ss"
		});
		var oSetTimeValuesSpy = this.spy(this.oDTp._oSliders, "_setTimeValues");

		// act
		this.oDTp.setInitialFocusedDateValue(oExpectedDateValue);
		this.oDTp._fillDateRange();

		// assert
		assert.ok(this.oDTp._oCalendar.focusDate.calledWith(oExpectedDateValue), "focusDate should be called with initialFocusedDateValue");
		assert.equal(this.oDTp._oCalendar.focusDate.getCall(0).args[0].toString(), oExpectedDateValue.toString(), "focusDate should be called with " + oExpectedDateValue);
		assert.ok(oSetTimeValuesSpy.calledWith(oExpectedDateValue), "_setTimeValues should be called with initialFocusedDateValue");

		// cleanup
		oSetTimeValuesSpy.restore();
	});

	QUnit.test("_fillDateRange should call Calendar's focusDate method and sliders _setTimeValues with currentDate if initialFocusedDateValue and value are not set", function (assert) {
		// prepare
		var oExpectedDateValue = new Date(2017, 4, 5, 6, 7, 8);
		this.oDTp._oCalendar = { focusDate: this.spy(), destroy: function () {}, removeAllSelectedDates: function() {} };
		this.oDTp._oOKButton = { setEnabled: function() {} };
		this.oDTp._oDateRange = { getStartDate: function () {}, setStartDate: function () {} };
		this.oDTp._oSliders = new TimePickerSliders(this.oDTp.getId() + "-Sliders", {
			displayFormat: "hh:mm:ss"
		});
		var oSetTimeValuesSpy = this.spy(this.oDTp._oSliders, "_setTimeValues");

		// act
		this.oDTp._fillDateRange();

		// assert
		assert.equal(this.oDTp._oCalendar.focusDate.calledWith(oExpectedDateValue), false, "focusDate should not be called with initialFocusedDateValue");
		assert.notEqual(this.oDTp._oCalendar.focusDate.getCall(0).args[0].toString(), oExpectedDateValue.toString(), "focusDate should be called with " + oExpectedDateValue);
		assert.equal(oSetTimeValuesSpy.calledWith(oExpectedDateValue), false, "_setTimeValues should not be called with initialFocusedDateValue");

		// cleanup
		oSetTimeValuesSpy.restore();
	});

	QUnit.test("_fillDateRange should call Calendar's focusDate method and sliders _setTimeValues with valueDate", function (assert) {
		// prepare
		var oExpectedDateValue = new Date(2017, 4, 5, 6, 7, 8),
			oGetDateValue = this.stub(this.oDTp, "getDateValue").callsFake(function () { return oExpectedDateValue; });
		this.oDTp._oCalendar = { focusDate: this.spy(), destroy: function () {} };
		this.oDTp._oOKButton = { setEnabled: function() {} };
		this.oDTp._oDateRange = { getStartDate: function () {}, setStartDate: function () {} };
		this.oDTp._oSliders = new TimePickerSliders(this.oDTp.getId() + "-Sliders", {
			displayFormat: "hh:mm:ss"
		});
		var oSetTimeValuesSpy = this.spy(this.oDTp._oSliders, "_setTimeValues");

		// act
		this.oDTp._fillDateRange();

		// assert
		assert.ok(this.oDTp._oCalendar.focusDate.calledWith(oExpectedDateValue), "focusDate should be called with valueDate");
		assert.equal(this.oDTp._oCalendar.focusDate.getCall(0).args[0].toString(), oExpectedDateValue.toString(), "focusDate should be called with " + oExpectedDateValue);
		assert.ok(oSetTimeValuesSpy.calledWith(oExpectedDateValue), "_setTimeValues should be called with valueDate");

		// cleanup
		oGetDateValue.restore();
		oSetTimeValuesSpy.restore();
	});

	QUnit.module("interaction");

	QUnit.test("change date by typing", function(assert) {
		sValue = "";
		bValid = true;
		sId = "";
		oDTP2.focus();
		jQuery("#DTP2").find("input").val("37+02+2016:10+11");
		qutils.triggerKeyboardEvent("DTP2-inner", KeyCodes.ENTER, false, false, false);
		jQuery("#DTP2").find("input").trigger("change"); // trigger change event, because browser do not if value is changed using jQuery
		assert.equal(sId, "DTP2", "Change event fired");
		assert.equal(sValue, "37+02+2016:10+11", "Value of event has entered value if invalid");
		assert.ok(!bValid, "Value is not valid");
		assert.equal(oDTP2.getValue(), "37+02+2016:10+11", "Value has entered value if invalid");
		assert.equal(oDTP2.getDateValue().getTime(), new Date("2016", "01", "17", "10", "11", "12").getTime(), "DateValue not changed set");

		sValue = "";
		bValid = true;
		sId = "";
		oDTP2.focus();
		jQuery("#DTP2").find("input").val("18+02+2016:10+30");
		qutils.triggerKeyboardEvent("DTP2-inner", KeyCodes.ENTER, false, false, false);
		jQuery("#DTP2").find("input").trigger("change"); // trigger change event, because browser do not if value is changed using jQuery
		assert.equal(sId, "DTP2", "Change event fired");
		assert.equal(sValue, "2016-02-18,10-30-00", "Value of event has entered value if valid");
		assert.ok(bValid, "Value is valid");
		assert.equal(oDTP2.getValue(), "2016-02-18,10-30-00", "Value has entered value if valid");
		assert.equal(oDTP2.getDateValue().getTime(), new Date("2016", "01", "18", "10", "30", "00").getTime(), "DateValue not changed set");

	});

	QUnit.test("change date using calendar - open", function(assert) {
		var done = assert.async(),
			oSliders,
			aMonths,
			aDays,
			oDay,
			aHours,
			iIndex,
			i;

		sValue = "";
		sId = "";

		oDTP3._createPopup();
		oDTP3._oPopup.attachEvent("afterOpen", function() {
			sap.ui.getCore().applyChanges();
			assert.ok(jQuery("#DTP3-cal")[0], "calendar rendered");
			assert.ok(jQuery("#DTP3-cal").is(":visible"), "calendar is visible");

			oSliders = sap.ui.getCore().byId("DTP3-Sliders");
			assert.equal(oSliders.getAggregation("_columns").length, 3 , "DTP3: number of rendered sliders");

			aMonths = jQuery("#DTP3-cal-content").children(".sapUiCalMonthView");
			aDays = jQuery(aMonths[0]).find(".sapUiCalItem");

			for (i = 0; i < aDays.length; i++) {
				oDay = aDays[i];
				if (jQuery(oDay).attr("data-sap-day") == "20160210") {
					oDay.focus();
					break;
				}
			}

			// use ENTER to not run into itemNavigation
			qutils.triggerKeyboardEvent(oDay, KeyCodes.ENTER, false, false, false);

			aHours = jQuery("#DTP3-Sliders-listHours-content").find(".sapMTimePickerItem");
			for ( iIndex = 0; iIndex < aHours.length; iIndex++) {
				if (jQuery(aHours[iIndex]).hasClass("sapMTimePickerItemSelected")) {
					break;
				}
			}

			oDTP3._oSliders.getAggregation("_columns")[0].focus();
			qutils.triggerKeyboardEvent(oDTP3._oSliders.getAggregation("_columns")[0].getDomRef(), KeyCodes.ARROW_DOWN, false, false, false);

			done();
		});

		oDTP3.focus();
		qutils.triggerEvent("click", "DTP3-icon");
		sap.ui.getCore().applyChanges();
	});

	QUnit.test("change date using calendar - choose", function(assert) {
		var done = assert.async();

		oDTP3._oPopup.attachEvent("afterClose", function() {
			assert.ok(!jQuery("#DTP3-cal").is(":visible"), "calendar is invisible");
			assert.ok(!jQuery("#DTP3-Sliders").is(":visible"), "Silder is invisible");
			assert.equal(sId, "DTP3", "Change event fired");
			assert.equal(sValue, "Feb 10, 2016, 11:11:00 AM", "Value in internal format priovided");
			assert.equal(oDTP3.getValue(), "Feb 10, 2016, 11:11:00 AM", "Value in internal format set");
			assert.equal(oDTP3.getDateValue().getTime(), new Date("2016", "01", "10", "11", "11").getTime(), "DateValue set");
			done();
		});

		jQuery("#DTP3-OK").trigger("focus");
		qutils.triggerKeydown("DTP3-OK", KeyCodes.ENTER, false, false, false);
		qutils.triggerKeyup("DTP3-OK", KeyCodes.ENTER, false, false, false);
	});

	QUnit.module("Accessibility");

	QUnit.test("aria-expanded correctly set", function(assert) {
		var oDTP = new DateTimePicker("DP", {}).placeAt("uiArea8");
		sap.ui.getCore().applyChanges();

		//before opening the popup
		assert.notOk(oDTP.$("inner").attr("aria-expanded"), "DP input doesn't have 'aria-expanded' attrubute set.");
	});

	QUnit.test("aria-haspopup set correctly", function(assert) {
		var oDTP = new DateTimePicker();

		oDTP.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		assert.equal(oDTP.$("inner").attr("aria-haspopup"), "dialog", "DateTimePicker's Input indicates that it opens a dialog");

		oDTP.destroy();
	});

	QUnit.test("getAccessibilityInfo", function(assert) {
		var oInput = new DateTimePicker({
			value: "Value",
			tooltip: "Tooltip",
			placeholder: "Placeholder"
		});
		assert.ok(!!oInput.getAccessibilityInfo, "DateTimePicker has a getAccessibilityInfo function");
		var oInfo = oInput.getAccessibilityInfo();
		assert.ok(!!oInfo, "getAccessibilityInfo returns a info object");
		assert.strictEqual(oInfo.role, oInput.getRenderer().getAriaRole(), "AriaRole");
		assert.strictEqual(oInfo.type, sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("ACC_CTR_TYPE_DATETIMEINPUT"), "Type");
		assert.strictEqual(oInfo.description, "Value  Date and Time", "Description");
		assert.strictEqual(oInfo.focusable, true, "Focusable");
		assert.strictEqual(oInfo.enabled, true, "Enabled");
		assert.strictEqual(oInfo.editable, true, "Editable");
		oInput.setValue("");
		oInput.setEnabled(false);
		oInfo = oInput.getAccessibilityInfo();
		assert.strictEqual(oInfo.description, "Date and Time", "Description");
		assert.strictEqual(oInfo.focusable, false, "Focusable");
		assert.strictEqual(oInfo.enabled, false, "Enabled");
		assert.strictEqual(oInfo.editable, false, "Editable");
		oInput.setEnabled(true);
		oInput.setEditable(false);
		oInfo = oInput.getAccessibilityInfo();
		assert.strictEqual(oInfo.focusable, true, "Focusable");
		assert.strictEqual(oInfo.enabled, true, "Enabled");
		assert.strictEqual(oInfo.editable, false, "Editable");
		oInput.setValueFormat("yyyy.MM.dd.HH.mm.ss");
		oInput.setDisplayFormat("yyyy-MM-dd-HH-mm-ss");
		oInput.setValue("2014.03.26.10.32.30");
		oInfo = oInput.getAccessibilityInfo();
		assert.strictEqual(oInfo.description, "2014-03-26-10-32-30  Date and Time", "Description");
		oInput.destroy();
	});

	QUnit.test("When tab is pressed on year button the focus should go to first slider", function(assert) {
		//Prepare
		var done = assert.async();

		var oDTP = new DateTimePicker().placeAt("uiArea1");
		sap.ui.getCore().applyChanges();

		oDTP._createPopup();
		oDTP._createPopupContent();
		sap.ui.getCore().applyChanges();
		oDTP._openPopup();

		setTimeout(function() {
			var oYearButton = oDTP._oPopup.getContent()[1].getCalendar().getAggregation("header").getDomRef("B2"),
				oHoursSlider = oDTP._oPopup.getContent()[1].getTimeSliders().getAggregation("_columns")[0];
			oYearButton.focus();
			sap.ui.getCore().applyChanges();
			qutils.triggerKeydown(oYearButton, KeyCodes.TAB);
			sap.ui.getCore().applyChanges();
			// Assert
			assert.strictEqual(oHoursSlider.getDomRef(), document.activeElement, "The slider's value is focused after a tap");

			oDTP.destroy();
			done();
		}, 400);
	});

	QUnit.module("Calendar and TimePicker");

	QUnit.test("When the popover is initially opened and there is a tap on the hours slider it should gain focus", function(assert) {
		//Prepare
		var oDTP = new DateTimePicker().placeAt("uiArea7");

		//Act
		oDTP._createPopup();
		oDTP._createPopupContent();
		var oRenderSpy = this.spy(oDTP._oPopup.getContent()[1].getTimeSliders().getAggregation("_columns")[0], "focus");
		sap.ui.getCore().applyChanges();
		oDTP._openPopup();
		oDTP._oPopup.getContent()[1].getTimeSliders().getAggregation("_columns")[0].fireTap({ setMarked:  jQuery.noop });

		// Assert
		assert.strictEqual(oRenderSpy.callCount, 1, "The slider's value is focused after a tap");

		oRenderSpy.restore();
		oDTP.destroy();
	});

	QUnit.test("Open picker on small screen", function(assert) {
		//Prepare
		jQuery("html").removeClass("sapUiMedia-Std-Desktop");
		jQuery("html").addClass("sapUiMedia-Std-Phone");

		var oDTP5 = new DateTimePicker("DTP5", {
						dateValue: new Date()
					}).placeAt("uiArea5");
		sap.ui.getCore().applyChanges();

		var done = assert.async();

		oDTP5.focus();
		qutils.triggerEvent("click", "DTP5-icon");
		sap.ui.getCore().applyChanges();
		setTimeout(function(){
			assert.ok(jQuery("#DTP5-RP-popover")[0], "popover is rendered");
			assert.ok(jQuery("#DTP5-RP-popover").is(":visible"), "popover is visible");
			oDTP5.destroy();
			jQuery("html").addClass("sapUiMedia-Std-Desktop");
			jQuery("html").removeClass("sapUiMedia-Std-Phone");
			done();
		}, 400);
	});

	QUnit.test("data binding with sap.ui.model.odata.type.DateTime", function(assert) {
		var oDate = new Date(2019, 5, 6, 3, 40, 46),
			oModel = new JSONModel({
				myDate: undefined
			}),
			oDateTimeType = new ODataDateTime({
				UTC: true
			}, {
				//Constraints
			}),
			oDateTimePicker = new DateTimePicker({
				value: {
					path: "/myDate",
					type: oDateTimeType
				}
			}).setModel(oModel);

		assert.equal(oDateTimePicker._parseValue("Jun 6, 2019, 3:40:46 AM").getTime(), oDate.getTime(), "Value successfully parsed");
		assert.equal(oDateTimePicker._formatValue(oDate), "Jun 6, 2019, 3:40:46 AM", "Date successfully formatted");

	});

	QUnit.test("data binding with sap.ui.model.odata.type.DateTime when UTC is set in FormatOptions source", function(assert) {
		var dateValue,
			actualValue,
			oDate = "2018-08-15T13:07:47.000Z",
			oFormatter = DateFormat.getDateTimeInstance({
				pattern: "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'",
				UTC: true //setting it to true should give me the original date ("2018-08-15T13:07:47.000Z") in UTC again
			}),
			oModel = new JSONModel({
				myDate: oDate
			}),
			oDateTimePicker = new DateTimePicker({
				value: {
					path: "/myDate",
					type:'sap.ui.model.type.DateTime',
					formatOptions:{
						source: {pattern:'yyyy-MM-dd\'T\'HH:mm:ss.SSS\'Z\'', UTC:true},
						style:'medium',
						strictParsing:true
					}
				}
			}).setModel(oModel);

		dateValue = oDateTimePicker.getDateValue();
		actualValue = oFormatter.format(dateValue);
		assert.equal(oDate, actualValue, "Date is formatted and parsed correctly");
	});

	QUnit.test("_createPopup: mobile device", function(assert) {
		// prepare
		var oDateTimePicker = new DateTimePicker(),
			oDeviceStub = this.stub(Device, "system").value({
				desktop: false,
				tablet: false,
				phone: true
			}),
			oLabel = new Label({text: "DatePicker Label", labelFor: oDateTimePicker.getId()}),
			oDialog;

		oDateTimePicker.placeAt("qunit-fixture");
		oLabel.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// act
		oDateTimePicker._createPopup();
		oDialog = oDateTimePicker.getAggregation("_popup");

		// assert
		assert.ok(oDialog.getShowHeader(), "Header is shown");
		assert.ok(oDialog.getShowCloseButton(), "Close button in the header is set");
		assert.strictEqual(oDialog.getTitle(), "DatePicker Label", "Title is set");
		assert.strictEqual(oDialog.getBeginButton().getType(), "Emphasized", "OK button type is set");
		assert.notOk(oDialog.getEndButton(), "Close button in the footer is not set");

		// clean
		oDeviceStub.restore();
		oDateTimePicker.destroy();
		oLabel.destroy();
	});

	QUnit.module("Private");

	QUnit.test("_selectFocusedDateValue should remove all selectedDates from the calendar and select the focused date", function (assert) {
		// arrange
		var oExpectedDate = new DateRange().setStartDate(new Date(2017, 5, 15)),
			oDateTimePicker = new DateTimePicker(),
			oCalendar = oDateTimePicker._oCalendar = {
				destroy: function () {},
				removeAllSelectedDates: this.spy(),
				addSelectedDate: this.spy()
			};

		// act
		oDateTimePicker._selectFocusedDateValue(oExpectedDate);

		// assert
		assert.ok(oCalendar.removeAllSelectedDates.calledOnce, "removeAllSelectedDates should be called once");
		assert.ok(oCalendar.addSelectedDate.calledWith(oExpectedDate), "addSelectedDate should be called with: " + oExpectedDate);

		// cleanup
		oDateTimePicker.destroy();
	});

	QUnit.test("setMinutesStep, setSecondsStep set the steps to the sliders", function(assert) {
		//arrange, act
		var oDTP = new DateTimePicker({
			minutesStep: 5,
			secondsStep: 4
		}).placeAt("qunit-fixture");

		sap.ui.getCore().applyChanges();

		oDTP._createPopup();
		oDTP._createPopupContent();
		oDTP._openPopup();

		//asert
		assert.equal(oDTP._oSliders.getMinutesStep(), 5, "sliders has the correct minutes step");
		assert.equal(oDTP._oSliders.getSecondsStep(), 4, "sliders has the correct seconds step");

		//clean
		oDTP.destroy();
	});

	// BCP: 2170086834
	QUnit.test("DateTimePicker.prototype._parseValue", function(assert) {
		// prepare
		var oModel = new JSONModel({
				myDate: new Date()
			}),
			oDTP = new DateTimePicker({
				value: {
					path: "/myDate",
					type: 'sap.ui.model.type.DateTime',
					formatOptions: {
						source: {
							pattern:'test'
						}
					}
				}
			}).setModel(oModel),
			oGetFormatterSpy = sinon.spy(oDTP, "_getFormatter");

		// act
		oDTP._parseValue("test", true);

		// assert
		assert.ok(oGetFormatterSpy.calledOnce, "Internal Dateformat isntance is created");

		// clean
		oDTP.destroy();
		oGetFormatterSpy.restore();
	});

	QUnit.test("_createPopupContent", function (assert) {
		// Arrange
		var oDTP = new DateTimePicker().placeAt("qunit-fixture"),
			oPopupContent;

		sap.ui.getCore().applyChanges();

		// Act
		oDTP.toggleOpen();

		oPopupContent = oDTP._oPopup.getContent();

		// Assert
		assert.ok(oPopupContent[0].isA("sap.m.ValueStateHeader"), "There is a sap.m.ValueStateHeader created in the popup content");
		assert.ok(oPopupContent[1].isA("sap.m.internal.DateTimePickerPopup"), "There is a sap.m.internal.DateTimePickerPopup created in the popup content");

		// Clean up
		oDTP.destroy();
	});

	QUnit.test("_inPreferredUserInteraction", function (assert) {
		// Prepare
		var oDTP = new DateTimePicker(),
			oInPreferredUserInteractionSpy = this.spy(oDTP, "_inPreferredUserInteraction");

		oDTP.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// Assert
		assert.ok(oInPreferredUserInteractionSpy.calledOnce, "Preferred interaction is handled during rendering");

		// Clean
		oDTP.destroy();
	});
});