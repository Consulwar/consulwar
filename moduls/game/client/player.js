import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import buzz from 'buzz';
import { Meteor } from 'meteor/meteor';
import SoundManager from '/imports/client/ui/SoundManager/SoundManager';
import buildings from '/imports/content/Building/client';

const TRACKS_CONFIG = {
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

// Initialize tracks and playlist data immediately
const initializePlayerData = () => {
  const storedPlaylist = JSON.parse(localStorage.getItem('playlist') || 'null');
  const storedTracks = JSON.parse(localStorage.getItem('tracks') || 'null');
  
  const newTracks = {};
  const newPlaylist = [];
  
  for (let key in TRACKS_CONFIG) {
    const id = parseInt(key, 10);
    const track = new buzz.sound(`https://consulwar.ru/music/${TRACKS_CONFIG[key]}.mp3`, {
      volume: 50,
    });
    
    track.name = TRACKS_CONFIG[key];
    track.id = id;
    track.disabled = storedTracks?.[id] || false;
    
    newTracks[id] = track;
    newPlaylist.push(id);
  }
  
  const finalPlaylist = storedPlaylist && storedPlaylist.length === newPlaylist.length 
    ? storedPlaylist 
    : newPlaylist;
  
  return {
    tracks: newTracks,
    playlist: finalPlaylist,
    allTracks: new buzz.group(finalPlaylist.map(id => newTracks[id]))
  };
};

// SoundManagerMute React component
const SoundManagerMute = ({ className = '' }) => {
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const updateMuteState = () => {
      if (Meteor.user()) {
        SoundManager.isMuted.set(SoundManager.getUserMute());
      }
      setIsMuted(SoundManager.isMuted.get());
    };

    updateMuteState();

    const computation = Tracker.autorun(() => {
      setIsMuted(SoundManager.isMuted.get());
    });

    return () => computation.stop();
  }, []);

  const handleMuteToggle = () => {
    SoundManager.muteToggle();
  };

  return (
    <a
      onClick={handleMuteToggle}
      className={`cw--SoundManagerMute ${isMuted ? 'cw--SoundManagerMute_muted' : ''} ${className}`}
      data-sound="hover,click"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleMuteToggle();
        }
      }}
    />
  );
};

