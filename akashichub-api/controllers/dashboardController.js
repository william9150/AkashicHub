import { Resource, User, Tag, ResourceTag } from '../models/index.js';
import { Op } from 'sequelize';

// 獲取儀表板統計資料
export const getDashboardStats = async (req, res) => {
  try {
    // 獲取總資源數
    const totalResources = await Resource.count();
    
    // 獲取總用戶數
    const totalUsers = await User.count();
    
    // 獲取總標籤數
    const totalTags = await Tag.count();
    
    // 獲取活躍資源數 (狀態為 Active)
    const activeResources = await Resource.count({
      where: {
        Status: 'Active'
      }
    });
    
    // 獲取最近7天的資源數變化
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentResources = await Resource.count({
      where: {
        CreatedAt: {
          [Op.gte]: sevenDaysAgo
        }
      }
    });
    
    const recentUsers = await User.count({
      where: {
        CreatedAt: {
          [Op.gte]: sevenDaysAgo
        }
      }
    });
    
    const recentTags = await Tag.count({
      where: {
        CreatedAt: {
          [Op.gte]: sevenDaysAgo
        }
      }
    });
    
    // 計算趨勢百分比 (簡化版本)
    const resourcesTrend = totalResources > 0 ? ((recentResources / totalResources) * 100).toFixed(1) : 0;
    const usersTrend = totalUsers > 0 ? ((recentUsers / totalUsers) * 100).toFixed(1) : 0;
    const tagsTrend = totalTags > 0 ? ((recentTags / totalTags) * 100).toFixed(1) : 0;
    const activeTrend = totalResources > 0 ? ((activeResources / totalResources) * 100).toFixed(1) : 0;
    
    // 資源類型分佈
    const resourceTypeDistribution = await Resource.findAll({
      attributes: [
        'ResourceType',
        [Resource.sequelize.fn('COUNT', Resource.sequelize.col('ResourceType')), 'count']
      ],
      group: ['ResourceType'],
      raw: true
    });
    
    // 用戶角色分佈
    const userRoleDistribution = await User.findAll({
      attributes: [
        'Role',
        [User.sequelize.fn('COUNT', User.sequelize.col('Role')), 'count']
      ],
      group: ['Role'],
      raw: true
    });
    
    // 最近活動資源
    const recentResourcesData = await Resource.findAll({
      limit: 5,
      order: [['CreatedAt', 'DESC']],
      attributes: ['Id', 'Name', 'ResourceType', 'IpAddress', 'CreatedAt']
    });
    
    const stats = {
      totalResources,
      totalUsers,
      totalTags,
      activeResources,
      resourcesTrend: parseFloat(resourcesTrend),
      usersTrend: parseFloat(usersTrend),
      tagsTrend: parseFloat(tagsTrend),
      activeTrend: parseFloat(activeTrend),
      resourceTypeDistribution,
      userRoleDistribution,
      recentResources: recentResourcesData
    };
    
    res.json({
      success: true,
      data: stats
    });
    
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '獲取統計資料失敗'
      }
    });
  }
};

// 獲取系統狀態
export const getSystemStatus = async (req, res) => {
  try {
    const status = {
      system: 'healthy',
      database: 'healthy',
      memoryUsage: 65,
      diskUsage: 42,
      onlineUsers: 8,
      uptime: '15天 3小時',
      apiRequests: 145,
      errorRate: 0.8
    };
    
    res.json({
      success: true,
      data: status
    });
    
  } catch (error) {
    console.error('System status error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '獲取系統狀態失敗'
      }
    });
  }
};