# List flatpak apps

https://github.com/flathub/com.github.donadigo.appeditor/issues/18

<!-- maybe required even with /usr/bin/flatpak in sandbox: -->

- "export PATH=$PATH:/run/host/usr/bin:~/.local/share/flatpak/exports/bin" # AppInfo needs the exec path to exist
- "export XDG_DATA_DIRS=$XDG_DATA_DIRS:/run/host/usr/share:~/.local/share/flatpak/exports/share" # https://github.com/flatpak/flatpak/issues/1299
- "--filesystem=~/.local/share/flatpak/exports/bin:ro" # flatpak --user
- "--filesystem=~/.local/share/flatpak/exports/share/applications:ro" # flatpak --user

# Bookmarks

https://gist.github.com/danbst/936774d9135ff0556bdb9dd864ec4e5b
https://github.com/jitsi/jitsi-meet-electron/issues/509
https://www.choosyosx.com/
https://alternativeto.net/software/choosy/
https://braus.properlypurple.com/
https://github.com/flatpak/xdg-desktop-portal/issues/126
https://github.com/flatpak/xdg-desktop-portal/issues/472
https://github.com/flathub/org.gnome.Lollypop/issues/99
https://github.com/flathub/com.github.donadigo.appeditor/blob/master/com.github.donadigo.appeditor.json
