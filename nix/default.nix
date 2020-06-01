{ system ? builtins.currentSystem }:

let
  sources = import ./sources.nix;
  inherit (sources) nixpkgs gitignore yarn2nix;

  pkgs = import nixpkgs {
    inherit system;
    config = { };
    overlays = [ ];
  };
  inherit (import gitignore { inherit (pkgs) lib; }) gitignoreSource;

  nodejs = pkgs.nodejs-12_x;
  yarn = pkgs.yarn.override { inherit nodejs; };

  midnight = (import sources.midnight {
    src = sources.midnight;
    inherit system;
  }).override { impure = system == "x86_64-darwin"; };

in {
  inherit pkgs nodejs yarn midnight;

  electron-zip = let

    electron = {
      x86_64-linux = sources.electron-linux;
      x86_64-darwin = sources.electron-darwin;
    };

  in pkgs.runCommand "electron-zip" { } ''
    mkdir $out
    cp ${electron.${system}} $out/$(stripHash ${electron.${system}})
  '';

  midnight-dist = let
  in pkgs.runCommand "midnight-dist" { } ''
    mkdir -p $out/midnight-dist
    cd $_
    cp --recursive --dereference ${midnight} midnight
    ln -s midnight midnight-node
    ln -s midnight midnight-wallet
  '';

  nodeHeaders = pkgs.fetchurl {
    url =
      "https://nodejs.org/download/release/v${nodejs.version}/node-v${nodejs.version}-headers.tar.gz";
    hash = "sha256:0zwl2d32m6cdi3cm80szba1x2nmn6hzcbjmhi4iipgmnc4jp6pl1";
  };

  yarn2nix = import yarn2nix rec { inherit pkgs nodejs yarn; };

  mkSrc = src:
    let
      isGit = builtins.pathExists (src + "/.git");
      repo = builtins.fetchGit src;
      dirty = repo.revCount == 0;
      filterSrc = src:
        pkgs.lib.cleanSourceWith {
          inherit src;
          filter = path: _: (builtins.baseNameOf path) != "release.nix";
        };
    in if isGit then
      if dirty then filterSrc (gitignoreSource src) else repo
    else
      src;
}
