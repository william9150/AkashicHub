import { User } from "../models/index.js";
import bcrypt from "bcrypt";
import logger from "../utils/logger.js";

/**
 * 取得所有使用者列表
 * GET /api/admin/users
 */
export async function getUsers(req, res) {
  const users = await User.findAll({
    attributes: ["Id", "LoginAccount", "DisplayName", "Role"],
    order: [["Id", "ASC"]],
  });
  res.json({ success: true, data: users });
}

/**
 * 新增使用者
 * POST /api/admin/users
 */
export async function createUser(req, res) {
  const { loginAccount, displayName, password, role = "User" } = req.body;

  if (!loginAccount || !displayName || !password) {
    return res.status(400).json({
      success: false,
      error: { code: "VALIDATION_ERROR", message: "loginAccount、displayName、password 為必填" },
    });
  }

  // 檢查帳號是否已存在
  const existing = await User.findOne({ where: { LoginAccount: loginAccount } });
  if (existing) {
    return res.status(409).json({ success: false, error: { code: "CONFLICT", message: "登入帳號已存在" } });
  }

  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({
    LoginAccount: loginAccount,
    DisplayName: displayName,
    PasswordHash: hash,
    Role: role,
  });

  logger.info("USER_CREATED", { userId: user.Id, by: req.user?.Id });

  res.status(201).json({
    success: true,
    data: {
      id: user.Id,
      loginAccount: user.LoginAccount,
      displayName: user.DisplayName,
      role: user.Role,
    },
  });
}

/**
 * 更新使用者
 * PUT /api/admin/users/:id
 */
export async function updateUser(req, res) {
  const { id } = req.params;
  const { displayName, role, password } = req.body;

  const user = await User.findByPk(id);
  if (!user) {
    return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "User 不存在" } });
  }

  const updates = {};
  if (displayName !== undefined) updates.DisplayName = displayName;
  if (role !== undefined) updates.Role = role;
  if (password !== undefined) {
    updates.PasswordHash = await bcrypt.hash(password, 10);
  }

  await user.update(updates);

  logger.info("USER_UPDATED", { userId: id, by: req.user?.Id });

  res.json({ success: true, message: "User updated successfully." });
}

/**
 * 刪除使用者
 * DELETE /api/admin/users/:id
 */
export async function deleteUser(req, res) {
  const { id } = req.params;
  const user = await User.findByPk(id);
  if (!user) {
    return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "User 不存在" } });
  }
  await user.destroy();

  logger.info("USER_DELETED", { userId: id, by: req.user?.Id });

  res.status(204).send();
}
