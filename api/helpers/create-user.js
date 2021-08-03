module.exports = {
    friendlyName: 'Create user',
    description: '',
    inputs: {
        user: {
            type: 'ref',
            description: 'all the user obj data'
        }
    },

    exits: {

    },

    fn: async function (inputs, exits) {
        try {
            let UserObj = inputs.user;
            User.create(UserObj).then(async (finalUserObj) => {
                var finalUserobjJSON = finalUserObj['dataValues'];
                return exits.success(finalUserobjJSON);
            }).catch(err => {
                return exits.error(err);
            });
        } catch (e) {
            return exits.error(e);
        }
    }
};