// Main Player React component
const Player = () => {
  // Initialize with actual data on first render
  const playerData = useMemo(() => initializePlayerData(), []);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isShowPlaylist, setIsShowPlaylist] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(playerData.playlist[0]);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [playlist, setPlaylist] = useState(playerData.playlist);
  const [tracks, setTracks] = useState(playerData.tracks);
  const [allTracks, setAllTracks] = useState(playerData.allTracks);
  const [isInitialized, setIsInitialized] = useState(false);

  // Bind events when component mounts
  useEffect(() => {
    if (!allTracks) return;
    
    const handleEnded = () => {
      // Play next track when current ends
      const currentPos = playlist.indexOf(currentTrack);
      const nextPos = currentPos + 1 >= playlist.length ? 0 : currentPos + 1;
      let nextTrack = playlist[nextPos];
      
      // Skip disabled tracks
      let attempts = 0;
      while (tracks[nextTrack]?.disabled && attempts < playlist.length) {
        const pos = playlist.indexOf(nextTrack);
        const newPos = pos + 1 >= playlist.length ? 0 : pos + 1;
        nextTrack = playlist[newPos];
        attempts++;
      }
      
      if (attempts < playlist.length) {
        setCurrentTrack(nextTrack);
        setIsPlaying(true); // This will trigger playback via useEffect
      }
    };
    
    // Don't bind playing/pause events since we control them via state
    allTracks.bind('ended', handleEnded);
    
    return () => {
      allTracks.unbind('ended', handleEnded);
    };
  }, [allTracks, playlist, currentTrack, tracks]);

  // Control actual playback based on isPlaying state
  useEffect(() => {
    if (!tracks[currentTrack]) return;
    
    // Always stop all tracks first to ensure clean state
    allTracks?.stop();
    
    if (isPlaying) {
      tracks[currentTrack].play();
    }
  }, [isPlaying, currentTrack, tracks, allTracks]);

  // Auto-play logic - runs after component mounts
  useEffect(() => {
    if (buildings["Building/Residential/House"].getCurrentLevel() === 0) {
      setTimeout(() => {
        setCurrentTrack(14);
        setIsPlaying(true); // This will trigger playback via useEffect
      }, 100);
    }
    setIsInitialized(true);
  }, [tracks]);

  // Save to localStorage when playlist or tracks change
  useEffect(() => {
    if (playlist.length > 0) {
      localStorage.setItem('playlist', JSON.stringify(playlist));
    }
  }, [playlist]);

  useEffect(() => {
    if (Object.keys(tracks).length > 0) {
      const tracksState = Object.values(tracks).reduce((acc, track) => {
        acc[track.id] = track.disabled;
        return acc;
      }, {});
      localStorage.setItem('tracks', JSON.stringify(tracksState));
    }
  }, [tracks]);

  const getNextPosition = useCallback((current) => {
    const pos = current ?? playlist.indexOf(currentTrack);
    return pos + 1 >= playlist.length ? 0 : pos + 1;
  }, [playlist, currentTrack]);

  const getPreviousPosition = useCallback((current) => {
    const pos = current ?? playlist.indexOf(currentTrack);
    return pos - 1 < 0 ? playlist.length - 1 : pos - 1;
  }, [playlist, currentTrack]);

  const getRandomTrack = useCallback(() => {
    const availableTracks = playlist.filter(id => id !== currentTrack && !tracks[id]?.disabled);
    return availableTracks[Math.floor(Math.random() * availableTracks.length)];
  }, [playlist, currentTrack, tracks]);

  const playTrack = useCallback((trackId = currentTrack, forcePlay = false) => {
    if (trackId === currentTrack && tracks[trackId]) {
      setIsPlaying(true); // Toggle play via state
      return;
    }
    
    const wasPlaying = isPlaying;
    setIsPlaying(false); // Stop current playback
    
    let nextTrack;
    if (isShuffle) {
      nextTrack = getRandomTrack();
    } else {
      let nextPos = typeof trackId === 'number' ? playlist.indexOf(trackId) : getNextPosition();
      let attempts = 0;
      
      while (tracks[playlist[nextPos]]?.disabled && attempts < playlist.length) {
        nextPos = getNextPosition(nextPos);
        attempts++;
      }
      
      if (attempts >= playlist.length) return;
      nextTrack = playlist[nextPos];
    }
    
    if (nextTrack) {
      setCurrentTrack(nextTrack);
      if (forcePlay || wasPlaying) {
        setIsPlaying(true); // Start playback via state
      }
    }
  }, [currentTrack, tracks, isPlaying, isShuffle, playlist, getRandomTrack, getNextPosition]);

  const playNext = () => playTrack(null, true);
  
  const playPrevious = () => {
    const prevPos = getPreviousPosition();
    let attempts = 0;
    let pos = prevPos;
    
    while (tracks[playlist[pos]]?.disabled && attempts < playlist.length) {
      pos = getPreviousPosition(pos);
      attempts++;
    }
    
    if (attempts < playlist.length) {
      setCurrentTrack(playlist[pos]);
      setIsPlaying(true); // Start playback via state
    }
  };

  const togglePlay = (trackId) => {
    if (currentTrack !== trackId) {
      setCurrentTrack(trackId);
      setIsPlaying(true); // Start playback via state
    } else {
      setIsPlaying(!isPlaying); // Toggle playback via state
    }
  };

  const toggleShuffle = () => setIsShuffle(prev => !prev);

  const toggleDisable = () => {
    if (selectedTrack && tracks[selectedTrack]) {
      setTracks(prev => ({
        ...prev,
        [selectedTrack]: {
          ...prev[selectedTrack],
          disabled: !prev[selectedTrack].disabled
        }
      }));
    }
  };

  const swapTracks = (pos1, pos2) => {
    setPlaylist(prev => {
      const newPlaylist = [...prev];
      [newPlaylist[pos1], newPlaylist[pos2]] = [newPlaylist[pos2], newPlaylist[pos1]];
      return newPlaylist;
    });
  };

  const moveUp = () => {
    if (selectedTrack) {
      const pos = playlist.indexOf(selectedTrack);
      const prevPos = pos - 1 < 0 ? playlist.length - 1 : pos - 1;
      swapTracks(pos, prevPos);
    }
  };

  const moveDown = () => {
    if (selectedTrack) {
      const pos = playlist.indexOf(selectedTrack);
      const nextPos = pos + 1 >= playlist.length ? 0 : pos + 1;
      swapTracks(pos, nextPos);
    }
  };

  const handleTrackSelect = (trackId) => {
    setSelectedTrack(prev => prev === trackId ? null : trackId);
  };

  // Expose player state globally
  useEffect(() => {
    if (!window.Game) window.Game = {};
    window.Game.Player = {
      // State getters
      get currentTrack() { return currentTrack; },
      get selectedTrack() { return selectedTrack; },
      get isPlaying() { return isPlaying; },
      get isShuffle() { return isShuffle; },
      get isShowPlaylist() { return isShowPlaylist; },
      get playlist() { return playlist; },
      get tracks() { return tracks; },
      
      // Actions
      play: playTrack,
      playNext,
      playPrevious,
      togglePlay,
      toggleShuffle,
      toggleDisable,
      moveUp,
      moveDown,
      stop: () => setIsPlaying(false), // Stop via state
      pause: () => setIsPlaying(false) // Pause via state
    };
    
    return () => {
      if (window.Game?.Player) {
        delete window.Game.Player;
      }
    };
  }, [currentTrack, selectedTrack, isPlaying, isShuffle, isShowPlaylist, playlist, tracks, playTrack, playNext, playPrevious, togglePlay, toggleShuffle, toggleDisable, moveUp, moveDown]);

  const currentTrackData = tracks[currentTrack];
  const selectedTrackData = tracks[selectedTrack];
  const hasMusic = Meteor.user()?.music;

  const playlistTracks = useMemo(() => {
    return playlist.map(id => tracks[id]).filter(Boolean);
  }, [playlist, tracks]);

  if (!currentTrackData) return null;

  return (
    <div className="player">
      <SoundManagerMute />
      
      <div 
        data-id={currentTrackData.id} 
        className={`currentTrack ${isPlaying ? 'play' : ''}`}
      >
        <button 
          className="playpause"
          onClick={() => togglePlay(currentTrackData.id)}
        />
        <span>{currentTrackData.name}</span>
        <button 
          className="openPlaylist"
          onClick={() => setIsShowPlaylist(prev => !prev)}
        />
      </div>

      <div className={`playlist ${isShowPlaylist ? 'show' : ''}`}>
        <div className={`controls ${selectedTrack ? 'hasSelected' : ''}`}>
          <button className="prev" onClick={playPrevious} />
          <button className="next" onClick={playNext} />
          <button 
            className={`shuffle ${isShuffle ? 'enabled' : ''}`}
            onClick={toggleShuffle}
          />
          <button className="movedown" onClick={moveDown} />
          <button className="moveup" onClick={moveUp} />
          <button 
            className={`toggle ${selectedTrackData?.disabled ? 'enable' : ''}`}
            onClick={toggleDisable}
          />
        </div>
        
        <ul>
          {playlistTracks.map(track => (
            <li
              key={track.id}
              className={`
                ${selectedTrack === track.id ? 'selected' : ''}
                ${track.disabled ? 'disabled' : ''}
                ${currentTrack === track.id ? `current ${isPlaying ? 'play' : ''}` : ''}
              `}
              data-id={track.id}
              onClick={() => handleTrackSelect(track.id)}
            >
              <button 
                className="playpause"
                onClick={(e) => {
                  e.stopPropagation();
                  togglePlay(track.id);
                }}
              />
              <span>{track.name}</span>
            </li>
          ))}
        </ul>
        
        <div className="author">
          Автор музыки: 
          <a
            href="http://cyclone-music-space.ru/?from=consulwar"
            target="_blank"
            rel="noopener noreferrer"
          >
            Антон Брежнев
          </a>
        </div>
        
        {hasMusic && (
          <button
            className="cw--button cw--button_type_primary cw--button_type_primary_orange downloadMusic"
            onClick={() => window.location = 'http://times.consulwar.ru/music/ConsulwarMusic.zip'}
          >
            Скачать альбом
          </button>
        )}
      </div>
    </div>
  );
};

initPleerClient = function() {
  'use strict';
  
  // Replace Blaze template with React component
Template.player.onRendered(function() {
    const container = this.firstNode;
    const root = createRoot(container);
    root.render(React.createElement(Player));
  });
};