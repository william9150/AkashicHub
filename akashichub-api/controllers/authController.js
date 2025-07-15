import { User } from "../models/index.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export async function login(req, res) {
  const { loginAccount, password } = req.body;
  if (!loginAccount || !password) {
    return res.status(400).json({
      success: false,
      error: { code: "VALIDATION_ERROR", message: "loginAccount 與 password 為必填" },
    });
  }
  const user = await User.findOne({ where: { LoginAccount: loginAccount } });
  if (!user) {
    return res.status(401).json({
      success: false,
      error: { code: "INVALID_CREDENTIALS", message: "帳號或密碼錯誤" },
    });
  }
  const valid = await bcrypt.compare(password, user.PasswordHash);
  if (!valid) {
    return res.status(401).json({
      success: false,
      error: { code: "INVALID_CREDENTIALS", message: "帳號或密碼錯誤" },
    });
  }
  const token = jwt.sign({ id: user.Id, loginAccount: user.LoginAccount, role: user.Role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });
  res.json({
    success: true,
    data: {
      token,
      displayName: user.DisplayName,
      role: user.Role,
    },
  });
}

// 取得當前使用者資訊
export async function me(req, res) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: { code: "UNAUTHORIZED", message: "請先登入" },
    });
  }
  res.json({
    success: true,
    data: {
      id: req.user.id,
      loginAccount: req.user.loginAccount,
      displayName: req.user.displayName || "",
      role: req.user.role,
    },
  });
}
