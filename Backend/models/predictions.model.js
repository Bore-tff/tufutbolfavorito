import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import Partido from "./partido.model.js";

const Pronostico = sequelize.define(
  "Pronostico",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    // 🔑 Partido
    matchId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    // 🔑 Usuario
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: "usuarios",
        key: "id",
      },
    },

    // 🎯 Pronóstico
    homeScore: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    awayScore: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    // ⚽ Penales (solo eliminatorias)
    penalesHome: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    penalesAway: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    // 🏆 Fase
    fase: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    // 📊 Puntaje
    puntos: {
      type: DataTypes.INTEGER,
      allowNull: true, // 👈 importante para partidos sin jugar
      defaultValue: null,
    },
    golesAcertados: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

    // 📅 Fecha del torneo
    fecha: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "pronosticos",
    timestamps: false,

    // 🔐 CLAVE ÚNICA REAL
    indexes: [
      {
        unique: true,
        fields: ["userId", "matchId"],
      },
    ],
  }
);

// 🔗 Relaciones
Pronostico.belongsTo(Partido, { foreignKey: "matchId" });
Partido.hasMany(Pronostico, { foreignKey: "matchId" });

export default Pronostico;