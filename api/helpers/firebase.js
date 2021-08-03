var http = require('https');
module.exports = {
    friendlyName: 'Send new notification',
    inputs: {
        token: {
            type: 'ref',
            required: true
        },
        body: {
            type: 'string',
            required: true
        },
        type: {
            type: 'string',
            required: true
        }
    },

    exits: {

    },

    fn: async function (inputs, exits) {
        var API_ACCESS_KEY = 'AAAAERCGm-w:APA91bE00wl8qj1xHVmbRKHTJuX4QSYi92L3slyTxeXrCYW1DvIPo3UR1mYXoodHkVsFDXicktVZYpHyR7NJPnrp7N7XO2OrtmLBwVamXW8jSovC7WIYokycdVliM2Fj3Tv7Ue6kXU6j';
        var title = 'D-Event';
        if (inputs.title)
            title = inputs.title;
        var fields = {
            'to': inputs.token,
            'notification': {
                'title': title,
                'body': inputs.body,
                'vibrate': 1,
                'sound': "default",
                'type': inputs.type
            },
            "priority": "high",
            'data': {
                'type': inputs.type
            },
            'alert': inputs.body,
            'title': title,
            'type': inputs.type,
        };
        var headers = {
            'Authorization': 'key=' + API_ACCESS_KEY,
            'Content-Type': 'application/json'
        };

        var options = {
            host: "fcm.googleapis.com",
            port: 443,
            path: "/fcm/send",
            method: "POST",
            headers: headers
        };

        var requ = http.request(options, function (result) {
            result.on('data', function (data) {
                process.stdout.write(data);
                return exits.success(data);
            });
        });

        requ.on('error', function (e) {
            console.error(e);
            return exits.error(e);
        });

        requ.write(JSON.stringify(fields));
        requ.end();
    }
};

