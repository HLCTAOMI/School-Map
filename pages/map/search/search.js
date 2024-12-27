// pages/search/search.js
var map = require('../../../utils/map');

Page({
    /**
     * 页面的初始数据
     */
    data: {
        content: null, // 用于存储输入框输入的内容
        search_id: 0, // 用于区分不同的搜索场景（根据原代码逻辑推测）
        site_data: map.site_data,
        result: [], // 搜索结果数组
        history: [], // 新增的搜索历史数组，用于存储历史搜索记录
        showHistory: true // 新增，用于控制搜索历史是否显示，初始值为true表示默认显示
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        console.log(options.id);
        this.setData({
            search_id: options.id
        });
        // 页面加载时，从本地缓存中读取搜索历史数据并设置到页面数据中
        this.loadSearchHistoryFromCache();
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

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh() {
        // 这里可添加下拉刷新时的具体逻辑，比如重新加载数据等，目前暂留空，你可按需完善
    },

    // 获取输入框的内容
    getContent(e) {
        this.setData({
            content: e.detail.value
        });
    },

    // 搜索功能函数，优化了添加搜索历史的逻辑以及添加搜索结果展示时隐藏搜索历史的逻辑
    goSearch() {
        const content = this.data.content;
        const site_data = this.data.site_data;
        const result = [];

        if (content) {
            // 遍历site_data中的数据进行搜索匹配
            for (let i = 0; i < site_data.length; i++) {
                for (let j = 0; j < site_data[i].list.length; j++) {
                    const data = site_data[i].list[j];
                    if (data.name.match(content) || data.aliases.match(content)) {
                        result.push(data);
                    }
                }
            }
            this.setData({
                result: result
            });
            if (result.length === 0) {
                wx.showToast({
                    icon: 'none',
                    title: '抱歉，没有找到您想找的地点',
                });
            }
            // 优化：只有当搜索结果存在且搜索内容不在历史记录中时，才添加到搜索历史，且更精准判断重复
            if (result.length > 0 &&!this.isInSearchHistory(content)) {
                this.addToSearchHistory(result[0]);
            }
            // 搜索结果展示时隐藏搜索历史，让界面更聚焦（可根据实际需求调整）
            this.setData({
                showHistory: false
            });
        } else {
            wx.showToast({
                icon: 'error',
                title: '请输入内容',
            });
        }
    },

    // 从本地缓存加载搜索历史数据的函数
    loadSearchHistoryFromCache() {
        const historyData = wx.getStorageSync('searchHistory');
        if (historyData) {
            this.setData({
                history: historyData
            });
        }
    },

    // 将搜索内容添加到搜索历史数组的函数（包含去重、限制数量等逻辑），优化去重判断逻辑
    addToSearchHistory(item) {
        let history = this.data.history;
        history.unshift(item);

        // 优化去重逻辑，综合考虑名称、别名等多因素判断重复
        history = history.filter((prevItem, index, self) => {
            return index === self.findIndex((t) => {
                return t.name === prevItem.name && t.aliases === prevItem.aliases;
            });
        });

        // 限制历史记录数量为10条（可根据实际需求调整）
        if (history.length > 10) {
            history.pop();
        }

        this.setData({
            history: history
        });
        // 将更新后的搜索历史数据存储到本地缓存
        wx.setStorageSync('searchHistory', history);
    },

    // 返回地图页并通过缓存传递参数的函数
    tapback(e) {
        console.log(e);
        const data = e.currentTarget.dataset;
        const search_id = this.data.search_id;
        const pages = getCurrentPages();
        const prevPage = pages[pages.length - 2];

        if (search_id === 1) {
            prevPage.setData({
                start: data
            });
        } else {
            prevPage.setData({
                end: data
            });
        }
        wx.navigateBack({});
    },

    // 点击搜索历史记录的处理函数，优化为点击后自动输入并触发搜索，且隐藏搜索历史
    tapHistory(e) {
        const name = e.currentTarget.dataset.name;
        this.setData({
            content: name
        });
        this.goSearch();
    },

    // 点击输入框时隐藏搜索历史的函数
    hideHistory() {
        this.setData({
            showHistory: false
        });
    },

    // 当输入框失去焦点时重新显示搜索历史的函数（可选功能，可根据实际需求决定是否添加）
    onInputBlur() {
        this.setData({
            showHistory: true
        });
    },

    // 新增函数：更精准判断搜索内容是否已在搜索历史中，考虑名称和别名多因素
    isInSearchHistory(content) {
        const history = this.data.history;
        for (let i = 0; i < history.length; i++) {
            if (history[i].name === content || history[i].aliases === content) {
                return true;
            }
        }
        return false;
    },

    // 新增函数：删除搜索历史的函数
    deleteSearchHistory() {
        // 清空本地缓存中的搜索历史数据
        wx.removeStorageSync('searchHistory');
        // 更新页面上显示的搜索历史数据为空数组，同时显示搜索历史区域（可根据实际需求调整显示与否逻辑）
        this.setData({
            history: [],
            showHistory: true
        });
    }
})