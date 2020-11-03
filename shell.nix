with import ./nix { };

pkgs.mkShell {
  CI = __getEnv "CI";
  buildInputs = [ yarn nodejs pkgs.git pkgs.openssh pkgs.python ]
    ++ (pkgs.lib.optional pkgs.stdenv.isLinux pkgs.wineWowPackages.base);
}
