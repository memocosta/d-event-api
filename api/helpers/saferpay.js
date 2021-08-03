var request = require('request');
module.exports = {
    friendlyName: 'Saferpay',
    inputs: {
        order_id: {
            type: 'number',
            required: true
        },
        user_id: {
            type: 'number',
            required: true
        },
        type: {
            type: 'string',
        }
    },

    exits: {

    },

    fn: async function(inputs, exits) {
        let items = [];
        let item = {};
        let email, name;
        let selectedOrder = await Order.findOne({ where: { id: inputs.order_id } });

        if (inputs.type && inputs.type == "assert") {
            if (selectedOrder.saferpay) {
                let saferpay = selectedOrder.saferpay;
                var fields = {
                    "RequestHeader": {
                        "SpecVersion": "1.21",
                        "CustomerId": "257381",
                        "RequestId": saferpay.ResponseHeader.RequestId,
                        "RetryIndicator": 0,
                        "ClientInfo": {
                            "ShopInfo": "My Shop",
                            "OsInfo": "Windows Server 2013"
                        }
                    },
                    "Token": saferpay.Token
                }
            } else {
                var fields = {};
            }

            var options = {
                'method': 'POST',
                'url': 'https://test.saferpay.com/api/payment/v1/PaymentPage/Assert',
                'headers': {
                    'Authorization': 'Basic QVBJXzI1NzM4MV83NDU3MjAwNTpKc29uQXBpUHdkMV91ajZIWW5BOQ==',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(fields)
            };
        } else {
            if (selectedOrder.owner_id) {
                email = selectedOrder.owner.email;
                name = selectedOrder.owner.name;
            } else {
                let selectedUser = await User.findOne({ where: { id: inputs.user_id } });
                email = selectedUser.email;
                name = selectedUser.name;
            }

            let filterOBJ = { where: {} };
            filterOBJ['include'] = [{
                model: OrderTickets,
                as: 'orderTickets',
                where: { order_id: inputs.order_id }
            }];
            let selectedTickets = await Ticket.findAll(filterOBJ);
            for (let i = 0; i < selectedTickets.length; i++) {
                item = {
                    "Type": "DIGITAL",
                    "Quantity": selectedTickets[i].orderTickets.length,
                    "Name": selectedTickets[i].name,
                    "UnitPrice": selectedTickets[i].price
                }
                items.push(item);
            }

            let filterOBJ2 = { where: {} };
            filterOBJ2['include'] = [{
                model: OrderItems,
                as: 'orderItems',
                where: { order_id: inputs.order_id }
            }];
            let selectedItems = await Item.findAll(filterOBJ2);
            for (let i = 0; i < selectedItems.length; i++) {
                item = {
                    "Type": "PHYSICAL",
                    "Quantity": selectedItems[i].orderItems.length,
                    "Name": selectedItems[i].name,
                    "UnitPrice": selectedItems[i].price
                }
                items.push(item);
            }

            var fields = {
                "TerminalId": "17731386",
                "Payment": {
                    "Amount": {
                        "Value": selectedOrder.price * 100,
                        "CurrencyCode": "EUR"
                    },
                    "OrderId": inputs.order_id,
                    "Description": "Test d-event"
                },
                "Notification": {
                    "NotifyUrl": "https://shop.saferpay.eu:443/saferpayintegration/status_safp_notify.php?sessionId=6"
                },
                "Payer": {
                    "BillingAddress": {
                        "FirstName": name,
                        "LastName": "x",
                        "Email": email,
                        "CountryCode": "BE"
                    }
                },
                "Order": {
                    "Items": items
                },
                "RiskFactors": {
                    "DeliveryType": "HOMEDELIVERY",
                    "PayerProfile": {
                        "HasAccount": false,
                        "HasPassword": false,
                        "FirstName": name,
                        "LastName": "x",
                        "DateOfBirth": "1990-12-17",
                        "Gender": "MALE",
                        "Email": email,
                        "Phone": {
                            "Main": "+411234509876",
                            "Mobile": "+410987612345"
                        }
                    }
                },
                "RequestHeader": {
                    "SpecVersion": "1.21",
                    "CustomerId": "257381",
                    "RequestId": Math.floor(Date.now() / 1000),
                    "RetryIndicator": 0,
                    "ClientInfo": {
                        "ShopInfo": "My Shop",
                        "OsInfo": "Windows Server 2013"
                    }
                },
                "ReturnUrls": {
                    "Success": "http://bydotpy.com/d-event/order-details/" + inputs.order_id + "/success",
                    "Fail": "http://bydotpy.com/d-event/POS/editPOS/20/" + inputs.order_id + "/failed",
                    "Abort": "http://bydotpy.com/d-event/POS/editPOS/20/" + inputs.order_id + "/abort"
                }
            };

            var options = {
                'method': 'POST',
                'url': 'https://test.saferpay.com/api/payment/v1/PaymentPage/Initialize',
                'headers': {
                    'Authorization': 'Basic QVBJXzI1NzM4MV83NDU3MjAwNTpKc29uQXBpUHdkMV91ajZIWW5BOQ==',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(fields)
            };
        }

        request(options, function(error, response) {
            if (error) throw new Error(error);
            return exits.success(JSON.parse(response.body));
        });
    }
};