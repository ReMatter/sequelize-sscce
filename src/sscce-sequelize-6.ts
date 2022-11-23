import { DataTypes, Model, Op } from 'sequelize';
import { createSequelize6Instance } from '../setup/create-sequelize-instance';
import { expect } from 'chai';
import sinon from 'sinon';

// if your issue is dialect specific, remove the dialects you don't need to test on.
export const testingOnDialects = new Set(['mssql', 'sqlite', 'mysql', 'mariadb', 'postgres', 'postgres-native']);

// You can delete this file if you don't want your SSCCE to be tested against Sequelize 6

// Your SSCCE goes inside this function.
export async function run() {
  // This function should be used instead of `new Sequelize()`.
  // It applies the config for your SSCCE to work on CI.
  const sequelize = createSequelize6Instance({
    logQueryParameters: true,
    benchmark: true,
    define: {
      // For less clutter in the SSCCE
      timestamps: false,
    },
  });

  class Truck extends Model { }

  Truck.init({
    truckId: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV1, primaryKey: true },
    centralizedCompanyId: DataTypes.UUID,
  }, {
    sequelize,
    modelName: 'Truck',
  });

  class Attachable extends Model { }

  Attachable.init({
    attachableId: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV1, primaryKey: true },
    truckId: DataTypes.UUID,
    s3Key: DataTypes.STRING,
    centralizedCompanyId: DataTypes.UUID,
  }, {
    sequelize,
    modelName: 'Attachable',
  });

  Truck.hasMany(Attachable, { foreignKey: 'truckId', as: 'attachables' });

  // You can use sinon and chai assertions directly in your SSCCE.
  const spy = sinon.spy();
  await sequelize.sync({ force: true });

  const truck = await Truck.create({ centralizedCompanyId: '62536467-7897-40fe-983e-7cc789c30ed3', attachables: [{ s3Key: 'test', centralizedCompanyId: '62536467-7897-40fe-983e-7cc789c30ed3' }] }, { include: ['attachables'] });

  await Truck.findOne({ where: { truckId: truck.get('truckId'), centralizedCompanyId: '62536467-7897-40fe-983e-7cc789c30ed3' }, include: ['attachables'], logging(sql) {
    spy(sql);
  }, })
  await Truck.findOne({ where: { [Op.and]: [{ truckId: truck.get('truckId') }, { centralizedCompanyId: '62536467-7897-40fe-983e-7cc789c30ed3' }]}, include: ['attachables'], logging(sql) {
    spy(sql);
  }, });

  expect(spy.getCall(0).args[0]).to.equal(spy.getCall(1).args[0]);
}
