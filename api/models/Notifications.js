/**
 * Notifications.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

    attributes: {
        title: {
            type: Sequelize.STRING,
            required: true,
            allowNull: false
        },
        read: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        },
        body: {
            type: Sequelize.STRING,
            required: true,
            allowNull: false
        },
        type : {
            type : Sequelize.ENUM,
            values : ['payment', 'send', 'receive', 'other']
        }
    },
    defaultScope: function () {
        return {
            include: [
                'project',
                'ticket', 
                {
                    model: User,
                    as: 'partner',
                    attributes: ['name', 'phone', 'email', 'address', 'description', 'registration_number']
                }
            ],
            order: [['id', 'DESC']]
        }
    },
    associations: function () {
        Notifications.belongsTo(User, {
            as: 'user',
            foreignKey: 'user_id',
            onDelete: 'CASCADE'
        });
        Notifications.belongsTo(Project, {
            as: 'project',
            foreignKey: 'project_id',
        });
        Notifications.belongsTo(Ticket, {
            as: 'ticket',
            foreignKey: 'ticket_id'
        });
        Notifications.belongsTo(User, {
            as: 'partner',
            foreignKey: 'partner_id'
        });
    },
    options: {
        tableName: 'notification',
        classMethods: {},
        instanceMethods: {},
        hooks: {}
    }

};

