const app = getApp();

Page({
  data: {
    title: '',
    content: '',
    images: [],
    maxImageCount: 9,
    mediaType: 'image', // 默认选择图片类型
    mediaFiles: [],
    category: ''
  },

  // 输入标题
  onTitleInput(e) {
    this.setData({
      title: e.detail.value
    });
  },
  selectMediaType(e) {
    const type = e.currentTarget.dataset.type;
    if (this.data.mediaType !== type) {
      this.setData({
        mediaType: type,
        mediaFiles: [] // 切换类型时清空已选媒体
      });
    }
  },

  // 选择媒体文件
  chooseMedia() {
    const { mediaType, mediaFiles, maxImageCount } = this.data;
    
    if (mediaType === 'video') {
      wx.chooseMedia({
        count: 1,
        mediaType: ['video'],
        sourceType: ['album', 'camera'],
        maxDuration: 60, // 最大时长60秒
        camera: 'back',
        success: (res) => {
          this.setData({
            mediaFiles: [res.tempFiles[0].tempFilePath]
          });
        }
      });
    } else {
      wx.chooseMedia({
        count: maxImageCount - mediaFiles.length,
        mediaType: ['image'],
        sourceType: ['album', 'camera'],
        camera: 'back',
        success: (res) => {
          const newFiles = res.tempFiles.map(file => file.tempFilePath);
          this.setData({
            mediaFiles: [...mediaFiles, ...newFiles]
          });
        }
      });
    }
  },

  // 预览媒体
  previewMedia(e) {
    const { index } = e.currentTarget.dataset;
    const { mediaFiles, mediaType } = this.data;
    
    if (mediaType === 'image') {
      wx.previewImage({
        urls: mediaFiles,
        current: mediaFiles[index]
      });
    }
    // 视频不需要预览，因为点击就能播放
  },

  // 删除媒体
  deleteMedia(e) {
    const { index } = e.currentTarget.dataset;
    const mediaFiles = this.data.mediaFiles.filter((_, i) => i !== index);
    this.setData({ mediaFiles });
  },

  // 提交表单时上传媒体文件
  async uploadMedia() {
    const { mediaFiles, mediaType } = this.data;  
    if (!mediaFiles.length) return [];
    
    const uploadTasks = mediaFiles.map(filePath => {
      return new Promise((resolve, reject) => {
        wx.uploadFile({
          url: 'http://121.41.13.49:8081/file/upload',
          filePath: filePath,
          name: 'file',
          success: res => {
            console.log('上传响应:', res.data); // 打印原始响应数据
            try {
              // 解析响应数据
              const result = JSON.parse(res.data);
              if (result.code === 1 && result.data) {
                console.log('上传成功，文件URL:', result.data);
                resolve(result.data); // 返回文件URL
              } else {
                console.error('上传失败，服务器返回:', result);
                reject(new Error('上传失败'));
              }
            } catch (e) {
              console.error('解析响应数据失败:', e);
              reject(e);
            }
          },
          fail: error => {
            console.error('上传失败:', filePath, error);
            reject(error);
          }
        });
      });
    });

    try {
      const uploadedFiles = await Promise.all(uploadTasks);
      console.log('所有文件上传完成:', uploadedFiles);
      return uploadedFiles;
    } catch (error) {
      console.error('上传失败:', error);
      wx.showToast({
        title: '媒体上传失败',
        icon: 'none'
      });
      return [];
    }
  },

  // 输入内容
  onContentInput(e) {
    this.setData({
      content: e.detail.value
    });
  },

  // 选择图片
  chooseImage() {
    const remainCount = this.data.maxImageCount - this.data.images.length;
    if (remainCount <= 0) {
      wx.showToast({
        title: '最多选择9张图片',
        icon: 'none'
      });
      return;
    }

    wx.chooseMedia({
      count: remainCount,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const newImages = res.tempFiles.map(file => file.tempFilePath);
        this.setData({
          images: [...this.data.images, ...newImages]
        });
      }
    });
  },

  // 删除图片
  deleteImage(e) {
    const index = e.currentTarget.dataset.index;
    const images = this.data.images;
    images.splice(index, 1);
    this.setData({ images });
  },

  // 预览图片
  previewImage(e) {
    const currentUrl = e.currentTarget.dataset.url;
    const urls = this.data.mediaList.map(item => item.url);
    wx.previewImage({
      current: currentUrl,
      urls: urls
    });
  },

  // 修改分类选择方法
  selectCategory(e) {
    const category = e.currentTarget.dataset.category;
    this.setData({
      category: category
    });
  },

  // 确保使用这个异步版本的 submitPost
  async submitPost() {
    if (!this.data.title.trim()) {
      wx.showToast({
        title: '请输入标题',
        icon: 'none'
      });
      return;
    }

    if (!this.data.content.trim()) {
      wx.showToast({
        title: '请输入内容',
        icon: 'none'
      });
      return;
    }

    if (!this.data.category) {
      wx.showToast({
        title: '请选择分类',
        icon: 'none'
      });
      return;
    }

    wx.showLoading({
      title: '发布中...'
    });

    try {
      // 先上传媒体文件
      console.log('开始上传媒体文件');
      const mediaUrls = await this.uploadMedia();
      console.log('媒体文件上传完成', mediaUrls);

      const { userStore } = getApp().globalData;
      const token = userStore.data.token;

      // 发送到服务器
      wx.request({
        url: 'http://121.41.13.49:8081/post/create',
        method: 'POST',
        header: {
          'content-type': 'application/json',
          'authentication': token
        },
        data: {
          title: this.data.title,
          content: this.data.content,
          mediaUrls: mediaUrls,
          category: this.data.category
        },
        success: (res) => {
          if (res.data.code === 1) {
            wx.showToast({
              title: '发布成功',
              icon: 'success'
            });
            setTimeout(() => {
              wx.navigateBack();
            }, 1500);
          } else {
            wx.showToast({
              title: '发布失败',
              icon: 'none'
            });
          }
        },
        fail: () => {
          wx.showToast({
            title: '发布失败',
            icon: 'none'
          });
        },
        complete: () => {
          wx.hideLoading();
        }
      });
    } catch (error) {
      console.error('发布过程出错:', error);
      wx.hideLoading();
      wx.showToast({
        title: '发布失败',
        icon: 'none'
      });
    }
  }
}); 