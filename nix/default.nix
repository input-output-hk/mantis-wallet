{ system ? builtins.currentSystem }:

let
  sources = import ./sources.nix;
  inherit (sources) nixpkgs gitignore yarn2nix;

  haskellNix = import sources."haskell.nix" {
    sourceOverrides = sources;
    inherit system;
  };

  pkgs = import nixpkgs {
    inherit system;
    config = { };
    overlays = [ ];
  };
  inherit (import gitignore { inherit (pkgs) lib; }) gitignoreSource;

  nodejs = pkgs.nodejs-12_x;
  yarn = pkgs.yarn.override { inherit nodejs; };

  midnight = import sources.midnight {
    inherit system;
    src = sources.midnight;
  };
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

  midnight-dist = pkgs.runCommand "midnight-dist" { } ''
    mkdir -p $out/midnight-dist
    cd $_
    ln -s ${midnight} midnight-node
    ln -s ${midnight} midnight-wallet
  '';

  nodeHeaders = pkgs.fetchurl {
    url =
      "https://nodejs.org/download/release/v${nodejs.version}/node-v${nodejs.version}-headers.tar.gz";
    hash = "sha256:0zwl2d32m6cdi3cm80szba1x2nmn6hzcbjmhi4iipgmnc4jp6pl1";
  };

  yarn2nix = import yarn2nix rec { inherit pkgs nodejs yarn; };

  inherit (haskellNix.pkgs.haskell-nix.haskellLib) cleanGit;
}
