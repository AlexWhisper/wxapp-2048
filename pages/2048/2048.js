var Board = require("./grid.js");
var Main = require("./main.js");
const innerAudioContext = wx.createInnerAudioContext();
innerAudioContext.src = '/music/audio.mp3';

var config=
  { 
    data: {
      hidden: false,
      start: "开始游戏",
      num: [],
      score: 0,
      bestScore: 0, // 最高分
      endMsg: '',
      over: false,  // 游戏是否结束 
    },
    // 页面渲染完成
    play: function(){
       innerAudioContext.stop();
       innerAudioContext.play();
       
    },
    onReady: function () {
      this.animation = wx.createAnimation({
        duration: 100,
        timingFunction: 'linear',
      })
      if(!wx.getStorageSync("highScore"))
        wx.setStorageSync('highScore', 0);
      this.gameStart();
    },
    scale: function(){
      this.animation.scale(0.7, 0.7).step()
      this.animation.scale(1, 1).step()
      this.setData({animation:this.animation.export()})
    },
    gameStart: function() {  // 游戏开始
      var main = new Main(4);
      this.setData({
        main: main,
        bestScore: wx.getStorageSync('highScore')
      });
      this.data.main.__proto__ = main.__proto__;
      
      this.setData({
        hidden: true,
        over: false,
        score: 0,
        num: this.data.main.board.grid
      });  
    },
    gameOver: function() {  // 游戏结束
      this.setData({
        over: true 
      });
    
      if (this.data.score >= 2048) {
        this.setData({ 
          endMsg: '恭喜达到2048！'
        });
        wx.setStorageSync('highScore', this.data.score);
      } else if (this.data.score > this.data.bestScore) {
        this.setData({
          endMsg: '创造新纪录！' 
        }); 
        wx.setStorageSync('highScore', this.data.score);
      } else {
        this.setData({
          endMsg: '游戏结束！'
        }); 
      } 
    },
  
  
    // 触摸
    touchStartX: 0,
    touchStartY: 0,
    touchEndX: 0,
    touchEndY: 0,
    touchStart: function(ev) { // 触摸开始坐标
      // 多指操作
      this.isMultiple = ev.touches.length > 1;
      if (this.isMultiple) {
          return;
      }
      var touch = ev.touches[0];
      this.touchStartX = touch.clientX;
      this.touchStartY = touch.clientY;
  
    },
    touchMove: function(ev) { // 触摸最后移动时的坐标
      var touch = ev.touches[0];
      this.touchEndX = touch.clientX;
      this.touchEndY = touch.clientY;
    },
    touchEnd: function() {
      if (this.isMultiple) {
        return;
      }
  
      var disX = this.touchStartX - this.touchEndX;
      var absdisX = Math.abs(disX);
      var disY = this.touchStartY - this.touchEndY;
      var absdisY = Math.abs(disY);
  
      if(this.data.main.isOver()) { // 游戏是否结束
        this.gameOver();
      } else {
        if (Math.max(absdisX, absdisY) > 0.1) { // 确定是否在滑动
            this.setData({
              start: "开始游戏",
            });
          var direction = absdisX > absdisY ? (disX < 0 ? 1 : 3) : (disY < 0 ? 2 : 0);  // 确定移动方向
          var data = this.data.main.move(direction);
          this.updateView(data);
          this.play();
          this.scale();
        }   
      }      
    },
    
    
  
    updateView(data) {
      var max = 0;
      for(var i = 0; i < 4; i++)
        for(var j = 0; j < 4; j++)
          if(data[i][j] != "" && data[i][j] > max)
            max = data[i][j];
      this.setData({
        num: data,
        score: max
      });
    },
    onShareAppMessage: function() {
      return {
        title: '你能不能合成2048吗',
        desc: '',
        path: '/pages/index/index'
      }
    }
  }



Page(config)