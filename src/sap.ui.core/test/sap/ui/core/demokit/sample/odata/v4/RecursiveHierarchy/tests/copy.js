/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/sample/common/pages/Any",
	"sap/ui/core/sample/odata/v4/RecursiveHierarchy/pages/Main",
	"sap/ui/test/TestUtils"
], function (_Any, _Main, TestUtils) {
	"use strict";

	return function (Given, When, Then) {
		function checkTable(sComment, iExpectedFirstVisibleRow, sExpected) {
			Then.onTheMainPage.checkTable(sComment, sExpected, /*bCheckName*/true,
				/*bCheckAge*/false, iExpectedFirstVisibleRow);
		}

		function copyAsLastChildOf(sId, sParent, sComment) {
			When.onTheMainPage.copyAsLastChildOf(sId, sParent, sComment);
		}

		function copyAsLastRoot(sId, sComment) {
			When.onTheMainPage.copyAsLastRoot(sId, sComment);
		}

		function copyJustBeforeSibling(sId, sSibling, sComment) {
			When.onTheMainPage.copyJustBeforeSibling(sId, sSibling, sComment);
		}

		function copyToParent(sId, sParent, sComment) {
			When.onTheMainPage.copyToParent(sId, sParent, sComment);
		}

		function copyToRoot(sId, sComment) {
			When.onTheMainPage.copyToRoot(sId, sComment);
		}

		TestUtils.setData("sap.ui.core.sample.odata.v4.RecursiveHierarchy.expandTo", "3");
		TestUtils.setData("sap.ui.core.sample.odata.v4.RecursiveHierarchy.visibleRowCount", "6");

		Given.iStartMyUIComponent({
			autoWait : true,
			componentConfig : {
				name : "sap.ui.core.sample.odata.v4.RecursiveHierarchy"
			}
		});

		Then.onAnyPage.iTeardownMyUIComponentInTheEnd();

		checkTable("Initial state", 0, `
- 0 Alpha
	- 1 Beta
		+ 1.1 Gamma
		+ 1.2 Zeta
	* 2 Kappa
	* 3 Lambda`);

		copyToParent("1", "2", "Copy 1 (Beta) to 2 (Kappa)");
		checkTable("After copy 1 to 2", 0, `
- 0 Alpha
	- 1 Beta
		+ 1.1 Gamma
		+ 1.2 Zeta
	- 2 Kappa
		+ A Copy of 1 (Beta)`);

		copyToRoot("1.1", "Copy 1.1 (Gamma) to root");
		checkTable("After copy 1.1 to root", 0, `
- B Copy of 1.1 (Gamma)
	* B.1 Copy of 1.1.1 (Delta)
	* B.2 Copy of 1.1.2 (Epsilon)
- 0 Alpha
	- 1 Beta
		+ 1.1 Gamma`);

		copyAsLastChildOf("1.1", "B", "Copy 1.1 (Gamma) as last child of B (Copy of Gamma)");
		checkTable("After copy 1.1 as last child of B", 0, `
- B Copy of 1.1 (Gamma)
	* B.1 Copy of 1.1.1 (Delta)
	* B.2 Copy of 1.1.2 (Epsilon)
	- C Copy of 1.1 (Gamma)
		* C.1 Copy of 1.1.1 (Delta)
		* C.2 Copy of 1.1.2 (Epsilon)`);

		copyJustBeforeSibling("C.1", "B.1",
			"Copy C.1 (Copy of 1.1.1 (Delta)) just before sibling B.1 (Copy of 1.1 (Gamma))");
		checkTable("After copy C.1 just before sibling B.1", 0, `
- B Copy of 1.1 (Gamma)
	* D Copy of C.1 (Copy of 1.1.1 (Delta))
	* B.1 Copy of 1.1.1 (Delta)
	* B.2 Copy of 1.1.2 (Epsilon)
	- C Copy of 1.1 (Gamma)
		* C.1 Copy of 1.1.1 (Delta)`);

		copyAsLastRoot("C", "Copy C (Copy of 1.1 (Gamma)) as last root");
		checkTable("After copy C as last root", 15, `
		* 4.1 Nu
	- 5 Xi
		+ 5.1 Omicron
- E Copy of C (Copy of 1.1 (Gamma))
	* E.1 Copy of C.1 (Copy of 1.1.1 (Delta))
	* E.2 Copy of C.2 (Copy of 1.1.2 (Epsilon))`);
	};
});
