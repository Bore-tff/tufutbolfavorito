import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import Partido from "./partido.model.js";

const PronosticoFavorito = sequelize.define("PronosticoFavorito", {
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
  tableName: "pronosticosFavoritos",
  timestamps: false,
});

// Asociación con Partido
PronosticoFavorito.belongsTo(Partido, { foreignKey: "matchId" });
Partido.hasMany(PronosticoFavorito, { foreignKey: "matchId" });

export default PronosticoFavorito;
