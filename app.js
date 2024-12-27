// app.js
import userStore from './store/userStore'

App({
  onLaunch() {
    // 初始化用户信息
    userStore.init();
    // 从 userStore 中恢复管理员状态
    if (userStore.data.userInfo && userStore.data.userInfo.roles) {
      this.globalData.isAdmin = userStore.data.userInfo.roles.includes('admin');
    }
  },
  
  globalData: {
    userStore,
    userInfo: null,
    isAdmin: false  // 添加管理员状态标识
  },
  onPullDownRefresh: function () {
    console.log('下拉刷新');
    //设置触发事件时间效果方法
    setTimeout(()=>{
      // 在此调取接口
      wx.showNavigationBarLoading(); // 显示顶部刷新图标
      wx.redirectTo({ //关闭当前页面跳转到目标页面，注意tabbar页面无法跳转！
        url: '/pages/mine/refresh', //加载页面地址
        success:function(res){ //调用成功时
          wx.stopPullDownRefresh({ // 数据请求成功后，关闭刷新。如果不加这个接口，刷新的动画效果时间使用系统默认设置时间
            success (res) { //调用成功时
                console.log('刷新成功');
            }
          })
        }
      })
    }, 1000)
  },
  // 在获取用户信息后判断是否为管理员
  setUserInfo(userInfo) {
    this.globalData.userInfo = userInfo;
    // 判断是否为管理员
    this.globalData.isAdmin = userInfo?.roles?.[0] === 'admin';
  }
})
