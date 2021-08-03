/**
 * PosTickets.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

    attributes: {},
    associations: function() {
        PosTickets.belongsTo(Ticket, {
            as: 'ticket',
            foreignKey: 'TicketId',
            onDelete: 'CASCADE'
        });
    },
    defaultScope: function() {
        return {
            include: ['ticket']
        }
    },
    options: {
        tableName: 'pos_tickets',
        classMethods: {},
        instanceMethods: {},
        hooks: {}
    }

};