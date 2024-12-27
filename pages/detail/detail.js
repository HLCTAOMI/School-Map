const app = getApp();

Page({
  data: {
    post: {},
    commentList: [],
    commentText: '',
    postId: null,
    replyTo: null,
    replyToUser: null,
    placeholder: '说点什么...',
    focus: false
  },

  onLoad: function(options) {
    this.setData({
      postId: options.id
    });
    this.loadPostDetail();
  },

  // 加载帖子详情
  loadPostDetail: function() {
    const { userStore } = getApp().globalData;
    const token = userStore.data.token || '';

    wx.request({
      url: `http://121.41.13.49:8081/post/list/detail/${this.data.postId}`,
      header: {
        'authentication': token
      },
      success: (res) => {
        if (res.data.code === 1) {
          this.setData({
            post: res.data.data,
            commentList: res.data.data.comments || []
          });
        }
      }
    });
  },

  // 监听评论输入
  onCommentInput: function(e) {
    this.setData({
      commentText: e.detail.value
    });
  },

  // 点击回复按钮
  onReplyTap: function(e) {
    const { commentId, userId, nickName } = e.currentTarget.dataset;
    this.setData({
      replyTo: commentId,
      replyToUser: userId,
      placeholder: `回复 ${nickName}：`,
      focus: true
    });
  },

  // 取消回复
  cancelReply: function() {
    this.setData({
      replyTo: null,
      replyToUser: null,
      placeholder: '说点什么...',
      focus: false
    });
  },

  // 提交评论
  submitComment: function() {
    const { userStore } = getApp().globalData;
    if (!userStore.data.isLogin) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }

    if (!this.data.commentText.trim()) { 
      wx.showToast({
        title: '请输入评论内容',
        icon: 'none'
      });
      return;
    }

    wx.request({
      url: `http://121.41.13.49:8081/comment/add`,
      method: 'POST',
      data: {
        postId: this.data.postId,
        content: this.data.commentText,
        parentId: this.data.replyTo || null,
        toUser: this.data.replyToUser || null
      },
      header: {
        'content-type': 'application/json',
        'authentication': userStore.data.token
      },
      success: (res) => {
        if (res.data.code === 1) {
          wx.showToast({
            title: '评论成功',
            icon: 'success'
          });
          this.setData({
            commentText: '',
            replyTo: null,
            replyToUser: null,
            placeholder: '说点什么...',
            focus: false
          });
          // 重新加载帖子详情以刷新评论列表
          this.loadPostDetail();
        }
      }
    });
  },

  // 处理评论点赞
  handleCommentLike: function(e) {
    const commentId = e.currentTarget.dataset.id;
    const { userStore } = getApp().globalData;
    if (!userStore.data.isLogin) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }

    wx.request({
      url: 'http://121.41.13.49:8081/comment/like',
      method: 'POST',
      data: {
        commentId: commentId
      },
      header: {
        'content-type': 'application/json',
        'authentication': userStore.data.token
      },
      success: (res) => {
        if (res.data.code === 1) {
          // 重新加载帖子详情以刷新评论点赞状态
          this.loadPostDetail();
        }
      }
    });
  },

  // 预览图片
  previewImage: function(e) {
    const current = e.currentTarget.dataset.url;
    // 只获取类型为图片的媒体URL
    const urls = this.data.post.mediaList
      .filter(media => media.type === 'image')
      .map(media => media.url);
      
    if (urls.length > 0) {
      wx.previewImage({
        current,
        urls
      });
    }
  }
}); 