import { jest } from '@jest/globals';
import {
  getAllTags,
  createTag,
  updateTag,
  deleteTag
} from '../controllers/tagController.js';

// Mock Tag model
const mockTag = {
  findAll: jest.fn(),
  create: jest.fn(),
  findByPk: jest.fn()
};

// Mock logger
const mockLogger = {
  info: jest.fn()
};

// Mock models and utilities
jest.unstable_mockModule('../models/index.js', () => ({
  Tag: mockTag
}));

jest.unstable_mockModule('../utils/logger.js', () => ({
  default: mockLogger
}));

describe('TagController', () => {
  let req, res;

  beforeEach(() => {
    req = {
      query: {},
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

  describe('getAllTags', () => {
    it('should return all tags without category filter', async () => {
      const mockTagsData = [
        { Id: 1, Name: '台中', Category: '使用區域' },
        { Id: 2, Name: 'ERP', Category: '用途' },
        { Id: 3, Name: '測試環境', Category: '環境' }
      ];

      mockTag.findAll.mockResolvedValue(mockTagsData);

      await getAllTags(req, res);

      expect(mockTag.findAll).toHaveBeenCalledWith({ where: {} });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockTagsData
      });
    });

    it('should filter tags by category', async () => {
      req.query.category = '使用區域';
      const mockFilteredTags = [
        { Id: 1, Name: '台中', Category: '使用區域' },
        { Id: 4, Name: '台北', Category: '使用區域' }
      ];

      mockTag.findAll.mockResolvedValue(mockFilteredTags);

      await getAllTags(req, res);

      expect(mockTag.findAll).toHaveBeenCalledWith({
        where: { Category: '使用區域' }
      });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockFilteredTags
      });
    });

    it('should return empty array when no tags found', async () => {
      mockTag.findAll.mockResolvedValue([]);

      await getAllTags(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: []
      });
    });
  });

  describe('createTag', () => {
    it('should create a new tag successfully', async () => {
      req.body = {
        name: '新標籤',
        category: '新分類'
      };

      const mockCreatedTag = {
        Id: 5,
        Name: '新標籤',
        Category: '新分類'
      };

      mockTag.create.mockResolvedValue(mockCreatedTag);

      await createTag(req, res);

      expect(mockTag.create).toHaveBeenCalledWith({
        Name: '新標籤',
        Category: '新分類'
      });

      expect(mockLogger.info).toHaveBeenCalledWith("TAG_CREATED", {
        tagId: 5,
        userId: 1
      });

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockCreatedTag
      });
    });

    it('should return 400 when name is missing', async () => {
      req.body = {
        category: '分類'
      };

      await createTag(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "name 與 category 為必填"
        }
      });
    });

    it('should return 400 when category is missing', async () => {
      req.body = {
        name: '標籤名稱'
      };

      await createTag(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "name 與 category 為必填"
        }
      });
    });

    it('should return 400 when both name and category are missing', async () => {
      req.body = {};

      await createTag(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "name 與 category 為必填"
        }
      });
    });

    it('should treat empty strings as missing values', async () => {
      req.body = {
        name: '',
        category: ''
      };

      await createTag(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "name 與 category 為必填"
        }
      });
    });
  });

  describe('updateTag', () => {
    it('should update tag successfully with both name and category', async () => {
      req.params.id = '1';
      req.body = {
        name: '更新後的標籤',
        category: '更新後的分類'
      };

      const mockExistingTag = {
        Id: 1,
        Name: '原始標籤',
        Category: '原始分類',
        update: jest.fn()
      };

      mockTag.findByPk.mockResolvedValue(mockExistingTag);

      await updateTag(req, res);

      expect(mockTag.findByPk).toHaveBeenCalledWith('1');
      expect(mockExistingTag.update).toHaveBeenCalledWith({
        Name: '更新後的標籤',
        Category: '更新後的分類'
      });

      expect(mockLogger.info).toHaveBeenCalledWith("TAG_UPDATED", {
        tagId: '1',
        userId: 1
      });

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Tag updated successfully."
      });
    });

    it('should update only name when category is not provided', async () => {
      req.params.id = '1';
      req.body = {
        name: '更新後的標籤'
      };

      const mockExistingTag = {
        Id: 1,
        Name: '原始標籤',
        Category: '原始分類',
        update: jest.fn()
      };

      mockTag.findByPk.mockResolvedValue(mockExistingTag);

      await updateTag(req, res);

      expect(mockExistingTag.update).toHaveBeenCalledWith({
        Name: '更新後的標籤',
        Category: '原始分類'
      });
    });

    it('should update only category when name is not provided', async () => {
      req.params.id = '1';
      req.body = {
        category: '更新後的分類'
      };

      const mockExistingTag = {
        Id: 1,
        Name: '原始標籤',
        Category: '原始分類',
        update: jest.fn()
      };

      mockTag.findByPk.mockResolvedValue(mockExistingTag);

      await updateTag(req, res);

      expect(mockExistingTag.update).toHaveBeenCalledWith({
        Name: '原始標籤',
        Category: '更新後的分類'
      });
    });

    it('should keep original values when neither name nor category provided', async () => {
      req.params.id = '1';
      req.body = {};

      const mockExistingTag = {
        Id: 1,
        Name: '原始標籤',
        Category: '原始分類',
        update: jest.fn()
      };

      mockTag.findByPk.mockResolvedValue(mockExistingTag);

      await updateTag(req, res);

      expect(mockExistingTag.update).toHaveBeenCalledWith({
        Name: '原始標籤',
        Category: '原始分類'
      });
    });

    it('should return 404 when tag not found', async () => {
      req.params.id = '999';
      req.body = {
        name: '更新後的標籤'
      };

      mockTag.findByPk.mockResolvedValue(null);

      await updateTag(req, res);

      expect(mockTag.findByPk).toHaveBeenCalledWith('999');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Tag 不存在"
        }
      });
    });
  });

  describe('deleteTag', () => {
    it('should delete tag successfully', async () => {
      req.params.id = '1';

      const mockTagToDelete = {
        Id: 1,
        Name: '要刪除的標籤',
        destroy: jest.fn()
      };

      mockTag.findByPk.mockResolvedValue(mockTagToDelete);

      await deleteTag(req, res);

      expect(mockTag.findByPk).toHaveBeenCalledWith('1');
      expect(mockTagToDelete.destroy).toHaveBeenCalled();

      expect(mockLogger.info).toHaveBeenCalledWith("TAG_DELETED", {
        tagId: '1',
        userId: 1
      });

      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });

    it('should return 404 when tag to delete not found', async () => {
      req.params.id = '999';

      mockTag.findByPk.mockResolvedValue(null);

      await deleteTag(req, res);

      expect(mockTag.findByPk).toHaveBeenCalledWith('999');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Tag 不存在"
        }
      });
    });
  });
});