{
  description = "RektBot Stats development environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            nodejs_20
          ];

          shellHook = ''
            if [ -f .env ]; then
              export $(cat .env | xargs)
            fi

            if [ ! -d "node_modules" ]; then
              echo "Installing npm dependencies"
              npm install
            fi

            echo "Using InfluxDB Cloud"
            echo "Make sure .env has: INFLUX_URL, INFLUX_TOKEN, INFLUX_ORG"
          '';
        };
      }
    );
}
