import request from "../../utils/request"
// 发布
import pubSub from "pubsub-js"
import moment from 'moment'
const appContext = getApp();

Page({
  data: {
    isPlay: false, // 音乐是否播放
    musicId: "", // 音乐id
    song: {}, //歌曲详情对象
    musicLink: "", // 音乐的链接
    currentTime: '00:00', // 当前时长
    durationTime: '00:00', // 总时长
    currentWidth: 0,

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function ({
    musicId
  }) {
    this.getMusicInfo(musicId);
    // 判断当前音乐是否播放
    if (appContext.globalData.isMusicPlay && appContext.globalData.musicId === musicId) {
      // 修改当前音乐的播放状态为true
      this.setData({
        isPlay: true
      })
    }
    this.changeMusicSubscribe();
    // 事件监听
    this.backgroundAudioManager = wx.getBackgroundAudioManager();
    this.backgroundAudioManager.onPlay(() => {
      this.changeMusicState(true);
      // 修改全局播放状态
      appContext.globalData.musicId = musicId;
    })
    this.backgroundAudioManager.onPause(() => {
      this.changeMusicState(false);
    })
    this.backgroundAudioManager.onStop(() => {
      this.changeMusicState(false);
    })
    // 监听播放进度
    this.backgroundAudioManager.onTimeUpdate(() => {
      // 获取当前播放时长并更新当前时长currentTime
      const currentTime = moment(this.backgroundAudioManager.currentTime * 1000).format('mm:ss');
      const currentWidth = this.backgroundAudioManager.currentTime / this.backgroundAudioManager.duration * 450;
      this.setData({
        currentTime,
        currentWidth
      })
    })
    // 监听音乐播放正常结束
    this.backgroundAudioManager.onEnded(() => {
      pubSub.publish('switchType', 'next')
      // 还原进度条
      this.setData({
        currentWidth: '',
        currentTime: '00:00'
      })
    })
  },
  changeMusicState(isPlay) {
    this.setData({
      isPlay
    })
    // 修改全局播放状态
    appContext.globalData.isMusicPlay = false;
  },
  // 切歌
  handleSwitch(event) {
    const type = event.currentTarget.id;
    // 停止当前播放的引用
    this.backgroundAudioManager.stop();
    pubSub.publish("switchType", type)
  },
  // 监听切歌操作
  changeMusicSubscribe() {
    pubSub.subscribe('musicId', (msg, musicId) => {
      // 更改musicId
      this.setData({
        musicId
      })
      // 获取音乐详情信息
      this.getMusicInfo(musicId)
      // 自动播放
      this.musicControl(true)
      // 取消订阅
      // pubSub.unsubscribe('musicId')
    })
  },
  // 控制播放/暂停
  handleMusicPlay() {
    // 改变播放状态
    this.changeMusicState(!this.data.isPlay)
    this.musicControl(this.data.isPlay)
  },
  async musicControl(isPlay, musicLink) {
    if (isPlay) {
      if (!musicLink) {
        const {
          data
        } = await request('/song/url', {
          id: this.data.musicId
        })
        musicLink = data[0].url;
        this.setData({
          musicLink
        })
      }
      this.backgroundAudioManager.src = musicLink;
      this.backgroundAudioManager.title = this.data.song.name;
      this.backgroundAudioManager.play()
    } else { // 暂停音乐
      this.backgroundAudioManager.pause()
    }
  },
  async getMusicInfo(musicId) {
    const songData = await request('/song/detail', {
      ids: musicId
    })
    const durationTime = moment(songData.songs[0].dt).format('mm:ss')
    this.setData({
      song: songData.songs[0],
      musicId,
      durationTime
    })
    wx.setNavigationBarTitle({
      title: this.data.song.name,
    })
  },
  // 小点拖拽改变进度
  dottouchstart(event) {
    if (!this.startPoint) {
      this.startPoint = event.touches[0].pageX;
    }
  },
  dottouchmove(event) {
    const {
      devicePixelRatio
    } = wx.getSystemInfoSync();
    this.setData({
      currentWidth: (event.touches[0].pageX - this.startPoint) * devicePixelRatio
    })
  },
})