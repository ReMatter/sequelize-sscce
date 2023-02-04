import { DataTypes, Model } from 'sequelize';
import { createSequelize6Instance } from '../setup/create-sequelize-instance';

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

  // Boxes have many cats, a box may belong to an owner

  class Box extends Model { }

  Box.init({
    boxId: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV1, primaryKey: true },
    ownerId: DataTypes.UUID,
    boxNumber: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'Box',
  });

  class Owner extends Model { }

  Owner.init({
    ownerId: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV1, primaryKey: true },
    fullName: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Owner',
  });

  class Cat extends Model { }

  Cat.init({
    catId: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV1, primaryKey: true },
    boxId: DataTypes.UUID,
    nickname: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Cat',
  });

  Box.hasMany(Cat, { foreignKey: 'boxId', as: 'cats' });
  Box.belongsTo(Owner, { foreignKey: 'ownerId', as: 'owner' });


  await sequelize.sync({ force: true });

  await Box.create({ boxNumber: 1, cats: [{ nickname: 'whiskers' }, { nickname: 'lucky' }] }, { include: ['cats'] });
  await Box.create({ boxNumber: 2, cats: [{ nickname: 'fluffy' }, { nickname: 'smudge' }] }, { include: ['cats'] });
  await Box.create({ boxNumber: 3, cats: [{ nickname: 'angel' }, { nickname: 'lady' }], owner: { fullName: 'John Doe' } }, { include: ['cats', 'owner'] });


  const boxes = await Box.findAll({ include: ['cats'], limit: 10, where: {'$owner.fullName$': 'John Doe'} });
}
