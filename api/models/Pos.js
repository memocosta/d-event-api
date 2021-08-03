/**
 * Pos.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

    attributes: {
        name: {
            type: Sequelize.STRING,
            required: true,
            allowNull: false,
        },
        exchange: {
            type: Sequelize.STRING,
            required: true,
            allowNull: false
        },
        pin_code: {
            type: Sequelize.STRING,
            required: true,
            allowNull: false
        },
    },
    associations: function () {
        Pos.belongsToMany(Ticket, {
            through: PosTickets,
            foreignKey: 'pos_id',
            as: 'tickets',
        });
        Pos.belongsToMany(Item, {
            through: PosItems,
            foreignKey: 'pos_id',
            as: 'items',
        });
        Pos.belongsTo(Project, {
            as: 'project',
            foreignKey: 'project_id',
            onDelete: 'CASCADE'
        });
    },
    defaultScope: function () {
        return {
            order: [['id', 'DESC']]
        }
    },
    options: {
        tableName: 'pos',
        classMethods: {},
        instanceMethods: {},
        hooks: {}
    }

};