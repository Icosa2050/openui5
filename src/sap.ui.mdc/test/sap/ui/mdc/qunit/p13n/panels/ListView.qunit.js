/* global QUnit */
sap.ui.define([
    "sap/ui/mdc/p13n/panels/ListView",
    "sap/ui/mdc/p13n/P13nBuilder",
    "sap/ui/model/json/JSONModel",
    "sap/ui/mdc/util/PropertyHelper",
    "sap/m/VBox"
], function(ListView, P13nBuilder, JSONModel, PropertyHelper, VBox) {
    "use strict";

    var oMockExisting = {
        items: [
            {
                name: "key1"
            },
            {
                name: "key2",
                isFiltered: true
            },
            {
                name: "key3"
            }
        ]
    };

    var aInfoData = [
        {
            name: "key1",
            label: "Field 1",
            group: "G1"
        },
        {
            name: "key2",
            label: "Field 2",
            group: "G1"
        },
        {
            name: "key3",
            label: "Field 3",
            group: "G1"
        },
        {
            name: "key4",
            label: "Field 4",
            group: "G2"
        },
        {
            name: "key5",
            label: "Field 5",
            group: "G2"
        },
        {
            name: "key6",
            label: "Field 6",
            group: "G2",
            tooltip: "Some Tooltip"
        }
    ];

    QUnit.module("API Tests", {
        beforeEach: function(){
            this.oExistingMock = oMockExisting;
            this.aMockInfo = aInfoData;
            this.oListView = new ListView();

            this.oListView.setItemFactory(function(){
                return new VBox();
            });

            this.oP13nData = P13nBuilder.prepareP13nData(this.oExistingMock, this.aMockInfo);

            this.oListView.placeAt("qunit-fixture");
            sap.ui.getCore().applyChanges();
        },
        afterEach: function(){
            this.sDefaultGroup = null;
            this.oExistingMock = null;
            this.oP13nData = null;
            this.aMockInfo = null;
            this.oListView.destroy();
        }
    });

    QUnit.test("check instantiation", function(assert){
        assert.ok(this.oListView, "Panel created");
        this.oListView.setP13nModel(new JSONModel(this.oP13nData));
        assert.ok(this.oListView.getModel(this.oListView.P13N_MODEL).isA("sap.ui.model.json.JSONModel"), "Model has been set");
    });

    QUnit.test("Check column toggle", function(assert){
        this.oListView.setP13nModel(new JSONModel(this.oP13nData));

        var oList = this.oListView._oListControl;

        assert.equal(oList.getColumns().length, 2, "Two columns");

        this.oListView.showFactory(true);
        assert.equal(oList.getColumns().length, 1, "One column");

        this.oListView.showFactory(false);
        assert.equal(oList.getColumns().length, 2, "Two columns");
    });

    QUnit.test("Check 'active' icon'", function(assert){
        this.oListView.setP13nModel(new JSONModel(this.oP13nData));

        assert.ok(this.oListView._oListControl.getItems()[1].getCells()[1].getItems()[0].getVisible(), "Item is filtered (active)");

        //Mock what happens during runtime if a filter is made inactive
        this.oP13nData.items[1].isFiltered = false;
        this.oListView.setP13nModel(new JSONModel(this.oP13nData));
        assert.ok(!this.oListView._oListControl.getItems()[1].getCells()[1].getItems()[0].getVisible(), "Item is NOT filtered (active)");

        //Mock what happens during runtime if a filter is made active
        this.oP13nData.items[1].isFiltered = true;
        this.oListView.setP13nModel(new JSONModel(this.oP13nData));
        assert.ok(this.oListView._oListControl.getItems()[1].getCells()[1].getItems()[0].getVisible(), "Item is filtered (active)");
    });

    QUnit.test("Check 'getSelectedFields' ", function(assert){
        this.oListView.setP13nModel(new JSONModel(this.oP13nData));
        assert.equal(this.oListView.getSelectedFields().length, oMockExisting.items.length, "Amount of selected fields is equal to initially visible fields");
    });

    QUnit.test("Check '_addMoveButtons' ", function(assert){
        this.oListView.setP13nModel(new JSONModel(this.oP13nData));

        this.oListView._oSelectedItem = this.oListView._oListControl.getItems()[0];

        this.oListView._addMoveButtons();
        assert.equal(this.oListView._oSelectedItem.getCells()[1].getItems().length, 5, "Item does contain move buttons after being selected");
    });

    QUnit.test("Check 'removeButtons' ", function(assert){
        this.oListView.setP13nModel(new JSONModel(this.oP13nData));

        this.oListView._oSelectedItem = this.oListView._oListControl.getItems()[0];

        this.oListView._addMoveButtons();
        this.oListView.removeMoveButtons();
        assert.equal(this.oListView._oSelectedItem.getCells()[1].getItems().length, 1, "Item does not contain move buttons");
    });

});
