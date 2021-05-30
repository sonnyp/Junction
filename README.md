<!-- <img style="vertical-align: middle;" src="data/icons/re.sonny.Junction.svg" width="120" height="120" align="left"> -->

<!-- ## Bookmarks

https://gist.github.com/danbst/936774d9135ff0556bdb9dd864ec4e5b
https://github.com/jitsi/jitsi-meet-electron/issues/509
https://www.choosyosx.com/
https://alternativeto.net/software/choosy/
https://braus.properlypurple.com/
https://github.com/flatpak/xdg-desktop-portal/issues/126
https://github.com/flatpak/xdg-desktop-portal/issues/472


-->

# Junction

Junction lets you choose the application to open a file or URL.

<!-- ![screenshot](data/screenshot.png)

<a href='https://flathub.org/apps/details/re.sonny.Junction'><img width='180' height='60' alt='Download on Flathub' src='https://flathub.org/assets/badges/flathub-badge-en.svg'/></a> -->

<!-- ## Installation

[Setup flatpak](https://flatpak.org/setup/) then

```sh
flatpak install re.sonny.Junction
```

|      Distro      |                   Package Name/Link                    |                   Maintainer                    |
| :--------------: | :----------------------------------------------------: | :---------------------------------------------: |
| Arch Linux (aur) | [`commit`](https://aur.archlinux.org/packages/commit/) | [Mark Wagie](https://github.com/yochananmarqos) | -->

<!-- ## Usage

Commit will pop up automatically when you make a commit in one of your projects.

To save your commit message, press the Commit button or the _Ctrl+Return_ key combination.

To abort and dismiss Commit, press the Cancel button or the _Escape_ key.

## Features

- a
- b
- c -->

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
