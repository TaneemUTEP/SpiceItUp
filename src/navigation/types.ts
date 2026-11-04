export type RootStackParamList = {
  Home: undefined;
  DareDiceSetup: undefined;
  DareDiceNormal: { players: string[] };
  DareDiceRounds: { players: string[]; rounds: number };
  SparkBingo: undefined;
  Positions: undefined;
  ActionCam: undefined;
};

export type PublicStackParamList = {
  Landing: undefined;
  Auth: { mode?: 'login' | 'signup' } | undefined;
};
