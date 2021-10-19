<img style="vertical-align: middle;" src="data/icons/re.sonny.Junction.svg" width="120" height="120" align="left">

# Junction

Junction lets you choose the application to open files and links.

![screenshot](data/screenshot.png)

<a href='https://flathub.org/apps/details/re.sonny.Junction'><img width='180' height='60' alt='Download on Flathub' src='https://flathub.org/assets/badges/flathub-badge-en.svg'/></a>

## Usage

Set Junction as the default application for a resource and let it do the rest. Junction will pop up and offer multiple options to handle it.

Use the mouse or keyboard navigation to choose the application to open the link or file with.

You can press `<Ctrl>W` or `Esc` to close and cancel.

You can copy the link to clipboard with `<Ctrl>C` or with the the "Copy to Clipboard" button.

Here are some advanced examples for the terminal

<details>
  <summary>Set Junction as default browser</summary>
  <code>
  xdg-settings set default-web-browser re.sonny.Junction.desktop
  </code>
</details>

<details>
  <summary>Set Junction as default for all files</summary>
  <code>
   xdg-mime default re.sonny.Junction.desktop x-scheme-handler/file
  </code>

Please note that this may not be respected by all applications but the command `xdg-open` will.

</details>

<details>
  <summary>Set Junction as default for png</summary>
  <code>
  xdg-mime default re.sonny.Junction.desktop image/png
  </code>
</details>

<details>
  <summary>Set Junction as default email composer</summary>
  <code>
  xdg-settings set default-url-scheme-handler mailto re.sonny.Junction.desktop
  </code>
</details>

<details>
  <summary>Set Junction as default folder opener</summary>
  <code>
  xdg-settings default re.sonny.Junction.desktop inode/directory
  </code>
</details>

## Tips and trick

### Make Junction appear in the center of the screen

On GNOME you can make all new windows open in the center using

```sh
gsettings set org.gnome.mutter center-new-windows true
```

See https://gitlab.gnome.org/GNOME/mutter/-/issues/246

### Open a file with Junction in the terminal

Set Junction as default application to open files with

```
xdg-mime default re.sonny.Junction.desktop x-scheme-handler/file
```

and use `xdg-open`.

## Planned:

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
- History of uris
- Read from clipboard when opening
- Reveal in terminal

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

## Copyright

© 2021 [Sonny Piers](https://github.com/sonnyp)

## License

GPLv3 or later. Please see [COPYING](COPYING) file.
