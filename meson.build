project('re.sonny.Junction',
  version: '1.2.0',
  meson_version: '>= 0.55.0',
  license: 'GPL-3.0-or-later'
)

gnome = import('gnome')
i18n = import('i18n')

app_id = meson.project_name()
prefix = get_option('prefix')
bindir = join_paths(prefix, 'bin')
datadir = join_paths(prefix, get_option('datadir'))
pkgdatadir = join_paths(datadir, app_id)

subdir('data')
subdir('src')
subdir('po')

# WARNING: Project targeting '>= 0.59.0' but tried to use feature deprecated since '0.55.0': ExternalProgram.path. use ExternalProgram.full_path() instead
# Build-time dependency gtk-4.0 found: NO (tried pkgconfig and cmake)
# Build-time dependency desktop-file-utils found: NO (tried pkgconfig and cmake)
# gnome.post_install(
#   glib_compile_schemas: true,
#   gtk_update_icon_cache: true,
#   update_desktop_database: true
# )

meson.add_install_script('build-aux/meson/postinstall.py')
