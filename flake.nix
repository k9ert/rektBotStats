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
            influxdb2
          ];

          shellHook = ''
            export INFLUX_DATA=$PWD/.local/influxdb
            export INFLUXD_BOLT_PATH=$INFLUX_DATA/influxd.bolt
            export INFLUXD_ENGINE_PATH=$INFLUX_DATA/engine
            export INFLUX_HOST=http://localhost:8086
            export INFLUX_ORG=rektbot
            export INFLUX_BUCKET_LONGS=rektBot_longs
            export INFLUX_BUCKET_SHORTS=rektBot_shorts

            mkdir -p $INFLUX_DATA

            if [ ! -f "$INFLUX_DATA/.initialized" ]; then
              echo "InfluxDB will be initialized on first start"
            fi

            if ! pgrep -x influxd > /dev/null; then
              echo "Starting InfluxDB"
              influxd --bolt-path=$INFLUXD_BOLT_PATH --engine-path=$INFLUXD_ENGINE_PATH --http-bind-address=:8086 > $INFLUX_DATA/influxd.log 2>&1 &
              sleep 3

              if [ ! -f "$INFLUX_DATA/.initialized" ]; then
                echo "Initializing InfluxDB"
                influx setup --force --username admin --password adminadmin --org $INFLUX_ORG --bucket $INFLUX_BUCKET_LONGS --token dev-token
                influx bucket create --name $INFLUX_BUCKET_SHORTS --org $INFLUX_ORG --token dev-token
                touch $INFLUX_DATA/.initialized
                export INFLUX_TOKEN=dev-token
                echo "export INFLUX_TOKEN=dev-token" > $INFLUX_DATA/.token
              fi
            fi

            if [ -f "$INFLUX_DATA/.token" ]; then
              source $INFLUX_DATA/.token
            fi

            echo "InfluxDB: $INFLUX_HOST"
            echo "Org: $INFLUX_ORG"
            echo "Buckets: $INFLUX_BUCKET_LONGS, $INFLUX_BUCKET_SHORTS"

            if [ ! -d "node_modules" ]; then
              echo "Installing npm dependencies"
              npm install
            fi
          '';
        };
      }
    );
}
