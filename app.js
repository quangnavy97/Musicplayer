/**
 * 1. render song
 * scroll top
 * play/ pause. seek    // mai học đoạn này togle
 * cd rotate
 * text / pre
 * random
 * next / repeat when end
 * active song   ///// mai học cái này
 * scroll active song into view
 * play song when click
 */

///.................................

const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)
const heading = $('header h2')
const cdThumb = $('.cd-thumb')
const audio = $('#audio')
const cd = $('.cd')  //gọi biến cd
const playBtn = $('.btn-toggle-play')
const player = $('.player')
const progress = $('#progress')
const prevBtn = $('.btn-prev')
const nextBtn = $('.btn-next')
const randomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')
const playlist = $('.playlist')
const PLAYER_STORAGE_KEY = 'Navy-Player'

//-------------------
const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs: [
        {
            name: 'Suýt Nữa Thì',
            singer: 'Andiez',
            path: './music/song1.mp3',
            image: './img/img1.png'    // <a href="./img/1.suyt-nua-thi.png"></a>
        },
        {
            name: 'Hôm Nay Tôi Buồn',
            singer: 'Phùng Khánh Linh',
            path: './music/song2.mp3',
            image: './img/img2.png'
        },
        {
            name: 'Như Anh Đã Thấy Em',
            singer: 'PhucXP, FreakD',
            path: './music/song3.mp3',
            image: './img/img3.png'
        },
        {
            name: 'Ngôi Sao Cô Đơn',
            singer: 'J97',
            path: './music/song4.mp3',
            image: './img/img4.jpg'
        },
        {
            name: 'Từng Là Tất Cả',
            singer: 'Karik',
            path: './music/song5.mp3',
            image: './img/img5.png'
        },
        {
            name: 'Giấc Mộng Thời Trai',
            singer: 'Lam Trường',
            path: './music/song6.mp3',
            image: './img/img6.png'
        },
    ],
    setConfig: function (key, value) {
        this.config[key] = value
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
    },
    render: function() {
        const htmls = this.songs.map((song, index )=> {
            return `
            <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}" >
                 <div class="thumb" style="background-image: url('${song.image}')">
                 </div>
                 <div class="body">
                     <h3 class="title">${song.name}</h3>
                     <p class="author">${song.singer}</p>
                 </div>
                 <div class="option">
                      <i class="fas fa-ellipsis-h"></i>
                 </div>
          </div>
            `
        })
        playlist.innerHTML = htmls.join('')
       
        
    },
    defineProperties: function(){
        Object.defineProperty(this,'currentSong',{
            get: function(){
                return this.songs[this.currentIndex]
            }
        })
    },
    handleEvents: function() {
        const _this = this
        const cdWidth = cd.offsetWidth  // gọi biến cd width

        // xử lý CD thumb quay / dừng
        const cdThumbAnimate = cdThumb.animate([
            {transform: 'rotate(360deg)'}
        ], {
            duration: 10000,
            iterations: Infinity
        })
        cdThumbAnimate.pause()

        
        // xử lý phóng to thu nhỏ CD
        document.onscroll = function() {
            const scrollTop = window.scrollY || document.documentElement.scrollTop   // hàm cuộn dọc
            const newCdWidth = cdWidth - scrollTop        // lấy kích thước ban đầu - cuộn dọc 
            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0
            cd.style.opacity = newCdWidth / cdWidth
        }
        // xử lý khi click play
        playBtn.onclick = function(){
            if (_this.isPlaying) {
                audio.pause()  
            } else {
                audio.play()
            }
        }
        // khi bài hát dc chạy
        audio.onplay = function () {
            _this.isPlaying = true
            player.classList.add('playing')
            cdThumbAnimate.play()
        }
        // khi bài hát bị pause
        audio.onpause = function () {
            _this.isPlaying = false
            player.classList.remove('playing')
            cdThumbAnimate.pause()
        }
        // khi tiến độ bài hát thay đổi
        audio.ontimeupdate = function(){
            if (audio.duration) {
                const progressPercent = Math.floor(audio.currentTime / audio.duration *100)
                progress.value = progressPercent
            }
        }
        // xử lý khi tua
        progress.onchange = function (e){
            const seekTime = e.target.value * audio.duration /100
            audio.currentTime = seekTime
        }
        // khi ấn Next
        nextBtn.onclick = function(){
            if (_this.isRandom){
                _this.playRandomSong()
            } else {
            _this.nextSong()
            }
            audio.play()
            _this.render()
            -_this.srollToActiveSong()
        }

        // khi ấn prev
        prevBtn.onclick = function(){
            if (_this.isRandom) {
                _this.playRandomSong()
            } else {
                _this.prevSong()
            }
            audio.play()
            _this.render()
            -_this.srollToActiveSong()

        }

        // khi ấn nút random
        randomBtn.onclick = function (e)  {
            _this.isRandom = !_this.isRandom
            _this.setConfig('isRandom', _this.isRandom)
            randomBtn.classList.toggle('active', _this.isRandom)
        }
        
        // Xử lý repeat
        repeatBtn.onclick = function(e) {
            _this.isRepeat = !_this.isRepeat
            _this.setConfig('isRepeat', _this.isRepeat)
            repeatBtn.classList.toggle('active', _this.repeatBtn)
        }
        
        // Xử lý next song khi audio ended
        audio.onended = function() {
           if (_this.isRepeat) {
                audio.play()
           } else{
            nextBtn.click ()
           }
        }

        // lắng nghe click vào playlist ( chọn bài hát)
        playlist.onclick = function(e) {
            const songNode = e.target.closest('.song:not(.active)')
            if ( songNode || e.target.closest('.option') ) {
                
                // xử lý khi click vào song
                if (songNode){
                    _this.currentIndex = Number(songNode.dataset.index)
                    _this.loadCurrentSong()
                    audio.play()
                    _this.render()
                }
            }
        }
    },
    srollToActiveSong: function(){
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'nearest'
            })
        }, 300);
    },
    loadConfig: function(){
        this.isRandom = this.config.isRandom
        this.isRepeat = this.config.isRepeat
    },
    loadCurrentSong: function() {
        
        heading.textContent = this.currentSong.name
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`
        audio.src = this.currentSong.path
       
    },
    nextSong: function() {
        this.currentIndex++
        if (this.currentIndex >= this.songs.length ) {
            this.currentIndex = 0
        }
        this.loadCurrentSong()
    },
    prevSong: function() {
        this.currentIndex--
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1
        }
        this.loadCurrentSong()
    },

    //xử lý random bật tắt song
    playRandomSong: function (){
        let newIndex 
        do {
            newIndex = Math.floor(Math.random() * this.songs.length)
        } while (newIndex === this.currentIndex)
        this.currentIndex = newIndex
        this.loadCurrentSong()
    },

  ////----START HERE----///
    start: function() {
        // gán cấu hình từ config
        this.loadConfig()

        // định nghĩa các thuộc tính cho object
        this.defineProperties()

        // lắng nghe các sự kiện Dom Events
        this.handleEvents()

        //tải thông tin bài hát đầu tiên vào UI khi chạy
        this.loadCurrentSong()

        // render playlist
        this.render()

        // hiển thị trạng thái ban đầu của button ramdom, repeat
        randomBtn.classList.toggle('active', _this.isRandom)
        repeatBtn.classList.toggle('active', _this.isRepeat)
    }
}
app.start()