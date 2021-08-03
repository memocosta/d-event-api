/**
 * Wallet.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */
module.exports = {

    attributes: {
        qr: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        status: {
            type: Sequelize.STRING(2500),
            defaultValue: '',
        },
        confirm_receive: {
            type: Sequelize.BOOLEAN,
            defaultValue: true
        },
        transaction_id: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        viva_id: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        amount: {
            type: Sequelize.DOUBLE,
            required: true,
            allowNull: false
        },
        system_amount: {
            type: Sequelize.DOUBLE,
            allowNull: true,
        },
        message: {
            type: Sequelize.STRING(2500),
            defaultValue: ''
        },
        saferpay: {
            type: Sequelize.JSON,
        }
    },
    associations: function() {
        Wallet.belongsTo(User, {
            as: 'user',
            foreignKey: 'user_id',
            onDelete: 'CASCADE'
        });
        Wallet.belongsTo(User, {
            as: 'partner',
            foreignKey: 'partner_id',
            onDelete: 'SET NULL',
            OnUpdate: 'SET NULL'
        });
        Wallet.belongsTo(Order, {
            as: 'order',
            foreignKey: 'order_id',
            onDelete: 'CASCADE'
        });
    },
    defaultScope: function() {
        return {
            include: [
                'order',
                {
                    model: User,
                    as: 'partner',
                    attributes: ['name', 'phone', 'email', 'address', 'description', 'registration_number']
                },
                {
                    model: User,
                    as: 'user',
                    attributes: ['name', 'phone', 'email', 'address', 'description', 'registration_number']
                }
            ],
            order: [
                ['id', 'DESC']
            ]
        }
    },
    options: {
        tableName: 'wallet',
        classMethods: {},
        instanceMethods: {},
        hooks: {
            beforeCreate: async function(model, options) {
                let ovalue = Number(model.amount);
                if (!Number.isInteger(ovalue)) {
                    model.amount = ovalue.toFixed(2)
                }
            },
            afterCreate: async function(model, options) {
                if (model.amount < 0 && model.system_amount) {
                    let blockchainAdminOBJ = {
                        'idpro': 5,
                        'amount': model.system_amount
                    }
                    await sails.helpers.blockchain('cashinpro', blockchainAdminOBJ);
                }
            },
        }
    }
};