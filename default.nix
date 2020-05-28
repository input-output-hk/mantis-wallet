{ src ? ./., system ? builtins.currentSystem }:

with import ./nix { inherit system; };

let
  inherit (pkgs.lib.importJSON ./package.json) name version;

  yarnNix = yarn2nix.mkYarnNix { yarnLock = ./yarn.lock; };
  offlineCache = yarn2nix.importOfflineCache yarnNix;

  nodeModules = pkgs.stdenv.mkDerivation {
    inherit version;
    pname = "${name}-modules";
    srcs = [ ./package.json ./yarn.lock ];
    buildInputs = [
      yarn
      nodejs
      pkgs.pkg-config
      pkgs.libsass
      pkgs.python
      pkgs.unzip
      yarn2nix.fixup_yarn_lock
    ] ++ (pkgs.lib.optional pkgs.stdenv.isDarwin
      pkgs.darwin.apple_sdk.frameworks.CoreServices);

    LIBSASS_EXT = "auto";
    ELECTRON_SKIP_BINARY_DOWNLOAD = true;

    unpackPhase = ''
      mkdir source
      cd $_

      for src in $srcs; do
        cp $src $(stripHash $src)
      done

      chmod +w *
    '';

    configurePhase = ''
      export HOME=$NIX_BUILD_TOP/yarn_home
      yarn config --offline set yarn-offline-mirror ${offlineCache}
      fixup_yarn_lock ./yarn.lock
    '';

    buildPhase = ''
      yarn config --offline set tarball ${nodeHeaders}
      yarn install --offline --frozen-lockfile --ignore-scripts
      patchShebangs .

      ${pkgs.lib.optionalString pkgs.stdenv.isDarwin ''
        LD=$CC
        tmp=$(mktemp -d)
        ln -s /usr/bin/xcodebuild $tmp
        export PATH="$PATH:$PWD/node_modules/.bin:$tmp"

        (
        cd node_modules/macos-alias
        node-gyp rebuild
        )

        (
        cd node_modules/fs-xattr
        node-gyp rebuild
        )

        (
        mkdir -p node_modules/electron/dist
        cd $_
        unzip ${electron-zip}/*.zip
        )
      ''}

      for module in $(grep -R '"postinstall":' node_modules --include package.json | cut -d: -f1 | grep -v '/test/' | xargs dirname); do
      (
        cd $module
        yarn --offline run postinstall
      )
      done

      # get rid of references
      rm yarn.lock node_modules/node-sass/build/config.gypi

    '';

    installPhase = ''
      mkdir $out
      mv node_modules $out/
    '';

    dontFixup = pkgs.stdenv.isDarwin;
  };

in pkgs.stdenv.mkDerivation {
  inherit version;

  pname = name;
  src = mkSrc src;
  buildInputs = [ yarn pkgs.unzip pkgs.zip ];

  LUNA_DIST_PACKAGES_DIR = midnight-dist + "/midnight-dist";

  configurePhase = ''
    export HOME=$NIX_BUILD_TOP/yarn_home

    export ELECTRON_ZIP_DIR=$NIX_BUILD_TOP/electron
    cp -r ${electron-zip} $ELECTRON_ZIP_DIR
    chmod -R +w $_

    cp -r ${nodeModules}/node_modules .
  '';

  buildPhase = ''
    yarn --offline run build-dist-${system}
  '';

  installPhase = ''
    cp -r dist $out

    ${{
      x86_64-darwin = ''
        tmp=$(mktemp -d)
        ln -s /usr/bin/hdiutil /usr/sbin/bless $tmp
        export PATH="$PATH:$tmp"
        yarn --offline run make-dmg

        mkdir -p $out/nix-support
        mv dist/*.dmg $out
        echo file dmg $out/*.dmg >> $out/nix-support/hydra-build-products
      '';
    }.${system} or "true"}
  '';

  dontFixup = pkgs.stdenv.isDarwin;
}
