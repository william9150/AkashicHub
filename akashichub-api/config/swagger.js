import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AkashicHub API',
      version: '1.0.0',
      description: 'IT 內部資源檢索系統 API - 提供資源管理、標籤分類、用戶管理等功能',
      contact: {
        name: 'AkashicHub 開發團隊',
        url: 'https://github.com/akashichub',
        email: 'support@akashichub.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: '開發環境'
      },
      {
        url: 'https://api.akashichub.com',
        description: '生產環境'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: '使用 JWT Bearer Token 進行身份驗證'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            Id: {
              type: 'integer',
              description: '用戶ID'
            },
            LoginAccount: {
              type: 'string',
              description: '登入帳號'
            },
            DisplayName: {
              type: 'string',
              description: '顯示名稱'
            },
            Role: {
              type: 'string',
              enum: ['Admin', 'User'],
              description: '用戶角色'
            }
          }
        },
        Resource: {
          type: 'object',
          properties: {
            Id: {
              type: 'integer',
              description: '資源ID'
            },
            ResourceType: {
              type: 'string',
              description: '資源類型'
            },
            Name: {
              type: 'string',
              description: '資源名稱'
            },
            IpAddress: {
              type: 'string',
              description: 'IP位址'
            },
            LoginUser: {
              type: 'string',
              description: '登入用戶名'
            },
            Description: {
              type: 'string',
              description: '資源描述'
            },
            Port: {
              type: 'integer',
              description: '端口號'
            },
            DbName: {
              type: 'string',
              description: '資料庫名稱'
            },
            DbVersion: {
              type: 'string',
              description: '資料庫版本'
            },
            Tags: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Tag'
              },
              description: '關聯標籤'
            }
          }
        },
        Tag: {
          type: 'object',
          properties: {
            Id: {
              type: 'integer',
              description: '標籤ID'
            },
            Name: {
              type: 'string',
              description: '標籤名稱'
            },
            Category: {
              type: 'string',
              description: '標籤分類'
            }
          }
        },
        ResourceRelationship: {
          type: 'object',
          properties: {
            Id: {
              type: 'integer',
              description: '關係ID'
            },
            SourceResourceId: {
              type: 'integer',
              description: '源資源ID'
            },
            TargetResourceId: {
              type: 'integer',
              description: '目標資源ID'
            },
            RelationshipType: {
              type: 'string',
              description: '關係類型'
            },
            Description: {
              type: 'string',
              description: '關係描述'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            error: {
              type: 'object',
              properties: {
                code: {
                  type: 'string',
                  description: '錯誤代碼'
                },
                message: {
                  type: 'string',
                  description: '錯誤訊息'
                }
              }
            }
          }
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            data: {
              type: 'object',
              description: '響應數據'
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: [
    './routes/*.js',
    './controllers/*.js'
  ]
};

const specs = swaggerJSDoc(options);

export { specs, swaggerUi };