import { jest } from '@jest/globals';
import {
  getResources,
  createResource,
  getResource,
  updateResource,
  deleteResource,
  decryptPassword
} from '../controllers/resourceController.js';

// Mock models
const mockResource = {
  findAndCountAll: jest.fn(),
  create: jest.fn(),
  findByPk: jest.fn(),
  findAll: jest.fn()
};

const mockTag = {
  create: jest.fn(),
  findAll: jest.fn()
};

const mockResourceRelationship = {
  bulkCreate: jest.fn(),
  findAll: jest.fn(),
  destroy: jest.fn()
};

// Mock utilities
const mockEncrypt = jest.fn();
const mockDecrypt = jest.fn();
const mockLogger = {
  info: jest.fn()
};

// Mock models module
jest.unstable_mockModule('../models/index.js', () => ({
  Resource: mockResource,
  Tag: mockTag,
  ResourceRelationship: mockResourceRelationship
}));

jest.unstable_mockModule('../utils/crypto.js', () => ({
  encrypt: mockEncrypt,
  decrypt: mockDecrypt
}));

jest.unstable_mockModule('../utils/logger.js', () => ({
  default: mockLogger
}));

describe('ResourceController', () => {
  let req, res;

  beforeEach(() => {
    req = {
      query: {},
      body: {},
      params: {},
      user: { id: 1, role: 'Admin' }
    };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn()
    };
    jest.clearAllMocks();
  });

  describe('getResources', () => {
    it('should return resources list with default pagination', async () => {
      const mockResourcesData = {
        rows: [
          {
            Id: 1,
            Name: 'Test Resource',
            ResourceType: 'Database',
            Tags: [{ Id: 1, Name: 'Test Tag' }]
          }
        ],
        count: 1
      };

      mockResource.findAndCountAll.mockResolvedValue(mockResourcesData);

      await getResources(req, res);

      expect(mockResource.findAndCountAll).toHaveBeenCalledWith({
        where: {},
        include: [{
          model: mockTag,
          as: "Tags",
          through: { attributes: [] },
          required: false,
          where: undefined
        }],
        distinct: true,
        offset: 0,
        limit: 20
      });

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          items: mockResourcesData.rows,
          total: 1,
          page: 1,
          limit: 20
        }
      });
    });

    it('should filter resources by keyword', async () => {
      req.query = { keyword: 'test' };
      const mockResourcesData = { rows: [], count: 0 };
      mockResource.findAndCountAll.mockResolvedValue(mockResourcesData);

      await getResources(req, res);

      expect(mockResource.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            [Symbol.for('or')]: [
              { Name: { [Symbol.for('like')]: '%test%' } },
              { IpAddress: { [Symbol.for('like')]: '%test%' } }
            ]
          }
        })
      );
    });

    it('should filter resources by tagIds', async () => {
      req.query = { tagIds: '1,2,3' };
      const mockResourcesData = { rows: [], count: 0 };
      mockResource.findAndCountAll.mockResolvedValue(mockResourcesData);

      await getResources(req, res);

      expect(mockResource.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          include: [expect.objectContaining({
            required: true,
            where: { Id: [1, 2, 3] }
          })]
        })
      );
    });
  });

  describe('createResource', () => {
    it('should create a new resource successfully', async () => {
      req.body = {
        resourceType: 'Database',
        name: 'Test DB',
        ipAddress: '192.168.1.1',
        loginUser: 'admin',
        loginPassword: 'password123',
        tagIds: [1],
        newTags: [{ name: 'New Tag', category: 'Test' }],
        relatedResourceIds: [2]
      };

      const mockCreatedResource = {
        Id: 1,
        ResourceType: 'Database',
        Name: 'Test DB',
        addTags: jest.fn()
      };

      const mockExistingTag = { Id: 1, Name: 'Existing Tag' };
      const mockNewTag = { Id: 2, Name: 'New Tag' };
      const mockFinalResource = { Id: 1, Name: 'Test DB', Tags: [] };

      mockEncrypt.mockReturnValue('encrypted_password');
      mockResource.create.mockResolvedValue(mockCreatedResource);
      mockTag.findAll.mockResolvedValue([mockExistingTag]);
      mockTag.create.mockResolvedValue(mockNewTag);
      mockResource.findByPk.mockResolvedValue(mockFinalResource);

      await createResource(req, res);

      expect(mockEncrypt).toHaveBeenCalledWith('password123');
      expect(mockResource.create).toHaveBeenCalledWith({
        ResourceType: 'Database',
        Name: 'Test DB',
        IpAddress: '192.168.1.1',
        LoginUser: 'admin',
        LoginPasswordEncrypted: 'encrypted_password',
        Description: undefined,
        Port: undefined,
        DbName: undefined,
        DbVersion: undefined
      });

      expect(mockCreatedResource.addTags).toHaveBeenCalledWith([mockExistingTag]);
      expect(mockTag.create).toHaveBeenCalledWith({ Name: 'New Tag', Category: 'Test' });
      expect(mockResourceRelationship.bulkCreate).toHaveBeenCalledWith([{
        SourceResourceId: 1,
        TargetResourceId: 2,
        RelationshipType: "使用"
      }]);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockFinalResource
      });
    });

    it('should handle empty password correctly', async () => {
      req.body = {
        resourceType: 'Website',
        name: 'Test Site',
        loginPassword: ''
      };

      const mockCreatedResource = {
        Id: 1,
        addTags: jest.fn()
      };

      mockEncrypt.mockReturnValue('');
      mockResource.create.mockResolvedValue(mockCreatedResource);
      mockResource.findByPk.mockResolvedValue({});

      await createResource(req, res);

      expect(mockEncrypt).toHaveBeenCalledWith('');
    });
  });

  describe('getResource', () => {
    it('should return resource details with relationships', async () => {
      req.params.id = '1';
      const mockResourceData = {
        Id: 1,
        Name: 'Test Resource',
        Tags: [],
        OutgoingRelationships: [],
        IncomingRelationships: []
      };

      mockResource.findByPk.mockResolvedValue(mockResourceData);

      await getResource(req, res);

      expect(mockResource.findByPk).toHaveBeenCalledWith('1', {
        include: [
          { model: mockTag, as: "Tags", through: { attributes: [] } },
          {
            model: mockResourceRelationship,
            as: "OutgoingRelationships",
            include: [{ model: mockResource, as: "TargetResource", attributes: ["Id", "Name", "ResourceType"] }]
          },
          {
            model: mockResourceRelationship,
            as: "IncomingRelationships",
            include: [{ model: mockResource, as: "SourceResource", attributes: ["Id", "Name", "ResourceType"] }]
          }
        ]
      });

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockResourceData
      });
    });

    it('should return 404 when resource not found', async () => {
      req.params.id = '999';
      mockResource.findByPk.mockResolvedValue(null);

      await getResource(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: { code: "NOT_FOUND", message: "Resource 不存在" }
      });
    });
  });

  describe('updateResource', () => {
    it('should update resource successfully', async () => {
      req.params.id = '1';
      req.body = {
        name: 'Updated Resource',
        loginPassword: 'newpassword',
        tagIds: [1, 2],
        newTags: [{ name: 'New Tag', category: 'Updated' }]
      };

      const mockResource_instance = {
        Id: 1,
        update: jest.fn(),
        getTags: jest.fn().mockResolvedValue([{ Id: 3 }]),
        addTags: jest.fn(),
        removeTags: jest.fn()
      };

      const mockUpdatedResource = { Id: 1, Name: 'Updated Resource' };

      mockResource.findByPk.mockResolvedValue(mockResource_instance);
      mockEncrypt.mockReturnValue('encrypted_new_password');
      mockTag.create.mockResolvedValue({ Id: 4, Name: 'New Tag' });
      mockTag.findAll.mockResolvedValue([{ Id: 1 }, { Id: 2 }]);
      mockResourceRelationship.findAll.mockResolvedValue([]);
      mockResource.findByPk.mockResolvedValueOnce(mockResource_instance).mockResolvedValueOnce(mockUpdatedResource);

      await updateResource(req, res);

      expect(mockResource_instance.update).toHaveBeenCalledWith({
        name: 'Updated Resource',
        LoginPasswordEncrypted: 'encrypted_new_password'
      });

      expect(mockTag.create).toHaveBeenCalledWith({ Name: 'New Tag', Category: 'Updated' });
      expect(mockResource_instance.addTags).toHaveBeenCalled();
      expect(mockResource_instance.removeTags).toHaveBeenCalled();

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockUpdatedResource
      });
    });

    it('should return 404 when resource to update not found', async () => {
      req.params.id = '999';
      mockResource.findByPk.mockResolvedValue(null);

      await updateResource(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: { code: "NOT_FOUND", message: "Resource 不存在" }
      });
    });
  });

  describe('deleteResource', () => {
    it('should delete resource successfully', async () => {
      req.params.id = '1';
      const mockResourceToDelete = {
        Id: 1,
        destroy: jest.fn()
      };

      mockResource.findByPk.mockResolvedValue(mockResourceToDelete);

      await deleteResource(req, res);

      expect(mockResourceToDelete.destroy).toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalledWith("RESOURCE_DELETED", {
        resourceId: '1',
        userId: 1
      });
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });

    it('should return 404 when resource to delete not found', async () => {
      req.params.id = '999';
      mockResource.findByPk.mockResolvedValue(null);

      await deleteResource(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: { code: "NOT_FOUND", message: "Resource 不存在" }
      });
    });
  });

  describe('decryptPassword', () => {
    it('should decrypt and return password successfully', async () => {
      req.params.id = '1';
      const mockResourceData = {
        Id: 1,
        LoginPasswordEncrypted: 'encrypted_password'
      };

      mockResource.findByPk.mockResolvedValue(mockResourceData);
      mockDecrypt.mockReturnValue('decrypted_password');

      await decryptPassword(req, res);

      expect(mockDecrypt).toHaveBeenCalledWith('encrypted_password');
      expect(mockLogger.info).toHaveBeenCalledWith("RESOURCE_PASSWORD_DECRYPTED", {
        resourceId: '1',
        userId: 1
      });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: { plainPassword: 'decrypted_password' }
      });
    });

    it('should return 404 when resource not found for password decryption', async () => {
      req.params.id = '999';
      mockResource.findByPk.mockResolvedValue(null);

      await decryptPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: { code: "NOT_FOUND", message: "Resource 不存在" }
      });
    });
  });
});