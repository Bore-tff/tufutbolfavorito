import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import Partido from "./partido.model.js";

const Pronostico = sequelize.define("Pronostico", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  matchId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  homeScore: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  awayScore: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  puntos: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  golesAcertados: {
  type: DataTypes.INTEGER,
  defaultValue: 0,
},
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  userId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    references: {
      model: "usuarios",
      key: "id",
    },
  }
}, {
  tableName: "pronosticos",
  timestamps: false,
});

// Asociación con Partido
Pronostico.belongsTo(Partido, { foreignKey: "matchId" });
Partido.hasMany(Pronostico, { foreignKey: "matchId" });

export default Pronostico;
