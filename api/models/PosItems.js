/**
 * PosItems.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

    attributes: {},
    associations: function() {
        PosItems.belongsTo(Item, {
            as: 'item',
            foreignKey: 'ItemId',
            onDelete: 'CASCADE'
        });
    },
    defaultScope: function() {
        return {
            include: ['item']
        }
    },
    options: {
        tableName: 'pos_items',
        classMethods: {},
        instanceMethods: {},
        hooks: {}
    }

};