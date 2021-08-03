/**
 * Cart.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

    attributes: {},
    associations: function () {
        Cart.belongsToMany(Ticket, {
            through: CartTickets,
            foreignKey: 'cart_id',
            as: 'tickets',
        });
        Cart.belongsToMany(Item, {
            through: CartItems,
            foreignKey: 'cart_id',
            as: 'items',
        });
        Cart.belongsTo(User, {
            as: 'owner',
            foreignKey: 'owner_id',
            onDelete: 'CASCADE'
        });
    },
    defaultScope: function () {
        return {
            include: [
                'tickets', 'items', 
                {
                    model: User,
                    as: 'owner',
                    attributes: ['name', 'phone', 'email', 'address', 'description', 'registration_number']
                }
            ],
            order: [['id', 'DESC']]
        }
    },
    options: {
        tableName: 'cart',
        classMethods: {},
        instanceMethods: {},
        hooks: {}
    }

};

