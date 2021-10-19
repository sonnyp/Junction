<img style="vertical-align: middle;" src="data/icons/re.sonny.Junction.svg" width="120" height="120" align="left">

# Junction

Junction lets you choose the application to open files and links.

![screenshot](data/screenshot.png)

<a href='https://flathub.org/apps/details/re.sonny.Junction'><img width='180' height='60' alt='Download on Flathub' src='https://flathub.org/assets/badges/flathub-badge-en.svg'/></a>

## Usage

Set Junction as the default application for a resource and let it do the rest. Junction will pop up and offer multiple options to handle it.

Use the mouse or keyboard navigation to choose the application to open the link or file with.

If you use middle click, Junction will remain open an you can open the resource in multiple applications.

You can press `<Ctrl>W` or `Esc` to close and cancel.

You can copy the link to clipboard with `<Ctrl>C` or with the the "Copy to Clipboard" button.

If you want your favorite websites to use Junction when opening links, you can use [Tangram](https://github.com/sonnyp/Tangram/).

## Tips and tricks

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

<details>
  <summary>Make Junction appear in the center of the screen</summary>

On GNOME you can make all new windows open in the center using

```sh
gsettings set org.gnome.mutter center-new-windows true
```

See https://gitlab.gnome.org/GNOME/mutter/-/issues/246

</details>

<details>
  <summary>Open a file with Junction in the terminal</summary>

**Using an alias**

Create a permant alias, for example `alias open="flatpak run re.sonny.Junction"`.

Then you can use `open my-file`.

**Using xdg-open**

Set Junction as default application to open files with

```
xdg-mime default re.sonny.Junction.desktop x-scheme-handler/file
```

Then you can use `xdg-open my-file`.

</details>

## Development

```sh
cd Junction
./re.sonny.Junction https://www.gnome.org/
```

Press `Ctrl+Shift+Q` on the Junction window to restart it.

To setup development version as default application first install the desktop file with

```sh
cd Junction
make dev
```

To pass the tests you have to install a few dependencies

```sh
# Install development dependencies
sudo dnf install --assumeyes npm flatpak make desktop-file-utils gjs gtk4-devel
cd Junction
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
