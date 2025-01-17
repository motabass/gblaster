# 🔊 gBlaster

A web audio player PWA using latest Web APIs.

![github action](https://github.com/motabass/gblaster/actions/workflows/build.yml/badge.svg)
[![codefactor](https://www.codefactor.io/repository/github/motabass/gblaster/badge)](https://www.codefactor.io/repository/github/motabass/gblaster)
[![GitHub release](https://img.shields.io/github/release/motabass/gblaster.svg)](https://GitHub.com/motabass/gblaster/releases/)
[![gh-pages](https://img.shields.io/badge/github-pages-blue.svg)](https://motabass.github.io/gblaster/)
[![demo](https://img.shields.io/badge/demo-online-green.svg)](https://gblaster-player.firebaseapp.com)

## Features

- 💿 Plays all audio file formats Chrome supports
- 🏷 Uses metadata like title, artist, album and picture from file-tags
- 🔗 Getting metadata from LastFM and MusicBrainz
- 🌈 Extracts colors from cover-art to adjust apps theme-colors
- ⌨ Keyboard input
- 🎮 Gamepad input
- ⏭ Supports browser and OS media-controls, and uses wakelock to screen locking
- 🎚 10 band equalizer
- 📊 Band-Meter and Oscilloscope Visualization
- 🔋 Local cache for all metadata in IndexedDB
- 🧲 Settings persistence in LocalStorage
- 📱 Responsive Layout for Desktop and Mobile
- 💾 Working offline and installable on most OSs

### Dependencies

App-Icon generated with:

[https://android-material-icon-generator.bitdroid.de/#section-material-icons](https://android-material-icon-generator.bitdroid.de/#section-material-icons)

Material Icons:

[https://petershaggynoble.github.io/MDI-Sandbox/](https://petershaggynoble.github.io/MDI-Sandbox/)

Tag Reader:

[music-metadata](https://github.com/Borewit/music-metadata)

Color extraction from cover-art:

[node-vibrant](https://github.com/Vibrant-Colors/node-vibrant)
