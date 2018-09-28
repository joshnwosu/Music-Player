const os = require('os'),
      fs = require('fs'),
      path = require('path'),
      homedir = os.homedir(),
      mm = require('music-metadata'),
      util = require('util'),
      $ = require('jquery')

let audioFile = [],
    allTrack = [],
    counter = 0,
    audio = new Audio(),
    lastPlayed = [],
    temporarySearchPlaylist = [],
    shuffle = false,
    repeat = 0,
    musicContainer = document.querySelector('.music-container'),
    harmburgerMenu = document.querySelector('.harmburger'),
    seekBar = document.querySelector('.seek-bar'),
    seekFill = seekBar.querySelector('.seek-fill'),
    timeCT = document.querySelector('.current-time'),
    timeDT = document.querySelector('.duration-time')

// Recursively get all files with the extension '.mp3'
function getMp3Files(startPath, filter, callback) {

  // checks if the directory path exists
  // if not return
  if(!startPath) return;

  let files = fs.readdirSync(startPath);
  files.forEach((elem, index)=> {
    let filename = path.join(startPath, elem),
        stat = fs.lstatSync(filename)

    // remove files that starts with '.'
    if(elem.startsWith('.') == true) {
      files.splice(index, 1)
    }else {
      if (stat.isDirectory()) {
        getMp3Files(filename, filter, callback); // Recursive
      }else if (filename.substr(-4) === filter) callback(filename)
    }
  });
}

getMp3Files(homedir, '.mp3', function(filename) {
  audioFile.push(filename);
});

audioFile.forEach((file, index)=> {

  mm.parseFile(file, {native: true})
    .then(metadata=> {
      let details = util.inspect(metadata, {showHidden: false, depth: null}),
          obj = path.parse(audioFile[index]),
          filesize = fs.statSync(audioFile[index]);

      allTrack.push({
        file: audioFile[index],
        title: metadata.common.title || obj.name,
        artist: metadata.common.artist || 'Unknown artist',
        album: metadata.common.album || 'Unknown album',
        genre: metadata.common.genre || 'Unknown genre',
        year: metadata.common.year || 'Unknown',
        duration: metadata.format.duration,
        size: filesize.size,
        data: metadata.format.bitrate,
        id: index,
        obj: obj
      });

      var order = allTrack.sort(function(a, b) {
        var nameA = a.title.toUpperCase();
        var nameB = b.title.toUpperCase();
        if(nameA < nameB) return -1;
        if (nameA > nameB) return 1;
        return 0;
      });

      localStorage.setItem('playlist', JSON.stringify(order));
    })
    .catch(err=> {
      console.log(err.message);
    });
});

function renderHTML(song, index) {
  let html = `
      <li class="track" data-index='${index}'>
        <div class="index">${index + 1}</div>
        <div class="title">${song.title}</div>
        <i id="${index}" class="ion-ios-heart-outline" onclick="addToFavorite('${index}', this)"></i>
        <div class="artist">${song.artist}</div>
        <div class="album">${song.album}</div>
        <div class="genre">${song.genre}</div>
        <div class="year">${song.year}</div>
        <div class="time">${convertTime(song.duration)}</div>
      </li>
  `;
  return html;
}

function convertTime(length) {
  let sec = Math.floor(length % 60) || 0;
  let min = Math.floor(length / 60) || 0;
  let hr = Math.floor(min / 60) || 0;

  hr %= 24;
  min %= 60;
  sec %= 60;

  sec = sec <= 9 ? '0' + sec : sec;
  min = min <= 9 ? '0' + min : min;
  hr  = hr <= 9 ? '0' + hr : hr;

  if (length >= 3600) {
      return (`${hr}:${min}:${sec}`);
  }else {
      return (`${min}:${sec}`);
  }
}

let playlist = JSON.parse(localStorage.getItem('playlist')) || [];

function returnRenderedHTML() {
  if(!playlist) return;
  let html = playlist.map((song, index)=> {
    return renderHTML(song, index);
  }).join('');
  musicContainer.innerHTML = html;
}
returnRenderedHTML();

