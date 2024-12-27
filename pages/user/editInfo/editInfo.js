Page({
  data: {
    type: '', // 当前编辑的字段类型
    title: '', // 页面标题
    value: '', // 当前值
    placeholder: '', // 输入框提示文本
    showGenderPicker: false, // 性别选择器显示状态
    genderArray: ['男', '女'],
    maxLength: 20, // 默认最大长度
    region: ['贵州省', '遵义市', '红花岗区'], // 默认地区
    phone: '', // 新手机号
    verifyCode: '', // 验证码
    countdown: 0, // 倒计时
    canSendCode: true, // 是否可以发送验证码
  },

  onLoad(options) {
    const { type } = options;
    const { userStore } = getApp().globalData;
    const userInfo = userStore.data.userInfo;
    
    console.log('type:', type);
    console.log('当前用户信息:', userInfo);
    
    // 根据type设置对应的标题和当前值
    const config = {
      nickName: {
        title: '修改昵称',
        value: userInfo.nickName || '',
        placeholder: '请输入昵称',
        maxLength: 12
      },
      gender: {
        title: '修改性别',
        value: userInfo.gender === 1 ? '男' : '女',
        placeholder: '请选择性别'
      },
      phone: {
        title: '修改手机号',
        value: userInfo.phone || '',
        placeholder: '请输入手机号',
        maxLength: 11
      },
      signature: {
        title: '修改个性签名',
        value: userInfo.signature || '',
        placeholder: '请输入个性签名',
        maxLength: 50
      },
      region: {
        title: '修改地区',
        value: userInfo.region ? userInfo.region.join(' ') : '',
        placeholder: '请选择地区'
      }
    };

    const currentConfig = config[type] || {};
    
    this.setData({
      type,
      title: currentConfig.title,
      value: currentConfig.value || '',
      placeholder: currentConfig.placeholder,
      maxLength: currentConfig.maxLength || 20
    });

    // 设置导航栏标题
    wx.setNavigationBarTitle({
      title: currentConfig.title || '编辑信息'
    });
  },

  // 输入框内容变化处理
  handleInput(e) {
    if (this.data.type === 'phone') {
      this.handlePhoneInput(e);
    } else {
      this.setData({
        value: e.detail.value
      });
    }
  },

  // 显示性别选择器
  showGenderPicker() {
    if (this.data.type === 'gender') {
      this.setData({
        showGenderPicker: true
      });
    }
  },

  // 性别选择器取消
  bindCancel() {
    this.setData({
      showGenderPicker: false
    });
  },

  // 性别选择器确认
  bindGenderChange(e) {
    const genderIndex = e.detail.value;
    this.setData({
      value: this.data.genderArray[genderIndex]
    });
  },

  // 地区选择器确认
  bindRegionChange(e) {
    const region = e.detail.value;
    this.setData({
      value: region.join(' '),
      region: region
    });
  },

  // 手机号输入处理
  handlePhoneInput(e) {
    this.setData({
      phone: e.detail.value
    });
  },

  // 验证码输入处理
  handleCodeInput(e) {
    this.setData({
      verifyCode: e.detail.value
    });
  },

  // 发送验证码
  sendVerifyCode() {
    const phone = this.data.phone;
    if (!phone) {
      wx.showToast({
        title: '请输入手机号',
        icon: 'none'
      });
      return;
    }
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      wx.showToast({
        title: '请输入正确的手机号',
        icon: 'none'
      });
      return;
    }

    const { userStore } = getApp().globalData;
    const token = userStore.data.token;

    // 发送验证码请求
    wx.request({
      url: 'http://121.41.13.49:8081/user/user/code',
      method: 'POST',
      header: {
        'content-type': 'application/json',
        'authentication': token
      },
      data: {
        phone: phone
      },
      success: (res) => {
        if (res.data.code === 1) {
          wx.showToast({
            title: '验证码已发送',
            icon: 'success'
          });
          // 开始倒计时
          this.setData({
            canSendCode: false,
            countdown: 60
          });
          this.startCountdown();
        } else {
          wx.showToast({
            title: res.data.msg || '发送失败',
            icon: 'none'
          });
        }
      },
      fail: () => {
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        });
      }
    });
  },

  // 倒计时函数
  startCountdown() {
    const timer = setInterval(() => {
      if (this.data.countdown <= 1) {
        clearInterval(timer);
        this.setData({
          canSendCode: true,
          countdown: 0
        });
      } else {
        this.setData({
          countdown: this.data.countdown - 1
        });
      }
    }, 1000);
  },

  // 保存修改
  saveChanges() {
    if (this.data.type === 'phone') {
      if (!this.data.phone || !this.data.verifyCode) {
        wx.showToast({
          title: '请填写完整信息',
          icon: 'none'
        });
        return;
      }
      if (!/^1[3-9]\d{9}$/.test(this.data.phone)) {
        wx.showToast({
          title: '请输入正确的手机号',
          icon: 'none'
        });
        return;
      }

      const { userStore } = getApp().globalData;
      const token = userStore.data.token;

      // 验证并更新手机号
      wx.request({
        url: 'http://121.41.13.49:8081/user/user/bindPhone',
        method: 'POST',
        header: {
          'content-type': 'application/json',
          'authentication': token
        },
        data: {
          phone: this.data.phone,
          code: this.data.verifyCode
        },
        success: (res) => {
          if (res.data.code === 1) {
            // 更新本地存储的用户信息
            const newUserInfo = { ...userStore.data.userInfo };
            newUserInfo.phone = this.data.phone;
            userStore.data.userInfo = newUserInfo;
            wx.setStorageSync('userInfo', newUserInfo);

            wx.showToast({
              title: '修改成功',
              icon: 'success'
            });

            // 返回上一页并刷新
            setTimeout(() => {
              const pages = getCurrentPages();
              const prevPage = pages[pages.length - 2];
              prevPage.onLoad();
              wx.navigateBack();
            }, 1500);
          } else {
            wx.showToast({
              title: res.data.msg || '修改失败',
              icon: 'none'
            });
          }
        },
        fail: () => {
          wx.showToast({
            title: '网络错误',
            icon: 'none'
          });
        }
      });
    } else if (!this.data.value.trim()) {
      wx.showToast({
        title: '内容不能为空',
        icon: 'none'
      });
      return;
    }

    const { userStore } = getApp().globalData;
    const token = userStore.data.token;

    // 构建新的请求数据
    let requestData = {};
    if (this.data.type === 'gender') {
      requestData = {
        gender: this.data.value === '男' ? 1 : 2
      };
    } else if (this.data.type === 'region') {
      requestData = {
        region: this.data.region  // 直接使用 region 数组
      };
    } else if (this.data.type === 'nickname') {
      requestData = {
        nickName: this.data.value  // 使用 nickName 而不是 nickname
      };
    } else {
      requestData[this.data.type] = this.data.value;
    }

    console.log('请求数据:', requestData);  // 添加日志便于调试

    // 发送请求到服务器
    wx.request({
      // url: 'http://localhost:8081/user/ user/updateInfo',
      url: 'http://121.41.13.49:8081/user/user/updateInfo',
      method: 'POST',
      header: {
        'content-type': 'application/json',
        'authentication': token
      },
      data: requestData,
      success: (res) => {
        console.log('服务器响应:', res.data);
        if (res.data.code === 1) {
          const { userStore } = getApp().globalData;
          const token = userStore.data.token;
          
          // 调用 getUserInfo 接口更新用户信息
          wx.request({
            url: 'http://121.41.13.49:8081/user/user/getUserInfo',
            // url: 'http://localhost:8081/user/user/getUserInfo',

            method: 'GET',
            header: {
              'authentication': token
            },
            success: (response) => {
              console.log('获取用户信息响应:', response.data); // 添加日志
              if (response.data.code === 1) {
                // 保留原有的用户信息
                const oldUserInfo = userStore.data.userInfo;
                console.log('旧用户信息:', oldUserInfo); // 添加日志
                
                const newUserInfo = {
                  ...oldUserInfo,
                  ...response.data.data
                };
                console.log('合并后的新用户信息:', newUserInfo); // 添加日志
                
                // 更新 store 中的用户信息
                userStore.data.userInfo = newUserInfo;
                wx.setStorageSync('userInfo', newUserInfo);
                
                wx.showToast({
                  title: '修改成功',
                  icon: 'success'
                });

                // 返回上一页并刷新
                setTimeout(() => {
                  const pages = getCurrentPages();
                  const prevPage = pages[pages.length - 2];
                  prevPage.onLoad();
                  wx.navigateBack();
                }, 1500);
              }
            }
          });
        } else {
          wx.showToast({
            title: res.data.msg || '修改失败',
            icon: 'none'
          });
        }
      },
      fail: () => {
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        });
      }
    });
  }
}); 