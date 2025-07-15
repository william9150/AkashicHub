import { jest } from '@jest/globals';
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser
} from '../controllers/userController.js';

// Mock User model
const mockUser = {
  findAll: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  findByPk: jest.fn()
};

// Mock bcrypt
const mockBcrypt = {
  hash: jest.fn()
};

// Mock logger
const mockLogger = {
  info: jest.fn()
};

// Mock models and utilities
jest.unstable_mockModule('../models/index.js', () => ({
  User: mockUser
}));

jest.unstable_mockModule('bcrypt', () => mockBcrypt);

jest.unstable_mockModule('../utils/logger.js', () => ({
  default: mockLogger
}));

describe('UserController', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      user: { Id: 1, role: 'Admin' }
    };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn()
    };
    jest.clearAllMocks();
  });

  describe('getUsers', () => {
    it('should return all users with selected fields', async () => {
      const mockUsersData = [
        {
          Id: 1,
          LoginAccount: 'admin',
          DisplayName: '系統管理員',
          Role: 'Admin'
        },
        {
          Id: 2,
          LoginAccount: 'user01',
          DisplayName: '一般使用者',
          Role: 'User'
        }
      ];

      mockUser.findAll.mockResolvedValue(mockUsersData);

      await getUsers(req, res);

      expect(mockUser.findAll).toHaveBeenCalledWith({
        attributes: ["Id", "LoginAccount", "DisplayName", "Role"],
        order: [["Id", "ASC"]]
      });

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockUsersData
      });
    });

    it('should return empty array when no users found', async () => {
      mockUser.findAll.mockResolvedValue([]);

      await getUsers(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: []
      });
    });
  });

  describe('createUser', () => {
    it('should create a new user successfully with default role', async () => {
      req.body = {
        loginAccount: 'newuser',
        displayName: '新使用者',
        password: 'password123'
      };

      const mockCreatedUser = {
        Id: 3,
        LoginAccount: 'newuser',
        DisplayName: '新使用者',
        Role: 'User'
      };

      mockUser.findOne.mockResolvedValue(null); // User doesn't exist
      mockBcrypt.hash.mockResolvedValue('hashed_password');
      mockUser.create.mockResolvedValue(mockCreatedUser);

      await createUser(req, res);

      expect(mockUser.findOne).toHaveBeenCalledWith({
        where: { LoginAccount: 'newuser' }
      });
      expect(mockBcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(mockUser.create).toHaveBeenCalledWith({
        LoginAccount: 'newuser',
        DisplayName: '新使用者',
        PasswordHash: 'hashed_password',
        Role: 'User'
      });

      expect(mockLogger.info).toHaveBeenCalledWith("USER_CREATED", {
        userId: 3,
        by: 1
      });

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          id: 3,
          loginAccount: 'newuser',
          displayName: '新使用者',
          role: 'User'
        }
      });
    });

    it('should create a new admin user when role is specified', async () => {
      req.body = {
        loginAccount: 'newadmin',
        displayName: '新管理員',
        password: 'password123',
        role: 'Admin'
      };

      const mockCreatedUser = {
        Id: 4,
        LoginAccount: 'newadmin',
        DisplayName: '新管理員',
        Role: 'Admin'
      };

      mockUser.findOne.mockResolvedValue(null);
      mockBcrypt.hash.mockResolvedValue('hashed_password');
      mockUser.create.mockResolvedValue(mockCreatedUser);

      await createUser(req, res);

      expect(mockUser.create).toHaveBeenCalledWith({
        LoginAccount: 'newadmin',
        DisplayName: '新管理員',
        PasswordHash: 'hashed_password',
        Role: 'Admin'
      });

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          id: 4,
          loginAccount: 'newadmin',
          displayName: '新管理員',
          role: 'Admin'
        }
      });
    });

    it('should return 400 when loginAccount is missing', async () => {
      req.body = {
        displayName: '使用者',
        password: 'password123'
      };

      await createUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "loginAccount、displayName、password 為必填"
        }
      });
    });

    it('should return 400 when displayName is missing', async () => {
      req.body = {
        loginAccount: 'user',
        password: 'password123'
      };

      await createUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "loginAccount、displayName、password 為必填"
        }
      });
    });

    it('should return 400 when password is missing', async () => {
      req.body = {
        loginAccount: 'user',
        displayName: '使用者'
      };

      await createUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "loginAccount、displayName、password 為必填"
        }
      });
    });

    it('should return 409 when loginAccount already exists', async () => {
      req.body = {
        loginAccount: 'existing',
        displayName: '重複使用者',
        password: 'password123'
      };

      const mockExistingUser = {
        Id: 5,
        LoginAccount: 'existing'
      };

      mockUser.findOne.mockResolvedValue(mockExistingUser);

      await createUser(req, res);

      expect(mockUser.findOne).toHaveBeenCalledWith({
        where: { LoginAccount: 'existing' }
      });

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: "CONFLICT",
          message: "登入帳號已存在"
        }
      });
    });
  });

  describe('updateUser', () => {
    it('should update user displayName and role successfully', async () => {
      req.params.id = '2';
      req.body = {
        displayName: '更新後的名稱',
        role: 'Admin'
      };

      const mockExistingUser = {
        Id: 2,
        LoginAccount: 'user01',
        update: jest.fn()
      };

      mockUser.findByPk.mockResolvedValue(mockExistingUser);

      await updateUser(req, res);

      expect(mockUser.findByPk).toHaveBeenCalledWith('2');
      expect(mockExistingUser.update).toHaveBeenCalledWith({
        DisplayName: '更新後的名稱',
        Role: 'Admin'
      });

      expect(mockLogger.info).toHaveBeenCalledWith("USER_UPDATED", {
        userId: '2',
        by: 1
      });

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "User updated successfully."
      });
    });

    it('should update user password', async () => {
      req.params.id = '2';
      req.body = {
        password: 'newpassword123'
      };

      const mockExistingUser = {
        Id: 2,
        update: jest.fn()
      };

      mockUser.findByPk.mockResolvedValue(mockExistingUser);
      mockBcrypt.hash.mockResolvedValue('new_hashed_password');

      await updateUser(req, res);

      expect(mockBcrypt.hash).toHaveBeenCalledWith('newpassword123', 10);
      expect(mockExistingUser.update).toHaveBeenCalledWith({
        PasswordHash: 'new_hashed_password'
      });
    });

    it('should update multiple fields at once', async () => {
      req.params.id = '2';
      req.body = {
        displayName: '新顯示名稱',
        role: 'User',
        password: 'newpassword'
      };

      const mockExistingUser = {
        Id: 2,
        update: jest.fn()
      };

      mockUser.findByPk.mockResolvedValue(mockExistingUser);
      mockBcrypt.hash.mockResolvedValue('hashed_new_password');

      await updateUser(req, res);

      expect(mockExistingUser.update).toHaveBeenCalledWith({
        DisplayName: '新顯示名稱',
        Role: 'User',
        PasswordHash: 'hashed_new_password'
      });
    });

    it('should handle partial updates correctly', async () => {
      req.params.id = '2';
      req.body = {
        displayName: '僅更新名稱'
      };

      const mockExistingUser = {
        Id: 2,
        update: jest.fn()
      };

      mockUser.findByPk.mockResolvedValue(mockExistingUser);

      await updateUser(req, res);

      expect(mockExistingUser.update).toHaveBeenCalledWith({
        DisplayName: '僅更新名稱'
      });
    });

    it('should return 404 when user not found', async () => {
      req.params.id = '999';
      req.body = {
        displayName: '不存在的使用者'
      };

      mockUser.findByPk.mockResolvedValue(null);

      await updateUser(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "User 不存在"
        }
      });
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      req.params.id = '2';

      const mockUserToDelete = {
        Id: 2,
        LoginAccount: 'user01',
        destroy: jest.fn()
      };

      mockUser.findByPk.mockResolvedValue(mockUserToDelete);

      await deleteUser(req, res);

      expect(mockUser.findByPk).toHaveBeenCalledWith('2');
      expect(mockUserToDelete.destroy).toHaveBeenCalled();

      expect(mockLogger.info).toHaveBeenCalledWith("USER_DELETED", {
        userId: '2',
        by: 1
      });

      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });

    it('should return 404 when user to delete not found', async () => {
      req.params.id = '999';

      mockUser.findByPk.mockResolvedValue(null);

      await deleteUser(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "User 不存在"
        }
      });
    });
  });
});