// setting the audio source
// let encoded = encodeURIComponent(playlist[counter].obj.base)
// audio.src = `${playlist[counter].obj.dir}/${encoded}`;

function playTrack(number) {
  if(!playlist) return
  else {
    if (playlist[number]) {
      lastPlayed.push(number);
    };

    let indeces = document.querySelectorAll('.index');
    for (let i = 0; i < indeces.length; i++) {
      indeces[i].innerHTML = i + 1
    }
    indeces[number].innerHTML = '<i class="ion-ios-volume-high"></i>';

    let playerLabel = document.querySelector('.player-name');
    let labelTitle = playerLabel.querySelector('.title');
    let labelArtist  = playerLabel.querySelector('.artist');

    labelTitle.textContent = playlist[number].title;
    labelArtist.textContent = playlist[number].artist;

    let encoded = encodeURIComponent(playlist[number].obj.base)
    audio.src = `${playlist[number].obj.dir}/${encoded}`;
    audio.play();

    mm.parseFile(playlist[number].file, {native: true})
      .then(metadata=> {

        var src = 'assets/img/avatar.png';
        document.querySelector('.cover img').setAttribute('src',src);
        document.querySelector('.tooltip img').setAttribute('src', src)
        
        var image = metadata.common.picture[0];
        if(image) {
          var base64String = '';
          for(var i = 0; i < image.data.length; i++) {
              base64String += String.fromCharCode(image.data[i]);
          }
          var base64 = "data:" + image.format + ";base64," + window.btoa(base64String);
          document.querySelector('.cover img').setAttribute('src',base64);
          document.querySelector('.tooltip img').setAttribute('src', base64)
        }
        
      })
      .catch(err=> {
        console.log(err.message);
      });
  }

  
}

audio.addEventListener('timeupdate', ()=> {
  let pos = audio.currentTime / audio.duration;
  seekFill.style.width =`${pos*100}%`;

  showCurrentTime();
  showDurationTime();
});

function showCurrentTime() {
  var curr = Math.floor(audio.currentTime);
  timeCT.textContent = convertTime(curr);
}

function showDurationTime() {
  var durr = Math.floor(audio.duration);
  timeDT.textContent = convertTime(durr);
}


// play and pause the music 
let playPauseBtn = document.querySelector('#playPause-button');
playPauseBtn.addEventListener('click', playAudio);

function playAudio() {
  if(audio.paused) {
    audio.play()
    playPauseBtn.querySelector('i').setAttribute('class', 'ion-ios-pause')
  }else {
    audio.pause();
    playPauseBtn.querySelector('i').setAttribute('class', 'ion-ios-play')
  }
}

// net Music button
var nextBtn = document.querySelector('#next-button')
nextBtn.addEventListener('click', nextAudio)

function nextAudio() {
  if (!shuffle) {
    counter++;
    if (counter > playlist.length - 1) {
      counter = 0;
    }
  }
  else {
    if (playlist.length > 1) {
      let temp = counter;
      while( counter == temp ){
        counter = Math.floor(Math.random() * playlist.length)
      }
    }
  }
  if (playlist[counter]) {
    if (audio.played) {
      playPauseBtn.querySelector('i').setAttribute('class', 'ion-ios-pause')
    }
    playTrack(counter);
  }

};


// previous Music Button
let prevBtn = document.querySelector('#previous-button');
prevBtn.addEventListener('click', previousAudio);

function previousAudio() {
  if(!shuffle) {
    if(counter == 0) {
      counter = playlist.length - 1;
    }
    else {
      counter--;
    }
  }
  
  else {
    lastPlayed.pop();
    counter = lastPlayed.pop();
  }

  if (counter ==  undefined || counter < 0) {
    counter = 0;
  }

  if (audio.played) {
    playPauseBtn.querySelector('i').setAttribute('class', 'ion-ios-pause')
  }

  playTrack(counter)
}

// Turn shuffle on and off
let shuffleBtn = document.querySelector('#shuffle-button');
shuffleBtn.addEventListener('click', shuffleAudio);

