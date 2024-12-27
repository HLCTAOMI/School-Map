const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    login: {
      show: false,
      avatar: "/images/default_avatar.png"
    },
    userInfo: null,
    isAdmin: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log('onLoad 开始执行');
    const { userStore } = app.globalData;
    console.log('userStore 状态:', userStore.data);
    
    if (userStore.data.isLogin) {
      console.log('用户已登录，设置数据');
      this.setData({
        login: {
          show: true,
          avatar: userStore.data.userInfo.avatar
        },
        userInfo: userStore.data.userInfo
      });
      console.log('设置后的数据:', this.data);
    }
  },

  // 选择头像
  onChooseAvatar(e) {
    const { avatarUrl } = e.detail 
    
    // 上传头像到后端
    wx.uploadFile({
      url: 'http://121.41.13.49:8081/user/user/uploadAvatar',
      filePath: avatarUrl,
      name: 'file',
      header: {
        'content-type': 'multipart/form-data',
        'authentication': wx.getStorageSync('satoken')
      },
      success: (res) => {
        console.log('原始返回数据:', res.data);
        const data = JSON.parse(res.data);
        console.log('解析后的数据:', data);
        
        if(data.code === 1) {
          // 获取返回的URL
          const avatarUrl = data.data;  // 直接使用返回的URL
          
          // 更新本地显示的头像
          this.setData({
            'login.avatar': avatarUrl,
            'userInfo.avatar': avatarUrl
          })

          // 更新全局状态中的头像
          const { userStore } = app.globalData;
          if(userStore && userStore.data.userInfo) {
            userStore.data.userInfo.avatar = avatarUrl
          }

          console.log('更新后的头像URL:', avatarUrl);
          console.log('更新后的状态:', this.data);

          wx.showToast({
            title: '上传成功',
            icon: 'success'
          });
        } else {
          wx.showToast({
            title: '上传失败',
            icon: 'error'
          });
        }
      },
      fail: () => {
        wx.showToast({
          title: '上传失败',
          icon: 'error'
        });
      }
    })
  },

  // 处理登录
  handleLogin() {
    console.log('开始登录流程');
    wx.login({
      success: (loginRes) => {
        console.log('wx.login 成功:', loginRes);
        if (loginRes.code) {
          // 模拟用户信息
          const userInfo = {
            nickname: '用户昵称',
            avatar: 'https://example.com/avatar.png'
          };

          // 将 code 和用户信息发送到服务器
          wx.request({
            url: 'http://121.41.13.49:8081/user/user/login',
            // url: 'http://localhost:8081/user/user/login',
            method: 'POST',
            data: {
              code: loginRes.code,
              userInfo: userInfo
            },
            header: {
              'content-type': 'application/json',
              'satoken': wx.getStorageSync('satoken')
            },
            success: (res) => {
              console.log('服务器返回的数据:', res.data);

              if (res.data.code === 1 && res.data.data) {
                const { userStore } = app.globalData;
                const userData = res.data.data;
                
                // 构建用户信息对象，统一使用 nickName
                const userInfo = {
                  avatar: userData.avatar,
                  nickName: userData.nickName,
                  gender: userData.gender,
                  phone: userData.phone,
                  openid: userData.openid,
                  id: userData.id,
                  createTime: userData.createTime,
                  roles: userData.roles || []  // 确保 roles 存在
                };
                
                console.log('构建的userInfo:', userInfo);
                
                // 保存用户信息和token
                userStore.login(userInfo, userData.token);
                
                this.setData({
                  login: {
                    show: true,
                    avatar: userInfo.avatar
                  },
                  userInfo: userInfo,
                  isAdmin: userInfo.roles[0] === 'admin'
                });
                
                console.log('页面数据更新后:', this.data);

                wx.showToast({
                  title: '登录成功',
                  icon: 'success'
                });

                // 设置全局管理员状态
                app.setUserInfo(userInfo);
              } else {
                wx.showToast({
                  title: '登录失败',
                  icon: 'none'
                });
              }
            },
            fail: (error) => {
              console.error('登录请求失败:', error);
              wx.showToast({
                title: '请求失败',
                icon: 'none'
              });
            }
          });
        } else {
          wx.showToast({
            title: '登录失败',
            icon: 'none'
          });
        }
      },
      fail: (error) => {
        console.error('wx.login 失败:', error);
      }
    });
  },

  // 退出登录
  exitClick() {
    let that = this;
    wx.showModal({
      title: '提示',
      content: '确定退出登录吗？',
      success(res) {
        if (res.confirm) {
          const { userStore } = app.globalData;
          userStore.logout(); // 清除store里的信息
          wx.removeStorageSync('satoken'); // 清除 token
          app.globalData.isAdmin = false; // 清除管理员状态
          
          that.setData({
            login: {
              show: false,
              avatar: 'https://img0.baidu.com/it/u=3204281136,1911957924&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500',
            },
            userInfo: null,
            isAdmin: false
          });
  
          wx.showToast({
            title: '已退出登录',
            icon: 'none'
          });
        }
      }
    });
  },

  // 基本信息
  basicClick() {
    if (!this.data.login.show) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }
    wx.navigateTo({
      url: '/pages/user/basicInfo/basicInfo'
    });
  },
  // 匿名反馈
  feedbackClick() {
    console.log('匿名反馈监听');
  },
  // 关于我们
  aboutClick() {
    console.log('关于我们监听');
  },
  huodong(){
    console.log('活动监听')
    wx.navigateTo({
      url: '../about/about',
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    console.log('onShow 开始执行');
    const { userStore } = app.globalData;
    console.log('当前 userStore:', userStore);
    
    if (userStore && userStore.data.userInfo) {
      console.log('userStore 中的用户信息:', userStore.data.userInfo);
      
      // 每次显示页面时都完整更新用户信息
      this.setData({
        login: {
          show: true,
          avatar: userStore.data.userInfo.avatar
        },
        userInfo: {
          ...userStore.data.userInfo,
          avatar: userStore.data.userInfo.avatar,
          nickName: userStore.data.userInfo.nickName
        },
        isAdmin: app.globalData.isAdmin
      });
      
      console.log('onShow 更新后的页面数据:', this.data);
    } else {
      console.log('userStore 或用户信息不存在');
      this.setData({
        login: {
          show: false,
          avatar: "/images/default_avatar.png"
        },
        userInfo: null
      });
    }
  },  

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },

  // 跳转到管理员页面
  goToAdmin() {
    wx.navigateTo({
      url: '/pages/admin/admin'
    })
  },
})
