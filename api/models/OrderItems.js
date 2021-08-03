/**
 * OrderItems.js
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
    },
    associations: function () {
        OrderItems.belongsTo(User, {
            as: 'user',
            foreignKey: 'user_id',
            onDelete: 'CASCADE'
        });
        OrderItems.belongsTo(Order, {
            as: 'order',
            foreignKey: 'order_id',
            onDelete: 'CASCADE'
        });
        OrderItems.belongsTo(Item, {
            as: 'item',
            foreignKey: 'item_id',
            onDelete: 'CASCADE'
        });
    },
    defaultScope: function () {
        return {
            include: ['item']
        }
    },
    options: {
        tableName: 'order_items',
        classMethods: {},
        instanceMethods: {},
        hooks: {
            beforeCreate: async function (model, options) {
                let min = 1000000000;
                let max = 9999999999;
                var randomX = Math.floor(Math.random() * (max - min + 1) ) + min;
                model._id = randomX;
                var Seleted_id = await OrderItems.findOne({
                    where: {
                        _id: randomX
                    }
                });
                if (!Seleted_id) {
                    model._id = randomX;
                } else {
                    model._id =  Math.floor(Date.now() / 1000);
                }
                
            },
        },
        indexes: [
            { unique: true, fields: ['_id'] }
        ]
    }

}; 