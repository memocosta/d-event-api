var request = require('request');
module.exports = {
    friendlyName: 'Saferpay',
    inputs: {
        wallet_id: {
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
        let selectedWallet = await Wallet.findOne({ where: { id: inputs.wallet_id } });

        if (inputs.type && inputs.type == "assert") {
            if (selectedWallet.saferpay) {
                let saferpay = selectedWallet.saferpay;
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
            email = selectedWallet.user.email;
            name = selectedWallet.user.name;

            item = {
                "Type": "DIGITAL",
                "Quantity": 1,
                "Name": 'wallet ' + inputs.wallet_id,
                "UnitPrice": selectedWallet.amount
            }
            items.push(item);

            var fields = {
                "TerminalId": "17731386",
                "Payment": {
                    "Amount": {
                        "Value": selectedWallet.amount * 100,
                        "CurrencyCode": "EUR"
                    },
                    "OrderId": inputs.wallet_id,
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
                    "Success": "http://ec2-35-177-49-67.eu-west-2.compute.amazonaws.com:1338/wallet/assert/" + inputs.wallet_id + "/success",
                    "Fail": "http://ec2-35-177-49-67.eu-west-2.compute.amazonaws.com:1338/wallet/assert/" + inputs.wallet_id + "/failed",
                    "Abort": "http://ec2-35-177-49-67.eu-west-2.compute.amazonaws.com:1338/wallet/assert/" + inputs.wallet_id + "/abort"
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
            if (error) {
                console.log(error);
                throw new Error(error);
            }
            return exits.success(JSON.parse(response.body));
        });
    }
};