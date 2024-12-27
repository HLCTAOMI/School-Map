Page({
  data: {
    
  },

  onLoad: function (options) {
    // 检查管理员权限
    const app = getApp()
    if (!app.globalData.isAdmin) {
      wx.showToast({
        title: '无权限访问',
        icon: 'none'
      })
      wx.navigateBack()
    }
  },

  // 活动管理
  handleActivityManage() {
    wx.navigateTo({
      url: '/pages/admin/activity/activity'
    })
  },

  // 用户管理
  handleUserManage() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    })
  },

  // 内容管理
  handleContentManage() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    })
  },

  // 系统设置
  handleSystemSettings() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    })
  }
}) 