import buzz from 'buzz';
import SoundManagerMute from '/imports/client/ui/SoundManager/Mute/SoundManagerMute';
import buildings from '/imports/content/Building/client';

initPleerClient = function() {
'use strict';

var tracks = {
  1: '1 Последний Дредноут',
  2: '2 Коварство Рептилоидов',
  3: '3 Атака на Марс',
  4: '4 Героям Земли',
  5: '5 Канал связи',
  6: '6 Звёздный ветер перемен',
  7: '7 Небо над Землёй',
  8: '8 Марш Отцов',
  9: '9 Бгоневички в бой',
  10: '10 Вечно далекие звезды',
  11: '11 Бесконечная вселенная',
  12: '12 Между галактик',
  13: '13 Потерянные',
  14: '14 Памяти павших',
  15: '15 Храм света',
  16: '16 Надежда выжить',
  17: '17 Блеск кристаллов'
};

var storedPlaylist = JSON.parse(localStorage.getItem('playlist'));
var storedTracks = JSON.parse(localStorage.getItem('tracks'));

var playlist = [];
for (let key in tracks) {
  key = parseInt(key, 10);
  let track = new buzz.sound('https://consulwar.ru/music/' + tracks[key] + '.mp3', {
    volume:50,
  });
  track.name = tracks[key];
  track.id = key;

  if (storedTracks && storedTracks[key]) {
    track.disabled = true;
  }

  tracks[key] = track;

  playlist.push(key);
}

if (storedPlaylist && playlist.length == storedPlaylist.length) {
  playlist = storedPlaylist;
}

var allTracks = new buzz.group(_.map(playlist, function(track) {
  return tracks[track];
}));


Game.Player = {
  tracks,
  playlist,
  updated: new ReactiveVar(0),
  currentTrack: new ReactiveVar(playlist[0]),
  selectedTrack: new ReactiveVar(null),
  isPlaying: new ReactiveVar(false),
  isShuffle: new ReactiveVar(false),
  isShowPlaylist: new ReactiveVar(false),

  getCurrentTrackPosition: function() {
    return this.playlist.indexOf(this.currentTrack.get());
  },

  next: function(current = this.getCurrentTrackPosition()) {
    return (current + 1 >= this.playlist.length
      ? 0
      : current + 1
    );
  },

  previous: function(current = this.getCurrentTrackPosition()) {
    return (current - 1 < 0
      ? this.playlist.length - 1
      : current - 1
    );
  },

  getRandomWithout: function(track) {
    return _.sample(_.filter(this.playlist, function(id) {
      return id != track && !tracks[id].disabled;
    }));
  },

  stop: function() {
    allTracks.stop();
    //this.tracks[this.playlist[this.currentTrack.get()]].stop();
  },

  play: function(target = 'current', forcePlay = false) {
    if (target == 'current') {
      this.tracks[this.currentTrack.get()].play();
    } else {
      var isPlaying = this.isPlaying.get();
      this.stop();
      var nextTrack = null;
      if (this.isShuffle.get()) {
        nextTrack = this.getRandomWithout(this.currentTrack.get());
      } else {
        if(typeof(target) === 'number') {
          nextTrack = target;
        } else {
          nextTrack = this[target]();
        }
        let disabledCount = 0;
        while(tracks[this.playlist[nextTrack]].disabled) {
          // Если все треки выключены
          if (disabledCount > this.playlist.length) {
            return;
          }
          disabledCount++;
          if(typeof(target) === 'number') {
            nextTrack = this.next();
          } else {
            nextTrack = this[target]();
          }
        }
        nextTrack = playlist[nextTrack];
      }

      if (nextTrack !== null) {
        this.currentTrack.set(nextTrack);
        if (forcePlay || isPlaying) {
          this.play();
        }
      }
    }
  },

  playpause: function(id) {
    if (this.currentTrack.get() != id) {
      this.stop();
      this.currentTrack.set(id);
      this.play();
    } else {
      this.tracks[id].togglePlay();
    }
  },

  pause: function() {
    this.tracks[this.currentTrack.get()].pause();
  },

  toggleShuffle: function() {
    this.isShuffle.set(!this.isShuffle.get());
  },

  toggleDisable: function() {
    let selectedTrack = this.selectedTrack.get();
    if (selectedTrack) {
      let track = this.tracks[selectedTrack];
      track.disabled = !track.disabled;
      this.updated.set(Game.Random.random());
    }
  },

  swapTracks: function(pos1, pos2) {
    [this.playlist[pos1], this.playlist[pos2]] = [this.playlist[pos2], this.playlist[pos1]];
    this.updated.set(Game.Random.random());
  },

  moveUp: function() {
    let selectedTrack = this.selectedTrack.get();
    if (selectedTrack) {
      selectedTrack = playlist.indexOf(selectedTrack);
      this.swapTracks(selectedTrack, this.previous(selectedTrack));
    }
  },

  moveDown: function() {
    let selectedTrack = this.selectedTrack.get();
    if (selectedTrack) {
      selectedTrack = playlist.indexOf(selectedTrack);
      this.swapTracks(selectedTrack, this.next(selectedTrack));
    }
  }
};

Tracker.autorun(function () {
  var updated = Game.Player.updated.get();
  
  localStorage.setItem('playlist', JSON.stringify(Game.Player.playlist));

  localStorage.setItem('tracks', JSON.stringify(_.reduce(Game.Player.tracks, function(tracks, track) {
    tracks[track.id] = track.disabled;
    return tracks;
  }, {})));
});

allTracks.bind('ended', function() {
  Game.Player.play('next', true);
});

allTracks.bind('playing', function() {
  Game.Player.isPlaying.set(true);
});

allTracks.bind('pause', function() {
  Game.Player.isPlaying.set(false);
});

Template.player.events({
  'click .playpause': function(e, t) {
    let id = parseInt(e.currentTarget.parentElement.dataset.id, 10);
    Game.Player.playpause(id);
  },

  'click .openPlaylist': function(e, t) {
    Game.Player.isShowPlaylist.set(!Game.Player.isShowPlaylist.get());
  },

  'click .prev': function(e, t) {
    Game.Player.play('previous');
  },

  'click .next': function(e, t) {
    Game.Player.play('next');
  },

  'click .shuffle': function(e, t) {
    Game.Player.toggleShuffle();
  },

  'click .movedown': function(e, t) {
    Game.Player.moveDown();
  },

  'click .moveup': function(e, t) {
    Game.Player.moveUp();
  },

  'click .toggle': function(e, t) {
    Game.Player.toggleDisable();
  },

  'click li': function(e, t) {
    let id = parseInt(e.currentTarget.dataset.id, 10);
    let selected = Game.Player.selectedTrack.get();
    if (selected == id) {
      Game.Player.selectedTrack.set(null);
    } else {
      Game.Player.selectedTrack.set(id);
    }
  },

  'click .downloadMusic': function(e, t) {
    window.location = 'http://times.consulwar.ru/music/ConsulwarMusic.zip';
  }
});

Template.player.helpers({
  currentTrack: function() {
    var updated = Game.Player.updated.get();

    return Game.Player.tracks[Game.Player.currentTrack.get()];
  },

  selectedTrack: function() {
    var updated = Game.Player.updated.get();

    return Game.Player.tracks[Game.Player.selectedTrack.get()];
  },

  isPlaying: function() {
    var updated = Game.Player.updated.get();

    return Game.Player.isPlaying.get();
  },

  isShuffle: function() {
    var updated = Game.Player.updated.get();

    return Game.Player.isShuffle.get();
  },

  isShowPlaylist: function() {
    var updated = Game.Player.updated.get();

    return Game.Player.isShowPlaylist.get();
  },

  tracks: function() {
    var updated = Game.Player.updated.get();

    return _.map(Game.Player.playlist, function(id) {
      return tracks[id];
    });
  },

  hasMusic: function() {
    var user = Meteor.user();
    return user && user.music;
  }
});

Template.player.onRendered(function() {
  if(buildings["Building/Residential/House"].getCurrentLevel() === 0) {
    Game.Player.play(14, true);
  }
});

};