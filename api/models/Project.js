/**
 * Project.js
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
        category: {
            type: Sequelize.STRING,
            required: true,
            allowNull: false
        },
        type: {
            type: Sequelize.STRING,
            required: true,
            allowNull: false
        },
        address: {
            type: Sequelize.JSON,
        },
        publish: {
            type: Sequelize.BOOLEAN,
            defaultValue: true
        },
        ongoing: {
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
        genderAccess: {
            type: Sequelize.ENUM,
            defaultValue: 'all',
            values: ['all', 'males', 'females']
        },
        description: {
            type: Sequelize.STRING(2500),
            defaultValue: ''
        },
        contactInfo: {
            type: Sequelize.STRING(2500),
            defaultValue: ''
        },
        isFavorite: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        },
        isPurchaced: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        }
    },
    associations: function() {
        Project.belongsTo(Image, {
            as: 'image',
            foreignKey: 'image_id',
            onDelete: 'SET NULL',
            OnUpdate: 'SET NULL'
        });
        Project.belongsTo(User, {
            as: 'user',
            foreignKey: 'user_id',
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
                'image',
                {
                    model: User,
                    as: 'user',
                    attributes: ['name', 'phone', 'email', 'address', 'description', 'registration_number']
                }
            ]
        }
    },
    options: {
        tableName: 'project',
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