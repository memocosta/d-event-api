/**
 * User.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */
var bcrypt = require('bcrypt');
module.exports = {

    attributes: {
        name: {
            type: Sequelize.STRING,
            required: true,
            allowNull: false
        },
        email: {
            type: Sequelize.STRING,
            required: true,
            allowNull: false
        },
        phone: {
            type: Sequelize.STRING,
            required: false,
            allowNull: true,
        },
        fb_id: {
            type: Sequelize.STRING,
            required: false,
            allowNull: true,
        },
        device_token: {
            type: Sequelize.STRING,
            defaultValue: 'xxx'
        },
        password: {
            type: Sequelize.STRING,
            required: true,
            allowNull: false,
        },
        passwordRestToken: {
            type: Sequelize.STRING,
            defaultValue: ''
        },
        VAT: {
            type: Sequelize.FLOAT,
            required: true,
        },
        gender: {
            type: Sequelize.ENUM,
            defaultValue: 'male',
            values: ['male', 'female']
        },
        address: {
            type: Sequelize.JSON,
        },
        favorite_categories: {
            type: Sequelize.JSON,
        },
        businessArea: {
            type: Sequelize.STRING,
        },
        bankAccount: {
            type: Sequelize.JSON,
        },
        withdrawal: {
            type: Sequelize.DOUBLE,
            allowNull: true
        },
        description: {
            type: Sequelize.STRING(2500),
            defaultValue: ''
        },
        registration_number: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        isDeleted: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        },
    },
    associations: function() {
        User.belongsTo(Image, {
            as: 'image',
            foreignKey: 'Image_id',
            onDelete: 'SET NULL',
            OnUpdate: 'SET NULL'
        });
    },
    defaultScope: function() {
        return {
            include: ['image'],
            attributes: ['id', 'name', 'phone', 'email', 'address', 'VAT', 'businessArea', 'bankAccount', 'favorite_categories', 'isDeleted', 'gender', 'withdrawal', 'description', 'registration_number', 'device_token']
        }
    },
    options: {
        tableName: 'user',
        hooks: {
            beforeCreate: async function(model, options) {
                var hash = await bcrypt.hash(model.password, 10);
                model.password = hash;
                model.favorite_categories = [
                    "Auto, Boat & Air",
                    "Business & Professional",
                    "Charity & Causes",
                    "Community & Culture",
                    "Family & Education",
                    "Fashion & Beauty",
                    "Film, Media & Entertainment",
                    "Travel & Outdoor",
                    "Food & Drink",
                    "Government & Politics",
                    "Health & Wellness",
                    "Hobbies & Special Interest",
                    "Home & Lifestyle",
                    "Music",
                    "Performing & Visual Arts",
                    "Religion & Spirituality",
                    "School Activities",
                    "Science & Technology",
                    "Other Seasonal & Holiday",
                    "Sports & Fitness",
                    "Other"
                ]
            },
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
        },
        scopes: {
            DontInclude: {}
        },
        indexes: [
            { unique: true, fields: ['email'] }
        ]

    }
};