{ cfg, pkgs, ... }:

with cfg.steps.commands;

let
  shouldBuild = platform: ''
        build.message =~ /ci pkg${if platform == "all" then "" else " ${platform}"}/ ||
          build.branch =~ /^release\// ||
          build.branch == "develop" ||
          build.branch == "luna-mantis"
      '';
in

{
  steps.commands = {
    mantis-dist = {
      label = ":clock12::darwin::linux::windows:";
      "if" = shouldBuild "all";
      command = ''
        (cd mantis; nix-shell --run 'sbt -v -mem 2048 -J-Xmx4g dist')

        mkdir mantis-dist
        cp mantis/target/universal/mantis-*.zip mantis-dist/mantis.zip
        (
          cd mantis-dist
          unzip mantis.zip
          mv mantis-* mantis
          rm mantis.zip
        )
        tar czf mantis-dist.tgz mantis-dist
      '';
      artifactPaths = [ "mantis-dist.tgz" ];
      agents.queue = "project42";
    };

    node_modules = {
      label = ":yarn:";
      command = ''
        nix-shell --pure --keep SSH_AUTH_SOCK --run yarn
        tar czf node_modules.tgz node_modules
      '';
      artifactPaths = [ "node_modules.tgz" ];
      agents.queue = "project42";
    };

    lint = {
      dependsOn = [ node_modules ];
      label = ":tslint:";
      command = ''
        buildkite-agent artifact download node_modules.tgz .
        tar xzf node_modules.tgz
        rm node_modules.tgz
        nix-shell --pure --run "yarn lint"
      '';
      agents.queue = "project42";
    };

    dtslint = {
      dependsOn = [ node_modules ];
      label = ":tslint:";
      command = ''
        buildkite-agent artifact download node_modules.tgz .
        tar xzf node_modules.tgz
        rm node_modules.tgz
        nix-shell --pure --run "yarn dtslint"
      '';
      agents.queue = "project42";
    };

    test = {
      dependsOn = [ node_modules ];
      label = ":react::test_tube:";
      command = ''
        buildkite-agent artifact download node_modules.tgz .
        tar xzf node_modules.tgz
        rm node_modules.tgz
        nix-shell --pure --run "yarn test --ci --no-cache"
      '';
      agents.queue = "project42";
    };

    build = {
      dependsOn = [ node_modules ];
      label = ":typescript::point_right::javascript:";
      command = ''
        buildkite-agent artifact download node_modules.tgz .
        tar xzf node_modules.tgz
        rm node_modules.tgz
        nix-shell --pure --run "yarn build-all"
        tar czf build.tgz build
      '';
      artifactPaths = [ "build.tgz" ];
      agents.queue = "project42";
    };

    electron-darwin = {
      dependsOn = [ build mantis-dist ];
      "if" = shouldBuild "darwin";
      label = ":electron::darwin:";
      command = ''
        buildkite-agent artifact download build.tgz .
        buildkite-agent artifact download mantis-dist.tgz .

        tar xzf build.tgz
        tar xzf mantis-dist.tgz
        rm build.tgz mantis-dist.tgz

        export NIX_PATH="/nix/var/nix/profiles/per-user/root/channels"
        export LUNA_DIST_PACKAGES_DIR=$PWD/mantis-dist

        nix-shell -p wget --run "wget https://github.com/AdoptOpenJDK/openjdk8-binaries/releases/download/jdk8u252-b09.1/OpenJDK8U-jre_x64_mac_hotspot_8u252b09.tar.gz"
        tar xzf OpenJDK8*.tar.gz
        rm OpenJDK8*.tar.gz
        mv *-jre/Contents/Home mantis-dist/jre

        nix-shell --pure --keep SSH_AUTH_SOCK --run yarn
        nix-shell --keep LUNA_DIST_PACKAGES_DIR --pure --run "yarn package-darwin"
        nix-shell --run "npx electron-builder --publish never --prepackaged dist/Luna-darwin-x64 --mac dmg"
      '';

      artifactPaths = [ "dist/*.dmg" ];
      agents.system = "x86_64-darwin";
    };

    electron-linux = {
      dependsOn = [ build mantis-dist node_modules ];
      label = ":electron::linux:";
      "if" = shouldBuild "linux";
      command = ''
        buildkite-agent artifact download node_modules.tgz .
        buildkite-agent artifact download build.tgz .
        buildkite-agent artifact download mantis-dist.tgz .

        tar xzf build.tgz
        tar xzf mantis-dist.tgz
        tar xzf node_modules.tgz
        rm build.tgz mantis-dist.tgz node_modules.tgz
        export LUNA_DIST_PACKAGES_DIR=$PWD/mantis-dist

        nix-shell -p wget --run "wget https://github.com/AdoptOpenJDK/openjdk8-binaries/releases/download/jdk8u252-b09/OpenJDK8U-jre_x64_linux_hotspot_8u252b09.tar.gz"
        tar xzf OpenJDK8*.tar.gz
        rm OpenJDK8*.tar.gz
        mv *-jre mantis-dist/jre

        nix-shell --keep LUNA_DIST_PACKAGES_DIR --pure --run "yarn package-linux"
        nix-shell --pure --run "npx electron-builder --publish never --prepackaged dist/Luna-linux-x64 --linux AppImage"
      '';

      artifactPaths = [ "dist/*.AppImage" ];

      agents.queue = "project42";
    };

    electron-win = {
      dependsOn = [ node_modules build mantis-dist ];
      label = ":electron::windows:";
      "if" = shouldBuild "win";
      command = ''
        buildkite-agent artifact download node_modules.tgz .
        buildkite-agent artifact download build.tgz .
        buildkite-agent artifact download mantis-dist.tgz .

        tar xzf node_modules.tgz
        tar xzf build.tgz
        tar xzf mantis-dist.tgz

        rm node_modules.tgz build.tgz mantis-dist.tgz
        export LUNA_DIST_PACKAGES_DIR=$PWD/mantis-dist

        nix-shell -p wget --run "wget https://github.com/AdoptOpenJDK/openjdk8-binaries/releases/download/jdk8u252-b09.1/OpenJDK8U-jre_x64_windows_hotspot_8u252b09.zip"
        unzip OpenJDK8*.zip
        rm OpenJDK8*.zip
        mv *-jre mantis-dist/jre

        nix-shell --keep LUNA_DIST_PACKAGES_DIR --pure --run "yarn package-win"
        nix-shell --pure --run "npx electron-builder --publish never --prepackaged dist/Luna-win32-x64 --win --x64"
      '';

      artifactPaths = [ "dist/*.exe" ];
      agents.queue = "project42";
    };
  };
}
