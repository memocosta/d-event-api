/**
 * Item.js
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
        exchange: {
            type: Sequelize.STRING,
            required: true,
            allowNull: false
        },
        price: {
            type: Sequelize.DOUBLE,
            required: true,
            allowNull: false
        },
        vat_rate: {
            type: Sequelize.DOUBLE,
            defaultValue: 0
        },
        description: {
            type: Sequelize.STRING(2500),
            defaultValue: ''
        },
    },
    associations: function() {
        Item.belongsTo(Image, {
            as: 'image',
            foreignKey: 'image_id',
            onDelete: 'SET NULL',
            OnUpdate: 'SET NULL'
        });
        Item.belongsTo(User, {
            as: 'user',
            foreignKey: 'user_id',
            onDelete: 'CASCADE'
        });
        Item.belongsTo(Project, {
            as: 'project',
            foreignKey: 'project_id',
            onDelete: 'CASCADE'
        });
        Item.belongsTo(Ticket, {
            as: 'ticket',
            foreignKey: 'ticket_id',
            onDelete: 'CASCADE'
        });
        Item.hasMany(OrderItems, {
            as: 'orderItems',
            foreignKey: 'item_id',
            onDelete: 'CASCADE'
        });
    },
    defaultScope: function() {
        return {
            include: [
                'image', 'project', 'ticket',
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
        tableName: 'item',
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