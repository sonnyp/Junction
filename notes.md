# List flatpak apps

https://github.com/flathub/com.github.donadigo.appeditor/issues/18

# Bookmarks

- https://www.reddit.com/r/gnome/comments/o4e7a6/nautilus_as_a_file_chooser_with_thumbnails/
- https://gist.github.com/danbst/936774d9135ff0556bdb9dd864ec4e5b
- https://github.com/jitsi/jitsi-meet-electron/issues/509
- https://www.choosyosx.com/
- https://alternativeto.net/software/choosy/
- https://braus.properlypurple.com/
- https://github.com/flatpak/xdg-desktop-portal/issues/126
- https://github.com/flatpak/xdg-desktop-portal/issues/472
- https://github.com/flathub/org.gnome.Lollypop/issues/99
- https://github.com/flathub/com.github.donadigo.appeditor/blob/master/com.github.donadigo.appeditor.json
- https://github.com/flatpak/flatpak/issues/1286
- https://news.ycombinator.com/item?id=28576147

# portal app chooser

https://blog.elementary.io/a-new-native-file-chooser/
https://github.com/ranchester2/nautilus-as-file-chooser-poc

## Ideas:

Junction is also an experiment to improve file and url handling on the Linux desktop - specially on GNOME - by taking inspiration from various systems and possibly doing some of the work usually left to the browser or file manager.

If you have any idea worth exploring in that area please feel free to open an issue.

Help welcome! Feel free to open an issue and I'd be happy to assist.

- "Remember for"
- No application to handle this type - search for one?
- Ctrl+Click / Ctrl+Enter to open in multiple applications
- [Desktop actions](https://specifications.freedesktop.org/desktop-entry-spec/desktop-entry-spec-latest.html#extra-actions) - e.g. open in new window / private window
- Implement `org.freedesktop.impl.portal.AppChooser`
- For files
  - Open/reveal in file manager
  - Remember application for pattern
  - Remember application for file type
  - Replace home dir path with ~
  - Replace `file:///` with `/`
  - Open file read only (or copy)
- For URLs
  - HTTPS Everywhere / hsts support
  - Removes tracking elements from URLs
  - Remember application for domain/pattern
  - Remember application for content-type
  - Firefox profiles
  - Protect against [homograph attack](https://en.wikipedia.org/wiki/IDN_homograph_attack)
  - URL rewrite (e.g. `https://meet.jit.si/example` -> `jitsi-meet://example `)
  - Hide scheme if `https`
  - https://publicsuffix.org/list/ support for rules
- Customizable (show/hide URI bar and so on)
- Open with any application
- Hide specific applications
- mailto pattern matching
- Search bar
- Open multiple URLs one by one then select app
- History of uris
- Read from clipboard when opening
- Open in Terminal

## Some crazy/maybe-bad ideas:

- Scriptable
- Stylable
- Browser extension (trigger Junction from browser links)
  - Protect from malicious domains / URLs
  - Parental control
- URL/file preview
- share intent https://wiki.gnome.org/Design/OS/Sharing
- allow desktop applications to be primary application of an url origin

# Similar

- [Choosy](https://www.choosyosx.com/)
- [BrowserChooser](https://www.browserchooser2.com/)
- [Braus](https://github.com/properlypurple/braus)
- [Browserosaurus](https://github.com/will-stone/browserosaurus)
- [Finicky](https://github.com/johnste/finicky)
- [Buffet](https://apps.apple.com/us/app/buffet-browser-picker/id1048695921?mt=12)
- [OpenIn](https://loshadki.app/openin/)
- [BrowserSelect](https://github.com/zumoshi/BrowserSelect)
