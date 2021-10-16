<img style="vertical-align: middle;" src="data/icons/re.sonny.Junction.svg" width="120" height="120" align="left">

# Junction

Junction lets you choose the application to open files and links.

![screenshot](data/screenshot.png)

## Usage

Make sure Junction is your default browser (Settings -> Default Applications -> Web in GNOME). Or `xdg-settings set default-web-browser re.sonny.Junction.desktop`

Junction will pop up automatically when you open a link in a desktop application.

Use the mouse or keyboard navigation to choose the application to open the link or file with.

You can also copy the link to clipboard with `<Ctrl>C` or with the "Copy to clipboard" icon.

`<Ctrl>W` or `ESC` to cancel.

## Tips and trick

Junction is not yet capable of handling all files automatically but if you set Junction as the default application for Mail, Calendar, Music, Video, Photos, it should work as expected.

### Set Junction as default Web handler

```sh
xdg-settings set default-web-browser re.sonny.Junction.desktop
```

### Set Junction as default application for type

```sh
xdg-mime default re.sonny.Junction.desktop image/png
```

### Open Junction in the center of the screen

On GNOME you can make all new windows open in the center using

```sh
gsettings set org.gnome.mutter center-new-windows true
```

See https://gitlab.gnome.org/GNOME/mutter/-/issues/246

or set and use the move-to-center keybinding

```sh
gsettings set org.gnome.desktop.wm.keybindings move-to-center "['<Super><Control><Shift>Space']"
```

## Install

<details>
<summary>
user
</summary>

`~/.local/bin` must be in `$PATH`

```sh
cd Junction
meson --prefix ~/.local build
ninja -C build install
```

</details>

<details>
<summary>
system
</summary>

```sh
cd Junction
meson build
ninja -C build install
```

</details>

<details>
<summary>uninstall</summary>

```sh
cd Junction
ninja -C build uninstall
```

</details>

## Planned:

There is more to it - it's an experiment to improve files and URLs handling on the Linux desktop - specially on GNOME - by taking inspiration from various systems and possibly doing some of the work usually left to the browser or file manager.

If you have any idea worth exploring in that area please feel free to open an issue.

⚠ Junction is a work in progress

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
  - Open file read only
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

## Some crazy/maybe-bad ideas:

- Scriptable
- Stylable
- Browser extension (trigger Junction from browser links)
  - Protect from malicious domains / URLs
  - Parental control
- URL/file preview
- share intent https://wiki.gnome.org/Design/OS/Sharing
- allow desktop applications to be primary application of an url origin

## Development

```sh
cd Junction
./re.sonny.Junction https://www.gnome.org/
```

Make changes and hit `Ctrl+Shift+Q` on the Junction window to restart it.

To setup development version as default application first install the desktop file with

```
cd Junction
make dev
```

To pass the tests you have to install a few dependencies

```
# Install development dependencies
sudo dnf install --assumeyes npm flatpak make desktop-file-utils gjs gtk4-devel
npm install
flatpak remote-add --user --if-not-exists flathub https://flathub.org/repo/flathub.flatpakrepo
flatpak install --user --assumeyes --noninteractive flathub org.freedesktop.appstream-glib

# Run tests
make test
```

<!-- Flathub builds https://flathub.org/builds/#/apps/re.sonny.Junction -->

## Building

<details>
  <summary>host</summary>

```sh
cd Junction
meson --prefix $PWD/install build
ninja -C build install
```

</details>

<details>
  <summary>Flatpak</summary>

Use [GNOME Builder](https://wiki.gnome.org/Apps/Builder) or

```sh
cd Junction
flatpak-builder --user --force-clean --repo=repo --install-deps-from=flathub flatpak re.sonny.Junction.json
flatpak --user remote-add --no-gpg-verify --if-not-exists Junction repo
flatpak --user install --reinstall --assumeyes Junction re.sonny.Junction
```

</details>

## Copyright

© 2021 [Sonny Piers](https://github.com/sonnyp)

## License

GPLv3 or later. Please see [COPYING](COPYING) file.
