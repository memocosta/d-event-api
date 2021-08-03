/**
 * OrderTickets.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

    attributes: {
        _id: {
            type: Sequelize.DOUBLE,
            required: true,
            allowNull: true
        },
        is_accessed: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        },
        is_hidden: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        },
        is_refunded: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        },
    },
    associations: function() {
        OrderTickets.belongsTo(User, {
            as: 'user',
            foreignKey: 'user_id',
            onDelete: 'CASCADE'
        });
        OrderTickets.belongsTo(Order, {
            as: 'order',
            foreignKey: 'order_id',
            onDelete: 'CASCADE'
        });
        OrderTickets.belongsTo(Ticket, {
            as: 'ticket',
            foreignKey: 'ticket_id',
            onDelete: 'CASCADE'
        });
    },
    defaultScope: function() {
        return {
            include: ['ticket']
        }
    },
    options: {
        tableName: 'order_tickets',
        classMethods: {},
        instanceMethods: {},
        hooks: {
            beforeCreate: async function(model, options) {
                let min = 1000000000;
                let max = 9999999999;
                var randomX = Math.floor(Math.random() * (max - min + 1)) + min;
                model._id = randomX;
                var Seleted_id = await OrderTickets.findOne({
                    where: {
                        _id: randomX
                    }
                });
                if (!Seleted_id) {
                    model._id = randomX;
                } else {
                    model._id = Math.floor(Date.now() / 1000);
                }

            },
            afterCreate: async function(model, options) {
                let oneTicket = await Ticket.findOne({ where: { id: model.ticket_id } });
                let blockchainOBJ = {
                    'id': model._id,
                    'ticketname': oneTicket.name,
                    'ticketprice': oneTicket.price,
                    'status': oneTicket.kind,
                    'tickettype': oneTicket.type,
                    'refundable': oneTicket.refundable,
                    'exchangeable': oneTicket.exchangeable,
                    'access': true,
                    'creator': model.user_id
                        //'creator': oneTicket.user_id
                }
                await sails.helpers.blockchain('createticket', blockchainOBJ);

                // let blockchainOBJ2 = {
                //     'id': model._id,
                //     'from': oneTicket.user_id,
                //     'to': model.user_id
                // }
                // await sails.helpers.blockchain('transferpro', blockchainOBJ2);
            },
        },
        indexes: [
            { unique: true, fields: ['_id'] }
        ]
    }

};