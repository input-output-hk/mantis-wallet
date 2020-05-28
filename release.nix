{ src ? ./. }:

let
  midnight-dist = {
    x86_64-linux = (import ./nix { system = "x86_64-linux"; }).midnight-dist;
    x86_64-darwin = (import ./nix { system = "x86_64-darwin"; }).midnight-dist;
  };
  # inherit (pkgs.lib.importJSON ./package.json) name version;

  # yarnNix = yarn2nix.mkYarnNix { yarnLock = ./yarn.lock; };
  # offlineCache = yarn2nix.importOfflineCache yarnNix;

  # node-modules = pkgs.lib.genAttrs [ "linux" "darwin" ] mkNodeModules;

  # mkMidnightDistWrapped = os:
  #   let
  #     inherit (import ./nix { system = "x86_64-${os}"; }) midnight-dist-wrapped;
  #   in midnight-dist-wrapped;

  # midnight-dist-wrapped =
  #   pkgs.lib.genAttrs [ "darwin" "linux" ] mkMidnightDistWrapped;

  # mkMidnightDist = os:
  #   let inherit (import ./nix { system = "x86_64-${os}"; }) midnight-dist;
  #   in midnight-dist;

  # midnight-dist = pkgs.lib.genAttrs [ "darwin" "linux" ] mkMidnightDist;

  # mkNodeModules = os:
  #   let
  #     inherit (import ./nix { system = "x86_64-${os}"; })
  #       pkgs yarn nodejs nodeHeaders yarn2nix;
  #   in pkgs.stdenv.mkDerivation {
  #     pname = "${name}-modules";
  #     version = "${version}-${os}";
  #     srcs = [ ./package.json ./yarn.lock ];
  #     buildInputs = [
  #       yarn
  #       nodejs
  #       pkgs.pkg-config
  #       pkgs.libsass
  #       pkgs.python
  #       pkgs.unzip
  #       yarn2nix.fixup_yarn_lock
  #     ] ++ (pkgs.lib.optional pkgs.stdenv.isDarwin
  #       pkgs.darwin.apple_sdk.frameworks.CoreServices);

  #     LIBSASS_EXT = "auto";
  #     unpackPhase = ''
  #       mkdir source
  #       cd $_

  #       for src in $srcs; do
  #         cp $src $(stripHash $src)
  #       done

  #       chmod +w *
  #     '';

  #     configurePhase = ''
  #       export HOME=$NIX_BUILD_TOP/yarn_home
  #       yarn config --offline set yarn-offline-mirror ${offlineCache}
  #       fixup_yarn_lock ./yarn.lock
  #     '';

  #     buildPhase = ''
  #       yarn config --offline set tarball ${nodeHeaders}
  #       yarn install --offline --frozen-lockfile --ignore-scripts
  #       patchShebangs .

  #       ${pkgs.lib.optionalString pkgs.stdenv.isDarwin ''
  #         LD=$CC
  #         tmp=$(mktemp -d)
  #         ln -s /usr/bin/xcodebuild $tmp
  #         export PATH="$PATH:$PWD/node_modules/.bin:$tmp"

  #         (
  #         cd node_modules/macos-alias
  #         node-gyp rebuild
  #         )

  #         (
  #         cd node_modules/fs-xattr
  #         node-gyp rebuild
  #         )

  #         (
  #         mkdir -p node_modules/electron/dist
  #         cd $_
  #         unzip ${electron-darwin}
  #         )
  #       ''}

  #       for module in $(grep -R '"postinstall":' node_modules --include package.json | cut -d: -f1 | grep -v '/test/' | xargs dirname); do
  #       (
  #         cd $module
  #         yarn --offline run postinstall
  #       )
  #       done

  #     '';

  #     installPhase = ''
  #       mkdir $out
  #       mv node_modules $out/
  #     '';

  #     dontFixup = pkgs.stdenv.isDarwin;
  #   };

  # mkBuild = os:
  #   let
  #     inherit (import ./nix { system = "x86_64-${os}"; })
  #       yarn nodejs pkgs midnight-dist-wrapped;
  #   in pkgs.stdenv.mkDerivation {
  #     pname = "${name}-build";
  #     version = "${version}-${os}";
  #     src = mkSrc ./.;
  #     buildInputs = [ yarn ];

  #     configurePhase = ''
  #       export HOME=$NIX_BUILD_TOP/yarn_home
  #       cp -r ${node-modules.${os}}/node_modules .
  #     '';

  #     buildPhase = ''
  #       yarn --offline run build-all
  #     '';

  #     installPhase = ''
  #       cp -r . $out
  #     '';
  #   };

  # build = pkgs.lib.genAttrs [ "darwin" "linux" ] mkBuild;

  # mkDist = os:
  #   let
  #     inherit (import ./nix { system = "x86_64-${os}"; }) yarn nodejs pkgs;
  #     inherit (pkgs) zip unzip;
  #   in pkgs.stdenv.mkDerivation {
  #     pname = "${name}-dist";
  #     version = "${version}-${os}";

  #     src = build.${os};
  #     buildInputs = [ yarn nodejs unzip zip ];

  #     LUNA_DIST_PACKAGES_DIR = midnight-dist-wrapped.${os} + "/midnight-dist";

  #     configurePhase = ''
  #       export HOME=$NIX_BUILD_TOP/yarn_home

  #       export ELECTRON_ZIP_DIR=$NIX_BUILD_TOP/electron
  #       cp -r ${electron-zips} $ELECTRON_ZIP_DIR
  #       chmod -R +w $_
  #     '';

  #     buildPhase = ''
  #       yarn --offline run package-${os}
  #     '';

  #     installPhase = ''
  #       cp -r dist $out
  #     '';
  #   };

  # dist = pkgs.lib.genAttrs [ "darwin" "linux" ] mkDist;

  # dmg =
  #   let inherit (import ./nix { system = "x86_64-darwin"; }) yarn nodejs pkgs;
  #   in pkgs.stdenv.mkDerivation {
  #     pname = "${name}-dmg";
  #     version = "${version}-darwin";

  #     src = build.darwin;
  #     buildInputs = [ nodejs yarn ];

  #     configurePhase = ''
  #       export HOME=$NIX_BUILD_TOP
  #       cp -r ${dist.darwin} dist
  #       chmod -R +w $_
  #     '';

  #     buildPhase = ''
  #       tmp=$(mktemp -d)
  #       ln -s /usr/bin/hdiutil /usr/sbin/bless $tmp
  #       export PATH="$PATH:$tmp"
  #       yarn --offline run make-dmg
  #     '';

  #     installPhase = ''
  #       mkdir -p $out/nix-support
  #       mv dist/luna-wallet.dmg $out
  #       echo file dmg $out/luna-wallet.dmg >> $out/nix-support/hydra-build-products
  #     '';
  #   };

in {
  # inherit midnight-dist
  # node-modules
  # build
  # dist
  # dmg
  # ;

  luna = rec {
    x86_64-darwin = import src {
      inherit src;
      system = "x86_64-darwin";
    };
    x86_64-linux = import src {
      inherit src;
      system = "x86_64-linux";
    };
  };
}
