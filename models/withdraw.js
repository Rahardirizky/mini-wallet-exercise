'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Withdraw extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Withdraw.belongsTo(models.User, {
        foreignKey: "withdrawn_by"
      })
    }
  };
  Withdraw.init({
    withdrawn_by: DataTypes.STRING,
    status: DataTypes.STRING,
    withdrawn_at: DataTypes.STRING,
    amount: DataTypes.INTEGER,
    reference_id: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Withdraw',
  });
  return Withdraw;
};