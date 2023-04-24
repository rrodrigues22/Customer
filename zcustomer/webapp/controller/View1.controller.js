sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel",
  ],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (Controller, MessageToast, Fragment, MessageBox, JSONModel) {
    "use strict";

    return Controller.extend("zcustomer.controller.View1", {
      onInit: function () {},

      onDialogEditCustomer: function () {

        var oSmartTable = this.getView().byId("StCustomers").getTable();
        var oView = this.getView();

        var oEditClient = this.getView().getModel("editClient");
        oEditClient.setProperty("/isEdit", true);

        if (oSmartTable._aSelectedPaths.length > 1) {
          MessageBox.error(
            this.getOwnerComponent()
              .getModel("i18n")
              .getResourceBundle()
              .getText("multipleRegisterNotAllowed")
          );
        } else if (oSmartTable._aSelectedPaths.length < 1) {
          MessageBox.error(
            this.getOwnerComponent()
              .getModel("i18n")
              .getResourceBundle()
              .getText("nullRegisterNotAllowed")
          );
        } else {
          debugger;

          var SelectedItem = oSmartTable
            .getModel()
            .getProperty(oSmartTable._aSelectedPaths.toString());
          var oView = this.getView();
          var modelCustomer = oView.getModel("EditFragmentModel");
          modelCustomer.setData(SelectedItem);

          if (!this.byId("openDialog")) {
            Fragment.load({
              id: oView.getId(),
              name: "zcustomer.view.Register",
              controller: this,
            }).then(function (oDialog) {
              oView.addDependent(oDialog);
              oDialog.open();
            });
          } else {
            this.byId("openDialog").open();
          }
        }
      },

      onDialogCreateCustomer: function () {
        var oView = this.getView();
        debugger;
        var oEditClient = this.getView().getModel("EditFragmentModel");

        var oEditClient = this.getView().getModel("editClient");
        oEditClient.setProperty("/isEdit", false);
   

        if (!this.byId("openDialog")) {
          Fragment.load({
            id: oView.getId(),
            name: "zcustomer.view.Register",
            controller: this,
          }).then(function (oDialog) {
            oView.addDependent(oDialog);
            oDialog.open();
          });
        } else {
          this.byId("openDialog").open();
        }
      },

      handleCancelBtnPress: function (oEvent) {
        this.byId("openDialog").destroy();
        oEvent.getSource().getParent().close();
      },

      handleCancelBtnPressEdit: function () {
        this.byId("openDialogEdit").destroy();
        var oView = this.getView();
        var oModel = oView.getModel();
        oModel.refresh();

      },


      handleSaveBtnPress: function (oEvent) {
        debugger;
        let oRegisterCustomer = this.getView();
        let CustomerName = oRegisterCustomer.byId("CustomerName").getValue();
        let CustomerAdress = oRegisterCustomer
          .byId("CustomerAdress")
          .getValue();
        let CustomerTelephone = oRegisterCustomer
          .byId("CustomerTelephone")
          .getValue();

        let CustomerData = [
          {
            name: CustomerName,
            address: CustomerAdress,
            phone: CustomerTelephone,
          },
        ];

        let payload = {
          Action: "REGISTERCUSTOMER",
          Payload: JSON.stringify(CustomerData),
        };

        let oModel = oRegisterCustomer.getModel();

        oModel.create("/JsonCommSet", payload, {
          success: function (oData, oResponse) {
            MessageToast.show("Cliente adicionado com sucesso");
            oModel.refresh();
            this.handleCancelBtnPress(oEvent);
          }.bind(this),

          error: function (oError) {
            debugger;
            var oSapMessage = JSON.parse(oError.responseText);
            var msg = oSapMessage.error.message.value;
            MessageToast.show("Erro ao cadastrar cliente");
            oModel.refresh();
          },
        });
      },

      handleSaveBtnPressEdit(oEvent) {
        sap.ui.core.BusyIndicator.show(0);
        var oSmartTable = this.getView().byId("StCustomers").getTable();

        if (oSmartTable._aSelectedPaths.length > 1) { MessageBox.error("Selecione apenas uma linha."); }

        else if (oSmartTable._aSelectedPaths.length < 1) { MessageBox.error("Nenhuma linha selecionada."); }

        else {
          var SelectedItem = oSmartTable.getModel().getProperty(oSmartTable._aSelectedPaths.toString());
          var oView = this.getView();

          var customerCod = SelectedItem.CodigoCliente;
          var address = oView.byId("CustomerName").getValue();
          var name = oView.byId("CustomerAdress").getValue();
          var phone = oView.byId("CustomerTelephone").getValue();
          
              var clientFragmentEditData = [
                {
                  Name: name,
                  Address: address,
                  Phone: phone,
                  customer_cod: customerCod
                },
              ];

              var payload = {
                Action: "UPDATECUSTOMER",
                Payload: JSON.stringify(clientFragmentEditData),
              };

              var oModel = oView.getModel();

              oModel.create("/JsonCommSet", payload, {
                success: function (oData, oResponse) {
                  MessageToast.show("Cliente editado com sucesso");
                  oModel.refresh(),
                    oView.byId("CustomerName").setValue(""),
                    oView.byId("CustomerAdress").setValue(""),
                    oView.byId("CustomerTelephone").setValue(""),

                    this.handleCancelBtnPressEdit();
                  sap.ui.core.BusyIndicator.hide();
                }.bind(this),

                error: function (oError) {
                  var oSapMessage = JSON.parse(oError.responseText);
                  var msg = oSapMessage.error.message.value;
                  MessageToast.show(msg);
                  oModel.refresh();
                  sap.ui.core.BusyIndicator.hide();
                },
              });
              
          }
        },



      onDeleteCustomer: function () {
        debugger;
        var CustomerData = [];
        var oView = this.getView();
        var oSmartTable = oView.byId("StCustomers");
        var oSmartTableTable = oView.byId("StCustomers").getTable();
        oSmartTableTable._aSelectedPaths.forEach((SelectedPath, i) => {
          var SelectedItem = oSmartTableTable
            .getModel()
            .getProperty(SelectedPath.toString());

          CustomerData.push({
            customer_cod: SelectedItem.CodigoCliente,
            name: SelectedItem.Nome,
            address: SelectedItem.Endereco,
            phone: SelectedItem.Telefone,
            created_on: SelectedItem.DataCriacao,
            created_at: SelectedItem.HoraCriacao,
            created_by: SelectedItem.Usuario,
          });
        });

        if (!CustomerData) {
          MessageToast.show("Selecione pelo menos uma linha");
        } else {
          //Declarando e Inserindo valor em um array //Inserir uma linha na tabela
          var payload = {
            Action: "DELETECUSTOMER",
            Payload: JSON.stringify(CustomerData),
          };

          var oModel = oView.getModel();

          oModel.create("/JsonCommSet", payload, {
            success: function (oData, oResponse) {
              MessageToast.show("Cliente excluído com sucesso");
              oSmartTable.rebindTable();
            }.bind(this),

            error: function (oError) {
              var oSapMessage = JSON.parse(oError.responseText);
              var msg = oSapMessage.error.message.value;
              MessageToast.show(msg);
            },
          });
        }
      },
    });
  }
);