function shuffleAudio() {
  var that = this;
  if (that.classList.contains('active')) {
    that.classList.remove('active')
    that.setAttribute('title', 'Shuffle Off');
    shuffle = false
  }else {
    that.classList.add('active');
    that.setAttribute('title', 'Shuffle On');
    shuffle = true;

    if (repeat == 2) {
      let rb = document.querySelector('#repeat-button');
      let that = rb;

      var span = that.querySelector('span');
      span.style.opacity = '0';
      that.classList.add('active');
      that.setAttribute('title', 'Repeat All');
      repeat = 1;
      
    }
  }
}


// Turn repeat on and off
// repeat = 0 Repeat is off - when the playlist reaches it's end it will stop
// repeat = 1 Repeat all - when the playlist reaches it's end it will start from begining
// repeat = 2 Repeat Current - repeat track
let repeatBtn = document.querySelector('#repeat-button');
repeatBtn.addEventListener('click', repeatAudio);

function repeatAudio() {
  var that = this;

  if (repeat == 0) {

    that.classList.add('active');
    that.setAttribute('title', 'Repeat All');
    repeat = 1;

  }
  else if (repeat == 1) {

    var spanEl = that.querySelector('span');
    spanEl.style.opacity = '1';
    that.setAttribute('title', 'Repeat Current');
    repeat = 2;

    if (shuffle) {
      let sb = document.querySelector('#shuffle-button');
      var that = sb;
  
      if (that.classList.contains('active')) {
        that.classList.remove('active');
        that.setAttribute('title', 'Shuffle Off');
        shuffle = false;
      } else {
          that.classList.add('active');
          that.setAttribute('title', 'Shuffle On');
          shuffle = true;
      }
    }

  }

  else if (repeat == 2) {
    var spanEl = that.querySelector('span');
    spanEl.style.opacity = '0';
    that.classList.remove('active');
    that.setAttribute('title', 'Repeat Off')
    repeat = 0;
    
  }
}

 // Event handler wnen a track finishes playing
 audio.addEventListener('ended', function() {
  // In case shuffle is on
  if (shuffle) {
    if (playlist.length > 1) {
      let temp = counter;
      while( counter == temp ) {
        counter = Math.floor(Math.random() * playlist.length);
      }
      if(playlist[counter]) {
        playTrack(counter)
      }
    }

  }

  // In case shuffle is off.
  else {
    if (!repeat) {
      if (counter >= playlist.length - 1) {
        console.log('All music played');
      }else {
        counter++;
        playTrack(counter);
      }
    }

    else if (repeat == 1) {
      if (counter >= playlist.length - 1) {
        counter = 0;
      }else {
        counter++;
      }
      playTrack(counter);
    }

    else if (repeat == 2) {
      if (playlist[counter]) {
        playTrack(counter)
      }
    }
  }

});

// SEEK BAR
// SEEK BAR EVENT

seekBar.addEventListener('mousedown', function(e) {
  seekTime = (e.offsetX / seekBar.offsetWidth) * audio.duration;
  audio.currentTime = seekTime;
  e.preventDefault();
});

let favItem = document.querySelector('.fav-item');

harmburgerMenu.addEventListener('click', ()=> {
  musicContainer.classList.toggle('slide');
  favItem.classList.toggle('show');
});

let searchBtn = document.querySelector('.search');
var searchInput = $('input');
let searchInputContainer = document.querySelector('.search-input');

searchBtn.addEventListener('click', function() {
  searchInputContainer.classList.toggle('isDown')
})

// function clickToPlay(id, that) {
//   if(id == undefined) return;

//   else {
//     if (audio.played) {
//       playPauseBtn.querySelector('i').setAttribute('class', 'ion-ios-pause')
//     }
//     counter = id;
//     playTrack(counter);
//   }
//   console.log(id);
// }
let favoriteItem = JSON.parse(localStorage.getItem('favoriteItem')) || [],
    likesFav = JSON.parse(localStorage.getItem('likesFav')) || [],
    likeIcon = 'ion-ios-heart',
    unlikeIcon = 'ion-ios-heart-outline'


likesFav.forEach(like=> {
  document.getElementById(like).className = likeIcon;
});

