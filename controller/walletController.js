const { getToken } = require("../helpers/jwt");
const { User, Deposit, Withdraw } = require("../models");

class WalletController {
  static async initialize(req, res) {
    try {
      const { customer_xid } = req.body;

      if (!customer_xid) {
        res.status(400).json({
          data: {
            error: { customer_xid: ["Missing data for required field."] },
          },
          status: "fail",
        });
      } else {
        const token = getToken(customer_xid);
        const found = await User.findOne({ where: { owned_by: customer_xid } });

        if (found) {
          res.status(400).json({
            data: {
              error: { customer_xid: ["Customer ID must be unique."] },
            },
            status: "fail",
          });
        } else {
          await User.create({
            owned_by: customer_xid,
            status: "disabled",
            balance: 0,
          });

          res.status(201).json({ data: { token }, status: "success" });
        }
      }
    } catch (error) {
      res
        .status(500)
        .json({ data: { error: "Internal Server Error" }, status: "fail" });
    }
  }

  static async enable(req, res) {
    try {
      const { customer_xid } = req;

      const foundUser = await User.findOne({
        where: { owned_by: customer_xid },
      });
      const now = new Date();

      if (foundUser.status === "disabled") {
        const [, [{ id, owned_by, status, enabled_at, balance }]] =
          await User.update(
            { status: "enabled", enabled_at: now.toISOString() },
            {
              where: { owned_by: customer_xid },
              returning: true,
            }
          );

        res.status(201).json({
          data: { wallet: { id, owned_by, status, enabled_at, balance } },
          status: "success",
        });
      } else {
        res.status(400).json({
          status: "fail",
          data: {
            error: "Already enabled",
          },
        });
      }
    } catch (error) {
      res
        .status(500)
        .json({ data: { error: "Internal Server Error" }, status: "fail" });
    }
  }

  static async get(req, res) {
    try {
      const { customer_xid } = req;

      const { id, owned_by, status, enabled_at, balance } = await User.findOne({
        where: { owned_by: customer_xid },
      });

      if (status === "disabled") {
        res.status(404).json({ data: { error: "disabled" }, status: "fail" });
      } else {
        res.status(200).json({
          data: {
            wallet: { id, owned_by, status, enabled_at, balance },
          },
          status: "success",
        });
      }
    } catch (error) {
      res
        .status(500)
        .json({ data: { error: "Internal Server Error" }, status: "fail" });
    }
  }

  static async deposits(req, res) {
    try {
      const { customer_xid } = req;
      const { amount, reference_id } = req.body;

      const { status, balance } = await User.findOne({
        where: { owned_by: customer_xid },
      });

      if (status === "disabled") {
        res.status(404).json({ data: { error: "disabled" }, status: "fail" });
      } else {
        const duplicateReference = await Deposit.findOne({
          where: { reference_id },
        });
        const now = new Date();

        if (duplicateReference) {
          res.status(400).json({
            data: {
              error: { reference_id: ["Reference ID is not unique"] },
            },
            status: "fail",
          });
        } else {
          const { deposited_by, status, deposited_at } = await Deposit.create({
            deposited_by: customer_xid,
            status: "success",
            deposited_at: now.toISOString(),
            amount,
            reference_id,
          });

          await User.update(
            { balance: +balance + +amount },
            { where: { owned_by: customer_xid } }
          );

          res
            .status(201)
            .json({
              data: {
                deposit: {
                  deposited_by,
                  status,
                  deposited_at,
                  amount: +amount,
                  reference_id,
                },
              },
              status: "successs"
            });
        }
      }
    } catch (error) {
      res
        .status(500)
        .json({ data: { error: "Internal Server Error" }, status: "fail" });
    }
  }

  static async withdraw(req, res) {
    try {
      const { customer_xid } = req;
      const { amount, reference_id } = req.body;

      const { status, balance } = await User.findOne({
        where: { owned_by: customer_xid },
      });

      if (status === "disabled") {
        res.status(404).json({ data: { error: "disabled" }, status: "fail" });
      } else {
        const duplicateReference = await Withdraw.findOne({
          where: { reference_id },
        });
        const now = new Date();

        if (duplicateReference) {
          res.status(400).json({
            data: {
              error: { reference_id: ["Reference ID is not unique"] },
            },
            status: "fail",
          });
        } else if (+balance >= +amount) {
          const { withdrawn_by, status, withdrawn_at } = await Withdraw.create({
            withdrawn_by: customer_xid,
            status: "success",
            withdrawn_at: now.toISOString(),
            amount,
            reference_id,
          });

          await User.update(
            { balance: +balance - +amount },
            { where: { owned_by: customer_xid } }
          );

          res
            .status(201)
            .json({
              data: {
                withdrawal: {
                  withdrawn_by,
                  status,
                  withdrawn_at,
                  amount: +amount,
                  reference_id,
                },
              },
              status: "success"
            });
        } else {
          res.status(400).json({
            data: {
              error: { amount: ["Balance is not enough"] },
            },
            status: "fail",
          });
        }
      }
    } catch (error) {
      res
        .status(500)
        .json({ data: { error: "Internal Server Error" }, status: "fail" });
    }
  }

  static async disable(req, res) {
    try {
      const { customer_xid } = req;
      const { is_disabled } = req.body;
      const now = new Date()

      const { status } = await User.findOne({
        where: { owned_by: customer_xid },
      });

      if(status === "enabled") {
        if (is_disabled === "true") {
          const [, [{ id, owned_by, status, disabled_at, balance }]] =
          await User.update(
            { status: "disabled", disabled_at: now.toISOString() },
            {
              where: { owned_by: customer_xid },
              returning: true,
            }
          );

          res.status(200).json({data: {wallet: {id, owned_by, status, disabled_at, balance}}, status: "success"})
        } else {
          res.status(400).json({
            data: {
              error: { is_disabled: ["Missing data for required field."] },
            },
            status: "fail",
          });
        }
      } else {
        res.status(400).json({
          status: "fail",
          data: {
            error: "Already disabled",
          },
        });
      }
    } catch (error) {
      res
        .status(500)
        .json({ data: { error: "Internal Server Error" }, status: "fail" });
    }
  }
}

module.exports = WalletController;
