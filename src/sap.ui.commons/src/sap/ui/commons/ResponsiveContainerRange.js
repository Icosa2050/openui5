/*!
 * ${copyright}
 */

// Provides control sap.ui.commons.ResponsiveContainerRange.
sap.ui.define(['./library', 'sap/ui/core/Element'],
	function(library, Element) {
	"use strict";



	/**
	 * Constructor for a new ResponsiveContainerRange.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * Defines a range for the ResponsiveContainer
	 * @extends sap.ui.core.Element
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @deprecated as of version 1.38 (altogether with sap.ui.commons.ResponsiveContainer). Use a container of your choice from the sap.m library instead.
	 * @alias sap.ui.commons.ResponsiveContainerRange
	 */
	var ResponsiveContainerRange = Element.extend("sap.ui.commons.ResponsiveContainerRange", /** @lends sap.ui.commons.ResponsiveContainerRange.prototype */ { metadata : {

		library : "sap.ui.commons",
		deprecated: true,
		properties : {

			/**
			 * The minimal width for this range to be displayed.
			 */
			width : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : ''},

			/**
			 * The minimal height for this range to be displayed.
			 */
			height : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : ''},

			/**
			 * A key which can be used to identify the range (optional).
			 */
			key : {type : "string", group : "Misc", defaultValue : ''}
		},
		associations : {

			/**
			 * The content to show for this range (optional).
			 */
			content : {type : "sap.ui.core.Control", multiple : false}
		}
	}});



	return ResponsiveContainerRange;

});