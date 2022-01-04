import { Sequelize, Model, DataTypes } from "sequelize";

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

export class LedgerStats extends Model {
  public sequence!: number;
  public closed_at!: Date;
  public paging_token!: string;
  public transaction_count!: number;
  public operation_count!: number;
}

LedgerStats.init(
  {
    sequence: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    closed_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    paging_token: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    transaction_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    operation_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "ledger_stats",
    sequelize,
  },
);

// Create schema if doesn't exist
sequelize.sync({ hooks: true });
