'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      User.hasMany(models.Deposit, {
        foreignKey: "deposited_by"
      })
      User.hasMany(models.Withdraw, {
        foreignKey: "withdrawn_by"
      })
    }
  };
  User.init({
    owned_by: DataTypes.STRING,
    status: DataTypes.STRING,
    enabled_at: DataTypes.STRING,
    disabled_at: DataTypes.STRING,
    balance: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};