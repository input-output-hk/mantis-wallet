with import ./nix { };

pkgs.mkShell {
  # LUNA_DIST_PACKAGES_DIR = midnight-dist + "/midnight-dist";
  CI = __getEnv "CI";
  buildInputs = [ yarn nodejs pkgs.git pkgs.openssh pkgs.python ]
    ++ (pkgs.lib.optional pkgs.stdenv.isLinux pkgs.wineWowPackages.base);
}
