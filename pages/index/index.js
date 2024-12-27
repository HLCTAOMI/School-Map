const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    background: [
      'http://cdnjson.com/images/2024/12/19/tushuguan.jpg',
      'http://cdnjson.com/images/2024/12/19/zhiyulou.jpg',
      'http://cdnjson.com/images/2024/12/19/zhijvlou.jpg'
    ],
    function_buttons: [
      // 其他功能按钮的链接
      "https://cdnjson.com/images/2024/02/19/map_guidec371b976f8a8ccfd.png", // 地图按钮
      "https://cloudflare.cdnjson.com/images/2024/12/22/th.jpg" // 校园论坛按钮
    ],
    isAdmin: false
  },

  // 跳转到地图页面
  site() {
    wx.navigateTo({
        url: '../site/site',
    })
},

  // 跳转到校园论坛页面
  forum() {
    wx.switchTab({
        url: '../forum/forum',
    })
},

 //跳转到活动页面
 allabout(){
   wx.navigateTo({
     url: '../allabout/allabout',
   })
 },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 初始化时设置为 false
    this.setData({
      isAdmin: false
    })
  },

  /**
   * 生命周期函数--监听页面初渲染完成
   */
  onReady: function () {
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // 每次页面显示时检查管理员状态
    this.setData({
      isAdmin: app.globalData.isAdmin
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    
  },

  goToAdmin() {
    wx.navigateTo({
      url: '/pages/admin/admin'
    })
  }
})