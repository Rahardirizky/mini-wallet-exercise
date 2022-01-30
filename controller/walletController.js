const { getToken } = require("../helpers/jwt");
const db = {};

class WalletController {
  static initialize(req, res) {
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
      db[customer_xid] = {
        id: customer_xid,
        owned_by: customer_xid,
        status: "disabled",
        balance: 0,
      };
      res.status(201).json({ data: { token }, status: "success" });
    }
  }

  static enable(req, res) {
    const { customer_xid } = req;

    if (db[customer_xid].status === "disabled") {
      db[customer_xid].status = "enabled";
      db[customer_xid].enabled_at = new Date();
      res.status(201).json({
        data: {
          wallet: {
            id: customer_xid,
            owned_by: customer_xid,
            status: db[customer_xid].status,
            enabled_at: db[customer_xid].enabled_at,
            balance: db[customer_xid].balance,
          },
        },
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
  }

  static get(req, res) {
    const { customer_xid } = req;

    if (db[customer_xid].status === "disabled") {
      res.status(404).json({ data: { error: "disabled" }, status: "fail" });
    } else {
      res.status(200).json({
        data: {
          wallet: {
            id: customer_xid,
            owned_by: customer_xid,
            status: db[customer_xid].status,
            enabled_at: db[customer_xid].enabled_at,
            balance: db[customer_xid].balance,
          },
        },
        status: "success",
      });
    }
  }

  static deposits(req, res) {
    const { customer_xid } = req;
    const { amount, reference_id } = req.body;
    let deposit = {
      id: customer_xid,
      deposited_by: customer_xid,
      status: "success",
      deposited_at: new Date(),
      amount: +amount,
      reference_id,
    };

    if (db[customer_xid].status === "disabled") {
      res.status(404).json({ data: { error: "disabled" }, status: "fail" });
    } else {
      if (
        db[customer_xid].deposits &&
        !db[customer_xid].deposits.find(
          (el) => el.reference_id === reference_id
        )
      ) {
        db[customer_xid].deposits.push(deposit);
        db[customer_xid].balance += +amount;
        res.status(201).json({ data: { deposit }, status: "success" });
      } else if (!db[customer_xid].deposits) {
        db[customer_xid].deposits = [deposit];
        db[customer_xid].balance += +amount;
        res.status(201).json({ data: { deposit }, status: "success" });
      } else {
        res.status(400).json({
          data: {
            error: { reference_id: ["Reference ID is not unique"] },
          },
          status: "fail",
        });
      }
    }
  }

  static withdraw(req, res) {
    const { customer_xid } = req;
    const { amount, reference_id } = req.body;
    let withdrawal = {
      id: customer_xid,
      withdrawn_by: customer_xid,
      status: "success",
      withdrawn_at: new Date(),
      amount: +amount,
      reference_id,
    };

    if (db[customer_xid].status === "disabled") {
      res.status(404).json({ data: { error: "disabled" }, status: "fail" });
    } else if (db[customer_xid].balance < amount) {
      res.status(400).json({
        data: {
          error: { amount: ["Balance is not enough"] },
        },
        status: "fail",
      });
    } else {
      if (
        db[customer_xid].withdrawals &&
        !db[customer_xid].withdrawals.find(
          (el) => el.reference_id === reference_id
        )
      ) {
        db[customer_xid].withdrawals.push(withdrawal);
        db[customer_xid].balance -= +amount;
        res.status(201).json({ data: { withdrawal }, status: "success" });
      } else if (!db[customer_xid].withdrawals) {
        db[customer_xid].withdrawals = [withdrawal];
        db[customer_xid].balance -= +amount;
        res.status(201).json({ data: { withdrawal }, status: "success" });
      } else {
        res.status(400).json({
          data: {
            error: { reference_id: ["Reference ID is not unique"] },
          },
          status: "fail",
        });
      }
    }
  }

  static disable(req, res) {
    const { customer_xid } = req;
    const { is_disabled } = req.body;

    if (db[customer_xid].status === "enabled") {
      if (is_disabled === "true") {
        db[customer_xid].status = "disabled";
        db[customer_xid].disabled_at = new Date();

        res.status(200).json({
          data: {
            wallet: {
              id: customer_xid,
              owned_by: customer_xid,
              status: db[customer_xid].status,
              disabled_at: db[customer_xid].disabled_at,
              balance: db[customer_xid].balance,
            },
          },
        });
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
  }
}

module.exports = WalletController;