function getFavoriteItems() {
  if(!favoriteItem) return;
  else {
    var html = '';
    html += favoriteItem.map(item=> {
      return `
        <li class="list">
          <span class="title">${item.title}</span>
          <span class="time">${convertTime(item.duration)}</span>
        </li>
      `;
    }).join('');
    document.querySelector('.fav-item').innerHTML = html;
  }
}
getFavoriteItems();

function addToFavorite(id, that) {
  let index = likesFav.indexOf(id);
  if(id == undefined) return;
  else {
    if (index == -1) {
      likesFav.push(id); favoriteItem.push(playlist[id]);
      that.className = likeIcon;
    }else {
      likesFav.splice(index, 1); favoriteItem.splice(index, 1);
      that.className = unlikeIcon;
    }
  }
  // set items to localStorage
  localStorage.setItem('likesFav', JSON.stringify(likesFav));
  localStorage.setItem('favoriteItem', JSON.stringify(favoriteItem));
  getFavoriteItems();
}

function removeFromFavorite(id) {
  var index = likesFav.indexOf(id);
  if(!id) return;
  else {
    likesFav.splice(index, 1); favoriteItem.splice(index, 1);
    document.getElementById(id).className = unlikeIcon;
  }

  // set items to localStorage
  localStorage.setItem('likesFav', JSON.stringify(likesFav));
  localStorage.setItem('favoriteItem', JSON.stringify(favoriteItem));
  getFavoriteItems();
}

$('.music-container').on('dblclick', function(e) {
  // Get the index of the clicked track.

  var target = $(e.target),
      index = target.closest('.track').data('index');
      
  if(index != undefined) {
    if (temporarySearchPlaylist.length) {
      playlist = temporarySearchPlaylist.slice(0);
      temporarySearchPlaylist = [];
      lastPlayed = [];
    }
    if (audio.played) {
      playPauseBtn.querySelector('i').setAttribute('class', 'ion-ios-pause')
    }
    counter = index;
    playTrack(counter);
    console.log(counter)
  }
});

var clearSearchDelay;

searchInput.on('keydown', function(e) {
  if (e.keyCode == 27) {
    $(this).val('');
    $(this).trigger('input');
  }else if (e.keyCode == 13){
    e.preventDefault();
    if ($(this).val().trim().length) {
      var searchString = $(this).val().trim();
      searchTracks(searchString);
      clearTimeout(clearSearchDelay);
    }
  }
});

searchInput.on('input', function(e) {
  e.preventDefault();
  var searchStr = $(this).val().trim();

  clearTimeout(clearSearchDelay);
  if(!searchStr.length) {
    searchInput.val('');
    searchTracks();
  }else {
    clearSearchDelay = setTimeout(function() {
      if(searchStr.length) {
        searchTracks(searchStr)
      }
    },700)
  }
});

function searchTracks(query) {
  query = query || "";
  query = query.toLowerCase();

  temporarySearchPlaylist = allTrack.slice(0);

  if (query.length) {
    temporarySearchPlaylist = temporarySearchPlaylist.filter(function(tr) {
      if(tr.artist.toLowerCase().indexOf(query) != -1 || tr.title.toLowerCase().indexOf(query) != -1 || tr.album.toLowerCase().indexOf(query) != -1){
        return tr;
      }
    })
  }
  renderTrackList(temporarySearchPlaylist);
};

function returnTrackHTML(song, index) {
  var html =
    ` <li class="track" data-index='${index}'>
        <div class="index">${index + 1}</div>
        <div class="title">${song.title}</div>
        <i id="${index}" class="ion-ios-heart-outline" onclick="addToFavorite('${index}', this)"></i>
        <div class="artist">${song.artist}</div>
        <div class="album">${song.album}</div>
        <div class="genre">${song.genre}</div>
        <div class="year">${song.year}</div>
        <div class="time">${convertTime(song.duration)}</div>
      </li>`;
    return html;
}


function renderTrackList(list) {
  $('.track').remove();
  var html = list.map(function(tr, index) {
    return returnTrackHTML(tr, index);
  }).join('');
  // $('.musicContainer').append($(html));
  musicContainer.innerHTML = html;
};







