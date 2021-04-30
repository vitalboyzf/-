import request from "../../utils/request";
// 订阅数据
import pubSub from "pubsub-js"
Page({

  /**
   * 页面的初始数据
   */
  data: {
    day: "",
    month: "",
    recommendList: [],
    index: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 判断是否登录
    const user = wx.getStorageSync('userInfo');
    if (!user) {
      wx.showToast({
        title: '请先登录',
        success() {
          wx.reLaunch({
            url: '/pages/login/login',
          })
        }
      })
    }

    this.setData({
      day: new Date().getDate(),
      month: new Date().getMonth() + 1
    })
    // 获取每日推荐数据
    this.getRecommendList();
    // 订阅来自songDetail的消息
    pubSub.subscribe('switchType', (msg, type) => {
      const {
        recommendList,
        index
      } = this.data;
      let idx = index;
      if (type === "pre") {
        (idx === 0) && (idx = recommendList.length)
        idx--;
      } else {
        (idx === recommendList.length) && (idx = -1)
        idx++;
      }
      this.setData({
        index: idx
      })
      let musicId = recommendList[this.data.index].id;

      // 发布musicId消息
      pubSub.publish('musicId', musicId)
    })
  },


  async getRecommendList() {
    const recommendListData = await request('/recommend/songs');
    recommendListData.recommend.forEach(item => {
      item.author = item.artists.map(e => e.name).join(" , ")
    })
    this.setData({
      recommendList: recommendListData.recommend
    })
    console.log(recommendListData.recommend[0]);

  },
  toSongDetail(event) {
    const {
      song,
      index
    } = event.currentTarget.dataset;
    this.setData({
      index
    })
    // 路由跳转
    wx.navigateTo({
      url: '/pages/songDetail/songDetail?musicId=' + song.id,
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

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

  }
})