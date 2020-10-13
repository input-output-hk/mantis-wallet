{ src ? ./., system ? builtins.currentSystem }:

with import ./nix { inherit system; };
let
  inherit (pkgs.lib.importJSON ./package.json) name version;

  mantis-dist =
    pkgs.runCommand "mantis-dist"
      {
        src = import ./mantis {
          inherit system;
        };
      } ''
      mkdir -p $out/mantis-dist
      cd $_
      ln -s $src mantis
    '';

  yarnLock =
    pkgs.runCommand "yarn.lock"
      {
        srcs = [ ./package.json ./yarn.lock ];
        buildInputs = with pkgs; [ jq ];
      } ''

    for src in $srcs; do
      cp $src $(stripHash $src)
      chmod +w $_
    done

    cat package.json | jq -r '.dependencies["luna-wallet-etc-loader"]' | cut -d# -f2 | xargs -I% sed -i 's/%":$/master":/' yarn.lock
    mv yarn.lock $out
  '';

  yarnNix = yarn2nix.mkYarnNix { inherit yarnLock; };
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
    ] ++ (
      pkgs.lib.optional
        pkgs.stdenv.isDarwin
        pkgs.darwin.apple_sdk.frameworks.CoreServices
    );

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
      # yarn config --offline set tarball ''${nodeHeaders}

      # export CPPFLAGS="-I${nodejs}/include/node"

      yarn config --offline set nodedir ${nodejs}
      #--build-from-source
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

in
pkgs.stdenv.mkDerivation {
  inherit version;

  pname = name;
  src = mkSrc src;

  nativeBuildInputs = [ pkgs.makeWrapper ];
  buildInputs = [ yarn pkgs.unzip pkgs.zip ];

  LUNA_DIST_PACKAGES_DIR = mantis-dist + "/mantis-dist";

  configurePhase = ''
    export HOME=$NIX_BUILD_TOP/yarn_home

    export ELECTRON_ZIP_DIR=$NIX_BUILD_TOP/electron
    cp -r ${electron-zip} $ELECTRON_ZIP_DIR
    chmod -R +w $_

    cp -r ${nodeModules}/node_modules .
  '';

  buildPhase = "";

  passthru = { inherit yarnNix nodeModules; };

  installPhase = {
    x86_64-darwin = ''
      yarn --offline run build-dist-${system}
      mkdir -p $out/Applications
      cp -r dist/Luna-darwin-x64/Luna.app $_
    '';
    x86_64-linux = ''
      yarn --offline run build-all
      mkdir -p $out/{bin,share/luna-wallet}
      mv build/main/package.json .
      mv build package.json $out/share/luna-wallet/
      ln -s $LUNA_DIST_PACKAGES_DIR $out/share/mantis-dist
      chmod 0755 $out/share/ -R
      echo "#!${pkgs.runtimeShell}" > $out/bin/luna-wallet
      echo "cd $out/share/luna-wallet" >> $out/bin/luna-wallet
      echo "${pkgs.electron_8}/bin/electron $out/share/luna-wallet/build/main/main.js" >> $out/bin/luna-wallet
      chmod 0755 $out/bin/luna-wallet
      wrapProgram $out/bin/luna-wallet --set MANTIS_PACKAGE_DIRECTORY "../mantis-dist/mantis"
    '';
  }.${system};
}
