Page({
  data: {
    userInfo: null,
    items: [
      { label: '昵称', value: '', key: 'nickName', icon: 'user' },
      { label: '性别', value: '', key: 'gender', icon: 'gender' },
      { label: '手机号', value: '', key: 'phone', icon: 'phone' },
      { label: '地区', value: '', key: 'region', icon: 'location' },
      { label: '个性签名', value: '', key: 'signature', icon: 'edit' }
    ]
  },

  updateUserInfo() {
    const { userStore } = getApp().globalData;
    console.log('获取最新的 userStore:', userStore.data);
    
    if (userStore.data.userInfo) {
      const userInfo = userStore.data.userInfo;
      const updatedItems = this.data.items.map(item => {
        let value = userInfo[item.key];
        if (item.key === 'gender') {
          value = userInfo.gender === 1 ? '男' : '女';
        } else if (item.key === 'region') {
          value = userInfo.region || '未设置';
        } else if (item.key === 'signature') {
          value = userInfo.signature || '这个人很懒，什么都没写~';
        }
        return { ...item, value: value || '未设置' };
      });

      this.setData({
        userInfo: userInfo,
        items: updatedItems
      });
    }
  },

  onLoad() {
    this.updateUserInfo();
  },

  onShow() {
    this.updateUserInfo();
  },

  editInfo(e) {
    const { key } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/user/editInfo/editInfo?type=${key}`
    });
  }
}); 