var request = require('request');
module.exports = {
    friendlyName: 'Saferpay',
    inputs: {
        table_id: {
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

    exits: {},

    fn: async function(inputs, exits) {
        let email, name, phone;
        let selectedWallet, customerTrns, amount;
        let fields = {};

        selectedWallet = await Wallet.findOne({ where: { id: inputs.table_id } });
        let user = await User.findOne({ where: { id: inputs.user_id } });

        if (selectedWallet.order_id) {
            customerTrns = "Make order with id " + selectedWallet.order_id;
            let selectedOrder = await Order.findOne({ where: { id: selectedWallet.order_id } });
            amount = selectedOrder.price * 100;
        } else {
            customerTrns = "Add amount to wallet with id " + inputs.table_id;
            amount = selectedWallet.amount * 100;
        }

        if (inputs.type && inputs.type == "assert") {
            fields = {};
        } else {
            email = user.email;
            name = user.name;
            phone = user.phone ? user.phone : "7967813180";

            fields = {
                "amount": amount,
                "email": email,
                "fullName": name,
                "customerTrns": customerTrns,
                "phone": phone,
                "requestLang": "en-GB",
                "sourceCode": "1465",
                "disableCash": "false",
                "disableExactAmount": "false",
                "allowRecurring": "false",
                "isPreAuth": "false",
                "merchantTrns": customerTrns
            }
        }

        let options = {
            'method': 'POST',
            'url': 'https://demo.vivapayments.com/api/orders',
            'headers': {
                'Authorization': 'Basic OWE3ZTliNzItODlhMi00OWY5LWEzNDktODU2YmFkZWI5Mzk0OkNNSkZyUg==',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(fields)
        };

        request(options, function(error, response) {
            if (error) {
                console.log(error);
                throw new Error(error);
            }
            return exits.success(JSON.parse(response.body));
        });
    }
};