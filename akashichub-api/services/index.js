// 統一匯出所有服務
export { authService } from './authService.js';
export { resourceService } from './resourceService.js';
export { tagService } from './tagService.js';
export { userService } from './userService.js';

// 也可以作為預設匯出
export default {
  authService,
  resourceService,
  tagService,
  userService
};