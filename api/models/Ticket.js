/**
 * Ticket.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */
var moment = require('moment');
module.exports = {

    attributes: {
        name: {
            type: Sequelize.STRING,
            required: true,
            allowNull: false,
        },
        quantity: {
            type: Sequelize.INTEGER,
            required: true,
            allowNull: false,
        },
        current_quantity: {
            type: Sequelize.INTEGER,
            required: true,
            allowNull: false,
        },
        channel: {
            type: Sequelize.STRING,
            required: true,
            allowNull: false
        },
        type: {
            type: Sequelize.STRING,
            required: true,
            allowNull: false
        },
        price: {
            type: Sequelize.DOUBLE,
            required: true,
            allowNull: false
        },
        exchangeable: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        },
        refundable: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        },
        validity: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        },
        from: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW
        },
        to: {
            type: Sequelize.DATE,
            allowNull: false,
        },
        kind: {
            type: Sequelize.ENUM,
            defaultValue: 'free',
            values: ['free', 'paid', 'donation']
        },
        vat_rate: {
            type: Sequelize.DOUBLE,
            defaultValue: 0
        },
        description: {
            type: Sequelize.STRING(2500),
            defaultValue: ''
        },
        terms: {
            type: Sequelize.STRING(2500),
            defaultValue: ''
        },
        isOutdated: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        }
    },
    associations: function() {
        Ticket.belongsTo(Image, {
            as: 'image',
            foreignKey: 'image_id',
            onDelete: 'SET NULL',
            OnUpdate: 'SET NULL'
        });
        Ticket.belongsTo(User, {
            as: 'user',
            foreignKey: 'user_id',
            onDelete: 'SET NULL',
            OnUpdate: 'SET NULL'
        });
        Ticket.belongsTo(Project, {
            as: 'project',
            foreignKey: 'project_id',
            onDelete: 'CASCADE'
        });
        Ticket.hasMany(OrderTickets, {
            as: 'orderTickets',
            foreignKey: 'ticket_id',
            onDelete: 'CASCADE'
        });
    },
    defaultScope: function() {
        let WhereOBJ = {};
        let filterDate = moment().toISOString();
        WhereOBJ['from'] = {
            [Sequelize.Op.lte]: filterDate }
        WhereOBJ['to'] = {
            [Sequelize.Op.gte]: filterDate }
        return {
            include: [
                'image', 'project',
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
        tableName: 'ticket',
        scopes: {
            DontInclude: {}
        },
        hooks: {
            afterDestroy: async function(instance, options) {
                var SeletedImage = await Image.findOne({
                    where: {
                        id: instance.image_id
                    }
                });
                if (SeletedImage) {
                    await SeletedImage.destroy();
                }
            }
        }
    }
};