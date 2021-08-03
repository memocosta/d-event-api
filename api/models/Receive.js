/**
 * Receive.js
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
        amount: {
            type: Sequelize.DOUBLE,
            required: true,
            allowNull: false
        },
        message: {
            type: Sequelize.STRING(2500),
            defaultValue: ''
        },
    },
    associations: function() {
        Receive.belongsTo(User, {
            as: 'user',
            foreignKey: 'user_id',
            onDelete: 'CASCADE'
        });
    },
    defaultScope: function() {
        return {
            include: [{
                model: User,
                as: 'user',
                attributes: ['name', 'phone', 'email', 'address', 'description', 'registration_number']
            }],
            order: [
                ['id', 'DESC']
            ]
        }
    },
    options: {
        tableName: 'receive',
        classMethods: {},
        instanceMethods: {},
        hooks: {}
    }
};