var request = require('request').defaults({ rejectUnauthorized: false });
module.exports = {
    friendlyName: 'Blockchain',
    description: '',
    inputs: {
        path: {
            type: 'string',
            required: true
        },
        OBJ: {
            type: 'ref',
            required: true,
            description: 'all the blockchain obj data'
        }
    },

    exits: {

    },

    fn: async function(inputs, exits) {
        var options = {
            'method': 'POST',
            'url': 'https://3.139.98.56:8000/pocchaincode/' + inputs.path,
            'headers': {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            form: inputs.OBJ
        };
        request(options, function(error, response) {
            if (error) console.log(error);
            console.log(response.body);
            return exits.success(response.body);
        });

    }
};