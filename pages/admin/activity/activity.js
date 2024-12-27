Page({
  data: {
    activities: [],
    loading: false
  },

  onLoad() {
    this.loadActivities()
  },

  // 加载活动列表
  loadActivities() {
    this.setData({ loading: true })
    // TODO: 从后端获取活动列表
    this.setData({ loading: false })
  },

  // 跳转到发布活动页面
  goToPublish() {
    wx.navigateTo({
      url: './publish/publish'
    })
  },

  // 编辑活动
  handleEdit(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `./publish/publish?id=${id}`
    })
  },

  // 删除活动
  handleDelete(e) {
    const id = e.currentTarget.dataset.id
    wx.showModal({
      title: '提示',
      content: '确定要删除这个活动吗？',
      success: (res) => {
        if (res.confirm) {
          // TODO: 调用删除活动的接口
        }
      }
    })
  }
}) 