.PHONY: build run-host flatpak flatpak-local-remote bundle test clean dev

build:
	# meson --reconfigure --prefix ${PWD}/install build
	meson --prefix ${PWD}/install build
	ninja -C build install

run-host:
	make clean
	make build
	GSETTINGS_SCHEMA_DIR=./data ./install/bin/re.sonny.Junction

flatpak:
	flatpak-builder --user --force-clean --sandbox --install-deps-from=flathub --install flatpak re.sonny.Junction.json
	# flatpak run re.sonny.Junction https://gnome.org

# Useful for previewing in GNOME Software
# https://gitlab.gnome.org/bertob/app-ideas/-/issues/116#note_1290065
flatpak-local-remote:
	flatpak-builder --user  --force-clean --repo=repo --install-deps-from=flathub flatpak re.sonny.Junction.json
	flatpak --user remote-add --no-gpg-verify --if-not-exists Junction repo
	flatpak --user install --reinstall --assumeyes Junction re.sonny.Junction
	# flatpak run re.sonny.Junction

bundle:
	flatpak-builder --user  --force-clean --repo=repo --install-deps-from=flathub flatpak re.sonny.Junction.json
	flatpak build-bundle repo Junction.flatpak re.sonny.Junction --runtime-repo=https://flathub.org/repo/flathub.flatpakrepo

test:
	./node_modules/.bin/eslint --cache .
	flatpak run org.freedesktop.appstream-glib validate data/re.sonny.Junction.metainfo.xml
	flatpak run --command="desktop-file-validate" --file-forwarding org.gnome.Sdk//41 --no-hints @@ data/re.sonny.Junction.desktop @@
	# gtk4-builder-tool validate src/*.ui
	flatpak-builder --show-manifest re.sonny.Junction.json
	find po/ -type f -name "*.po" -print0 | xargs -0 -n1 msgfmt -o /dev/null --check
	gjs -m test/*.test.js

clean:
	rm -rf build builddir install .eslintcache
	rm -f ~/.local/share/applications/re.sonny.Junction.desktop
	rm -f ~/.local/share/dbus-1/services/re.sonny.Junction.service
	rm -f ~/.local/share/icons/hicolor/symbolic/apps/re.sonny.Junction-symbolic.svg
	rm -f ~/.local/share/icons/hicolor/scalable/apps/re.sonny.Junction.svg
	update-desktop-database ~/.local/share/applications

dev:
	# service file
	mkdir -p ~/.local/share/dbus-1/services
	cp data/re.sonny.Junction.service ~/.local/share/dbus-1/services/
	sed -i "/^Exec=/s#=.*#=${PWD}\/re\.sonny\.Junction --gapplication-service#" ~/.local/share/dbus-1/services/re.sonny.Junction.service
	# icons
	cp data/icons/re.sonny.Junction-symbolic.svg ~/.local/share/icons/hicolor/symbolic/apps/
	cp data/icons/re.sonny.Junction.svg ~/.local/share/icons/hicolor/scalable/apps/
	gtk4-update-icon-cache -qtf ~/.local/share/icons/hicolor/
	# desktop file
	cp data/re.sonny.Junction.desktop ~/.local/share/applications/
	desktop-file-edit --set-key=Exec --set-value="${PWD}/re.sonny.Junction %u" ~/.local/share/applications/re.sonny.Junction.desktop
	desktop-file-edit --set-key=Icon --set-value="${PWD}/data/icons/re.sonny.Junction.svg" ~/.local/share/applications/re.sonny.Junction.desktop
	update-desktop-database ~/.local/share/applications

