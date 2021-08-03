/**
 * Order.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */
module.exports = {

    attributes: {
        status: {
            type: Sequelize.ENUM,
            defaultValue: 'online',
            values: ['pos', 'online']
        },
        type: {
            type: Sequelize.STRING,
            allowNull: true
        },
        country: {
            type: Sequelize.STRING,
            required: true,
            allowNull: false,
        },
        tickets_quantity: {
            type: Sequelize.INTEGER,
            required: true,
            defaultValue: 0,
            allowNull: false,
        },
        items_quantity: {
            type: Sequelize.INTEGER,
            required: true,
            defaultValue: 0,
            allowNull: false,
        },
        price: {
            type: Sequelize.DOUBLE,
            required: true,
            defaultValue: 0,
            allowNull: false
        },
        saferpay: {
            type: Sequelize.JSON,
        }
    },
    defaultScope: function() {
        return {
            include: [{
                model: User,
                as: 'owner',
                attributes: ['name', 'phone', 'email', 'address', 'description', 'registration_number']
            }],
            order: [
                ['id', 'DESC']
            ]
        }
    },
    associations: function() {
        Order.hasMany(OrderTickets, {
            as: 'tickets',
            foreignKey: 'order_id',
            onDelete: 'CASCADE',
        });
        Order.hasMany(OrderItems, {
            as: 'items',
            foreignKey: 'order_id',
            onDelete: 'CASCADE',
        });
        Order.belongsTo(User, {
            as: 'owner',
            foreignKey: 'owner_id',
            onDelete: 'CASCADE'
        });
        Order.belongsTo(Project, {
            as: 'project',
            foreignKey: 'project_id',
            onDelete: 'SET NULL',
            OnUpdate: 'SET NULL'
        });
        Order.belongsTo(Pos, {
            as: 'pos',
            foreignKey: 'pos_id',
            onDelete: 'SET NULL',
            OnUpdate: 'SET NULL'
        });
    },
    options: {
        tableName: 'order',
        classMethods: {},
        instanceMethods: {},
        hooks: {
            beforeUpdate: async function(model, options) {
                let ovalue = Number(model.price);
                if (!Number.isInteger(ovalue)) {
                    model.price = ovalue.toFixed(2)
                }
            },
        }
    }

};