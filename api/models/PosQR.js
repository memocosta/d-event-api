/**
 * PosQR.js
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
            defaultValue: 0,
            allowNull: false
        },
        obj: {
            type: Sequelize.JSON,
        }
    },
    defaultScope: function() {},
    associations: function() {
        PosQR.belongsTo(Pos, {
            as: 'pos',
            foreignKey: 'pos_id',
            onDelete: 'CASCADE',
        });
    },
    options: {
        tableName: 'pos_qr',
        classMethods: {},
        instanceMethods: {},
        hooks: {}
    }

};