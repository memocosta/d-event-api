/**
 * CartTickets.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

    attributes: {
        quantity: {
            type: Sequelize.DOUBLE,
            defaultValue: 0,
        },
    },
    options: {
        tableName: 'cart_tickets',
        classMethods: {},
        instanceMethods: {},
        hooks: {}
    }

};