/**
 * Favorite.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

    attributes: {},
    associations: function () {
      Favorite.belongsTo(Project , {
        as : 'project',
        foreignKey : 'project_id',
        onDelete : 'CASCADE'
      });
      Favorite.belongsTo(User , {
        as : 'user',
        foreignKey : 'user_id',
        onDelete : 'CASCADE'
      })
    },
    defaultScope: function () {
        return {
            include: ['project'],
            order: [['id', 'DESC']]
        }
    },
    options: {
      tableName: 'favorite',
      classMethods: {},
      instanceMethods: {},
      hooks: {}
    }
  };
  
  