/*!
 * ${copyright}
 */

// Provides control sap.m.Input.
sap.ui.define([
	'./InputBase',
	'./Popover',
	'sap/ui/core/Item',
	'./ColumnListItem',
	'./GroupHeaderListItem',
	'./StandardListItem',
	'sap/ui/core/SeparatorItem',
	'./List',
	'./Table',
	'./library',
	'sap/ui/core/IconPool',
	'sap/ui/Device',
	'./SuggestionsPopover',
	'./Toolbar',
	'./ToolbarSpacer',
	'./Button',
	"sap/ui/core/ResizeHandler",
	"sap/ui/dom/containsOrEquals",
	"sap/base/assert",
	"sap/base/util/deepEqual",
	"sap/m/inputUtils/wordStartsWithValue",
	"sap/m/inputUtils/inputsDefaultFilter",
	"sap/m/inputUtils/highlightDOMElements",
	"sap/m/inputUtils/typeAhead",
	"sap/ui/events/KeyCodes",
	"sap/m/inputUtils/filterItems",
	"sap/m/inputUtils/ListHelpers",
	"sap/m/inputUtils/calculateSelectionStart",
	"sap/m/inputUtils/selectionRange",
	"./InputRenderer",
	"sap/ui/base/ManagedObject",
	"sap/ui/thirdparty/jquery",
	// jQuery Plugin "selectText"
	"sap/ui/dom/jquery/selectText"
],
function(
	InputBase,
	Popover,
	Item,
	ColumnListItem,
	GroupHeaderListItem,
	StandardListItem,
	SeparatorItem,
	List,
	Table,
	library,
	IconPool,
	Device,
	SuggestionsPopover,
	Toolbar,
	ToolbarSpacer,
	Button,
	ResizeHandler,
	containsOrEquals,
	assert,
	deepEqual,
	wordStartsWithValue,
	inputsDefaultFilter,
	highlightDOMElements,
	typeAhead,
	KeyCodes,
	filterItems,
	ListHelpers,
	calculateSelectionStart,
	selectionRange,
	InputRenderer,
	ManagedObject,
	jQuery
) {
	"use strict";
	// shortcut for sap.m.ListType
	var ListType = library.ListType;

	// shortcut for sap.m.InputTextFormatMode
	var InputTextFormatMode = library.InputTextFormatMode;

	// shortcut for sap.m.InputType
	var InputType = library.InputType;

	// shortcut for sap.m.ListMode
	var ListMode = library.ListMode;

	// shortcut for sap.m.ListSeparators
	var ListSeparators = library.ListSeparators;

	/**
	 * Constructor for a new <code>Input</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Allows the user to enter and edit text or numeric values in one line.
	 *
	 * <h3>Overview</h3>
	 *
	 * You can enable the autocomplete suggestion feature and the value help option to easily enter a valid value.
	 *
	 * <h3>Guidelines</h3>
	 *
	 * <ul>
	 * <li> Always provide a meaningful label for any input field </li>
	 * <li> Limit the length of the input field. This will visually emphasize the constraints for the field. </li>
	 * <li> Do not use the <code>placeholder</code> property as a label.</li>
	 * <li> Use the <code>description</code> property only for small fields with no placeholders (i.e. for currencies).</li>
	 * </ul>
	 *
	 * <h3>Structure</h3>
	 *
	 * The controls inherits from {@link sap.m.InputBase} which controls the core properties like:
	 * <ul>
	 * <li> editable / read-only </li>
	 * <li> enabled / disabled</li>
	 * <li> placeholder</li>
	 * <li> text direction</li>
	 * <li> value states</li>
	 * </ul>
	 * To aid the user during input, you can enable value help (<code>showValueHelp</code>) or autocomplete (<code>showSuggestion</code>).
	 * <strong>Value help</strong> will open a new dialog where you can refine your input.
	 * <strong>Autocomplete</strong> has three types of suggestions:
	 * <ul>
	 * <li> Single value - a list of suggestions of type <code>sap.ui.core.Item</code> or <code>sap.ui.core.ListItem</code> </li>
	 * <li> Two values - a list of two suggestions (ID and description) of type <code>sap.ui.core.Item</code> or <code>sap.ui.core.ListItem</code> </li>
	 * <li> Tabular suggestions of type <code>sap.m.ColumnListItem</code> </li>
	 * </ul>
	 * The suggestions are stored in two aggregations <code>suggestionItems</code> (for single and double values) and <code>suggestionRows</code> (for tabular values).
	 *
	 * <h3>Usage</h3>
	 *
	 * <b>When to use:</b>
	 * Use the control for short inputs like emails, phones, passwords, fields for assisted value selection.
	 *
	 * <b>When not to use:</b>
	 * Don't use the control for long texts, dates, designated search fields, fields for multiple selection.
	 *
	 * <h3>Known Limitations</h3>
	 *
	 * If <code>showValueHelp</code> or if <code>showSuggestion</code> is <code>true</code>, the native browser autofill will not fire a change event.
	 *
	 * <h4>Note:</h4>
	 * The control has the following behavior regarding the <code>selectedKey</code> and <code>value</code> properties:
	 * <ul>
	 * <li> On initial loading, if the control has a <code>selectedKey</code> set which corresponds to a matching item, and a set <code>value</code>, the <code>value</code> will be updated to the matching item's text. </li>
	 * <li> If a <code>selectedKey</code> is set and the user types an input which corresponds to an item's text, the <code>selectedKey</code> will be updated with the matching item's key. </li>
	 * <li> If a <code>selectedKey</code> is set and the user types an input which does not correspond to any item's text, the <code>selectedKey</code> will be set to an empty string ("") </li>
	 * <li> If a <code>selectedKey</code> is set and the user selects an item, the <code>selectedKey</code> will be updated to match the selected item's key. </li>
	 * <li> If a <code>selectedKey</code> is bound and the user types before the data is loaded, the user's input will be overwritten by the binding update. </li>
	 * </ul>
	 *
	 * @extends sap.m.InputBase
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @alias sap.m.Input
	 * @see {@link fiori:https://experience.sap.com/fiori-design-web/input-field/ Input}
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Input = InputBase.extend("sap.m.Input", /** @lends sap.m.Input.prototype */ { metadata : {

		library : "sap.m",
		properties : {

			/**
			 * HTML type of the internal <code>input</code> tag (e.g. Text, Number, Email, Phone).
			 * The particular effect of this property differs depending on the browser and the current language settings,
			 * especially for the type Number.<br>
			 * This parameter is intended to be used with touch devices that use different soft keyboard layouts depending on the given input type.<br>
			 * Only the default value <code>sap.m.InputType.Text</code> may be used in combination with data model formats.
			 * <code>sap.ui.model</code> defines extended formats that are mostly incompatible with normal HTML
			 * representations for numbers and dates.
			 */
			type : {type : "sap.m.InputType", group : "Data", defaultValue : InputType.Text},

			/**
			 * Maximum number of characters. Value '0' means the feature is switched off.
			 * This parameter is not compatible with the input type <code>sap.m.InputType.Number</code>.
			 * If the input type is set to <code>Number</code>, the <code>maxLength</code> value is ignored.
			 */
			maxLength : {type : "int", group : "Behavior", defaultValue : 0},

			/**
			 * Only used if type=date and no datepicker is available.
			 * The data is displayed and the user input is parsed according to this format.
			 * <b>Note:</b> The value property is always of the form RFC 3339 (YYYY-MM-dd).
			 * @deprecated Since version 1.9.1.
			 * <code>sap.m.DatePicker</code>, <code>sap.m.TimePicker</code> or <code>sap.m.DateTimePicker</code> should be used for date/time inputs and formating.
			 */
			dateFormat : {type : "string", group : "Misc", defaultValue : 'YYYY-MM-dd', deprecated: true},

			/**
			 * If set to true, a value help indicator will be displayed inside the control. When clicked the event "valueHelpRequest" will be fired.
			 * @since 1.16
			 */
			showValueHelp : {type : "boolean", group : "Behavior", defaultValue : false},

			/**
			 * Set custom value help icon.
			 * @since 1.84.0
			 */
			valueHelpIconSrc : {type : "sap.ui.core.URI", group : "Behavior", defaultValue : "sap-icon://value-help"},

			/**
			 * If this is set to true, suggest event is fired when user types in the input. Changing the suggestItems aggregation in suggest event listener will show suggestions within a popup. When runs on phone, input will first open a dialog where the input and suggestions are shown. When runs on a tablet, the suggestions are shown in a popup next to the input.
			 * @since 1.16.1
			 */
			showSuggestion : {type : "boolean", group : "Behavior", defaultValue : false},

			/**
			 * If set to true, direct text input is disabled and the control will trigger the event "valueHelpRequest" for all user interactions. The properties "showValueHelp", "editable", and "enabled" must be set to true, otherwise the property will have no effect
			 * @since 1.21.0
			 */
			valueHelpOnly : {type : "boolean", group : "Behavior", defaultValue : false},

			/**
			 * Defines whether to filter the provided suggestions before showing them to the user.
			 */
			filterSuggests : {type : "boolean", group : "Behavior", defaultValue : true},

			/**
			 * If set, the value of this parameter will control the horizontal size of the suggestion list to display more data. This allows suggestion lists to be wider than the input field if there is enough space available. By default, the suggestion list is always as wide as the input field.
			 * <b>Note:</b> The value will be ignored if the actual width of the input field is larger than the specified parameter value.
			 * @since 1.21.1
			 */
			maxSuggestionWidth : {type : "sap.ui.core.CSSSize", group : "Appearance", defaultValue : null},

			/**
			 * Minimum length of the entered text in input before suggest event is fired. The default value is 1 which means the suggest event is fired after user types in input.
			 *
			 * <b>Note:</b> When it's set to 0, suggest event is fired when input with no text gets focus. In this case no suggestion popup will open.
			 * @since 1.21.2
			 */
			startSuggestion : {type : "int", group : "Behavior", defaultValue : 1},

			/**
			 * For tabular suggestions, this flag will show/hide the button at the end of the suggestion table that triggers the event "valueHelpRequest" when pressed. The default value is true.
			 *
			 * <b>Note:</b> If suggestions are not tabular or no suggestions are used, the button will not be displayed and this flag is without effect.
			 * @since 1.22.1
			 */
			showTableSuggestionValueHelp : {type : "boolean", group : "Behavior", defaultValue : true},

			/**
			 * The description is a text after the input field, e.g. units of measurement, currencies.
			 */
			description: { type: "string", group: "Misc", defaultValue: null },

			/**
			 * This property only takes effect if the description property is set. It controls the distribution of space between the input field and the description text. The default value is 50% leaving the other 50% for the description.
			 */
			fieldWidth: { type: "sap.ui.core.CSSSize", group: "Appearance", defaultValue: '50%' },

			/**
			 * Indicates when the value gets updated with the user changes: At each keystroke (true) or first when the user presses enter or tabs out (false).
			 *
			 * <b>Note:</b> When set to true and the value of the Input control is bound to a model, the change event becomes obsolete and will not be fired, as the value in the model will be updated each time the user provides input. In such cases, subscription to the liveChange event is more appropriate, as it corresponds to the way the underlying model gets updated.
			 * @since 1.24
			 */
			valueLiveUpdate : {type : "boolean", group : "Behavior", defaultValue : false},

			/**
			 * Defines the key of the selected item.
			 *
			 * <b>Note:</b> If duplicate keys exist, the first item matching the key is used.
			 * @since 1.44
			 */
			selectedKey: {type: "string", group: "Data", defaultValue: ""},
			/**
			 * Defines the display text format mode.
			 * @since 1.44
			 */
			textFormatMode: {type: "sap.m.InputTextFormatMode", group: "Misc", defaultValue: InputTextFormatMode.Value},
			/**
			 * Defines the display text formatter function.
			 * @since 1.44
			 */
			textFormatter: {type: "any", group: "Misc", defaultValue: ""},
			/**
			 * Defines the validation callback function called when a suggestion row gets selected.
			 * @since 1.44
			 */
			suggestionRowValidator: {type: "any", group: "Misc", defaultValue: ""},

			/**
			 * Specifies whether the suggestions highlighting is enabled.
			 * @since 1.46
			 */
			enableSuggestionsHighlighting: {type: "boolean", group: "Behavior", defaultValue: true},

			/**
			 * Specifies whether autocomplete is enabled.
			 * Works only if "showSuggestion" property is set to true.
			 * <b>Note:</b> The autocomplete feature is disabled on Android devices due to a OS specific issue.
			 * @since 1.61
			 */
			autocomplete: {type: "boolean", group: "Behavior", defaultValue: true}
		},
		defaultAggregation : "suggestionItems",
		aggregations : {

			/**
			 * Defines the items displayed in the suggestion popup. Changing this aggregation
			 * (by calling <code>addSuggestionItem</code>, <code>insertSuggestionItem</code>,
			 * <code>removeSuggestionItem</code>, <code>removeAllSuggestionItems</code>, or
			 * <code>destroySuggestionItems</code>) after <code>Input</code> is rendered
			 * opens/closes the suggestion popup.
			 *
			 * To display suggestions with two text values, add <code>sap.ui.core.ListItem</code>
			 * as <code>SuggestionItems</code> (since 1.21.1). For the selected
			 * <code>ListItem</code>, only the first value is returned to the input field.
			 *
			 * <b>Note:</b> Only <code>text</code> and <code>additionalText</code> property values
			 * of the item are displayed. For example, if an <code>icon</code> is set, it is
			 * ignored. To display more information per item (including icons), you can use the
			 * <code>suggestionRows</code> aggregation.
			 *
			 * <b>Note:</b> Disabled items are not visualized in the list with the suggestions,
			 * however they can still be accessed through the aggregation.
			 *
			 * @since 1.16.1
			 */
			suggestionItems : {type : "sap.ui.core.Item", multiple : true, singularName : "suggestionItem"},

			/**
			 * The suggestionColumns and suggestionRows are for tabular input suggestions. This aggregation allows for binding the table columns; for more details see the aggregation "suggestionRows".
			 * @since 1.21.1
			 */
			suggestionColumns : {type : "sap.m.Column", multiple : true, singularName : "suggestionColumn", bindable : "bindable", forwarding: {getter:"_getSuggestionsTable", aggregation: "columns"}},

			/**
			 * The suggestionColumns and suggestionRows are for tabular input suggestions. This aggregation allows for binding the table cells.
			 * The items of this aggregation are to be bound directly or to set in the suggest event method.
			 * <b>Note:</b> If this aggregation is filled, the aggregation suggestionItems will be ignored.
			 * @since 1.21.1
			 */
			suggestionRows : {type : "sap.m.ColumnListItem", altTypes: ["sap.m.GroupHeaderListItem"], multiple : true, singularName : "suggestionRow", bindable : "bindable", forwarding: {getter: "_getSuggestionsTable", aggregation: "items"}},

			/**
			 * The suggestion popup (can be a Dialog or Popover); aggregation needed to also propagate the model and bindings to the content of the popover
			 */
			_suggestionPopup : {type : "sap.ui.core.Control", multiple: false, visibility: "hidden"},

			/**
			 * The icon on the right side of the Input
			 */
			_valueHelpIcon : {type : "sap.ui.core.Icon", multiple: false, visibility: "hidden"}
		},
		associations: {

			/**
			 * Sets or retrieves the selected item from the suggestionItems.
			 * @since 1.44
			 */
			selectedItem: {type: "sap.ui.core.Item", multiple: false},

			/**
			 * Sets or retrieves the selected row from the suggestionRows.
			 * @since 1.44
			 */
			selectedRow: {type: "sap.m.ColumnListItem", multiple: false}
		},
		events : {

			/**
			 * Fired when the value of the input is changed by user interaction - each keystroke, delete, paste, etc.
			 *
			 * <b>Note:</b> Browsing autocomplete suggestions does not fires the event.
			 */
			liveChange : {
				parameters : {
					/**
					 * The current value of the input, after a live change event.
					 */
					value : {type : "string"},

					/**
					 * Indicates that ESC key triggered the event. <b>Note:</b> This parameter will not be sent unless the ESC key is pressed.
					 * @since 1.48
					 */
					escPressed : {type : "boolean"},

					/**
					 * The value of the input before pressing ESC key. <b>Note:</b> This parameter will not be sent unless the ESC key is pressed.
					 * @since 1.48
					 */
					previousValue : {type : "string"}
				}
			},

			/**
			 * When the value help indicator is clicked, this event will be fired.
			 * @since 1.16
			 */
			valueHelpRequest : {
				parameters : {

					/**
					 * The event parameter is set to true, when the button at the end of the suggestion table is clicked, otherwise false. It can be used to determine whether the "value help" trigger or the "show all items" trigger has been pressed.
					 */
					fromSuggestions : {type : "boolean"}
				}
			},

			/**
			 * This event is fired when user types in the input and showSuggestion is set to true. Changing the suggestItems aggregation will show the suggestions within a popup.
			 * @since 1.16.1
			 */
			suggest : {
				parameters : {

					/**
					 * The current value which has been typed in the input.
					 */
					suggestValue : {type : "string"},

					/**
					 * The suggestion list is passed to this event for convenience. If you use list-based or tabular suggestions, fill the suggestionList with the items you want to suggest. Otherwise, directly add the suggestions to the "suggestionItems" aggregation of the input control.
					 */
					suggestionColumns : {type : "sap.m.ListBase"}
				}
			},

			/**
			 * This event is fired when suggestionItem shown in suggestion popup are selected. This event is only fired when showSuggestion is set to true and there are suggestionItems shown in the suggestion popup.
			 * @since 1.16.3
			 */
			suggestionItemSelected : {
				parameters : {

					/**
					 * This is the item selected in the suggestion popup for one and two-value suggestions. For tabular suggestions, this value will not be set.
					 */
					selectedItem : {type : "sap.ui.core.Item"},

					/**
					 * This is the row selected in the tabular suggestion popup represented as a ColumnListItem. For one and two-value suggestions, this value will not be set.
					 *
					 * <b>Note:</b> The row result function to select a result value for the string is already executed at this time. To pick different value for the input field or to do follow up steps after the item has been selected.
					 * @since 1.21.1
					 */
					selectedRow : {type : "sap.m.ColumnListItem"}
				}
			},

			/**
			 * This event is fired when user presses the <kbd>Enter</kbd> key on the input.
			 *
			 * <b>Notes:</b>
			 * <ul>
			 * <li>The event is fired independent of whether there was a change before or not. If a change was performed, the event is fired after the change event.</li>
			 * <li>The event is also fired when an item of the select list is selected via <kbd>Enter</kbd>.</li>
			 * <li>The event is only fired on an input which allows text input (<code>editable</code>, <code>enabled</code> and not <code>valueHelpOnly</code>).</li>
			 * </ul>
			 *
			 * @since 1.33.0
			 */
			submit : {
				parameters: {

					/**
					 * The new value of the input.
					 */
					value: { type: "string" }
				}
			}
		},
		designtime: "sap/m/designtime/Input.designtime"
	}});


	IconPool.insertFontFaceStyle();

	/**
	 * The default filter function for tabular suggestions. It checks whether some item text begins with the typed value.
	 *
	 * @private
	 * @param {string} sValue the current filter string.
	 * @param {sap.m.ColumnListItem} oColumnListItem The filtered list item.
	 * @returns {boolean} true for items that start with the parameter sValue, false for non matching items.
	 */
	Input._DEFAULTFILTER_TABULAR = function(sValue, oColumnListItem) {
		var aCells = oColumnListItem.getCells(),
			i = 0;

		for (; i < aCells.length; i++) {

			if (aCells[i].getText) {
				if (wordStartsWithValue(aCells[i].getText(), sValue)) {
					return true;
				}
			}
		}

		return false;
	};

	/**
	 * The default result function for tabular suggestions. It returns the value of the first cell with a "text" property.
	 *
	 * @private
	 * @param {sap.m.ColumnListItem} oColumnListItem The selected list item.
	 * @returns {string} The value to be displayed in the input field.
	 */
	Input._DEFAULTRESULT_TABULAR = function (oColumnListItem) {
		var aCells = oColumnListItem.getCells(),
			i = 0;

		for (; i < aCells.length; i++) {
			// take first cell with a text method and compare value
			if (aCells[i].getText) {
				return aCells[i].getText();
			}
		}
		return "";
	};

	/**
	 * Initializes the control.
	 *
	 * @private
	 */
	Input.prototype.init = function() {
		InputBase.prototype.init.call(this);
		this._fnFilter = inputsDefaultFilter;

		// Counter for concurrent issues with setValue:
		this._iSetCount = 0;

		// TypeAhead's suggested text. It's always executed in the context of the "root" Input and never in the Dialog's instance!
		this._sProposedItemText = null;

		this._oRb = sap.ui.getCore().getLibraryResourceBundle("sap.m");
	};

	/**
	 * Destroys the Input.
	 *
	 * @private
	 */
	Input.prototype.exit = function() {

		InputBase.prototype.exit.call(this);

		this._deregisterEvents();

		// clear delayed calls
		this.cancelPendingSuggest();

		if (this._iRefreshListTimeout) {
			clearTimeout(this._iRefreshListTimeout);
			this._iRefreshListTimeout = null;
		}

		if (this._oSuggestionsTable) {
			this._oSuggestionsTable.destroy();
			this._oSuggestionsTable = null;
		}

		if (this._isSuggestionsPopoverInitiated()) {
			this._oSuggestionPopup = null;
			this._oSuggPopover.destroy();
			this._oSuggPopover = null;
		}

		// Unregister custom events handlers after migration to semantic rendering
		this.$().off("click");
	};

	/**
	 * Overwrites the onBeforeRendering.
	 *
	 * @public
	 */
	Input.prototype.onBeforeRendering = function() {
		var sSelectedKey = this.getSelectedKey(),
			bShowIcon = this.getShowValueHelp() && this.getEnabled() && this.getEditable(),
			aEndIcons = this.getAggregation("_endIcon") || [],

			oIcon = aEndIcons[0],
			oSuggestionsPopover = this._isSuggestionsPopoverInitiated() && this._getSuggestionsPopover(),
			bSuggestionsPopoverIsOpen = oSuggestionsPopover && this._isSuggestionsPopoverOpen(),
			oPopupInput = oSuggestionsPopover && oSuggestionsPopover.getInput(),
			sValueStateHeaderText = bSuggestionsPopoverIsOpen ?  oSuggestionsPopover._getValueStateHeader().getText() : null,
			sValueStateHeaderValueState = bSuggestionsPopoverIsOpen ?  oSuggestionsPopover._getValueStateHeader().getValueState() : "";

		InputBase.prototype.onBeforeRendering.call(this);

		this._deregisterEvents();

		if (sSelectedKey) {
			this.setSelectedKey(sSelectedKey);
		}

		if (this.getShowSuggestion()) {
			if (this.getShowTableSuggestionValueHelp()) {
				this._addShowMoreButton();
			} else {
				this._removeShowMoreButton();
			}

			// setting the property "type" of the Input inside the Suggestion popover
			if (oPopupInput) {
				oPopupInput.setType(this.getType());
			}
		}

		if (bShowIcon) {
			// ensure the creation of an icon
			oIcon = this._getValueHelpIcon();
			oIcon.setProperty("visible", true, true);
		} else if (oIcon) {
			// if the icon should not be shown and has never be initialized - do nothing
			oIcon.setProperty("visible", false, true);
		}

		if (!this.getWidth()) {
			this.setProperty("width", "100%", true);
		}

		this._resetTypeAhead();

		if (bSuggestionsPopoverIsOpen && ((this.getValueStateText() && sValueStateHeaderText !== this.getValueStateText()) ||
			(this.getValueState() !== sValueStateHeaderValueState) ||
			(this.getFormattedValueStateText()))) {
			/* If new value state, value state plain text or FormattedText is set
			while the suggestions popover is open update the value state header.
			If the input has FormattedText aggregation while the suggestions popover is open then
			it's new, because the old is already switched to have the value state header as parent */
			this._updateSuggestionsPopoverValueState();
		}
	};

	/**
	 * Returns input display text.
	 *
	 * @private
	 * @param {sap.ui.core.Item} oItem The displayed item.
	 * @returns {string} The key for the text format mode.
	 */
	Input.prototype._getDisplayText = function(oItem) {

		var fTextFormatter = this.getTextFormatter();
		if (fTextFormatter) {
			return fTextFormatter(oItem);
		}

		var sText = oItem.getText(),
			sKey = oItem.getKey(),
			textFormatMode = this.getTextFormatMode();

		switch (textFormatMode) {
			case InputTextFormatMode.Key:
				return sKey;
			case InputTextFormatMode.ValueKey:
				return sText + ' (' + sKey + ')';
			case InputTextFormatMode.KeyValue:
				return '(' + sKey + ') ' + sText;
			default:
				return sText;
		}
	};

	/**
	 * Handles value updates.
	 *
	 * @private
	 * @param {string} newValue The new selected value.
	 */
	Input.prototype._onValueUpdated = function (newValue) {
		if (this._bSelectingItem || newValue === this._sSelectedValue) {
			return;
		}

		var sKey = this.getSelectedKey(),
			bHasSelectedItem,
			oList = this._isSuggestionsPopoverInitiated() && this._getSuggestionsPopover().getItemsContainer();

		if (sKey === '') {
			return;
		}

		if (this._hasTabularSuggestions()) {
			bHasSelectedItem = this._getSuggestionsTable() && !!this._getSuggestionsTable().getSelectedItem();
		} else {
			bHasSelectedItem = oList && !!oList.getSelectedItem();
		}

		if (bHasSelectedItem) {
			return;
		}

		this.setProperty("selectedKey", '', true);
		this.setAssociation("selectedRow", null, true);
		this.setAssociation("selectedItem", null, true);

		this.fireSuggestionItemSelected({
			selectedItem: null,
			selectedRow: null
		});
	};

	/**
	 * Updates and synchronizes the <code>selectedItem</code> association and <code>selectedKey</code> properties.
	 *
	 * @private
	 * @param {sap.ui.core.Item | null} oItem Selected item.
	 * @param {boolean} bInteractionChange Specifies if the change is triggered by user interaction.
	 */
	Input.prototype.setSelectionItem = function (oItem, bInteractionChange) {

		this._bSelectingItem = true;

		if (!oItem) {
			this.setAssociation("selectedItem", null, true);
			this.setValue('');
			return;
		}

		var iCount = this._iSetCount,
			sNewValue;

		this.setAssociation("selectedItem", oItem, true);
		this.setProperty("selectedKey", oItem.getKey(), true);

		// fire suggestion item select event
		if (bInteractionChange) {
			this.fireSuggestionItemSelected({
				selectedItem: oItem
			});
		}

		// choose which field should be used for the value
		if (iCount !== this._iSetCount) {
			// if the event handler modified the input value we take this one as new value
			sNewValue = this.getValue();
		} else {
			sNewValue = this._getDisplayText(oItem);
		}

		this._sSelectedValue = sNewValue;

		this.updateInputField(sNewValue);

		// don't continue if the input is destroyed after firing change event through updateInputField
		if (this.bIsDestroyed) {
			return;
		}

		if (!(this.isMobileDevice() && this instanceof sap.m.MultiInput)) {
			this._closeSuggestionPopup();
		}

		this._bSelectingItem = false;
	};


	/**
	 * Adds a sap.m.GroupHeaderListItem item to the aggregation named <code>suggestionRows</code>.
	 *
	 * @param {sap.ui.core.Item} oGroup Item of that group
	 * @param {sap.ui.core.SeparatorItem} oHeader The item to be added
	 * @param {boolean} bSuppressInvalidate Flag indicating whether invalidation should be suppressed
	 * @returns {sap.m.GroupHeaderListItem} The group header
	 * @private
	 */
	Input.prototype.addSuggestionRowGroup = function(oGroup, oHeader, bSuppressInvalidate) {
		oHeader = oHeader || new GroupHeaderListItem({
			title: ManagedObject.escapeSettingsValue(oGroup.text) || ManagedObject.escapeSettingsValue(oGroup.key)
		});

		this.addAggregation("suggestionRows", oHeader, bSuppressInvalidate);
		return oHeader;
	};


	/**
	 * Adds a sap.ui.core.SeparatorItem item to the aggregation named <code>suggestions</code>.
	 *
	 * @param {sap.ui.core.Item} oGroup Item of that group
	 * @param {sap.ui.core.SeparatorItem} oHeader The item to be added
	 * @param {boolean} bSuppressInvalidate Flag indicating whether invalidation should be suppressed
	 * @returns {sap.m.GroupHeaderListItem} The group header
	 * @private
	 */
	Input.prototype.addSuggestionItemGroup = function(oGroup, oHeader, bSuppressInvalidate) {
		oHeader = oHeader || new SeparatorItem({
			text: ManagedObject.escapeSettingsValue(oGroup.text) || ManagedObject.escapeSettingsValue(oGroup.key)
		});

		this.addAggregation("suggestionItems", oHeader, bSuppressInvalidate);
		return oHeader;
	};

	/**
	 * Sets the <code>selectedItem</code> association.
	 *
	 *
	 * @public
	 * @param {sap.ui.core.Item} [oItem=null] New value for the <code>selectedItem</code> association.
	 * If an ID of a <code>sap.ui.core.Item</code> is given, the item with this ID becomes the
	 * <code>selectedItem</code> association.
	 * Alternatively, a <code>sap.ui.core.Item</code> instance may be given or <code>null</code> to clear
	 * the selection.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @since 1.44
	 */
	Input.prototype.setSelectedItem = function(oItem) {

		if (typeof oItem === "string") {
			oItem = sap.ui.getCore().byId(oItem);
		}

		if (oItem !== null && !(oItem instanceof Item)) {
			return this;
		}

		this.setSelectionItem(oItem);
		return this;
	};

	/**
	 * Sets the <code>selectedKey</code> property.
	 *
	 * Default value is an empty string <code>""</code> or <code>undefined</code>.
	 *
	 * @public
	 * @param {string} sKey New value for property <code>selectedKey</code>.
	 * If the provided <code>sKey</code> is an empty string <code>""</code> or <code>undefined</code>,
	 * the selection is cleared.
	 * If duplicate keys exist, the first item matching the key is selected.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @since 1.44
	 */
	Input.prototype.setSelectedKey = function(sKey) {
		sKey = this.validateProperty("selectedKey", sKey);
		this.setProperty("selectedKey", sKey, true);

		if (this._hasTabularSuggestions()) {
			return this;
		}

		if (!sKey) {
			this.setSelectionItem();
			return this;
		}

		var oItem = this.getSuggestionItemByKey(sKey);
		this.setSelectionItem(oItem);

		return this;
	};

	/**
	 * Gets the item with the given key from the aggregation <code>suggestionItems</code>.
	 * <b>Note:</b> If duplicate keys exist, the first item matching the key is returned.
	 *
	 * @public
	 * @param {string} sKey An item key that specifies the item to retrieve.
	 * @returns {sap.ui.core.Item} Suggestion item.
	 * @since 1.44
	 */
	Input.prototype.getSuggestionItemByKey = function(sKey) {
		var aItems = this.getSuggestionItems() || [],
			oItem,
			i;

		for (i = 0; i < aItems.length; i++) {
			oItem = aItems[i];
			if (oItem.getKey() === sKey) {
				return oItem;
			}
		}
	};

	/**
	 * Gets <code>sap.m.FormattedText</code> aggregation based on its current parent.
	 * If the SuggestionPopover is open that is the <code>sap.m.ValueStateHeader</code>, otherwise is the Input itself.
	 *
	 * @private
	 * @returns {sap.m.FormattedText} Aggregation used for value state message that can contain links.
	 * @since 1.78
	 */
	Input.prototype._getFormattedValueStateText = function () {
		var bSuggestionsPopoverIsOpen = this._isSuggestionsPopoverOpen(),
			oValueStateHeaderFormattedText = bSuggestionsPopoverIsOpen ?
				this._getSuggestionsPopover()._getValueStateHeader().getFormattedText() : null;

		if (bSuggestionsPopoverIsOpen && oValueStateHeaderFormattedText) {
			return oValueStateHeaderFormattedText;
		} else {
			return InputBase.prototype.getFormattedValueStateText.call(this);
		}
	};


	/**
	 * Updates and synchronizes the <code>selectedRow</code> association and <code>selectedKey</code> properties.
	 *
	 * @private
	 * @param {sap.m.ColumnListItem} oListItem Selected item.
	 * @param {boolean} bInteractionChange Specifies if the change is triggered by user interaction.
	 */
	Input.prototype.setSelectionRow = function (oListItem, bInteractionChange) {
		if (!oListItem) {
			this.setAssociation("selectedRow", null, true);
			return;
		}

		this._bSelectingItem = true;

		var oItem,
			fSuggestionRowValidator = this.getSuggestionRowValidator();

		if (fSuggestionRowValidator) {
			oItem = fSuggestionRowValidator(oListItem);
			if (!(oItem instanceof Item)) {
				oItem = null;
			}
		}

		var iCount = this._iSetCount,
			sKey = "",
			sNewValue;

		this.setAssociation("selectedRow", oListItem, true);

		if (oItem) {
			sKey = oItem.getKey();
		}

		this.setProperty("selectedKey", sKey, true);

		// fire suggestion item select event
		if (bInteractionChange) {
			this.fireSuggestionItemSelected({
				selectedRow: oListItem
			});
		}

		// choose which field should be used for the value
		if (iCount !== this._iSetCount) {
			// if the event handler modified the input value we take this one as new value
			sNewValue = this.getValue();
		} else {
			// for tabular suggestions we call a result filter function
			if (oItem) {
				sNewValue = this._getDisplayText(oItem);
			} else {
				sNewValue = this._fnRowResultFilter ? this._fnRowResultFilter(oListItem) : Input._DEFAULTRESULT_TABULAR(oListItem);
			}
		}

		this._sSelectedValue = sNewValue;

		this.updateInputField(sNewValue);

		// don't continue if the input is destroyed after firing change event through updateInputField
		if (this.bIsDestroyed) {
			return;
		}

		if (!(this.isMobileDevice() && this instanceof sap.m.MultiInput && this._isMultiLineMode)) {
			this.setSelectionUpdatedFromList(false);
			this._closeSuggestionPopup();
		}

		this._bSelectingItem = false;
	};

	/**
	 * Sets the <code>selectedRow</code> association.
	 * Default value is <code>null</code>.
	 *
	 * @public
	 * @param {sap.m.ColumnListItem} oListItem New value for the <code>selectedRow</code> association.
	 * If an ID of a <code>sap.m.ColumnListItem</code> is given, the item with this ID becomes the
	 * <code>selectedRow</code> association.
	 * Alternatively, a <code>sap.m.ColumnListItem</code> instance may be given or <code>null</code> to clear
	 * the selection.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @since 1.44
	 */
	Input.prototype.setSelectedRow = function(oListItem) {

		if (typeof oListItem === "string") {
			oListItem = sap.ui.getCore().byId(oListItem);
		}

		if (oListItem !== null && !(oListItem instanceof ColumnListItem)) {
			return this;
		}

		this.setSelectionRow(oListItem);
		return this;
	};

	/**
	 * Returns/Instantiates the value help icon control when needed.
	 *
	 * @private
	 * @returns {object} Value help icon of the input.
	 */
	Input.prototype._getValueHelpIcon = function () {
		var that = this,
			aEndIcons = this.getAggregation("_endIcon") || [],
			sIconSrc = this.getValueHelpIconSrc(),
			oValueStateIcon = aEndIcons[0];

		// for backward compatibility - leave this method to return the instance
		if (!oValueStateIcon) {
			oValueStateIcon = this.addEndIcon({
				id: this.getId() + "-vhi",
				src: sIconSrc,
				useIconTooltip: false,
				alt: this._oRb.getText("INPUT_VALUEHELP_BUTTON"),
				decorative: false,
				noTabStop: true,
				press: function (oEvent) {
					// if the property valueHelpOnly is set to true, the event is triggered in the ontap function
					if (!that.getValueHelpOnly()) {
						var oParent = this.getParent(),
							$input;

						if (Device.support.touch) {
							// prevent opening the soft keyboard
							$input = oParent.$('inner');
							$input.attr('readonly', 'readonly');
							oParent.focus();
							$input.removeAttr('readonly');
						} else {
							oParent.focus();
						}

						that.bValueHelpRequested = true;

						that._fireValueHelpRequest(false);
					}
				}
			});
		} else if (oValueStateIcon.getSrc() !== sIconSrc) {
			oValueStateIcon.setSrc(sIconSrc);
		}

		return oValueStateIcon;
	};

	/**
	 * Fire valueHelpRequest event.
	 *
	 * @private
	 */
	Input.prototype._fireValueHelpRequest = function(bFromSuggestions) {

		// The goal is to provide a value in the value help event, which can be used to filter the opened Value Help Dialog.
		var sTypedInValue = "";

		if (this.getShowSuggestion() && this._isSuggestionsPopoverInitiated() && !this.isMobileDevice()) {
			sTypedInValue = this._sTypedInValue || "";
		} else {
			sTypedInValue = this.getDOMValue();
		}

		this.fireValueHelpRequest({
			fromSuggestions: bFromSuggestions,
			_userInputValue: sTypedInValue // NOTE: Private parameter for the SmartControls which need only the value entered by the user.
		});
	};

	/**
	 * Fire valueHelpRequest event if conditions for ValueHelpOnly property are met.
	 *
	 * @private
	 */
	Input.prototype._fireValueHelpRequestForValueHelpOnly = function() {
		// if all the named properties are set to true, the control triggers "valueHelpRequest" for all user interactions
		if (this.getEnabled() && this.getEditable() && this.getShowValueHelp() && this.getValueHelpOnly()) {
			if (Device.system.phone) {
				this.focus();
			}
			this._fireValueHelpRequest(false);
		}
	};

	/**
	 * Fire valueHelpRequest event on tap.
	 *
	 * @public
	 * @param {jQuery.Event} oEvent Ontap event.
	 */
	Input.prototype.ontap = function(oEvent) {
		InputBase.prototype.ontap.call(this, oEvent);

		if (this.isValueHelpOnlyOpener(oEvent.target)) {
			this._fireValueHelpRequestForValueHelpOnly();
		}

		if (this.isMobileDevice()
			 && this.getEditable()
			 && this.getEnabled()
			 && this.getShowSuggestion()
			 && this._isSuggestionsPopoverInitiated()
			 && oEvent.target.id != this.getId() + "-vhi") {
				this._openSuggestionsPopover();
		}
	};

	/**
	 * Sets a custom filter function for suggestions. The default is to check whether the first item text begins with the typed value. For one and two-value suggestions this callback function will operate on sap.ui.core.Item types, for tabular suggestions the function will operate on sap.m.ColumnListItem types.
	 *
	 * @public
	 * @param {function} fnFilter The filter function is called when displaying suggestion items and has two input parameters: the first one is the string that is currently typed in the input field and the second one is the item that is being filtered. Returning true will add this item to the popup, returning false will not display it.
	 * @returns {this} this pointer for chaining
	 * @since 1.16.1
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	Input.prototype.setFilterFunction = function(fnFilter) {
		// reset to default function when calling with null or undefined
		if (fnFilter === null || fnFilter === undefined) {
			this._fnFilter = inputsDefaultFilter;
			return this;
		}
		// set custom function
		assert(typeof (fnFilter) === "function", "Input.setFilterFunction: first argument fnFilter must be a function on " + this);
		this._fnFilter = fnFilter;
		return this;
	};

	/**
	 * Sets a custom result filter function for tabular suggestions to select the text that is passed to the input field. Default is to check whether the first cell with a "text" property begins with the typed value. For one value and two-value suggestions this callback function is not called.
	 *
	 * @public
	 * @param {function} fnFilter The result function is called with one parameter: the sap.m.ColumnListItem that is selected. The function must return a result string that will be displayed as the input field's value.
	 * @returns {this} this pointer for chaining
	 * @since 1.21.1
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	Input.prototype.setRowResultFunction = function(fnFilter) {
		var sSelectedRow;

		// reset to default function when calling with null or undefined
		if (fnFilter === null || fnFilter === undefined) {
			this._fnRowResultFilter = Input._DEFAULTRESULT_TABULAR;
			return this;
		}
		// set custom function
		assert(typeof (fnFilter) === "function", "Input.setRowResultFunction: first argument fnFilter must be a function on " + this);
		this._fnRowResultFilter = fnFilter;

		sSelectedRow = this.getSelectedRow();
		if (sSelectedRow) {
			this.setSelectedRow(sSelectedRow);
		}

		return this;
	};

	/**
	 * Closes the suggestion list.
	 *
	 * @public
	 * @since 1.48
	 */
	Input.prototype.closeSuggestions = function() {
		this._closeSuggestionPopup();
	};

	/**
	 * Selects the text of the InputDomRef in the given range.
	 *
	 * @private
	 * @param {int} iStart Start of selection.
	 * @param {iEnd} iEnd End of selection.
	 * @returns {this} this Input instance for chaining.
	 */
	Input.prototype._doSelect = function(iStart, iEnd) {
		if (Device.support.touch) {
			return;
		}
		var oDomRef = this._$input[0];
		if (oDomRef) {
			// if no Dom-Ref - no selection (Maybe popup closed)
			var $Ref = this._$input;
			oDomRef.focus();
			$Ref.selectText(iStart ? iStart : 0, iEnd ? iEnd : $Ref.val().length);
		}
		return this;
	};

	/**
	 *  Helper method for distinguishing between incremental and non-incremental types of input.
	 *
	 * @private
	 * @returns {boolean} Is it incremental type.
	 */
	Input.prototype._isIncrementalType = function () {
		var sTypeOfInput = this.getType();
		if (sTypeOfInput === "Number" || sTypeOfInput === "Date" ||
			sTypeOfInput === "Datetime" || sTypeOfInput === "Month" ||
			sTypeOfInput === "Time" || sTypeOfInput === "Week") {
			return true;
		}
		return false;
	};

	/**
	 * Keyboard handler for escape key.
	 *
	 * @public
	 * @param {jQuery.Event} oEvent Keyboard event.
	 */
	Input.prototype.onsapescape = function(oEvent) {
		if (this._isSuggestionsPopoverOpen()) {
			// mark the event as already handled
			oEvent.originalEvent._sapui_handledByControl = true;
			this.setSelectionUpdatedFromList(false);
			this._closeSuggestionPopup();

			// restore the initial value that was there before suggestion dialog
			if (this.getBeforeSuggestValue() !== this.getValue()) {
				this.setValue(this.getBeforeSuggestValue());
			}
			return; // override InputBase.onsapescape()
		}

		if (this.getValueLiveUpdate()) {
			// When valueLiveUpdate is true call setProperty to return back the last value.
			this.setProperty("value", this.getLastValue(), true);
		}

		if (InputBase.prototype.onsapescape) {
			InputBase.prototype.onsapescape.apply(this, arguments);
		}
	};

	/**
	 * Keyboard handler for enter key.
	 *
	 * @public
	 * @param {jQuery.Event} oEvent Keyboard event.
	 */
	Input.prototype.onsapenter = function(oEvent) {
		var iValueLength;
		// when enter is pressed before the timeout of suggestion delay, suggest event is cancelled
		this.cancelPendingSuggest();

		if (this._isSuggestionsPopoverOpen() && !this.isComposingCharacter()) {
			this.setSelectionUpdatedFromList(true);
			this._closeSuggestionPopup();
			iValueLength = this.getDOMValue() ? this.getDOMValue().length : null;
			this.selectText(iValueLength, iValueLength); // Remove text selection
		} else {
			InputBase.prototype.onsapenter.apply(this, arguments);
		}

		if (this.getEnabled() && this.getEditable() && !(this.getValueHelpOnly() && this.getShowValueHelp())) {
			this.fireSubmit({value: this.getValue()});
		}
	};

	/**
	 * Keyboard handler for the onFocusLeave event.
	 *
	 * @public
	 * @param {jQuery.Event} oEvent Keyboard event.
	 */
	Input.prototype.onsapfocusleave = function(oEvent) {
		var oSuggPopover = this._isSuggestionsPopoverInitiated() && this._getSuggestionsPopover(),
			oPopup = oSuggPopover && oSuggPopover.getPopover(),
			oFocusedControl = oEvent.relatedControlId && sap.ui.getCore().byId(oEvent.relatedControlId),
			oFocusDomRef = oFocusedControl && oFocusedControl.getFocusDomRef(),
			bFocusInPopup = oPopup
				&& oFocusDomRef
				&& containsOrEquals(oPopup.getDomRef(), oFocusDomRef);

		if (oPopup instanceof Popover) {
			if (bFocusInPopup && !oSuggPopover.getValueStateActiveState()) {
				// set the flag that the focus is currently in the Popup
				this._bPopupHasFocus = true;
				if (Device.system.desktop && deepEqual(oPopup.getFocusDomRef(), oFocusDomRef) || oFocusedControl.isA("sap.m.GroupHeaderListItem")) {
					// force the focus to stay in the Input field when scrollbar
					// is moving
					this.focus();
				}
			} else {
				// When the input still has the value of the last jQuery.val call, a change event has to be
				// fired manually because browser doesn't fire an input event in this case.
				if (this.getDOMValue() === this._sSelectedSuggViaKeyboard) {
					this._sSelectedSuggViaKeyboard = null;
				}
			}
		}

		if (!this.isMobileDevice() && this._sProposedItemText) {
			// Update selections for poweruser
			var oSelectedItem = this.getSuggestionItems()
				.filter(function (oItem) {
					return oItem.getText() === this._sProposedItemText;
				}.bind(this))[0];

			if (oSelectedItem) {
				this.setSelectionItem(oSelectedItem, true);
				this.selectText(0, 0);
			}
		}

		// Inform InputBase to fire the change event on Input only when focus doesn't go into the suggestion popup
		if (!bFocusInPopup) {
			InputBase.prototype.onsapfocusleave.apply(this, arguments);
		}

		this.bValueHelpRequested = false;
	};
	/**
	 * Keyboard handler for the onMouseDown event.
	 *
	 * @public
	 * @param {jQuery.Event} oEvent Keyboard event.
	 */
	Input.prototype.onmousedown = function(oEvent) {
		if (this._isSuggestionsPopoverOpen()) {
			oEvent.stopPropagation();
		}
	};

	/**
	 * Handles the <code>sappageup</code>, <code>sappagedown</code>, <code>saphome</code>, <code>sapend</code>,
	 * <code>sapup</code> and <code>sapdown</code> pseudo events when the Page Up/Page Down/Home/End key is pressed.
	 *
	 * @param {jQuery.Event} oEvent The event object.
	 * @private
	 */
	["onsapup", "onsapdown", "onsappageup", "onsappagedown", "onsaphome", "onsapend"].forEach(function(sName){
		Input.prototype[sName] = function (oEvent) {
			if ((sName === "onsapup" || sName === "onsapdown") && this.isComposingCharacter()) {
				return;
			}

			if (this.getShowSuggestion()){
				this._getSuggestionsPopover().handleListNavigation(this, oEvent);

				if (this._isIncrementalType()) {
					oEvent.setMarked();
				}

				this.setSelectionUpdatedFromList(true);
			}
		};
	});

	/**
	 * Determines whether the selection is updated from the list, while navigating.
	 * This is needed, since otherwise a double selection update will be done,
	 * when closing the picker.
	 *
	 * @param {boolean} bUpdated True, if the selection is updated from the list.
	 * @private
	 */
	Input.prototype.setSelectionUpdatedFromList = function (bUpdated) {
		this._bSelectionUpdatedFromList = bUpdated;
	};

	/**
	 * Gets the selection updated from list state.
	 *
	 * @private
	 */
	Input.prototype.getSelectionUpdatedFromList = function () {
		return this._bSelectionUpdatedFromList;
	};

	/**
	 * Updates the selection, when the picker is closed and the suggestions selection
	 * was updated, while navigating.
	 *
	 * @param {sap.m.StandardListItem | sap.m.ColumnListItem | sap.m.GroupHeaderListItem} oSelectedItem The selected from navigation item
	 * @private
	 */
	Input.prototype.updateSelectionFromList = function (oSelectedItem) {
		if (this._hasTabularSuggestions() && (this.getSelectedRow() !== oSelectedItem)) {
			this.setSelectionRow(oSelectedItem, true);
		} else {
			var oNewItem = ListHelpers.getItemByListItem(this.getSuggestionItems(), oSelectedItem);
			oNewItem && (this.getSelectedItem() !== oNewItem.getId()) && this.setSelectionItem(oNewItem, true);
		}

		this.setSelectionUpdatedFromList(false);
	};

	/**
	 * Removes events from the input.
	 *
	 * @private
	 */
	Input.prototype._deregisterEvents = function() {
		this._deregisterPopupResize();

		if (this.isMobileDevice() && this._isSuggestionsPopoverInitiated() && this._getSuggestionsPopover().getPopover()) {
			this.$().off("click");
		}
	};

	/**
	 * Update suggestion items.
	 *
	 * @public
	 * @return {this} this Input instance for chaining.
	 */
	Input.prototype.updateSuggestionItems = function() {
		this._bSuspendInvalidate = true;
		this.updateAggregation("suggestionItems");
		this._synchronizeSuggestions();
		this._bSuspendInvalidate = false;
		return this;
	};

	/**
	 * Invalidates the control.
	 * @override
	 * @protected
	 */
	Input.prototype.invalidate = function() {
		if (!this._bSuspendInvalidate) {
			InputBase.prototype.invalidate.apply(this, arguments);
		}
	};

		/**
	 * Cancels any pending suggestions.
	 *
	 * @public
	 */
	Input.prototype.cancelPendingSuggest = function() {
		if (this._iSuggestDelay) {
			clearTimeout(this._iSuggestDelay);
			this._iSuggestDelay = null;
		}
	};

	/**
	 * Triggers suggestions.
	 *
	 * @private
	 * @param {string} sValue User input.
	 */
	Input.prototype._triggerSuggest = function(sValue) {
		var oList = this._getSuggestionsPopover().getItemsContainer();

		this.cancelPendingSuggest();
		this._bShouldRefreshListItems = true;

		if (!sValue) {
			sValue = "";
		}

		if (sValue.length >= this.getStartSuggestion()) {
			this._iSuggestDelay = setTimeout(function(){

				// when using non ASCII characters the value might be the same as previous
				// don't re populate the suggestion items in this case
				if (this._sPrevSuggValue !== sValue) {

					this._bBindingUpdated = false;
					this.fireSuggest({
						suggestValue: sValue
					});
					// if binding is updated during suggest event, the list items don't need to be refreshed here
					// because they will be refreshed in updateItems function.
					// This solves the popup blinking problem
					if (!this._bBindingUpdated) {
						this._refreshItemsDelayed();
					}

					this._sPrevSuggValue = sValue;
				}
			}.bind(this), 300);
		} else if (this.isMobileDevice()) {
			if (oList instanceof Table) {
				// CSN# 1421140/2014: hide the table for empty/initial results to not show the table columns
				oList.addStyleClass("sapMInputSuggestionTableHidden");
			} else if (oList && oList.destroyItems) {
				oList.destroyItems();
			}
		} else if (this._isSuggestionsPopoverOpen()) {

			// when compose a non ASCII character, in Chrome the value is updated in the next browser tick cycle
			setTimeout(function () {
				var sNewValue = this.getDOMValue() || '';
				if (sNewValue < this.getStartSuggestion()) {
					this._closeSuggestionPopup();
				}
			}.bind(this), 0);
		}
	};

	(function(){
		/**
		 * Shows suggestions.
		 *
		 * @public
		 * @param {boolean} bValue Show suggestions.
		 * @return {this} this Input instance for chaining.
		 */
		Input.prototype.setShowSuggestion = function(bValue){
			var oSuggestionsPopover;
			this.setProperty("showSuggestion", bValue, true);
			if (bValue) {
				oSuggestionsPopover = this._getSuggestionsPopover();
				this._oSuggPopover = oSuggestionsPopover;

				if (!oSuggestionsPopover.getPopover()) {
					this._createSuggestionsPopoverPopup();
					this._synchronizeSuggestions();
					this._createSuggestionPopupContent();
				}
			} else {
				if (this._isSuggestionsPopoverInitiated()) {
					oSuggestionsPopover = this._getSuggestionsPopover();
					oSuggestionsPopover._destroySuggestionPopup();
				}
			}

			return this;
		};

		/**
		 * Checks if suggest should be triggered.
		 *
		 * @private
		 * @returns {boolean} Determines if suggest should be triggered.
		 */
		Input.prototype._shouldTriggerSuggest = function() {
			return !this._bPopupHasFocus && !this.getStartSuggestion() && !this.getValue() && this.getShowSuggestion();
		};

		/**
		 * Shows value help suggestions in table.
		 *
		 * @public
		 * @param {boolean} bValue Show suggestions.
		 * @return {this} this Input instance for chaining.
		 */
		Input.prototype.setShowTableSuggestionValueHelp = function(bValue) {
			this.setProperty("showTableSuggestionValueHelp", bValue, true);

			if (!(this._isSuggestionsPopoverInitiated() && this._getSuggestionsPopover().getPopover())) {
				return this;
			}

			if (bValue) {
				this._addShowMoreButton();
			} else {
				this._removeShowMoreButton();
			}
			return this;
		};

		/**
		 * Event handler for browsers' <code>change</code> event.
		 *
		 * @since 1.73
		 * @public
		 * @param {jQuery.Event} oEvent The event.
		 */
		Input.prototype.onchange = function(oEvent) {
			if (this.getShowValueHelp() || this.getShowSuggestion()) {
				// can not handle browser change if value help or suggestions is enabled
				// because change is fired before the value help is opened or when a link in suggestions is clicked
				return;
			}

			this.onChange(oEvent);
		};

		/**
		 * Event handler for user input.
		 *
		 * @public
		 * @param {jQuery.Event} oEvent User input.
		 */
		Input.prototype.oninput = function(oEvent) {
			InputBase.prototype.oninput.call(this, oEvent);
			if (oEvent.isMarked("invalid")) {
				return;
			}

			var sValue = this.getDOMValue(),
				oSuggestionsPopover,
				oList,
				oSelectedItem;

			if (this.getValueLiveUpdate()) {
				this.setProperty("value", sValue, true);
				this._onValueUpdated(sValue);
			}

			this.fireLiveChange({
				value: sValue,
				// backwards compatibility
				newValue: sValue
			});

			// always focus input field when typing in it
			this.addStyleClass("sapMFocus");

			// No need to fire suggest event when suggestion feature isn't enabled or runs on the phone.
			// Because suggest event should only be fired by the input in dialog when runs on the phone.
			if (this.getShowSuggestion() && !this.isMobileDevice()) {
				oSuggestionsPopover = this._getSuggestionsPopover();
				oList = oSuggestionsPopover.getItemsContainer();
				this._triggerSuggest(sValue);

				// If the visual focus is on a selected item, or if it is on a value state containing a link
				if (oList && !oSuggestionsPopover.getValueStateActiveState()) {
					oSelectedItem = oList && oList.getSelectedItem();
					oList.removeStyleClass("sapMListFocus");
					oSelectedItem && oSelectedItem.removeStyleClass("sapMLIBFocused");
				} else if (oSuggestionsPopover.getValueStateActiveState() && document.activeElement.tagName !== "A") {
					oSuggestionsPopover._getValueStateHeader().removeStyleClass("sapMPseudoFocus");
				}
			}

			this._handleTypeAhead(this);
		};

		Input.prototype.onkeydown = function (oEvent) {
			// disable the typeahead feature for android devices due to an issue on android soft keyboard, which always returns keyCode 229
			this._bDoTypeAhead = !Device.os.android && this.getAutocomplete() && (oEvent.which !== KeyCodes.BACKSPACE) && (oEvent.which !== KeyCodes.DELETE);
		};

		/**
		 * Gets the input value.
		 *
		 * @public
		 * @returns {string} Value of the input.
		 */
		Input.prototype.getValue = function(){
			return this.getDomRef("inner") && this._$input ? this.getDOMValue() : this.getProperty("value");
		};

		/**
		 * Refreshes delayed items.
		 *
		 * @public
		 */
		Input.prototype._refreshItemsDelayed = function() {
			clearTimeout(this._iRefreshListTimeout);

			this._iRefreshListTimeout = setTimeout(function () {
				if (this._isSuggestionsPopoverInitiated()) {
					this._refreshListItems();
				}
			}.bind(this), 0);
		};

		/**
		 * Clears the items from the <code>SuggestionsPopover</code>.
		 * For List items destroys, and for tabular ones removes the items.
		 *
		 * @private
		 */
		Input.prototype._clearSuggestionPopupItems = function () {
			var oList = this._getSuggestionsPopover().getItemsContainer();
			if (!oList) {
				return;
			}

			// only destroy items in simple suggestion mode
			if (oList instanceof Table) {
				oList.removeSelections(true);
			} else {
				// TODO: avoid flickering when !bFilter
				oList.destroyItems();
			}
		};

		/**
		 * Hides the <code>SuggestionsPopover</code> and adjusts the corresponding acc
		 * @private
		 */
		Input.prototype._hideSuggestionPopup = function () {
			var oSuggestionsPopover = this._getSuggestionsPopover(),
				oPopup = oSuggestionsPopover.getPopover(),
				oList = oSuggestionsPopover.getItemsContainer();

			// The IE moves the cursor position at the beginning when there is a binding and delay from the back-end
			// The workaround is to save the focus info which includes position and reset it after updating the DOM
			function _setDomValue(sValue) {
				var oFocusInfo = this.getFocusInfo();
				this.setDOMValue(sValue);

				if (Device.browser.internet_explorer) {
					this.applyFocusInfo(oFocusInfo);
				}
			}

			// when the input has no value, close the Popup when not runs on the phone because the opened dialog on phone shouldn't be closed.
			if (!this.isMobileDevice()) {
				if (this._isSuggestionsPopoverOpen()) {
					this._sCloseTimer = setTimeout(function () {
						this.cancelPendingSuggest();
						if (this._sTypedInValue) {
							_setDomValue.call(this, this._sTypedInValue);
						}
						oPopup.close();
					}.bind(this), 0);
				}
			} else if (this._hasTabularSuggestions() && oList) { // hide table on phone when there are no items to display
				oList.addStyleClass("sapMInputSuggestionTableHidden");
			}

			this.$("SuggDescr").text(""); // clear suggestion text
			this.$("inner").removeAttr("aria-activedescendant");
		};

		/**
		 * Opens the <code>SuggestionsPopover</code> and adjusts the corresponding acc
		 *
		 * @param {Boolean} bOpenCondition Additional open condition
		 * @private
		 */
		Input.prototype._openSuggestionPopup = function (bOpenCondition) {
			if (!this.isMobileDevice()) {
				if (this._sCloseTimer) {
					clearTimeout(this._sCloseTimer);
					this._sCloseTimer = null;
				}
				if (!this._isSuggestionsPopoverOpen() && !this._sOpenTimer && bOpenCondition !== false) {
					this._sOpenTimer = setTimeout(function () {
						this._sOpenTimer = null;
						this._isSuggestionsPopoverInitiated() && this._openSuggestionsPopover();
					}.bind(this), 0);
				}
			}
		};

		/**
		 * Adds List items to the <code>SuggestionsPopover</code>.
		 * Tabular items would be ignored.
		 *
		 * @param oFilterResults
		 * @returns {number} Number of suggestions
		 * @private
		 */
		Input.prototype.getSuggestionsCount = function (oFilterResults) {
			// The number of all items, including group headers
			var aHitItems = oFilterResults.items,
				aGroups = oFilterResults.groups,
				iItemsLength = aHitItems.length +  aGroups.length,
				iSuggestionsLength = iItemsLength;

			if (!this._hasTabularSuggestions()) {
				iSuggestionsLength -= aGroups.length;
			}

			return iSuggestionsLength;
		};

		/**
		 * Applies Suggestion Acc
		 *
		 * @param {Integer} iNumItems
		 * @private
		 */
		Input.prototype._applySuggestionAcc = function (iNumItems) {
			var sAriaText = "",
				oRb = this._oRb;

			// add items to list
			if (iNumItems === 1) {
				sAriaText = oRb.getText("INPUT_SUGGESTIONS_ONE_HIT");
			} else if (iNumItems > 1) {
				sAriaText = oRb.getText("INPUT_SUGGESTIONS_MORE_HITS", iNumItems);
			} else {
				sAriaText = oRb.getText("INPUT_SUGGESTIONS_NO_HIT");
			}

			// update Accessibility text for suggestion
			this.$("SuggDescr").text(sAriaText);
		};

		/**
		 * Helper function that refreshes list all items.
		 */
		Input.prototype._refreshListItems = function () {
			var bShowSuggestion = this.getShowSuggestion(),
				sTypedChars = this._bDoTypeAhead ? this._sTypedInValue : (this.getDOMValue() || ""),
				oFilterResults,
				iSuggestionsLength;

			if (!bShowSuggestion ||
				!this._bShouldRefreshListItems ||
				!this.getDomRef() ||
				(!this.isMobileDevice() && !this.$().hasClass("sapMInputFocused"))) {

				return null;
			}

			this._clearSuggestionPopupItems();

			// hide suggestions list/table if the number of characters is smaller than limit
			if (sTypedChars.length < this.getStartSuggestion()) {
				this._hideSuggestionPopup();
				return false;
			}

			oFilterResults = this._getFilteredSuggestionItems(sTypedChars);
			iSuggestionsLength = this.getSuggestionsCount(oFilterResults);

			if (iSuggestionsLength > 0) {
				this._openSuggestionPopup(this.getValue().length >= this.getStartSuggestion());
			} else {
				this._hideSuggestionPopup();
			}

			this._applySuggestionAcc(iSuggestionsLength);
		};

		/**
		 * Adds suggestion item.
		 *
		 * @public
		 * @param {sap.ui.core.Item} oItem Suggestion item.
		 * @return {this} this Input instance for chaining.
		 */
		Input.prototype.addSuggestionItem = function(oItem) {
			this.addAggregation("suggestionItems", oItem, true);

			if (!this._isSuggestionsPopoverInitiated()) {
				this._getSuggestionsPopover();
			}

			this._synchronizeSuggestions();
			this._createSuggestionPopupContent();

			return this;
		};

		/**
		 * Inserts suggestion item.
		 *
		 * @public
		 * @param {sap.ui.core.Item} oItem Suggestion item.
		 * @param {int} iIndex Index to be inserted.
		 * @returns {this} this Input instance for chaining.
		 */
		Input.prototype.insertSuggestionItem = function(oItem, iIndex) {
			this.insertAggregation("suggestionItems", iIndex, oItem, true);

			if (!this._isSuggestionsPopoverInitiated()) {
				this._getSuggestionsPopover();
			}

			this._synchronizeSuggestions();
			this._createSuggestionPopupContent();

			return this;
		};

		/**
		 * Removes suggestion item.
		 *
		 * @public
		 * @param {sap.ui.core.Item} oItem Suggestion item.
		 * @returns {boolean} Determines whether the suggestion item has been removed.
		 */
		Input.prototype.removeSuggestionItem = function(oItem) {
			var res = this.removeAggregation("suggestionItems", oItem, true);
			this._synchronizeSuggestions();
			return res;
		};

		/**
		 * Removes all suggestion items.
		 *
		 * @public
		 * @returns {boolean} Determines whether the suggestion items are removed.
		 */
		Input.prototype.removeAllSuggestionItems = function() {
			var res = this.removeAllAggregation("suggestionItems", true);
			this._synchronizeSuggestions();
			return res;
		};

		/**
		 * Destroys suggestion items.
		 *
		 * @public
		 * @return {this} this Input instance for chaining.
		 */
		Input.prototype.destroySuggestionItems = function() {
			this.destroyAggregation("suggestionItems", true);
			this._synchronizeSuggestions();
			return this;
		};

		/**
		 * Adds suggestion row.
		 *
		 * @public
		 * @param {sap.ui.core.Item} oItem Suggestion item.
		 * @return {this} this Input instance for chaining.
		 */
		Input.prototype.addSuggestionRow = function(oItem) {
			oItem.setType(ListType.Active);
			this.addAggregation("suggestionRows", oItem);
			this._synchronizeSuggestions();
			this._createSuggestionPopupContent(true);
			return this;
		};

		/**
		 * Inserts suggestion row.
		 *
		 * @public
		 * @param {sap.ui.core.Item} oItem Suggestion row
		 * @param {int} iIndex Row index.
		 * @return {this} this Input instance for chaining.
		 */
		Input.prototype.insertSuggestionRow = function(oItem, iIndex) {
			oItem.setType(ListType.Active);
			this.insertAggregation("suggestionRows", oItem, iIndex);
			this._synchronizeSuggestions();
			this._createSuggestionPopupContent(true);
			return this;
		};

		/**
		 * Removes suggestion row.
		 *
		 * @public
		 * @param {sap.ui.core.Item} oItem Suggestion row.
		 * @returns {boolean} Determines whether the suggestion row is removed.
		 */
		Input.prototype.removeSuggestionRow = function(oItem) {
			var res = this.removeAggregation("suggestionRows", oItem);
			this._synchronizeSuggestions();
			return res;
		};

		/**
		 * Removes all suggestion rows.
		 *
		 * @public
		 * @returns {boolean} Determines whether the suggestion rows are removed.
		 */
		Input.prototype.removeAllSuggestionRows = function() {
			var res = this.removeAllAggregation("suggestionRows");
			this._synchronizeSuggestions();
			return res;
		};

		/**
		 * Destroys all suggestion rows.
		 *
		 * @public
		 * @return {this} this Input instance for chaining.
		 */
		Input.prototype.destroySuggestionRows = function() {
			this.destroyAggregation("suggestionRows");
			this._synchronizeSuggestions();
			return this;
		};

		Input.prototype.bindAggregation = function() {
			if (arguments[0] === "suggestionRows" || arguments[0] === "suggestionColumns" || arguments[0] === "suggestionItems") {
				this._createSuggestionPopupContent(arguments[0] === "suggestionRows" || arguments[0] === "suggestionColumns");
				this._bBindingUpdated = true;
			}
			return InputBase.prototype.bindAggregation.apply(this, arguments);
		};

		/**
		 * Closes suggestion popup.
		 *
		 * @private
		 */
		Input.prototype._closeSuggestionPopup = function() {

			if (this._isSuggestionsPopoverInitiated()) {
				this._bShouldRefreshListItems = false;
				this.cancelPendingSuggest();
				this._isSuggestionsPopoverOpen() && this._getSuggestionsPopover().getPopover().close();

				// Ensure the valueStateMessage is opened after the suggestion popup is closed.
				// Only do this for desktop (not required for mobile) when the focus is on the input.
				if (!this.isMobileDevice() && this.$().hasClass("sapMInputFocused")) {
					this.openValueStateMessage();
				}
				this.$("SuggDescr").text(""); // initialize suggestion ARIA text
				this.$("inner").removeAttr("aria-activedescendant");

				this._sPrevSuggValue = null;
			}

		};

		/**
		 * Synchronize the displayed suggestion items and sets the correct selectedItem/selectedRow
		 * @private
		 */
		Input.prototype._synchronizeSuggestions = function() {
			var oSuggestionsPopover = this._isSuggestionsPopoverInitiated() && this._getSuggestionsPopover(),
				oPopupInput = oSuggestionsPopover && oSuggestionsPopover.getInput(),
				oPopupInputDomRef = oPopupInput && oPopupInput.getFocusDomRef();

			// Trigger the ListItems refresh only when the focus is on the input field or the device is phone.
			// In all other cases this instantiates list population and it might not be needed at all.
			if (document.activeElement === this.getFocusDomRef() || document.activeElement === oPopupInputDomRef) {
				this._bShouldRefreshListItems = true;
				this._refreshItemsDelayed();
			}

			if (!this.getDomRef() || this._isSuggestionsPopoverOpen()) {
				return;
			}

			this._synchronizeSelection();
		};

		/**
		 * Synchronizes the selectedItem/selectedRow, depending on the selectedKey
		 * @private
		 */
		Input.prototype._synchronizeSelection = function() {
			var sSelectedKey = this.getSelectedKey();
			if (!sSelectedKey) {
				return;
			}

			if (this.getValue() && !this.getSelectedItem() && !this.getSelectedRow()) {
				return;
			}

			this.setSelectedKey(sSelectedKey);
		};
	})();

	/**
	 * Event handler for the onFocusIn event.
	 *
	 * @public
	 * @param {jQuery.Event} oEvent On focus in event.
	 */
	Input.prototype.onfocusin = function(oEvent) {
		InputBase.prototype.onfocusin.apply(this, arguments);
		this.addStyleClass("sapMInputFocused");

		// Close the ValueStateMessage when the suggestion popup is being opened.
		// Only do this in case a popup is used.
		if (!this.isMobileDevice() && this._isSuggestionsPopoverOpen()) {
			this.closeValueStateMessage();
		}

		// fires suggest event when startSuggestion is set to 0 and input has no text
		if (this._shouldTriggerSuggest()) {
			this._triggerSuggest(this.getValue());
		}
		this._bPopupHasFocus = undefined;

		this._sPrevSuggValue = null;
	};

	/**
	 * Called when the composition of a passage of text has been completed or cancelled.
	 *
	 * @param {jQuery.Event} oEvent The event object.
	 * @private
	 */
	Input.prototype.oncompositionend = function (oEvent) {
		InputBase.prototype.oncompositionend.apply(this, arguments);

		if (!Device.browser.edge && !Device.browser.firefox) {
			this._handleTypeAhead(this);
		}
	};

	/**
	 * Handles Input's specific type ahead logic.
	 *
	 * @param oInput {sap.m.Input} Input's instance to which the type ahead would be applied. For example: this OR Dialog's Input instance.
	 * @private
	 */
	Input.prototype._handleTypeAhead = function (oInput) {
		var sValue = this.getValue();

		this._sTypedInValue = sValue;
		oInput._sProposedItemText = null;

		if (!this._bDoTypeAhead || sValue === "" ||
			sValue.length < this.getStartSuggestion() || document.activeElement !== this.getFocusDomRef()) {

			return;
		}

		var bHasTabularSuggestions = oInput._hasTabularSuggestions(),
			aItems = bHasTabularSuggestions ? oInput.getSuggestionRows() : oInput.getSuggestionItems(),
			fnExtractText = function (oItem) {
				if (!oItem) {
					return "";
				}
				return bHasTabularSuggestions ? oInput._fnRowResultFilter(oItem) : oItem.getText();
			};

		var aItemsToSelect = typeAhead(sValue, this, aItems, function (oItem) {
			return this._formatTypedAheadValue(fnExtractText(oItem));
		}.bind(this));

		oInput._sProposedItemText = fnExtractText(aItemsToSelect[0]);
	};

	/**
	 * Resets properties, that are related to type ahead, to their initial state.
	 *
	 * @param oInput {sap.m.Input} The _sProposedItemText property is always attached to the "root" input and the one in the Dialog should consider root's property.
	 * @private
	 */
	Input.prototype._resetTypeAhead = function (oInput) {
		oInput = oInput || this;

		oInput._sProposedItemText = null;
		this._sTypedInValue = '';
	};

	/**
	 * Finalizes autocomplete and fires liveChange event eventually.
	 *
	 * @protected
	 * @override
	 */
	Input.prototype.onsapright = function () {
		var sValue = this.getValue();

		if (!this.getAutocomplete()) {
			return;
		}

		if (this._sTypedInValue !== sValue) {
			this._sTypedInValue = sValue;

			this.fireLiveChange({
				value: sValue,
				// backwards compatibility
				newValue: sValue
			});
		}
	};

	/**
	 * Formats the input value
	 * in a way that it preserves character casings typed by the user
	 * and appends suggested value with casings as they are in the
	 * corresponding suggestion item.
	 *
	 * @private
	 * @param {string} sNewValue Value which will be formatted.
	 * @returns {string} The new formatted value.
	 */
	Input.prototype._formatTypedAheadValue = function (sNewValue) {
		if (sNewValue.toLowerCase().indexOf(this._sTypedInValue.toLowerCase()) === 0) {
			return this._sTypedInValue.concat(sNewValue.substring(this._sTypedInValue.length, sNewValue.length));
		} else {
			return sNewValue;
		}
	};

	/**
	 * Register F4 to trigger the valueHelpRequest event
	 *
	 * @private
	 * @param {jQuery.Event} oEvent Keyboard event.
	 */
	Input.prototype.onsapshow = function (oEvent) {
		if (!this.getEnabled() || !this.getEditable() || !this.getShowValueHelp()) {
			return;
		}

		this.bValueHelpRequested = true;
		this._fireValueHelpRequest(false);
		oEvent.preventDefault();
		oEvent.stopPropagation();
	};

	Input.prototype.onsaphide = Input.prototype.onsapshow;

	/**
	 * Event handler for input select.
	 *
	 * @private
	 * @param {jQuery.Event} oEvent Keyboard event.
	 */
	Input.prototype.onsapselect = function(oEvent) {
		this._fireValueHelpRequestForValueHelpOnly();
	};

	/**
	 * Event handler for the onFocusOut event.
	 *
	 * @private
	 * @param {jQuery.Event} oEvent Keyboard event.
	 */
	Input.prototype.onfocusout = function (oEvent) {
		InputBase.prototype.onfocusout.apply(this, arguments);
		this.removeStyleClass("sapMInputFocused");
		this.$("SuggDescr").text(""); // clear suggestion text, if any
	};

	/**
	 * Check for tabular suggestions in the input.
	 *
	 * @private
	 * @returns {boolean} Determines if the Input has tabular suggestions.
	 */
	Input.prototype._hasTabularSuggestions = function() {
		return !!(this.getAggregation("suggestionColumns") && this.getAggregation("suggestionColumns").length);
	};

	/**
	 * Gets suggestion table with lazy loading.
	 *
	 * @private
	 * @returns {sap.m.Table|null} Suggestion table or <code>null</code> in case the control is currently being destroyed.
	 */
	Input.prototype._getSuggestionsTable = function () {
		// this._bIsBeingDestroyed was added here, as if the Input is in process of destruction
		// and there is no suggestions table created, there is no need to create one.
		// In case there was suggestions table present, it was already destroyed by the 'exit' method.
		if (this._bIsBeingDestroyed) {
			return null;
		}

		if (!this._oSuggestionsTable) {
			this._oSuggestionsTable = this._createSuggestionsTable();
		}

		return this._oSuggestionsTable;
	};

	/**
	 * Creates the suggestions table
	 *
	 * @private
	 * @returns {sap.m.Table} The newly created suggestions table.
	 */
	Input.prototype._createSuggestionsTable = function () {
		var oSuggestionsTable = new Table(this.getId() + "-popup-table", {
			mode: ListMode.SingleSelectMaster,
			showNoData: false,
			showSeparators: ListSeparators.None,
			width: "100%",
			enableBusyIndicator: false,
			rememberSelections : false,
			itemPress: function (oEvent) {
				if (Device.system.desktop) {
					this.focus();
				}
				var oSelectedListItem = oEvent.getParameter("listItem");
				this.setSelectionRow(oSelectedListItem, true);
			}.bind(this),
			sticky: [library.Sticky.ColumnHeaders]
		});

		oSuggestionsTable.addEventDelegate({
			onAfterRendering: function () {
				var aTableCellsDomRef;

				if (!this.getEnableSuggestionsHighlighting()) {
					return;
				}

				aTableCellsDomRef = oSuggestionsTable.$().find('tbody .sapMLabel');

				highlightDOMElements(aTableCellsDomRef, this._sTypedInValue);
			}
		}, this);

		// initially hide the table on phone
		if (this.isMobileDevice()) {
			oSuggestionsTable.addStyleClass("sapMInputSuggestionTableHidden");
		}

		oSuggestionsTable.updateItems = function() {
			Table.prototype.updateItems.apply(this, arguments);
			this._refreshItemsDelayed();
			return this;
		};

		return oSuggestionsTable;
	};


	/**
	 * Clones input.
	 *
	 * @public
	 * @returns {this} Cloned input.
	 */
	Input.prototype.clone = function() {
		var oInputClone = InputBase.prototype.clone.apply(this, arguments);

		oInputClone.setRowResultFunction(this._fnRowResultFilter);

		// because of the "selectedKey", the input value can be reset,
		// make sure it is the same as the original
		oInputClone.setValue(this.getValue());

		return oInputClone;
	};

	/* =========================================================== */
	/*           end: forward aggregation methods to table         */
	/* =========================================================== */

	/**
	 * Setter for property <code>value</code>.
	 *
	 * Default value is empty/<code>undefined</code>.
	 *
	 * @param {string} sValue New value for property <code>value</code>.
	 * @return {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	Input.prototype.setValue = function(sValue) {
		this._iSetCount++;
		InputBase.prototype.setValue.call(this, sValue);
		this._onValueUpdated(sValue);
		return this;
	};

	/**
	 * Sets the inner input DOM value.
	 *
	 * @protected
	 * @param {string} value Dom value which will be set.
	 */
	Input.prototype.setDOMValue = function(value) {
		this._$input.val(value);
	};

	/**
	 * Gets the inner input DOM value.
	 *
	 * @protected
	 * @returns {any} The value of the input.
	 */
	Input.prototype.getDOMValue = function() {
		return this._$input.val();
	};

	Input.prototype._getInputValue = function() {
		var sValue = InputBase.prototype._getInputValue.apply(this, arguments);

		if (this.getMaxLength() > 0) {
			sValue = sValue.substring(0, this.getMaxLength());
		}

		return sValue;
	};

	Input.prototype.setMaxLength = function (iLength) {
		iLength = this.validateProperty("maxLength", iLength);
		this.setProperty("maxLength", iLength);
		this.updateDomValue(this.getProperty("value"));

		return this;
	};

	/**
	 * Updates the inner input field.
	 *
	 * @protected
	 */
	Input.prototype.updateInputField = function(sNewValue) {
		if (this._isSuggestionsPopoverOpen() && this.isMobileDevice()) {
			this._getSuggestionsPopover().getInput()
				.setValue(sNewValue)
				._doSelect();
		} else {
			// call _getInputValue to apply the maxLength to the typed value
			sNewValue = this._getInputValue(sNewValue);
			this.setDOMValue(sNewValue);
			this.onChange(null, null, sNewValue);
		}
	};

	/**
	 * Gets accessibility information for the input.
	 *
	 * @see sap.ui.core.Control#getAccessibilityInfo
	 * @protected
	 * @returns {object} Accessibility information.
	 */
	Input.prototype.getAccessibilityInfo = function() {
		var oInfo = InputBase.prototype.getAccessibilityInfo.apply(this, arguments);
		oInfo.description = ((oInfo.description || "") + " " + this.getDescription()).trim();
		return oInfo;
	};

	/**
	 * Getter for property <code>valueStateText</code>.
	 * The text which is shown in the value state message popup. If not specfied a default text is shown. This property is already available for sap.m.Input since 1.16.0.
	 *
	 * Default value is empty/<code>undefined</code>
	 *
	 * @return {string} the value of property <code>valueStateText</code>
	 * @public
	 * @since 1.16
	 * @name sap.m.Input#getValueStateText
	 * @function
	 */

	/**
	 * Setter for property <code>valueStateText</code>.
	 *
	 * Default value is empty/<code>undefined</code>
	 *
	 * @param {string} sValueStateText new value for property <code>valueStateText</code>
	 * @returns {this} <code>this</code> to allow method chaining
	 * @public
	 * @since 1.16
	 * @name sap.m.Input#setValueStateText
	 * @function
	 */

	/**
	 * Getter for property <code>showValueStateMessage</code>.
	 * Whether the value state message should be shown. This property is already available for sap.m.Input since 1.16.0.
	 *
	 * Default value is <code>true</code>
	 *
	 * @return {boolean} the value of property <code>showValueStateMessage</code>
	 * @public
	 * @since 1.16
	 * @name sap.m.Input#getShowValueStateMessage
	 * @function
	 */

	/**
	 * Setter for property <code>showValueStateMessage</code>.
	 *
	 * Default value is <code>true</code>
	 *
	 * @param {boolean} bShowValueStateMessage  new value for property <code>showValueStateMessage</code>
	 * @return {this} <code>this</code> to allow method chaining
	 * @public
	 * @since 1.16
	 * @name sap.m.Input#setShowValueStateMessage
	 * @function
	 */

	/**
	 * Hook method to prevent the change event from being fired when the text input field loses focus.
	 *
	 * @param {jQuery.Event} [oEvent] The event object.
	 * @returns {boolean} Whether or not the change event should be prevented.
	 * @protected
	 * @since 1.46
	 */
	Input.prototype.preventChangeOnFocusLeave = function(oEvent) {
		return this.bFocusoutDueRendering || this.bValueHelpRequested;
	};

	/**
	 * Gets show more button from SuggestionsPopover's Popover/Dialog.
	 *
	 * @private
	 * @return {sap.m.Button} Show more button.
	 */
	Input.prototype._getShowMoreButton = function() {
		return this._getSuggestionsPopover().getShowMoreButton();
	};

	/**
	 * Show more button press handler.
	 *
	 * @private
	 */
	Input.prototype._getShowMoreButtonPress = function() {
		var sTypedInValue;

		if (this.getShowTableSuggestionValueHelp()) {

			// request for value help interrupts autocomplete
			if (this._sTypedInValue) {
				sTypedInValue = this._sTypedInValue;
				this.updateDomValue(sTypedInValue);
				this._resetTypeAhead();
				// Resetting the Suggestions popover clears the typed in value.
				// However, we need to keep it in this case as the fireValueHelpRequest will need to pass this information.
				this._sTypedInValue =  sTypedInValue;
			}

			this._fireValueHelpRequest(true);
			this._closeSuggestionPopup();
		}
	};

	/**
	 * Adds a show more button to the footer of the tabular suggestion popup/dialog.
	 *
	 * @private
	 * @param{boolean} [bTabular] optional parameter to force override the tabular suggestions check
	 */
	Input.prototype._addShowMoreButton = function() {
		var oSuggestionsPopover = this._isSuggestionsPopoverInitiated() && this._getSuggestionsPopover();
		var oPopup = oSuggestionsPopover && oSuggestionsPopover.getPopover();

		if (!oPopup || !this._hasTabularSuggestions() || this._getShowMoreButton()) {
			return;
		}

		var oShowMoreButton = new Button({
			text : this._oRb.getText("INPUT_SUGGESTIONS_SHOW_ALL"),
			press : this._getShowMoreButtonPress.bind(this)
		});

		if (oPopup.isA("sap.m.Dialog")) {
			oSuggestionsPopover.setShowMoreButton(oShowMoreButton);
		} else {
			oSuggestionsPopover.setShowMoreButton(new Toolbar({
				content: [new ToolbarSpacer(), oShowMoreButton]
			}));
		}
	};

	/**
	 * Removes the show more button from the footer of the tabular suggestion popup/dialog.
	 *
	 * @private
	 */
	Input.prototype._removeShowMoreButton = function() {
		var oSuggestionsPopover = this._isSuggestionsPopoverInitiated() && this._getSuggestionsPopover();
		var oPopup = oSuggestionsPopover && oSuggestionsPopover.getPopover();

		if (oPopup && this._hasTabularSuggestions() && this._getShowMoreButton()) {
			oSuggestionsPopover.removeShowMoreButton();
		}
	};

	Input.prototype._hasShowSelectedButton = function () {return false;};

	/**
	 * Helper function that creates content for the suggestion popup.
	 *
	 * @param {boolean} bTabular Determines whether the popup content is a table or a list.
	 * @private
	 */
	Input.prototype._createSuggestionPopupContent = function(bTabular) {
		var oSuggestionsPopover = this._getSuggestionsPopover();
		// only initialize the content once
		if (this._bIsBeingDestroyed || !oSuggestionsPopover || oSuggestionsPopover.getItemsContainer()) {
			return;
		}

		this._getSuggestionsPopover().initContent(this.getId(), bTabular ? this._getSuggestionsTable() : null);

		if (!this._hasTabularSuggestions() && !bTabular) {
			this._decorateSuggestionsPopoverList(this._getSuggestionsPopover().getItemsContainer());
		} else {
			this._decorateSuggestionsPopoverTable();
		}
	};

	/**
	 * Decorates SuggestionsPopover list.
	 *
	 * @param oList {sap.m.List}
	 * @private
	 */
	Input.prototype._decorateSuggestionsPopoverList = function (oList) {
		if (!oList || !oList.isA("sap.m.List")) {
			return;
		}
		oList.addEventDelegate({
			onAfterRendering: function () {
				var aListItemsDomRef, sInputValue;

				if (!this.getEnableSuggestionsHighlighting()) {
					return;
				}

				aListItemsDomRef = oList.$().find('.sapMSLIInfo, .sapMSLITitleOnly');
				sInputValue = this._bDoTypeAhead ? this._sTypedInValue : this.getValue();
				sInputValue = (sInputValue || "").toLowerCase();

				highlightDOMElements(aListItemsDomRef, sInputValue);
			}
		}, this);

		oList.attachItemPress(function (oEvent) {
			if (Device.system.desktop) {
				this.focus();
			}
			var oListItem = oEvent.getParameter("listItem");

			if (!oListItem.isA("sap.m.GroupHeaderListItem")) {
				this.setSelectionItem(ListHelpers.getItemByListItem(this.getSuggestionItems(), oListItem), true);
			}
		}, this);
	};

	/**
	 * Decorates SuggestionsPopover table and makes adjustments to the formatting functions.
	 *
	 * @private
	 */
	Input.prototype._decorateSuggestionsPopoverTable = function () {
		// tabular suggestions
		// if no custom filter is set we replace the default filter function here
		if (this._fnFilter === inputsDefaultFilter) {
			this._fnFilter = Input._DEFAULTFILTER_TABULAR;
		}

		// if not custom row result function is set we set the default one
		if (!this._fnRowResultFilter) {
			this._fnRowResultFilter = Input._DEFAULTRESULT_TABULAR;
		}

		if (this.getShowTableSuggestionValueHelp()) {
			this._addShowMoreButton();
		}
	};

	/**
	 * Modifies Dialog's Input instance
	 *
	 * @param oInput {sap.m.Input}
	 * @returns {sap.m.Input}
	 * @private
	 * @ui5-restricted
	 */
	Input.prototype._decoratePopupInput = function (oInput) {
		if (!oInput) {
			return;
		}

		oInput.setValueLiveUpdate(true);
		oInput.setValueState(this.getValueState());
		oInput.setShowValueHelp(this.getShowValueHelp());

		oInput.attachValueHelpRequest(function () {
			// it is the same behavior as by ShowMoreButton:
			this.fireValueHelpRequest({fromSuggestions: true});
			this._getSuggestionsPopover().iPopupListSelectedIndex = -1;
			this._closeSuggestionPopup();
		}.bind(this));

		oInput.attachLiveChange(function (oEvent) {
			var sValue = oEvent.getParameter("newValue");
			// call _getInputValue to apply the maxLength to the typed value
			this.setDOMValue(this._getInputValue(this._getSuggestionsPopover().getInput().getValue()));

			this._triggerSuggest(sValue);

			// make sure the live change handler on the original input is also called
			this.fireLiveChange({
				value: sValue,

				// backwards compatibility
				newValue: sValue
			});
		}.bind(this));

		oInput._handleTypeAhead = function () {
			Input.prototype._handleTypeAhead.call(oInput, this);
		}.bind(this);

		oInput._resetTypeAhead = function () {
			Input.prototype._resetTypeAhead.call(oInput, this);
		}.bind(this);

		oInput.addEventDelegate({
			onsapenter: function () {
				this.setValue(this._sProposedItemText);
			}
		}, this);

		return oInput;
	};

	Input.prototype.forwardEventHandlersToSuggPopover = function (oSuggPopover) {
		oSuggPopover.setOkPressHandler(this._closeSuggestionPopup.bind(this));
		oSuggPopover.setCancelPressHandler(this._closeSuggestionPopup.bind(this));
	};

	/**
	 * Lazily retrieves the <code>SuggestionsPopover</code>.
	 *
	 * @returns {sap.m.SuggestionsPopover} A suggestion popover instance.
	 * @private
	 */
	Input.prototype._getSuggestionsPopover = function () {
		if (!this._isSuggestionsPopoverInitiated()) {
			var oSuggPopover = this._oSuggPopover = new SuggestionsPopover(this);

			oSuggPopover.decorateParent(this);
			oSuggPopover.setInputLabels(this.getLabels.bind(this));
			this._createSuggestionsPopoverPopup();

			this.forwardEventHandlersToSuggPopover(oSuggPopover);

			oSuggPopover.attachEvent(SuggestionsPopover.M_EVENTS.SELECTION_CHANGE, function (oEvent) {
				var oItem = oEvent.getParameter("newItem"),
					sNewValue = this.calculateNewValue(oItem),
					bFocusedGroupHeader = oItem && oItem.isA("sap.m.GroupHeaderListItem"),
					oFocusDomRef = this.getFocusDomRef(),
					sTypedValue = oFocusDomRef && oFocusDomRef.value.substring(0, oFocusDomRef.selectionStart),
					oPreviousItem, bPreviosFocusOnGroup, iSelectionStart;

				// setValue isn't used because here is too early to modify the lastValue of input
				this.setDOMValue(bFocusedGroupHeader ? sTypedValue : sNewValue);

				// memorize the value set by calling jQuery.val, because browser doesn't fire a change event when the value is set programmatically.
				this._sSelectedSuggViaKeyboard = sNewValue;

				if (!bFocusedGroupHeader && (sNewValue.toLowerCase() !== this.getValue().toLowerCase())) {
					oPreviousItem = oEvent.getParameter("previousItem");
					bPreviosFocusOnGroup = oPreviousItem && oPreviousItem.isA("sap.m.GroupHeaderListItem");
					iSelectionStart = calculateSelectionStart(selectionRange(oFocusDomRef, bPreviosFocusOnGroup), sNewValue, sTypedValue, bPreviosFocusOnGroup);

					this._doSelect(iSelectionStart);
				}
			}, this);

			if (this.getShowTableSuggestionValueHelp()) {
				this._addShowMoreButton();
			}
		}

		return this._oSuggPopover;
	};

	/**
	 * Calculates the correct input value to be applied, depending on the newly selected suggestion.
	 *
	 * @param {sap.m.GroupHeaderListItem | sap.m.StandardListItem | sap.m.ColumnListItem} oListItem The selected item
	 * @returns {string} The input value to be applied
	 * @private
	 */
	Input.prototype.calculateNewValue = function (oListItem) {
		if (!oListItem || (oListItem && oListItem.isA("sap.m.GroupHeaderListItem"))) {
			return "";
		}

		if (oListItem.isA("sap.m.ColumnListItem")) {
			return this._getInputValue(this._fnRowResultFilter(oListItem));
		}

		if (oListItem.isA("sap.m.StandardListItem")) {
			return this._getInputValue(oListItem.getTitle());
		}
	};

	/**
	 * Creates a suggestion popover popup.
	 *
	 * @private
	 */
	Input.prototype._createSuggestionsPopoverPopup = function () {
		if (!this._isSuggestionsPopoverInitiated()) {
			return;
		}

		var oSuggPopover = this._getSuggestionsPopover();
		var oPopover;
		oSuggPopover.createSuggestionPopup(this, { showSelectedButton: this._hasShowSelectedButton() });
		this._decoratePopupInput(oSuggPopover.getInput());

		oPopover = oSuggPopover.getPopover();
		oPopover.attachBeforeOpen(function () {
			this._updateSuggestionsPopoverValueState();
		}, this);

		oPopover.attachBeforeClose(function () {
			this._updateSuggestionsPopoverValueState();
		}, this);

		if (this.isMobileDevice()) {
			oPopover
				.attachBeforeClose(function () {
					// call _getInputValue to apply the maxLength to the typed value
					this.setDOMValue(this
						._getInputValue(oSuggPopover.getInput()
							.getValue()));
					this.onChange();
				}, this)
				.attachAfterClose(function() {
					var oList = oSuggPopover.getItemsContainer();

					if (!oList) {
						return;
					}

					if (Table && !(oList instanceof Table)) {
						oList.destroyItems();
					} else {
						oList.removeSelections(true);
					}
				})
				.attachAfterOpen(function () {
					this._triggerSuggest(this.getValue());
					this._refreshListItems();
				}, this)
				.attachBeforeOpen(function() {
					var oSuggestionsInput = oSuggPopover.getInput();
					// set the same placeholder and maxLength as the original input
					oSuggestionsInput.setPlaceholder(this.getPlaceholder());
					oSuggestionsInput.setMaxLength(this.getMaxLength());
					oSuggestionsInput.setValue(this.getValue());
				}, this);
		} else {
			oPopover
				.attachAfterClose(function() {
					var oList = this._getSuggestionsPopover().getItemsContainer(),
						oSelectedItem = oList && oList.getSelectedItem();

					if (this.getSelectionUpdatedFromList()) {
						this.updateSelectionFromList(oSelectedItem);
					}

					if (!oList) {
						return;
					}

					// only destroy items in simple suggestion mode
					if (oList instanceof Table) {
						oSelectedItem && oSelectedItem.removeStyleClass("sapMLIBFocused");
						oList.removeSelections(true);
					} else {
						oList.destroyItems();
					}

					this._deregisterPopupResize();
				}, this)
				.attachBeforeOpen(function () {
					oSuggPopover._sPopoverContentWidth = this.getMaxSuggestionWidth();

					this.setBeforeSuggestValue(this._sTypedInValue || this.getValue());
					oSuggPopover.resizePopup(this);
					this._registerPopupResize();
				}, this);
		}

		// add popup to a hidden aggregation to also propagate the model and bindings to the content of the popover
		this.setAggregation("_suggestionPopup", oPopover);

		this._oSuggestionPopup = oPopover; // for backward compatibility (used in some other controls)
	};

	/**
	 * Sets the input value before the suggest.
	 *
	 * @param {string} sValue The value to be set
	 * @private
	 */
	Input.prototype.setBeforeSuggestValue = function (sValue) {
		this._sBeforeSuggest = sValue;
	};

	/**
	 * Gets the input value before the suggest.
	 *
	 * @returns {string} The string value before the sugger
	 * @private
	 */
	Input.prototype.getBeforeSuggestValue = function () {
		return this._sBeforeSuggest;
	};

	/**
	 * Registers Popover resize handler
	 *
	 * @private
	 */
	Input.prototype._registerPopupResize = function () {
		var oSuggestionsPopover;

		if (this._isSuggestionsPopoverInitiated()) {
			oSuggestionsPopover = this._getSuggestionsPopover();
			this._sPopupResizeHandler = ResizeHandler.register(this, oSuggestionsPopover.resizePopup.bind(oSuggestionsPopover, this));
		}
	};

	/**
	 * Removes Popover's resize handler
	 *
	 * @private
	 */
	Input.prototype._deregisterPopupResize = function () {
		if (this._sPopupResizeHandler) {
			this._sPopupResizeHandler = ResizeHandler.deregister(this._sPopupResizeHandler);
		}
	};

	/**
	 * Opens the <code>SuggestionsPopover</code> with the available items.
	 *
	 * @param {function} fnFilter Function to filter the items shown in the SuggestionsPopover
	 * @returns {void}
	 *
	 * @since 1.64
	 * @experimental Since 1.64
	 * @public
	 */
	Input.prototype.showItems = function (fnFilter) {
		var oFilterResults, iSuggestionsLength,
			fnFilterStore = this._fnFilter;

		// in case of a non-editable or disabled, the popup cannot be opened
		if (!this.getEnabled() || !this.getEditable()) {
			return;
		}

		// Replace the filter with provided one or show all the items
		this.setFilterFunction(fnFilter || function () {
			return true;
		});

		this._clearSuggestionPopupItems();

		oFilterResults = this._getFilteredSuggestionItems(this.getDOMValue());
		iSuggestionsLength = this.getSuggestionsCount(oFilterResults);

		if (iSuggestionsLength > 0) {
			this._openSuggestionPopup();
		} else {
			this._hideSuggestionPopup();
		}

		this._applySuggestionAcc(iSuggestionsLength);

		this.setFilterFunction(fnFilterStore); // Restore filtering function
	};

	Input.prototype.shouldValueStateMessageBeOpened = function() {
		var bShouldValueStateMessageBeOpened = InputBase.prototype.shouldValueStateMessageBeOpened.apply(this, arguments);

		if (!bShouldValueStateMessageBeOpened || this._isSuggestionsPopoverOpen()) {
			return false;
		}

		return true;
	};

	/**
	 * Checks if the suggestion popover is currently opened.
	 *
	 * @return {boolean} whether the suggestions popover is currently opened
	 * @private
	 */
	Input.prototype._isSuggestionsPopoverOpen = function () {
		return this._isSuggestionsPopoverInitiated() &&
			this._getSuggestionsPopover().isOpen();
	};

	/**
	 * Checks whether the SuggestionsPopover is initiated;
	 * @returns {boolean}
	 * @private
	 */
	Input.prototype._isSuggestionsPopoverInitiated = function() {
		return !!this._oSuggPopover;
	};

	/**
	 * Indicates whether the control should use <code>sap.m.Dialog</code> or not.
	 *
	 * @returns {Boolean} Boolean.
	 * @protected
	 */
	Input.prototype.isMobileDevice = function () {
		return Device.system.phone;
	};

	/**
	 * Opens the suggestions popover
	 *
	 * @private
	 */
	Input.prototype._openSuggestionsPopover = function() {
		this.closeValueStateMessage();
		this._updateSuggestionsPopoverValueState();
		this._getSuggestionsPopover().getPopover().open();
	};

	/**
	 * Updates the suggestions popover value state
	 *
	 * @private
	 */
	Input.prototype._updateSuggestionsPopoverValueState = function() {
		var oSuggPopover = this._getSuggestionsPopover(),
			sValueState = this.getValueState(),
			bNewValueState = this.getValueState() !== oSuggPopover._getValueStateHeader().getValueState(),
			oNewFormattedValueStateText = this.getFormattedValueStateText(),
			sValueStateText = this.getValueStateText();

		if (!oSuggPopover) {
			return;
		}

		/*  If open and no new FormattedText or value state is set to the Input then this is called
		onBeforeClose of the SuggestionsPopover. Switch the value state aggregation's
		parent from the ValueStateHeader to the Input control */
		if (this._isSuggestionsPopoverOpen() && !oNewFormattedValueStateText && !bNewValueState) {
			this.setFormattedValueStateText(oSuggPopover._getValueStateHeader().getFormattedText());
		}

		oSuggPopover.updateValueState(sValueState, (oNewFormattedValueStateText || sValueStateText), this.getShowValueStateMessage());

		if (this.isMobileDevice()) {
			oSuggPopover.getInput().setValueState(sValueState);
		}
	};

	Input.prototype.setShowValueHelp = function (bShowValueHelp) {
		var oSuggestionsPopoverInput = this._isSuggestionsPopoverInitiated() &&
			this._getSuggestionsPopover().getInput();

		this.setProperty("showValueHelp", bShowValueHelp);
		if (oSuggestionsPopoverInput) {
			oSuggestionsPopoverInput.setShowValueHelp(bShowValueHelp);
		}

		return this;
	};

	/**
	 * Gets the supported openers for the valueHelpOnly.
	 * In the context of the Input, all targets are valid.
	 *
	 * @protected
	 * @param {HTMLElement|undefined} oTarget The target of the event.
	 * @returns {Boolean} Boolean indicating if the target is a valid opener.
	 */
	Input.prototype.isValueHelpOnlyOpener = function (oTarget) {
		return true;
	};

	/* =========================================================== */
	/* Filtering                                                   */
	/* =========================================================== */

	/**
	 * Gets filtered items.
	 * Table/List item agnostic.
	 *
	 * @param {String} sValue The value, to be used as a filter
	 * @returns {Object} A filtering result object, containing the matching items and list groups
	 * @private
	 */
	Input.prototype._getFilteredSuggestionItems = function (sValue) {
		var oFilterResults,
			aItems = this.getSuggestionItems(),
			aTabularRows = this.getSuggestionRows(),
			oList = this._getSuggestionsPopover().getItemsContainer();

		if (this._hasTabularSuggestions()) {
			// show list on phone (is hidden when search string is empty)
			if (this.isMobileDevice() && oList) {
				oList.removeStyleClass("sapMInputSuggestionTableHidden");
			}

			oFilterResults = this.filterTabularItems(aTabularRows, sValue);
		} else {
			oFilterResults = filterItems(
				this, // control instance
				aItems, // array of items to be filtered
				sValue, // the value, to be used as a filter
				this.getFilterSuggests(), // boolean that determines if the suggestions should be filtered
				true, // filter also by secondary values
				this._fnFilter // the filter function
			);
			this._mapItems(oFilterResults);
		}
		return oFilterResults;
	};

	/**
	 * Filters tabular suggestions.
	 *
	 * @private
	 * @param {Array} aTabularRows Array of table rows
	 * @param {String} sValue The value, to be used as a filter
	 * @returns {Object} A filtering result object, containing the matching items and list groups
	 */
	Input.prototype.filterTabularItems = function (aTabularRows, sValue) {
		var bShowItem,
			bFilter = this.getFilterSuggests(),
			aFilteredItems = [],
			aGroups = [],
			bIsAnySuggestionAlreadySelected = false;

		// filter tabular items
		aTabularRows.forEach(function(oTabularRow) {
			if (oTabularRow.isA("sap.m.GroupHeaderListItem")) {
				aGroups.push({
					header: oTabularRow,
					visible: false
				});
			} else {
				bShowItem = !bFilter || this._fnFilter(sValue, oTabularRow);

				oTabularRow.setVisible(bShowItem);
				bShowItem && aFilteredItems.push(oTabularRow);

				if (!bIsAnySuggestionAlreadySelected && bShowItem && this._sProposedItemText === this._fnRowResultFilter(oTabularRow)) {
					oTabularRow.setSelected(true);
					bIsAnySuggestionAlreadySelected = true;
				}

				if (aGroups.length && bShowItem) {
					aGroups[aGroups.length - 1].visible = true;
				}
			}
		}, this);

		aGroups.forEach(function(oGroup){
			oGroup.header.setVisible(oGroup.visible);
		});

		this._getSuggestionsTable().invalidate();

		return {
			items: aFilteredItems,
			groups: aGroups
		};
	};

	/**
	 * Calls the mapping method, sets the list selection and updates the visibility of groups headers.
	 *
	 * @param {Object} oFilterResults A filtering result object, containing the matching items and list groups
	 * @private
	 */
	Input.prototype._mapItems = function (oFilterResults) {
		var aItems = this.getSuggestionItems(),
			aFilteredItems = oFilterResults.items,
			aGroups = oFilterResults.groups,
			aMappedGroups = aGroups.map(function (aGroupItem) { return aGroupItem.header; }),
			bIsAnySuggestionAlreadySelected = false,
			oList = this._getSuggestionsPopover().getItemsContainer(),
			oListItem, iGroupItemIndex;

		aItems
			.filter(function (oItem) {
				return (aFilteredItems.indexOf(oItem) > -1) ||
					(aMappedGroups.indexOf(oItem) > -1);
			})
			.map(function (oItem) {
				oListItem = ListHelpers.createListItemFromCoreItem(oItem, true);
				oList.addItem(oListItem);

				if (!bIsAnySuggestionAlreadySelected && this._sProposedItemText === oItem.getText()) {
					oListItem.setSelected(true);
					bIsAnySuggestionAlreadySelected = true;
				}

				return oItem;
			}, this)
			.filter(function (oItem) {
				return aMappedGroups.indexOf(oItem) > -1;
			})
			.forEach(function (oGroupItem) {
				iGroupItemIndex = aMappedGroups.indexOf(oGroupItem);

				if (iGroupItemIndex > -1) {
					oListItem = ListHelpers.getListItem(oGroupItem);
					oListItem && oListItem.setVisible(aGroups[iGroupItemIndex].visible);
				}
			});
	};

	return Input;

});