import { Sequelize, INTEGER, STRING, DATE } from "sequelize";

export const sequelize = new Sequelize(
  process.env.DEV
    ? "postgres://localhost/dashboard?sslmode=disable"
    : process.env.POSTGRES_URL || "",
  process.env.DEV
    ? {}
    : {
        dialect: "postgres",
        dialectOptions: {
          ssl: {
            require: true,
            rejectUnauthorized: false,
          },
        },
      },
);

export const NodeMeasurement = sequelize.define(
  "node_measurement",
  {
    id: {
      type: INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    node_id: {
      type: STRING,
      allowNull: false,
    },
    date: {
      type: DATE,
      allowNull: false,
    },
    status: {
      type: INTEGER,
      allowNull: false,
    },
  },
  {
    indexes: [{ unique: true, fields: ["node_id", "date"] }],
  },
);

export const LedgerStats = sequelize.define("ledger_stats", {
  sequence: {
    type: INTEGER,
    allowNull: false,
    primaryKey: true,
  },
  closed_at: {
    type: DATE,
    allowNull: false,
  },
  paging_token: {
    type: STRING,
    allowNull: false,
  },
  transaction_count: {
    type: INTEGER,
    allowNull: false,
  },
  operation_count: {
    type: INTEGER,
    allowNull: false,
  },
});

// Create schema if doesn't exist
sequelize.sync({ hooks: true });
