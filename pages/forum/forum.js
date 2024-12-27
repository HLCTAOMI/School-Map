const app = getApp();

Page({
  data: {
    posts: [], // 存储帖子数据
    pageNum: 1, // 当前页数
    pageSize: 5, // 每页显示数量
    hasMore: true, // 是否还有更多数据
    isLoading: false, // 是否正在加载数据
    totalPages: 1, // 总页数
    searchKeyword: '', // 添加搜索关键词字段
    statusBarHeight: 0,
  },

  onLoad: function() {
    // 获取状态栏高度
    const systemInfo = wx.getSystemInfoSync();
    this.setData({
      statusBarHeight: systemInfo.statusBarHeight
    });
    
    this.loadPosts(); // 页面加载时加载帖子
  },

  // 加载帖子数据
  loadPosts: function() {
    if (this.data.isLoading) return; // 如果正在加载，防止重复请求

    this.setData({ isLoading: true });

    const { userStore } = getApp().globalData;
    const token = userStore.data.token || '';

    // 根据当前标签获取不同类型的帖子
    const types = ['all', 'latest', 'hot', 'secondhand'];
    const type = types[this.data.currentTab];

    wx.request({
      url: 'http://121.41.13.49:8081/post/list', // 请求地址
      data: {
        current: this.data.pageNum, // 当前页
        size: this.data.pageSize // 每页数量
      },
      header: {
        'authentication': token // 传递用户认证token
      },
      success: (res) => {
        if (res.data.code === 1) {
          const newPosts = res.data.data.records.map(item => ({
            id: item.id,
            author: item.username,
            avatar: item.userAvatar || '/images/avatar1.png',
            title: item.title,
            content: item.content,
            images: item.mediaList || [],
            timestamp: item.createdAt,
            likes: item.likeCount,
            comments: item.commentCount,
            isLiked: false
          }));

          console.log('新帖子数据:', newPosts); // 调试输出

          // 如果用户已登录，获取每个帖子的点赞状态
          if (userStore.data.isLogin) {
            newPosts.forEach((post, index) => {
              this.getLikeStatus(post.id, index, newPosts);
            });
          }

          // 更新数据，区分刷新和加载更多
          if (this.data.pageNum === 1) {
            this.setData({
              posts: newPosts,
              totalPages: res.data.data.pages,
              hasMore: res.data.data.current < res.data.data.pages
            });
          } else {
            this.setData({
              posts: [...this.data.posts, ...newPosts],
              hasMore: res.data.data.current < res.data.data.pages
            });
          }
        }
      },
      fail: (err) => {
        console.error('加载帖子失败：', err);
        wx.showToast({
          title: '加载失败',
          icon: 'none'
        });
      },
      complete: () => {
        this.setData({ isLoading: false });
      }
    });
  },

  // 添加获取点赞状态的函数
  getLikeStatus: function(postId, index, posts) {
    const { userStore } = getApp().globalData;
    const token = userStore.data.token;

    wx.request({
      url: `http://121.41.13.49:8081/postlike/status`,
      method: 'GET',
      data: {
        postId: postId
      },
      header: {
        'authentication': token
      },
      success: (res) => {
        if (res.data.code === 1) {
          // 更新对应帖子的点赞状态
          const updatedPosts = this.data.posts.map((post, i) => {
            if (post.id === postId) {
              return {
                ...post,
                isLiked: res.data.data
              };
            }
            return post;
          });

          this.setData({
            posts: updatedPosts
          });
        }
      }
    });
  },

  // 下拉刷新
  onPullDownRefresh: function() {
    this.setData({
      posts: [], // 清空帖子数据
      pageNum: 1, // 重置为第一页
      hasMore: true, // 重置是否有更多数据
      totalPages: 1 // 重置总页数
    }, () => {
      this.loadPosts(); // 重新加载帖子
      wx.stopPullDownRefresh(); // 停止下拉刷新动画
    });
  },

  // 上拉加载更多
  onReachBottom: function() {
    if (this.data.hasMore && !this.data.isLoading && this.data.pageNum < this.data.totalPages) {
      this.setData({
        pageNum: this.data.pageNum + 1 // 增加页码
      }, () => {
        this.loadPosts(); // 加载下一页数据
      });
    }
  },

  // 跳转到发帖页面
  navigateToPost: function() {
    const { userStore } = getApp().globalData;
    if (!userStore.data.isLogin) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }
    wx.navigateTo({
      url: '/pages/post/post'
    });
  },

  // 跳转到帖子详情页
  goToDetail: function(e) {
    const postId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/detail/detail?id=${postId}`
    });
  },

  // 点赞或取消点赞功能
  handleLike: function(e) {
    console.log('点赞按钮被点击');
    
    const { userStore } = getApp().globalData;
    if (!userStore.data.isLogin) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }

    const postId = e.currentTarget.dataset.id;
    const currentPost = this.data.posts.find(post => post.id === postId);
    const isCurrentlyLiked = currentPost.isLiked;

    // 防止重复请求
    if (currentPost.isLiking) {
      return;
    }

    // 设置请求中状态
    const updatingPosts = this.data.posts.map(post => {
      if (post.id === postId) {
        return { ...post, isLiking: true };
      }
      return post;
    });
    this.setData({ posts: updatingPosts });

    const token = userStore.data.token;

    wx.request({
      url: 'http://121.41.13.49:8081/postlike',
      method: 'POST',
      data: {
        postId: postId
      },
      header: {
        'content-type': 'application/json',
        'authentication': token
      },
      success: (res) => {
        console.log('点赞响应:', res);
        if (res.data.code === 1) {
          // 更新点赞状态和数量
          const updatedPosts = this.data.posts.map(post => {
            if (post.id === postId) {
              return {
                ...post,
                likes: isCurrentlyLiked ? post.likes - 1 : post.likes + 1,
                isLiked: !isCurrentlyLiked,
                isLiking: false
              };
            }
            return post;
          });

          this.setData({ posts: updatedPosts });

          wx.showToast({
            title: isCurrentlyLiked ? '取消点赞成功' : '点赞成功',
            icon: 'success'
          });
        } else {
          // 恢复原始状态
          const resetPosts = this.data.posts.map(post => {
            if (post.id === postId) {
              return { ...post, isLiking: false };
            }
            return post;
          });
          this.setData({ posts: resetPosts });

          wx.showToast({
            title: res.data.msg || '操作失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error('操作失败:', err);
        // 恢复原始状态
        const resetPosts = this.data.posts.map(post => {
          if (post.id === postId) {
            return { ...post, isLiking: false };
          }
          return post;
        });
        this.setData({ posts: resetPosts });

        wx.showToast({
          title: '操作失败',
          icon: 'none'
        });
      }
    });
  },

  onVideoTap(e) {
    // 阻止事件冒泡，不执行任何跳转
    // 可以在这里添加其他视频相关的处理逻辑
  },
})
