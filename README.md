# NoAnnoyance v2 GNOME Shell Extension

## About
Another extension, that removes the 'Window is ready' notification and puts the window into focus.  
In contrast to all the other extensions, this uses ES6 syntax and is actively maintained.

This is a fork of https://github.com/sindex/no-annoyance, so thank you Alex for the work you already made.

## Supported GNOME versions
- 45
- 46
- 47
- 48
- 49
- 50

## Installation

Clone then activate

``` sh
git clone --depth=1 https://github.com/emad-elsaid/noannoyance  ~/.local/share/gnome-shell/extensions/noannoyance@daase.net
gdbus call --session --dest org.gnome.Shell.Extensions --object-path /org/gnome/Shell/Extensions --method org.gnome.Shell.Extensions.InstallRemoteExtension  'noannoyance@daase.net'
```
