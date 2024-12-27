const userStore = {
  data: {
    isLogin: false,
    userInfo: null,
    token: null
  },

  // 登录
  login(userInfo, token) {
    this.data.isLogin = true;
    this.data.userInfo = userInfo;
    this.data.token = token;
    // 保存到本地存储
    wx.setStorageSync('userInfo', userInfo);
    wx.setStorageSync('satoken', token);  // 修改这里，使用 satoken 作为键名
  },

  // 退出登录
  async logout() {
    try {
      const res = await new Promise((resolve, reject) => {
        wx.request({
          url: 'http://121.41.13.49:8081/user/user/logout',
          method: 'POST',
          header: {
            'content-type': 'application/json',
            'authentication': wx.getStorageSync('satoken')
          },
          success: resolve,
          fail: reject
        });
      });

      if (res.data.code === 1) {
        // 清除本地数据
        this.data.isLogin = false;
        this.data.userInfo = null;
        this.data.token = null;
        // 清除本地存储
        wx.removeStorageSync('userInfo');
        wx.removeStorageSync('satoken');
        return true;
      }
      return false;
    } catch (error) {
      console.error('退出登录失败:', error);
      return false;
    }
  },

  // 初始化store
  init() {
    const userInfo = wx.getStorageSync('userInfo');
    const token = wx.getStorageSync('satoken');  // 修改这里，使用 satoken 作为键名
    if (userInfo && token) {
      this.data.isLogin = true;
      this.data.userInfo = userInfo;
      this.data.token = token;
    }
  }
};

export default userStore;