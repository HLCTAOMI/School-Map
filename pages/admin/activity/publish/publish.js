// pages/admin/activity/publish/publish.js
Page({
  data: {
    title: '',
    content: '',
    time: '',
    location: '',
    isEdit: false,
    activityId: null
  },

  onLoad(options) {
    if (options.id) {
      this.setData({
        isEdit: true,
        activityId: options.id
      })
      this.loadActivityDetail(options.id)
    }
  },

  // 加载活动详情（编辑时使用）
  loadActivityDetail(id) {
    // TODO: 从后端获取活动详情
  },

  // 处理输入
  handleInput(e) {
    const { field } = e.currentTarget.dataset
    this.setData({
      [field]: e.detail.value
    })
  },

  // 选择时间
  bindTimeChange(e) {
    this.setData({
      time: e.detail.value
    })
  },

  // 提交表单
  handleSubmit() {
    const { title, content, time, location } = this.data
    
    if (!title || !content || !time || !location) {
      wx.showToast({
        title: '请填写完整信息',
        icon: 'none'
      })
      return
    }

    // TODO: 调用后端接口保存活动
    wx.showLoading({
      title: '保存中...'
    })

    // 模拟保存
    setTimeout(() => {
      wx.hideLoading()
      wx.showToast({
        title: '保存成功',
        icon: 'success'
      })
      wx.navigateBack()
    }, 1500)
  }
})