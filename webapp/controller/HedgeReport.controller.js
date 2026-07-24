sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/ui/model/json/JSONModel"
], function (Controller, Filter, FilterOperator, MessageBox, MessageToast, JSONModel) {
	"use strict";

	return Controller.extend("hedgerprt.hedge_rprt.controller.HedgeReport", {
		onInit: function () {
			var btnArray = ["idRHedgeRollover", "idMassRollover", "idEarlyExp", "idExpRolover", "idCloseOut", "idRequestSpotForward"];
			for (var i = 0; i < btnArray.length; i++) {
				this.byId(btnArray[i]).setVisible(false);
			}

			// commented
			var that = this;
			var oModelMain = this.getOwnerComponent().getModel();
			oModelMain.read("/AuthorizationDataSet('')", {
				//filters: [filter],
				success: function (data, oResponse) {
					console.log(data);
					that.userRole = data;
					if (data.Utype === "M") {
						for (var i = 0; i < btnArray.length; i++) {
							that.byId(btnArray[i]).setVisible(true); // temp changes
							//	that.byId(btnArray[i]).setVisible(false);
						}
						//that.byId(btnArray[3]).setVisible(true); // temp changes
						//that.byId(btnArray[5]).setVisible(true); // temp changes
					} else if (data.Utype === "U") {
						for (var i = 0; i < btnArray.length; i++) {
							that.byId(btnArray[i]).setVisible(false);
						}
						that.byId(btnArray[3]).setVisible(true);
					} else if (data.Utype === "A") {
						for (var i = 0; i < btnArray.length; i++) {
							that.byId(btnArray[i]).setVisible(false);
						}
						that.byId("idExpRoleback").setVisible(false);
					} else {
						for (var i = 0; i < btnArray.length; i++) {
							that.byId(btnArray[i]).setVisible(true);
						}
					}

				},
				error: function (err) {
					
				}
			});

		},

		formatRowHighlight: function (oValue) {
			//console.log(oValue);
			if (oValue == 0) {
				return "None";
			} else if (oValue == 1) {
				return "Error";
			} else if (oValue == 2) {
				return "Warning";
			} else if (oValue == 3) {
				return "Success";
			}
			return "None";
		},

		onBeforeRebindTable: function (oEvent) {
			var mBindingParams = oEvent.getParameter("bindingParams");
			var oCustomStatusDrp = this.getView().byId("idCustomStatusDrp");
			var aStatusKey = oCustomStatusDrp.getSelectedKey();
			var newFilter = new Filter("Status", FilterOperator.EQ, aStatusKey);
			mBindingParams.filters.push(newFilter);

			var oCustomExpoCat = this.getView().byId("idCustomExpoCat");
			var aCustomExpoCatKey = oCustomExpoCat.getSelectedKey();
			var newFilter1 = new Filter("TransactionCatT", FilterOperator.EQ, aCustomExpoCatKey);
			mBindingParams.filters.push(newFilter1);

			var oCustomEntityType = this.getView().byId("idCustomEntityType");
			var aCustomEntityKey = oCustomEntityType.getSelectedKey();
			var newFilter2 = new Filter("EntityType", FilterOperator.EQ, aCustomEntityKey);
			mBindingParams.filters.push(newFilter2);

			//console.log(oEvent.filters);

		},

		handledCustomStatusChange: function (oEvent) {
			var selStatus = oEvent.getSource().getSelectedKey();
			if (this.userRole === "M") {
				if (selStatus === "3" || selStatus === "2") {
					this.byId("idRequestSpotForward").setVisible(false);
				} else {
					this.byId("idRequestSpotForward").setVisible(true);
				}
			}
		},

		onHedgeThresholdCheck: function (oEvent) {
			var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
			var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
				target: {
					semanticObject: "Thresholdcheck",
					action: "display"
				}
			})) || "";
			/*	oCrossAppNavigator.toExternal({
					target: {
						shellHash: hash
					}
				});*/

			var url = window.location.href.split('#')[0] + hash;
			sap.m.URLHelper.redirect(url, true);
		},

		onHedgeMonitorRequest: function (oEvent) {

			var oTable = this.byId("IdHedgeLineItemsSmartTable").getTable();
			var oItems = oTable.getSelectedIndices();
			var posotionId = "";

			if (oItems.length > 1) {
				MessageBox.warning("You have selected multiple rows. Please select any one row for navigation");
			} else if (oItems.length === 0) {
				var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
				var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
					target: {
						semanticObject: "hedge",
						action: "monitor"
					}
				})) || "";
				/*oCrossAppNavigator.toExternal({
					target: {
						shellHash: hash
					}
				});*/
				var url = window.location.href.split('#')[0] + hash;
				sap.m.URLHelper.redirect(url, true);

			} else {
				posotionId = oTable.getContextByIndex(oItems[0]).getProperty("PositionId");

				var oCrossAppNavigator1 = sap.ushell.Container.getService("CrossApplicationNavigation");
				var hash_par = (oCrossAppNavigator1 && oCrossAppNavigator1.hrefForExternal({
					target: {
						semanticObject: "hedge",
						action: "monitor"
					},
					params: {
						"PositionID": posotionId
					}
				})) || "";
				/*oCrossAppNavigator1.toExternal({
					target: {
						shellHash: hash_par
					}
				});*/
				var url = window.location.href.split('#')[0] + hash_par;
				sap.m.URLHelper.redirect(url, true);
			}

		},

		onHedgePositionFlows: function (oEvent) {
			var oTable = this.byId("IdHedgeLineItemsSmartTable").getTable();
			var oItems = oTable.getSelectedIndices();
			//var j;
			/*for (var i = 0; i < oItems.length; i++) {
				j = oItems[i];
				var pos = oTable.getContextByIndex(j).getProperty("PositionId");
			}*/

			if (oItems.length > 1) {
				MessageBox.warning("You have selected multiple rows. Please select any one row for navigation");
			} else {
				//MessageBox.show("You have selected a row.");

				var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
				var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
					target: {
						semanticObject: "FinancialExposurePosition",
						action: "displayExposurePositionFlows"
					}
				})) || "";
				/*	oCrossAppNavigator.toExternal({
						target: {
							shellHash: hash
						}
					});*/
				var url = window.location.href.split('#')[0] + hash;
				sap.m.URLHelper.redirect(url, true);
			}

		},

		onHedgeRequestSpotForward: function (oEvent) {
			this._getHedgeRequestSpotForward(); // old code
			//	this._getPopupHedgeDetails();   // new code for popup
		},

		_getPopupHedgeDetails: function () {

			var oSelectedItem = this.byId("IdHedgeLineItemsSmartTable").getTable();
			var aItemIndices = oSelectedItem.getSelectedIndices();
			var aItemlength = aItemIndices.length;
			if (aItemlength === 0) {
				// If no row is selected, show an error message
				MessageBox.error("Please select a row before requesting a Spot Forward.");
			} else if (aItemlength > 1) {
				// If more than 1 row is selected, show an error message
				MessageBox.error("Select only one row for requesting a Spot Forward.");
			} else {
				// If exactly 1 row is selected, open the dialog fragment
				var that = this;
				if (!that._requestSpotForwardDialog) {
					that._requestSpotForwardDialog = sap.ui.xmlfragment("hedgerprt.hedge_rprt.fragment.HedgeAmount", this);
					that.getView().addDependent(that._requestSpotForwardDialog);

					// // Create a JSON object with the values
					// var oRequestSpotForwardData = {
					// 	maximumLimit: maximumLimitValue,
					// 	proposedHedge: proposedHedgeValue,
					// 	hedgeRequest: hedgeRequestValue
					// };

					// // Create a JSON model and set it to the view
					// var oRequestSpotForwardModel = new sap.ui.model.json.JSONModel(oRequestSpotForwardData);
					// that.byId("idHRRequestSpotForwardForm").setModel(oRequestSpotForwardModel, "RequestSpotForwardModel");

					// // Bind values to the input fields in the fragment
					// that._requestSpotForwardDialog.setModel(oRequestSpotForwardModel, "RequestSpotForwardModel");
				}
				that._requestSpotForwardDialog.open();
				var maximumLimitValue = oSelectedItem.getContextByIndex(aItemIndices).getProperty("Maxhedge");
				var minimumLimitValue = oSelectedItem.getContextByIndex(aItemIndices).getProperty("Minhedge");
				var proposedHedgeValue = oSelectedItem.getContextByIndex(aItemIndices).getProperty("Proposedhedge");
				var hedgeRequestValue = oSelectedItem.getContextByIndex(aItemIndices).getProperty("Reqamt");
				var currency = oSelectedItem.getContextByIndex(aItemIndices).getProperty("ExpCurr");
				this.absStatus = oSelectedItem.getContextByIndex(aItemIndices).getProperty("absStatus");

				var oMaximumLimitValue = sap.ui.getCore().byId("idHRMaximumLimit");
				var oMinimumLimitValue = sap.ui.getCore().byId("idHRMinimumLimit");
				var oProposedHedgeValue = sap.ui.getCore().byId("idHRProposedHedge");
				var oHedgeRequestValue = sap.ui.getCore().byId("idHRHedgeRequest");

				oMaximumLimitValue.setValue(maximumLimitValue);
				oMaximumLimitValue.setDescription(currency);
				oMinimumLimitValue.setValue(minimumLimitValue);
				oMinimumLimitValue.setDescription(currency);
				oProposedHedgeValue.setValue(proposedHedgeValue);
				oProposedHedgeValue.setDescription(currency);
				oHedgeRequestValue.setValue(hedgeRequestValue);
				oHedgeRequestValue.setDescription(currency);
			}

		},

		onRequestSpotForwardSave: function (oEvent) {
			var hedgeRequestValue = sap.ui.getCore().byId("idHRHedgeRequest").getValue();
			var currency = sap.ui.getCore().byId("idHRHedgeRequest").getDescription();
			if (hedgeRequestValue) {
				//	MessageBox.success("Hedge Request of " + hedgeRequestValue + " " + currency + " sent to RITA.");
				this._getHedgeRitaResponse(this.payload, hedgeRequestValue);
				if (this._requestSpotForwardDialog && this._requestSpotForwardDialog.isOpen()) {
					this._requestSpotForwardDialog.close();
				}
			} else {
				MessageBox.error("Please enter the Hedge Request value");
			}
		},

		onRequestSpotForwardCancel: function (oEvent) {
			if (this._requestSpotForwardDialog && this._requestSpotForwardDialog.isOpen()) {
				this._requestSpotForwardDialog.close();
			}
		},

		onHedgeRequest: function (oEvent) {
			var hedgeRequestValue = oEvent.getSource().getValue();
			var ohedgeRequestValue = parseFloat(hedgeRequestValue);
			var oProposedHedgeValue = parseFloat(sap.ui.getCore().byId("idHRProposedHedge").getValue());
			var oMaxLimitValue = parseFloat(sap.ui.getCore().byId("idHRMaximumLimit").getValue());
			var oMinLimitValue = parseFloat(sap.ui.getCore().byId("idHRMinimumLimit").getValue());
			//this.absStatus = "X";

			// new logic of swap the values of min and max if min is greater than max.
			if (isNaN(ohedgeRequestValue)) {
				MessageBox.error("Please enter a valid number");
				oEvent.getSource().setValue("");
				return;
			} else if (oMinLimitValue > oMaxLimitValue) {
				//swapn no.s
				[oMinLimitValue, oMaxLimitValue] = [oMaxLimitValue, oMinLimitValue];
			}
            /**
             * SOC FIN00534584 removed the validation for the min and max amount 
             * as these validations are oding to be hanled from the backend
             * Uid 10452844
             * /  
			/*if (ohedgeRequestValue > oMaxLimitValue || ohedgeRequestValue < oMinLimitValue) {
				MessageBox.error("Hedge Request should be between Maximum & Minimum Hedge Limit");
				oEvent.getSource().setValue("");
			}*/
            // EOC FIN00534584

			// old logic of Abs for -ve amounts
			// if (isNaN(ohedgeRequestValue)) {
			// 	MessageBox.error("Please enter a valid number");
			// 	oEvent.getSource().setValue("");
			// } else if (this.absStatus === "X") {
			// 	if (oMaxLimitValue < 0 && oMinLimitValue < 0 && ohedgeRequestValue >= 0) {
			// 		MessageBox.error("Value should be negative");
			// 		oEvent.getSource().setValue("");
			// 	} else if (Math.abs(ohedgeRequestValue) > Math.abs(oMaxLimitValue) || Math.abs(ohedgeRequestValue) < Math.abs(oMinLimitValue)) {
			// 		MessageBox.error("Hedge Request should be between Maximum & Minimum Hedge Limit");
			// 		oEvent.getSource().setValue("");
			// 	}
			// } else if (ohedgeRequestValue > oMaxLimitValue || ohedgeRequestValue < oMinLimitValue) {
			// 	MessageBox.error("Hedge Request should be between Maximum & Minimum Hedge Limit");
			// 	oEvent.getSource().setValue("");
			// }

		},

		_getHedgeRequestSpotForward: function () {

			//var oResult = "",that=this;
			//var arrIndex = this.byId("IdHedgeLineItemsSmartTable").getTable().getSelectedIndices();
			//console.log(arrIndex);

			var buttonName = "RequestSpotForward";

			this._payloadFunction(buttonName);

		},

		_getHedgeRitaResponse: function (payload, hedgeRequestValue) {

			if (hedgeRequestValue) {
				payload.pos_idSet[0].Reqamt = hedgeRequestValue;
			}
			payload.pos_idSet[0].Reqoption = "HR";
			console.log(payload, hedgeRequestValue);
			var that = this;
			var oModel = this.getOwnerComponent().getModel();
			oModel.create("/pos_detailsSet", payload, {
				success: function (oData, oResponse) {

					//new changes common for CHAL & NON-CHAL
					var response = $.parseJSON(oResponse.headers["sap-message"]).message;
					if (response !== "") {
						MessageBox.success(response);
					}

					// old changes for CHAL & NON-CHAL commented as of now 13/01
					// Changes reverted again on 29/09 as per abap consultant
					// var cto = "",
					// 	notCto = "",
					// 	status = "";
					// for (var i = 0; i < payload.pos_idSet.length; i++) {

					// 	if (payload.pos_idSet[i].EntityType === "CHCAL") {
					// 		cto = "X";
					// 		break;
					// 	}
					// }
					// for (var i = 0; i < payload.pos_idSet.length; i++) {
					// 	if (payload.pos_idSet[i].EntityType === "NON-CHCAL") {
					// 		notCto = "Y";
					// 		break;
					// 	}
					// }
					// for (var i = 0; i < payload.pos_idSet.length; i++) {
					// 	if (payload.pos_idSet[i].Status === "1") {
					// 		status = "Z";
					// 		break;
					// 	}
					// }

					// // for CTO - RITA report response
					// if (cto === "X" && notCto === "") {
					// 	var response = $.parseJSON(oResponse.headers["sap-message"]).message;
					// 	if (response !== "") {
					// 		MessageBox.success(response);
					// 	}
					// } else if (cto === "" && notCto === "Y") {
					// 	// for NON-CTO & status red -Excel Download call
					// 	if (status === "Z") {
					// 		var sUrl = "";
					// 		sUrl = "/sap/opu/odata/sap/ZFITR_EXP_HEDGE_POSITION_SRV/hedge_downloadSet('" + posData.join(",") + "')/$value";
					// 		var encodeUrl = encodeURI(sUrl);
					// 		sap.m.URLHelper.redirect(encodeUrl, true);
					// 	} else {
					// 		MessageBox.warning("Please select correct request");
					// 	}
					// } else {
					// 	// both call
					// 	// resplose call
					// 	var response1 = $.parseJSON(oResponse.headers["sap-message"]).message;
					// 	if (response1 !== "") {
					// 		MessageBox.success(response1);
					// 	}

					// 	// download
					// 	var sUrl = "";
					// 	sUrl = "/sap/opu/odata/sap/ZFITR_EXP_HEDGE_POSITION_SRV/hedge_downloadSet('" + posData.join(",") + "')/$value";
					// 	var encodeUrl = encodeURI(sUrl);
					// 	//console.log(sUrl);
					// 	sap.m.URLHelper.redirect(encodeUrl, true);

					// }

				},
				error: function (oError) {
					//console.log(oError);

				}
			});
		},

		// Hedge Rollover Button 
		onHedgeRollover: function () {
			var identifier = "RO";
			this.onButtonPopupDialog(identifier);
		},

		// Mass Rollover Button 
		onMassRollover: function () {
			var identifier = "MR";
			this.onButtonPopupDialog(identifier);
		},

		// Early Expiration Button 
		onEarlyExpiration: function () {
			var identifier = "EE";
			this.onButtonPopupDialog(identifier);
		},

		// Exposure Rollover Button 
		onExposureRollover: function () {
			var identifier = "ER";
			this.onButtonPopupDialog(identifier);
		},

		// Exposure Roleback Button 
		onExposureRoleback: function () {
			var identifier = "EB";
			this.onButtonPopupDialog(identifier);
		},

		// Closeout Button 
		oncloseout: function () {
			var identifier = "CS";
			this.onButtonPopupDialog(identifier);
		},

		onButtonPopupDialog: function (identifier) {
			var oSelectedItem = this.byId("IdHedgeLineItemsSmartTable").getTable();
			var aItemIndices = oSelectedItem.getSelectedIndices();
			var aItemlength = aItemIndices.length;
			if (aItemlength === 0) {
				MessageBox.error("Please select a row before requesting a Spot Forward.");
			} else {

				if (aItemlength > 1 && identifier !== "MR") {
					MessageBox.error("Select only one row for requesting a Spot Forward.");
				} else {
					var that = this;
					if (!that._buttonPopupDialog) {
						that._buttonPopupDialog = sap.ui.xmlfragment("hedgerprt.hedge_rprt.fragment.HedgeRollover", this);
						that.getView().addDependent(that._buttonPopupDialog);
					}
					that._buttonPopupDialog.open();

					var containerIDs = ["idHRHedgeRolloverContainer1", "idHRHedgeRolloverContainer2", "idHRMassRolloverContainer",
						"idHREarlyExpirationContainer1", "idHREarlyExpirationContainer2", "idHRExposureRolloverContainer", "idHRCloseoutContainer1",
						"idHRCloseoutContainer2", "idHRExposureRolebackContainer"
					];

					sap.ui.getCore().byId("idHRBuySelHedgeRolloverl").setValue();
					sap.ui.getCore().byId("idHRBuySelHedgeEarlyExp").setValue();
					sap.ui.getCore().byId("idHRBuySelHedgeCloseOut").setValue();

					for (var i = 0; i < containerIDs.length; i++) {
						// var ids = sap.ui.getCore().byId(containerIDs[i]);
						// ids.setVisible(false);
						sap.ui.getCore().byId(containerIDs[i]).setVisible(false);
					}
					if (identifier === "MR") {
						sap.ui.getCore().byId("idHRDialogButton").setTitle("Mass Rollover");
						var massRolloverC = sap.ui.getCore().byId("idHRMassRolloverContainer");
						massRolloverC.setVisible(true);
					} else {
						this.positionID = oSelectedItem.getContextByIndex(aItemIndices).getProperty("PositionId");

						if (identifier === "RO") {
							sap.ui.getCore().byId("idHRDialogButton").setTitle("Hedge Rollover");

							var hedgeRolloverC1 = sap.ui.getCore().byId("idHRHedgeRolloverContainer1");
							var hedgeRolloverC2 = sap.ui.getCore().byId("idHRHedgeRolloverContainer2");

							hedgeRolloverC1.setVisible(true);
							hedgeRolloverC2.setVisible(true);

							var expFlowTypeHR = oSelectedItem.getContextByIndex(aItemIndices).getProperty("ExpType");
							var expFlowTypeTextHR = oSelectedItem.getContextByIndex(aItemIndices).getProperty("ExpTypeT");
							var fullExpFlowTypeHR = expFlowTypeHR + "(" + expFlowTypeTextHR + ")";
							var valueDateHR = oSelectedItem.getContextByIndex(aItemIndices).getProperty("DueDate");
							var currencyHR = oSelectedItem.getContextByIndex(aItemIndices).getProperty("ExpCurr");
							// var exposureAmountHR = oSelectedItem.getContextByIndex(aItemIndices).getProperty("ExpAmt");

							var oExpFlowTypeHR = sap.ui.getCore().byId("idHRExpFlowTypeHedgeRollover");
							var oValueDateHR = sap.ui.getCore().byId("idHRValueDateHedgeRollover");
							var oCurrencyHR = sap.ui.getCore().byId("idHRAmountCurrencyHedgeRollover");
							// var oExposureAmountHR = sap.ui.getCore().byId("idHRAmountHedgeRollover");

							// oExposureAmountHR.setValue(exposureAmountHR);
							oExpFlowTypeHR.setValue(fullExpFlowTypeHR);
							oValueDateHR.setValue(valueDateHR);
							oCurrencyHR.setValue(currencyHR);

							// } else if (identifier === "MR") {
							// 	sap.ui.getCore().byId("idHRDialogButton").setTitle("Mass Rollover");
							// 	var massRolloverC = sap.ui.getCore().byId("idHRMassRolloverContainer");
							// 	massRolloverC.setVisible(true);
						} else if (identifier === "EE") {
							sap.ui.getCore().byId("idHRDialogButton").setTitle("Early Expiration");
							var earlyExpirationC1 = sap.ui.getCore().byId("idHREarlyExpirationContainer1");
							var earlyExpirationC2 = sap.ui.getCore().byId("idHREarlyExpirationContainer2");
							earlyExpirationC1.setVisible(true);
							earlyExpirationC2.setVisible(true);

							var expFlowTypeEE = oSelectedItem.getContextByIndex(aItemIndices).getProperty("ExpType");
							var expFlowTypeTextEE = oSelectedItem.getContextByIndex(aItemIndices).getProperty("ExpTypeT");
							var fullExpFlowTypeEE = expFlowTypeEE + "(" + expFlowTypeTextEE + ")";
							var valueDateEE = oSelectedItem.getContextByIndex(aItemIndices).getProperty("DueDate");
							var currencyEE = oSelectedItem.getContextByIndex(aItemIndices).getProperty("ExpCurr");
							// var exposureAmountEE = oSelectedItem.getContextByIndex(aItemIndices).getProperty("ExpAmt");

							var oExpFlowTypeEE = sap.ui.getCore().byId("idHRExpFlowTypeEarlyExpiration");
							var oValueDateEE = sap.ui.getCore().byId("idHRValueDateEarlyExpiration");
							var oCurrencyEE = sap.ui.getCore().byId("idHRAmountCurrencyEarlyExpiration");
							// var oExposureAmountEE = sap.ui.getCore().byId("idHRAmountEarlyExpiration");

							oExpFlowTypeEE.setValue(fullExpFlowTypeEE);
							oValueDateEE.setValue(valueDateEE);
							oCurrencyEE.setValue(currencyEE);
							// oExposureAmountEE.setValue(exposureAmountEE);
						} else if (identifier === "ER") {
							sap.ui.getCore().byId("idHRDialogButton").setTitle("Exposure Rollover");
							var exposureRolloverC = sap.ui.getCore().byId("idHRExposureRolloverContainer");
							exposureRolloverC.setVisible(true);

							var currencyER = oSelectedItem.getContextByIndex(aItemIndices).getProperty("ExpCurr");
							var exposureAmountER = oSelectedItem.getContextByIndex(aItemIndices).getProperty("ExpAmt");
							this.exposureAmountForCheck = exposureAmountER;

							var oCurrencyER = sap.ui.getCore().byId("idHRAmountCurrencyExposureRollover");
							var oExposureAmountER = sap.ui.getCore().byId("idHRAmountExposureRollover");

							oCurrencyER.setValue(currencyER);
							oExposureAmountER.setValue(exposureAmountER);
						} else if (identifier === "EB") {
							sap.ui.getCore().byId("idHRDialogButton").setTitle("Exposure Rollback");
							var exposureRolloverC = sap.ui.getCore().byId("idHRExposureRolebackContainer");
							exposureRolloverC.setVisible(true);

							var currencyER = oSelectedItem.getContextByIndex(aItemIndices).getProperty("ExpCurr");
							var exposureAmountEB = oSelectedItem.getContextByIndex(aItemIndices).getProperty("ExpAmt");
							this.exposureAmountForCheck = exposureAmountEB;

							var oCurrencyER = sap.ui.getCore().byId("idHRAmountCurrencyExposureRoleback");
							var oExposureAmountEB = sap.ui.getCore().byId("idHRAmountExposureRoleback");

							oCurrencyER.setValue(currencyER);
							oExposureAmountEB.setValue(exposureAmountEB);
						} else if (identifier === "CS") {
							sap.ui.getCore().byId("idHRDialogButton").setTitle("Close Out");
							var closeoutC1 = sap.ui.getCore().byId("idHRCloseoutContainer1");
							var closeoutC2 = sap.ui.getCore().byId("idHRCloseoutContainer2");
							closeoutC1.setVisible(true);
							closeoutC2.setVisible(true);

							var expFlowTypeCS = oSelectedItem.getContextByIndex(aItemIndices).getProperty("ExpType");
							var expFlowTypeTextCS = oSelectedItem.getContextByIndex(aItemIndices).getProperty("ExpTypeT");
							var fullExpFlowTypeCS = expFlowTypeCS + " (" + expFlowTypeTextCS + ")";
							var valueDateCS = oSelectedItem.getContextByIndex(aItemIndices).getProperty("DueDate");
							var currencyCS = oSelectedItem.getContextByIndex(aItemIndices).getProperty("ExpCurr");
							// var exposureAmountCS = oSelectedItem.getContextByIndex(aItemIndices).getProperty("ExpAmt");

							var oExpFlowTypeCS = sap.ui.getCore().byId("idHRExpFlowTypeCloseout");
							var oValueDateCS = sap.ui.getCore().byId("idHRValueDateCloseout");
							var oCurrencyCS = sap.ui.getCore().byId("idHRAmountCurrencyCloseout");
							// var oExposureAmountCS = sap.ui.getCore().byId("idHRAmountCloseout");

							oExpFlowTypeCS.setValue(fullExpFlowTypeCS);
							oValueDateCS.setValue(valueDateCS);
							oCurrencyCS.setValue(currencyCS);
							// oExposureAmountCS.setValue(exposureAmountCS);
						}
					}
				}
			}
		},

		onHMEECancel: function (oEvent) {
			if (this._buttonPopupDialog && this._buttonPopupDialog.isOpen()) {
				this._buttonPopupDialog.close();
			}
			this._resetFormValues();
		},

		onHMEESave: function (oEvent) {
			var hedgeRolloverVisibility = sap.ui.getCore().byId("idHRHedgeRolloverContainer1").getVisible();
			var massRolloverVisibility = sap.ui.getCore().byId("idHRMassRolloverContainer").getVisible();
			var earlyExpirationVisibility = sap.ui.getCore().byId("idHREarlyExpirationContainer1").getVisible();
			var exposureRolloverVisibility = sap.ui.getCore().byId("idHRExposureRolloverContainer").getVisible();
			var exposureRolebackVisibility = sap.ui.getCore().byId("idHRExposureRolebackContainer").getVisible();
			var closeOutVisibility = sap.ui.getCore().byId("idHRCloseoutContainer1").getVisible();

			if (hedgeRolloverVisibility) {
				var parentNumberHedgeRollover = sap.ui.getCore().byId("idHRParentNumberHedgeRollover").getValue();
				var planningMYHedgeRollover = sap.ui.getCore().byId("idHRPlanningMYHedgeRollover").getValue();
				var amountHedgeRollover = sap.ui.getCore().byId("idHRAmountHedgeRollover").getValue();
				var buySellHedgeRollover = sap.ui.getCore().byId("idHRBuySelHedgeRolloverl").getValue();
				var identifier = "RO";
				var exposureNoHedgeRollover = sap.ui.getCore().byId("idHRExposureNoHedgeRollover").getValue();

				if (parentNumberHedgeRollover && planningMYHedgeRollover && amountHedgeRollover) {
					var hedgeRolloverAmountID = "idHRAmountHedgeRollover";
					this.commonAmountCheck(amountHedgeRollover, identifier, hedgeRolloverAmountID);
					if (this.amountFLAG === true) {
						 this._sendRolloverData(planningMYHedgeRollover, identifier,
						 	amountHedgeRollover, parentNumberHedgeRollover, buySellHedgeRollover, exposureNoHedgeRollover);
						// this._sendRolloverData(planningMYHedgeRollover, identifier,
						// 	amountHedgeRollover, parentNumberHedgeRollover, buySellHedgeRollover);
						if (this._buttonPopupDialog && this._buttonPopupDialog.isOpen()) {
							this._buttonPopupDialog.close();
						}
						this._resetFormValues();
					} else {
						return;
					}
				} else {
					MessageBox.error("All the fields are mandatory.");
				}
			}

			if (massRolloverVisibility) {
				var targetMYMassRollover = sap.ui.getCore().byId("idHRTargetMYMassRollover").getValue();
				var identifier = "MR";

				if (targetMYMassRollover) {
					this._sendRolloverData(targetMYMassRollover, identifier);
					if (this._buttonPopupDialog && this._buttonPopupDialog.isOpen()) {
						this._buttonPopupDialog.close();
					}
					this._resetFormValues();
				} else {
					MessageBox.error("Target Month & Year field is mandatory.");
				}
			}

			if (earlyExpirationVisibility) {
				var parentNumberEarlyExpiratio = sap.ui.getCore().byId("idHRParentNumberEarlyExpiration").getValue();
				var maturityMYEarlyExpiration = sap.ui.getCore().byId("idHRMaturityMYEarlyExpiration").getValue();
				var amountEarlyExpiration = sap.ui.getCore().byId("idHRAmountEarlyExpiration").getValue();
				var buySellEarlyExpiration = sap.ui.getCore().byId("idHRBuySelHedgeEarlyExp").getValue();
				var identifier = "EE";
				var exposureNoEarlyExpiratio = sap.ui.getCore().byId("idHRExposureNoEarlyExpiration").getValue();

				if (parentNumberEarlyExpiratio && maturityMYEarlyExpiration && amountEarlyExpiration) {
					var earlyExpirationAmountID = "idHRAmountEarlyExpiration";
					this.commonAmountCheck(amountEarlyExpiration, identifier, earlyExpirationAmountID);
					if (this.amountFLAG === true) {
						this._sendRolloverData(maturityMYEarlyExpiration, identifier, amountEarlyExpiration, parentNumberEarlyExpiratio,
							buySellEarlyExpiration, exposureNoEarlyExpiratio);
							// this._sendRolloverData(maturityMYEarlyExpiration, identifier, amountEarlyExpiration, parentNumberEarlyExpiratio,
							// buySellEarlyExpiration);
						if (this._buttonPopupDialog && this._buttonPopupDialog.isOpen()) {
							this._buttonPopupDialog.close();
						}
						this._resetFormValues();
					} else {
						return;
					}

				} else {
					MessageBox.error("All the fields are mandatory.");
				}
			}

			if (exposureRolloverVisibility) {
				var periodExposureRollover = sap.ui.getCore().byId("idHRMYExposureRollover").getValue();
				var amountExposureRollover = sap.ui.getCore().byId("idHRAmountExposureRollover").getValue();
				var identifier = "ER";

				// if (periodExposureRollover && amountExposureRollover) {
				// 	this._sendRolloverData(periodExposureRollover, identifier, amountExposureRollover);
				// 	if (this._buttonPopupDialog && this._buttonPopupDialog.isOpen()) {
				// 		this._buttonPopupDialog.close();
				// 	}
				// 	this._resetFormValues();
				// } else {
				// 	MessageBox.error("All the fields are mandatory.");
				// }

				/////////////////////////////
				if (periodExposureRollover && amountExposureRollover) {
					var exposureRolloverAmountID = "idHRAmountExposureRollover";
					this.commonExposureAmountCheck(amountExposureRollover, identifier, exposureRolloverAmountID);
					if (this.exposureAmountFLAG === true) {
						this._sendRolloverData(periodExposureRollover, identifier, amountExposureRollover);
						if (this._buttonPopupDialog && this._buttonPopupDialog.isOpen()) {
							this._buttonPopupDialog.close();
						}
						this._resetFormValues();
					} else {
						return;
					}

				} else {
					MessageBox.error("All the fields are mandatory.");
				}
			}

			if (exposureRolebackVisibility) {
				var periodExposureRoleback = sap.ui.getCore().byId("idHRMYExposureRoleback").getValue();
				var amountExposureRoleback = sap.ui.getCore().byId("idHRAmountExposureRoleback").getValue();
				var identifier = "EB";

				// if (periodExposureRoleback && amountExposureRoleback) {
				// 	this._sendRolloverData(periodExposureRoleback, identifier, amountExposureRoleback);
				// 	if (this._buttonPopupDialog && this._buttonPopupDialog.isOpen()) {
				// 		this._buttonPopupDialog.close();
				// 	}
				// 	this._resetFormValues();
				// } else {
				// 	MessageBox.error("All the fields are mandatory.");
				// }

				///////////////////////////
				if (periodExposureRoleback && amountExposureRoleback) {
					var exposureRolebackAmountID = "idHRAmountExposureRoleback";
					this.commonExposureAmountCheck(amountExposureRoleback, identifier, exposureRolebackAmountID);
					if (this.exposureAmountFLAG === true) {
						this._sendRolloverData(periodExposureRoleback, identifier, amountExposureRoleback);
						if (this._buttonPopupDialog && this._buttonPopupDialog.isOpen()) {
							this._buttonPopupDialog.close();
						}
						this._resetFormValues();
					} else {
						return;
					}

				} else {
					MessageBox.error("All the fields are mandatory.");
				}
			}

			if (closeOutVisibility) {
				var parentNumberCloseOut = sap.ui.getCore().byId("idHRParentNumberCloseout").getValue();
				var amountCloseOut = sap.ui.getCore().byId("idHRAmountCloseout").getValue();
				var buySellCloseOut = sap.ui.getCore().byId("idHRBuySelHedgeCloseOut").getValue();
				var maturityMYCloseOut = null;
				var identifier = "CS";
				var exposureNoCloseOut = sap.ui.getCore().byId("idHRExposureNoCloseout").getValue();

				if (parentNumberCloseOut && amountCloseOut) {
					var closeOutAmountID = "idHRAmountCloseout";
					this.commonAmountCheck(amountCloseOut, identifier, closeOutAmountID);
					if (this.amountFLAG === true) {
						this._sendRolloverData(maturityMYCloseOut, identifier, amountCloseOut, parentNumberCloseOut, buySellCloseOut, exposureNoCloseOut);
					//this._sendRolloverData(maturityMYCloseOut, identifier, amountCloseOut, parentNumberCloseOut, buySellCloseOut);
						if (this._buttonPopupDialog && this._buttonPopupDialog.isOpen()) {
							this._buttonPopupDialog.close();
						}
						this._resetFormValues();
					} else {
						return;
					}
				} else {
					MessageBox.error("All the fields are mandatory.");
				}
			}
		},
		
		// _sendRolloverData: function (value1, value2, value3, value4, value5) {
		// 	var buttonName = "rollover";
		// 	this._payloadFunction(buttonName, value1, value2, value3, value4, value5);
		// },
		// changes revert for exp
		_sendRolloverData: function (value1, value2, value3, value4, value5, value6) {
			var buttonName = "rollover";
			this._payloadFunction(buttonName, value1, value2, value3, value4, value5, value6);
		},

		onParentNumberHedgeRolloverValueHelp: function (oEvent) {
			this._commanParentNumberValueHelp();
		},

		onParentNumberEarlyExpirationValueHelp: function (oEvent) {
			this._commanParentNumberValueHelp();
		},

		onParentNumberCloseoutValueHelp: function (oEvent) {
			this._commanParentNumberValueHelp();
		},

		_commanParentNumberValueHelp: function (oEvent) {
			var that = this;
			if (!that._parentNumberValueHelpDialog) {
				that._parentNumberValueHelpDialog = sap.ui.xmlfragment("hedgerprt.hedge_rprt.fragment.ParentNumber", this);
				that.getView().addDependent(that._parentNumberValueHelpDialog);
			}
			//	sap.ui.getCore().byId("idParentNumberPositionID").setText(this.positionID);
			var filter = new sap.ui.model.Filter("PositionId", "EQ", this.positionID);

			var oModelMain = this.getOwnerComponent().getModel();
			oModelMain.read("/get_parent_detailsSet", {
				filters: [filter],
				success: function (data, oResponse) {
					var oModelNo = new JSONModel(data.results);
					that.getView().setModel(oModelNo, "ParentNumberModel");
					that._parentNumberValueHelpDialog.open();
				},
				error: function (err) {}
			});
		},

		onSelectParentNumber: function (oEvent) {
			var oSelectedItem = oEvent.getSource().getSelectedItem();
			if (oSelectedItem) {
				var oContext = oSelectedItem.getBindingContext("ParentNumberModel");
				if (oContext) {
					var oSelectedParentNumber = oContext.getObject().RitaNumber;
					sap.ui.getCore().byId("idHRParentNumberHedgeRollover").setValue(oSelectedParentNumber);
					sap.ui.getCore().byId("idHRParentNumberEarlyExpiration").setValue(oSelectedParentNumber);
					sap.ui.getCore().byId("idHRParentNumberCloseout").setValue(oSelectedParentNumber);

					this.AvailableAmount = oContext.getObject().AvlAmt;
					//	this.buySellVal = oContext.getObject().BuySell;

					sap.ui.getCore().byId("idHRAmountHedgeRollover").setValue(oContext.getObject().AvlAmt);
					sap.ui.getCore().byId("idHRAmountEarlyExpiration").setValue(oContext.getObject().AvlAmt);
					sap.ui.getCore().byId("idHRAmountCloseout").setValue(oContext.getObject().AvlAmt);

					sap.ui.getCore().byId("idHRBuySelHedgeRolloverl").setValue(oContext.getObject().BuySell);
					sap.ui.getCore().byId("idHRBuySelHedgeEarlyExp").setValue(oContext.getObject().BuySell);

					if (oContext.getObject().BuySell === "B") {
						sap.ui.getCore().byId("idHRBuySelHedgeCloseOut").setValue("S");
					} else {
						sap.ui.getCore().byId("idHRBuySelHedgeCloseOut").setValue("B");
					}
				}
			}
			if (this._parentNumberValueHelpDialog && this._parentNumberValueHelpDialog.isOpen()) {
				this._parentNumberValueHelpDialog.close();
			}
			oEvent.getSource().removeSelections();
		},

		parentNumberValueHelpClose: function () {
			if (this._parentNumberValueHelpDialog && this._parentNumberValueHelpDialog.isOpen()) {
				this._parentNumberValueHelpDialog.close();
			}
		},
		
		onExposureNoHedgeRolloverValueHelp: function (oEvent) {
			this._commanExposureNoValueHelp();
		},

		onExposureNoEarlyExpirationValueHelp: function (oEvent) {
			this._commanExposureNoValueHelp();
		},
		
		onExposureNoCloseoutValueHelp: function (oEvent) {
			this._commanExposureNoValueHelp();
		},
        
        _commanExposureNoValueHelp: function (oEvent) {
			var that = this;
			if (!that._exposureNoValueHelpDialog) {
				that._exposureNoValueHelpDialog = sap.ui.xmlfragment("hedgerprt.hedge_rprt.fragment.ExposureNo", this);
				that.getView().addDependent(that._exposureNoValueHelpDialog);
			}
			//	sap.ui.getCore().byId("idParentNumberPositionID").setText(this.positionID);
			var filter = new sap.ui.model.Filter("PositionId", "EQ", this.positionID);

			var oModelMain = that.getOwnerComponent().getModel();
			oModelMain.read("/get_exposuresSet", {
				filters: [filter],
				success: function (data, oResponse) {
					var oModelNo = new JSONModel(data.results);
					that.getView().setModel(oModelNo, "ExposureNoModel");
					that._exposureNoValueHelpDialog.open();
				},
				error: function (err) {}
			});
		},

		onSelectExposureId: function (oEvent) {
			var oSelectedItem = oEvent.getSource().getSelectedItem();
			if (oSelectedItem) {
				var oContext = oSelectedItem.getBindingContext("ExposureNoModel");
				if (oContext) {
					var oSelectedExposureId = oContext.getObject().ExposureId;
					sap.ui.getCore().byId("idHRExposureNoHedgeRollover").setValue(oSelectedExposureId);
					sap.ui.getCore().byId("idHRExposureNoEarlyExpiration").setValue(oSelectedExposureId);
					sap.ui.getCore().byId("idHRExposureNoCloseout").setValue(oSelectedExposureId);
				}
			}
			if (this._exposureNoValueHelpDialog && this._exposureNoValueHelpDialog.isOpen()) {
				this._exposureNoValueHelpDialog.close();
			}
			oEvent.getSource().removeSelections();
		},

		exposureIdValueHelpClose: function () {
			if (this._exposureNoValueHelpDialog && this._exposureNoValueHelpDialog.isOpen()) {
				this._exposureNoValueHelpDialog.close();
			}
		},

		_payloadFunction: function (Button, value1, value2, value3, value4, value5, value6) {
			var oTable = this.byId("IdHedgeLineItemsSmartTable").getTable();

			var oItems = oTable.getSelectedIndices(),
				j, posData = [],
				bukrs = [],
				rcomp = [],
				gsber = [],
				division = [],
				pggroup = [],
				prctr = [],
				due_date = [],
				buy_sell = [],
				exp_curr = [],
				target_curr = [],
				unhedged_amt = [],
				expAmt = [],
				hedgedAmt = [],
				expThAmt = [],
				expType = [],
				status = [],
				entityType = [],
				maxhedge = [],
				proposedhedge = [],
				hedgereq = [],
				Wbs = [];

			for (var i = 0; i < oItems.length; i++) {
				j = oItems[i];
				posData[i] = oTable.getContextByIndex(j).getProperty("PositionId");
				expType[i] = oTable.getContextByIndex(j).getProperty("ExpType");
				bukrs[i] = oTable.getContextByIndex(j).getProperty("Bukrs");
				rcomp[i] = oTable.getContextByIndex(j).getProperty("Rcomp");
				gsber[i] = oTable.getContextByIndex(j).getProperty("Gsber");
				division[i] = oTable.getContextByIndex(j).getProperty("Division");
				pggroup[i] = oTable.getContextByIndex(j).getProperty("Pggroup");
				prctr[i] = oTable.getContextByIndex(j).getProperty("Prctr");
				expAmt[i] = oTable.getContextByIndex(j).getProperty("ExpAmt");
				buy_sell[i] = oTable.getContextByIndex(j).getProperty("BuySell");
				exp_curr[i] = oTable.getContextByIndex(j).getProperty("ExpCurr");
				target_curr[i] = oTable.getContextByIndex(j).getProperty("TargetCurr");
				hedgedAmt[i] = oTable.getContextByIndex(j).getProperty("HedgedAmt");
				unhedged_amt[i] = oTable.getContextByIndex(j).getProperty("UnhedgedAmt");
				expThAmt[i] = oTable.getContextByIndex(j).getProperty("ExpThAmt");
				due_date[i] = oTable.getContextByIndex(j).getProperty("DueDate");
				status[i] = oTable.getContextByIndex(j).getProperty("Status");
				entityType[i] = oTable.getContextByIndex(j).getProperty("EntityType");
				maxhedge[i] = oTable.getContextByIndex(j).getProperty("Maxhedge");
				proposedhedge[i] = oTable.getContextByIndex(j).getProperty("Proposedhedge");
				hedgereq[i] = oTable.getContextByIndex(j).getProperty("Hedgereq");
				Wbs[i] = oTable.getContextByIndex(j).getProperty("Wbs");

			}
			//	console.log(oItems.length,posData.length)

			if (oItems.length === 0) {
				MessageBox.warning("You have not selected any row. Please select any one row for navigation");
			} else {
				this.payload = {};
				var sItemsList = [];
				for (var i = 0; i < oItems.length; i++) {
					var sItems = {};
					sItems.PositionId = posData[i];
					sItems.ExpType = expType[i];
					sItems.Bukrs = bukrs[i];
					sItems.Rcomp = rcomp[i];
					sItems.Gsber = gsber[i];
					sItems.Prctr = prctr[i];
					sItems.Division = division[i];
					sItems.Pggroup = pggroup[i];
					sItems.ExpAmt = expAmt[i];
					sItems.BuySell = buy_sell[i];
					sItems.ExpCurr = exp_curr[i];
					sItems.TargetCurr = target_curr[i];
					sItems.HedgedAmt = hedgedAmt[i];
					sItems.UnhedgedAmt = unhedged_amt[i];
					sItems.ExpThAmt = expThAmt[i];
					sItems.DueDate = due_date[i];
					sItems.Status = status[i];
					sItems.EntityType = entityType[i];
					sItems.Maxhedge = (maxhedge[i]);
					sItems.Proposedhedge = (proposedhedge[i]);
					sItems.Reqamt = (hedgereq[i]);
					sItems.Wbs = (Wbs[i]);

					sItemsList.push(sItems);

				}
				this.payload.pos_idSet = sItemsList;

				if (Button === "RequestSpotForward") {
					console.log(this.payload);
					var expTypeFlag = "";
					for (var i = 0; i < this.payload.pos_idSet.length; i++) {

						if (this.payload.pos_idSet[i].ExpType === "FCE05" || this.payload.pos_idSet[i].ExpType === "FCE06" || this.payload.pos_idSet[i].ExpType ===
							"FCE07" || this.payload.pos_idSet[i].ExpType === "FCE08" || this.payload.pos_idSet[i].ExpType === "FCE09" ||
							this.payload.pos_idSet[i].ExpType === "FCE10") {
							expTypeFlag = "X";
							break;
						}
					}
					if (expTypeFlag === "X") {
						this._getPopupHedgeDetails();
					} else {
						this._getHedgeRitaResponse(this.payload);
					}
				} else if (Button === "rollover") {
					var items = this.payload.pos_idSet;
					for (var i = 0; i < items.length; i++) {
						this.payload.pos_idSet[i].Reqperiod = value1;
						this.payload.pos_idSet[i].Reqamt = value3;
						this.payload.pos_idSet[i].Reqoption = value2;
						this.payload.pos_idSet[i].RitaNumber = value4;
						this.payload.pos_idSet[i].Reqbuysell = value5;
						this.payload.pos_idSet[i].ExposureId = value6; // changes revert for exp
					}

					var that = this;
					var oModel = this.getOwnerComponent().getModel();
					oModel.create("/pos_detailsSet", this.payload, {
						success: function (oData, oResponse) {
							var response = $.parseJSON(oResponse.headers["sap-message"]).message;
							if (response !== "") {
								MessageBox.success(response);
							}
						},
						error: function (oError) {

						}
					});
				}
			}
		},

		_resetFormValues: function () {
			var fieldIds = [
				"idHRParentNumberHedgeRollover",
				"idHRPlanningMYHedgeRollover",
				"idHRAmountHedgeRollover",
				"idHRTargetMYMassRollover",
				"idHRMYExposureRollover",
				"idHRAmountExposureRollover",
				"idHRParentNumberEarlyExpiration",
				"idHRMaturityMYEarlyExpiration",
				"idHRAmountEarlyExpiration",
				"idHRParentNumberCloseout",
				"idHRAmountCloseout",
				"idHRExposureNoEarlyExpiration",
				"idHRExposureNoHedgeRollover",
				"idHRExposureNoCloseout"
			];
			fieldIds.forEach(function (fieldId) {
				var oField = sap.ui.getCore().byId(fieldId);
				if (oField) {
					oField.setValue("");
				}
			});
		},

		commonAmountCheck: function (amount, identifier, id) {
			this.amountFLAG = false;
			var availableAmount = this.AvailableAmount;
			//	var absAmount = Math.abs(parseFloat(amount));

			// new condition with greate then zero value
			if (parseInt(amount) < 0) {
				MessageBox.error("The Amount cannot be in negative");
				sap.ui.getCore().byId(id).setValueState("Error");
			} else if (parseInt(amount) > parseInt(availableAmount)) {
				MessageBox.error("The Amount cannot exceed the Available amount " + availableAmount);
				sap.ui.getCore().byId(id).setValueState("Error");
			} else {
				sap.ui.getCore().byId(id).setValueState("None");
				this.amountFLAG = true;
			}

			// old condition with abs valus check
			// if (absAmount > availableAmount) {
			// 	MessageBox.error("The Amount cannot exceed the Available amount " + availableAmount);
			// 	sap.ui.getCore().byId(id).setValueState("Error");
			// } else {
			// 	sap.ui.getCore().byId(id).setValueState("None");
			// 	this.amountFLAG = true;
			// }
		},

		// commonExposureAmountCheck: function (amount, identifier, id) {
		// 	this.exposureAmountFLAG = false;
		// 	var exposureAmount = Math.abs(this.exposureAmountForCheck);
		// 	var absAmount = Math.abs(parseFloat(amount));

		// 	if (absAmount > exposureAmount) {
		// 		MessageBox.error("The Amount cannot exceed the Available amount " + exposureAmount);
		// 		sap.ui.getCore().byId(id).setValueState("Error");
		// 	} else {
		// 		sap.ui.getCore().byId(id).setValueState("None");
		// 		this.exposureAmountFLAG = true;
		// 	}

		// },

		commonExposureAmountCheck: function (amount, identifier, id) {
			this.exposureAmountFLAG = false;
			var exposureAmount = this.exposureAmountForCheck;
			var absAmount = parseFloat(amount);

			// Handle negative exposureAmountForCheck case
			if (exposureAmount < 0) {
				if (absAmount > 0 || absAmount < exposureAmount) {
					MessageBox.error("The Amount must be between " + exposureAmount + " and 0.");
					sap.ui.getCore().byId(id).setValueState("Error");
				} else {
					sap.ui.getCore().byId(id).setValueState("None");
					this.exposureAmountFLAG = true;
				}
			}
			// Handle positive exposureAmountForCheck case
			else if (exposureAmount > 0) {
				if (absAmount < 0 || absAmount > exposureAmount) {
					MessageBox.error("The Amount must be between " + exposureAmount + " and 0.");
					sap.ui.getCore().byId(id).setValueState("Error");
				} else {
					sap.ui.getCore().byId(id).setValueState("None");
					this.exposureAmountFLAG = true;
				}
			}
			// Handle zero case
			else if (exposureAmount === 0) {
				if (absAmount !== 0) {
					MessageBox.error("The Amount cannot exceed 0.");
					sap.ui.getCore().byId(id).setValueState("Error");
				} else {
					sap.ui.getCore().byId(id).setValueState("None");
					this.exposureAmountFLAG = true;
				}
			}
		},

		onHedgeRolloverAmountCheck: function (oEvent) {
			var hedgeRollOverAmount = sap.ui.getCore().byId("idHRAmountHedgeRollover").getValue();
			if (hedgeRollOverAmount) {
				sap.ui.getCore().byId("idHRAmountHedgeRollover").setValueState("None");
			}
		},

		onEarlyExpirationAmountCheck: function (oEvent) {
			var hedgeRollOverAmount = sap.ui.getCore().byId("idHRAmountEarlyExpiration").getValue();
			if (hedgeRollOverAmount) {
				sap.ui.getCore().byId("idHRAmountEarlyExpiration").setValueState("None");
			}
		},

		onCloseOutAmountCheck: function (oEvent) {
			var hedgeRollOverAmount = sap.ui.getCore().byId("idHRAmountCloseout").getValue();
			if (hedgeRollOverAmount) {
				sap.ui.getCore().byId("idHRAmountCloseout").setValueState("None");
			}
		},

	});
});