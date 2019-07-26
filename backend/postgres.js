import Sequelize from "sequelize";

export const sequelize = new Sequelize(
  process.env.DEV
    ? "postgres://localhost/dashboard?sslmode=disable"
    : process.env.POSTGRES_URL,
  process.env.DEV ? {} : { dialect: "postgres", dialectOptions: { ssl: true } },
);

export const NodeMeasurement = sequelize.define(
  "node_measurement",
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    node_id: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    date: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    status: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
  },
  {
    indexes: [{ unique: true, fields: ["node_id", "date"] }],
  },
);

export const LedgerStats = sequelize.define("ledger_stats", {
  sequence: {
    type: Sequelize.INTEGER,
    allowNull: false,
    primaryKey: true,
  },
  closed_at: {
    type: Sequelize.DATE,
    allowNull: false,
  },
  paging_token: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  transaction_count: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  operation_count: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
});

// Create schema if doesn't exist
sequelize.sync({ hooks: true });
