'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Deposit extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Deposit.belongsTo(models.User, {
        foreignKey: "deposited_by"
      })
    }
  };
  Deposit.init({
    deposited_by: DataTypes.STRING,
    status: DataTypes.STRING,
    deposited_at: DataTypes.STRING,
    amount: DataTypes.INTEGER,
    reference_id: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Deposit',
  });
  return Deposit;
};