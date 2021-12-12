<img style="vertical-align: middle;" src="data/icons/re.sonny.Junction.svg" width="120" height="120" align="left">

# Junction

Junction lets you choose the application to open files and links.

![screenshot](data/screenshot.png)

<a href='https://flathub.org/apps/details/re.sonny.Junction'><img width='180' height='60' alt='Download on Flathub' src='https://flathub.org/assets/badges/flathub-badge-en.svg'/></a>

## Usage

Set Junction as the default application for a resource and let it do the rest. Junction will pop up and offer multiple options to handle it.

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
  <summary>API</summary>

Junction has a very simple API that doesn't require any programming. To open any resource with Junction, even if it's not configured as the default application, simply use the following URI format `x-junction://$RESOURCE`. For examples

- `x-junction://https://github.com`
- `x-junction://~`
- `x-junction://file:///etc/os-release`
- `x-junction:///etc/os-release`

You can use this in web pages, the terminal, native applications and anything that is able to open URIs.

If Junction is installed - you can test this in the terminal with `xdg-open "x-junction://file:///etc/os-release"` and in the browser with `<a href="x-junction://file:///etc/os-release">Test Junction URI</a>`.

</details>

## Tips and tricks

<details>
  <summary>Keyboard navigation</summary>

Use the menu or `<Ctrl>?` to learn about Keyboard usage. You can navigate the UI with the arrow keys too.

</details>

<details>
  <summary>Open with multiple applications</summary>

Use middle-click to keep Junction open - allowing you to open the resource in multiple applications.

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
  <summary>Use Junction from the terminal</summary>

Create a permant alias, for example `alias open="flatpak run re.sonny.Junction"`.

Then you can use `open my-file`.

See [How To Create Permanent Aliases In Linux?](https://fossbytes.com/alias-in-linux-how-to-use-create-permanent-aliases/)

</details>

<details>
  <summary>Add custom scripts to Junction</summary>

You can add your own script to Junction by creating a `.desktop` file for it in `~/.local/share/applications`.

See https://wiki.archlinux.org/title/desktop_entries (distro agnostic).

</details>

<details>
  <summary>Browser integration</summary>

Drag the following [bookmarklet](https://en.wikipedia.org/wiki/Bookmarklet) to your browser bookmarks toolbar to create a button to open the current page in Junction.

Bookmarklet: <a herf="javascript:window.location='x-junction://'+window.location">Junction</a>

Or create a bookmark with the following URL

```
javascript:window.location='x-junction://'+window.location
```

</details>

<details>
  <summary>Multiple Firefox profiles</summary>

See [Profile Manager - Create, remove or switch Firefox profiles](https://support.mozilla.org/en-US/kb/profile-manager-create-remove-switch-firefox-profiles)

If you want to be able to choose the Firefox profile to open the resource with, you can make desktop files for your Firefox profiles in `~/.local/share/applications`.

Here is an example `~/.local/share/applications/firefox-work.desktop`

```ini
[Desktop Entry]
Version=1.0
Name=Firefox work
Exec=firefox -P work --class=firefox-work %u
Icon=firefox
Terminal=false
Type=Application
StartupWMClass=firefox-work
MimeType=text/html;text/xml;application/xhtml+xml;application/vnd.mozilla.xul+xml;text/mml;x-scheme-handler/http;x-scheme-handler/https;
StartupNotify=true
```

Save, run `update-desktop-database ~/.local/share/applications`, enjoy.

[Reference](https://github.com/sonnyp/Junction/issues/9)

</details>

## Troubleshooting

<details>
  <summary>I can't distinguish between options with the same icon</summary>

Within Junction, you can toggle `Show names` in the menu or hover the application with the mouse to display a tooltip.

Otherwise, you can edit the desktop files to use distinctive icons, here are a some tools

- [MenuLibre](https://flathub.org/apps/details/org.bluesabre.MenuLibre) GUI
- [AppEditor](https://flathub.org/apps/details/com.github.donadigo.appedito) GUI
- [ArchWiki](https://wiki.archlinux.org/title/desktop_entries) advanced

</details>

<details>
  <summary>My app doesn't show up</summary>

If the application was installed via Flatpak, the package manager or an other conventional way, feel free to [open an issue](https://github.com/sonnyp/Junction/issues/new/choose).

Make sure the application desktop file has a `MimeType` key that matches the type of resource you want it to handle. For example if you want the application `~/.local/share/applications/my-custom-browser.desktop` to handle web content; add the following `MimeType=text/html;text/xml;application/xhtml+xml;text/mml;x-scheme-handler/http;x-scheme-handler/https;`.

The desktop filename should be unique. Junction can't display both `/usr/share/applicatins/firefox.desktop` and `~/.local/share/applications/firefox.desktop`. The second overrides the first.

Finally - make sure to run `update-desktop-database ~/.local/share/applications` after installing a desktop file.

</details>

<details>
  <summary>Where are desktop files located ?</summary>

- System `/usr/share/applications`
- User `~/.local/share/applications`
- Flatpak system `/var/lib/flatpak/exports/share/applications/`
- Flatpak user `~/.local/share/flatpak/exports/share/applications/`

</details>

## In the media

[linuxunplugged.com - Episode 433 The Lessons of Jellyfin](https://linuxunplugged.com/433?t=3183) - 11/2021

## Development

```sh
cd Junction
./re.sonny.Junction https://www.gnome.org/
```

Make changes and press `<Primary><Shift>Q` on the Junction window to restart it.

Use `<Primary><Shift>I` to open the inspector.

To setup development version as default application first install the desktop file with

```sh
cd Junction
make dev
```

To pass the tests you have to install a few dependencies

```sh
# Install development dependencies
sudo dnf install --assumeyes npm flatpak make desktop-file-utils gjs gtk4-devel libadwaita-devel
cd Junction
npm install
flatpak remote-add --user --if-not-exists flathub https://flathub.org/repo/flathub.flatpakrepo
flatpak install --user --assumeyes --noninteractive flathub org.freedesktop.appstream-glib

# Run tests
make test
```

## Maintainer

Bookmarks

- [Flathub](https://flathub.org/apps/details/re.sonny.Junction)
- [Flathub repo](https://github.com/flathub/re.sonny.Junction)
- [Flathub builds](https://flathub.org/builds/#/apps/re.sonny.Junction)
- [Flathub stats](https://klausenbusk.github.io/flathub-stats/#ref=re.sonny.Junction)

<details>

  <summary>i18n</summary>

```sh
# To update the pot file
# xgettext -f po/POTFILES -o po/re.sonny.Junction.pot --no-wrap -cTRANSLATORS --from-code=UTF-8
# sed -i "s/Project-Id-Version: PACKAGE VERSION/Project-Id-Version: re.sonny.Junction/" po/re.sonny.Junction.pot
meson compile re.sonny.Junction-pot -C build


# To create a translation
# msginit -i po/re.sonny.Junction.pot -o po/fr.po -l fr_FR.UTF-8
echo -n " fr" >> po/LINGUAS
meson compile re.sonny.Junction-update-po -C build

# To update translations
# msgmerge -U po/*.po po/re.sonny.Junction.pot
meson compile re.sonny.Junction-update-po -C build
```

See https://github.com/sonnyp/Commit/pull/14#issuecomment-894070878

</details>

<details>

<summary>Publish new version</summary>

- `meson compile re.sonny.Junction-update-po -C build`
- Update version in `meson.build`
- git tag
- flathub

</details>

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
