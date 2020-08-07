{
  luna = {
    x86_64-darwin = import ./. { system = "x86_64-darwin"; };
    x86_64-linux = import ./. { system = "x86_64-linux"; };
  };
}
