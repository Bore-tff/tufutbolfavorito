import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import Partido from "./partido.model.js";

const PronosticoFavoritoGoleador = sequelize.define("PronosticoFavoritoGoleador", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  matchId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  fecha: {
  type: DataTypes.INTEGER,
  allowNull: false
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
  tableName: "pronosticosFavoritosGoleador",
  timestamps: false,
});

// Asociación con Partido
PronosticoFavoritoGoleador.belongsTo(Partido, { foreignKey: "matchId" });
Partido.hasMany(PronosticoFavoritoGoleador, { foreignKey: "matchId" });

export default PronosticoFavoritoGoleador;
