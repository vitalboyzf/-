import request from "../../utils/request";
Page({
  /**
   * 页面的初始数据
   */
  data: {
    bannerList: [], // 轮播图数据
    recommendList: [], // 推荐歌单
    topList: [], // 排行榜数据
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function () {
    let bannerListData = await request("/banner", {
      type: 2
    });
    this.setData({
      bannerList: bannerListData.banners
    });

    // 获取推荐歌单数据
    let recommendListData = await request("/personalized", {
      limit: 10
    });
    this.setData({
      recommendList: recommendListData.result
    });


    // 获取排行榜数据
    /*
     * 需求分析：
     *   1. 需要根据idx的值获取对应的数据
     *   2. idx的取值范围是0-20， 我们需要0-4
     *   3. 需要发送5次请求
     */
    let index = 0;
    let resultArr = [];
    while (index < 5) {
      let topListData = await request("/top/list", {
        idx: index++
      });
      // splice(会修改原数组，可以对指定的数组进行增删改) slice(不会修改原数组)
      let topListItem = {
        name: topListData.playlist.name,
        tracks: topListData.playlist.tracks.slice(0, 3)
      };
      resultArr.push(topListItem);
      // 不需要等待五次请求全部结束才更新，用户体验较好，但是渲染次数会多一些
      this.setData({
        topList: resultArr
      });
    }
  },
  // 跳转至recommend页面的回调
  toRecommendSong() {
    wx.navigateTo({
      url: "/pages/recommend/recommend"
    });
  },
  // 跳转至other页面
  toOther() {
    wx.navigateTo({
      url: "/songPackage/pages/other/other"
    });
  },
})