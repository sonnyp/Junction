<!-- <img style="vertical-align: middle;" src="data/icons/re.sonny.Junction.svg" width="120" height="120" align="left"> -->

# Junction

Junction lets you choose the application to open files and links.

![screenshot](data/screenshot.png)

There is more to it - it's an experiment to improve file and url handling on the Linux desktop - specially on GNOME - by taking inspiration from various systems and possibly doing some of the work usually left to the browser or file manager.

If you have any idea worth exploring in that area please feel free to open an issue.

<!-- <a href='https://flathub.org/apps/details/re.sonny.Junction'><img width='180' height='60' alt='Download on Flathub' src='https://flathub.org/assets/badges/flathub-badge-en.svg'/></a> -->

<!-- ## Installation

[Setup flatpak](https://flatpak.org/setup/) then

```sh
flatpak install re.sonny.Junction
```

|      Distro      |                   Package Name/Link                    |                   Maintainer                    |
| :--------------: | :----------------------------------------------------: | :---------------------------------------------: |
| Arch Linux (aur) | [`commit`](https://aur.archlinux.org/packages/commit/) | [Mark Wagie](https://github.com/yochananmarqos) | -->

⚠ Junction is a work in progress

## Usage

Make sure Junction is your default browser (Settings -> Default Applications -> Web in GNOME).

Junction will pop up automatically when you click on a link.

Use the mouse or keyboard navigation to choose the application to open the link or file with.

`Ctrl+C` or `ESC` to cancel.

Junction is not yet capable of handling all files automatically but if you set Junction as the default application for Music, Video, Mail, ... it should work as expected.

## Features

- Displays the URL / path
- Shows a hint for unecrypted link
- Ctrl+C or ESC to cancel
- Keyboard navigation

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

Help welcome! Feel free to open an issue and I'd be happy to assist.

- "Remember for"
- Copy to clipboard shortcut and button
- Ctrl+Click / Ctrl+Enter to open in multiple applications
- Browser extension (trigger Junction from browser links)
- [Desktop actions](https://specifications.freedesktop.org/desktop-entry-spec/desktop-entry-spec-latest.html#extra-actions) - e.g. open in new window
- For files
  - Open/reveal in file manager
  - Remember application for pattern
  - Remember application for file type
  - Replace home dir path with ~
  - Hide scheme unless `http`
- For URLs
  - HTTPS Everywhere support
  - Removes tracking elements from URLs
  - Remember application for domain/pattern
  - Remember application for content-type
  - Firefox profiles
  - Protect against [homograph attack](https://en.wikipedia.org/wiki/IDN_homograph_attack)
  - URL rewrite (e.g. `https://meet.jit.si/foo` -> `jitsi-meet://VerbalSelvesTipRound `)
- Customizable (show/hide URI bar and so on)
- Open with any application
- Hide specific applications
- mailto pattern matching
- Search bar

## Some crazy/maybe-bad ideas:

- Scriptable
- Stylable
- Protect from malicious domains / URLs
- Parental control
- URL/file preview
- share intent https://wiki.gnome.org/Design/OS/Sharing
- application url handling (Jitsi desktop can handle https://meet.jit.si urls)

## Development

```sh
cd Junction
./re.sonny.Junction https://www.gnome.org/
```

Make changes and hit `Ctrl+Shift+Q` on the Junction window to restart it.

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
flatpak-builder --user --force-clean --repo=repo --install-deps-from=flathub flatpak re.sonny.Junction.yaml
flatpak --user remote-add --no-gpg-verify --if-not-exists Junction repo
flatpak --user install --reinstall --assumeyes Junction re.sonny.Junction
```

</details>

## Copyright

© 2021 [Sonny Piers](https://github.com/sonnyp)

## License

GPLv3 or later. Please see [COPYING](COPYING) file.
