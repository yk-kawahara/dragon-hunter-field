"use strict";

(() => {
  // Human-editable fixed world map for DRAGON HUNTER.
  // Edit BASE_MAP / EAST_EXPANSION / SOUTH_EXPANSION rows directly to change terrain.
  // Legend:
  //   . grass / open field
  //   + road or walkable clearing
  //   ~ water
  //   T forest / tree wall
  //   # stone wall / ridge
  //   ^ roof
  //   _ village / interior stone floor
  //   C cave entrance
  //   * flowers
  //   = harvest field
  const BASE_MAP = [
    "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT",
    "T..............................................................................T",
    "T.........................................~~~~.................................T",
    "T.........................................~~~~........................########.T",
    "T.........................................~~~~........................########.T",
    "T.........................................~~~~............................###..T",
    "T.....................======..............~~~~............................###..T",
    "T...*****.............======..............~~~~...............=====#.......###..T",
    "T...*****.......T.....======..............~~~~.........#.....==#######....###..T",
    "T...*****...TTTTTTTTT.======......****....~~~~.....#########.=#########...###..T",
    "T...*****.TTTTTTTTTTTTT...........****....~~~~.#########################..###..T",
    "T...*****TTTTTTTTTTTTTTT..........****....~~~~.#+++++++#################..###..T",
    "T.......TT+++TTTTTTTTTTTT.........****....~~~~.#+++++++##################.###..T",
    "T.......TT+++TTTTTTTTTTTT....T....****....~~~~.#+++++++#################..###..T",
    "T.......TT+++TTTTTTTTTTTT.TTTTTTT.........~~~~.#+++++++#################..###..T",
    "T......TTT+++TTTTT++++TTTTTTTTTTTT........~~~~.#+++++++###+++++########*.......T",
    "T.......TT+++TTT++++++TTTTTTTTTTTTT.......~~~~.#+++++++++++++++#######**.......T",
    "T.......TT+++T++++++++TTTTTTTTTTTTT.......~~~~.#+++++++++++++++...#.+++*.......T",
    "T.......TT++++++++++TTTTTTTTTTTTTTTT.....~~~~..###+++++++++++++....++++*.......T",
    "T........T++++++++TTT++++TTTTTTTTTT......~~~~....#+++++####++++..++++++TT......T",
    "T.........++++++TT+++++++++TTTTTTTT......~~~~.....#########++++.++++++TTTTT....T",
    "T.........++++T+++++++++++++TTTTTT.......~~~~......########+++.++++++TTTTTTT...T",
    "T.........++++++++++++++++++++TTT........~~~~..........#...++++++++TTTTTTTTT...T",
    "T.........++++++++++.....++++++..........~~~~..............+++++++TTTTTTTTTT...T",
    "T.........+++++++.........+++++++........~~~~..............++++++TTTTTTTTTTTT..T",
    "T.........++++..............++++++.......~~~~............++++++TTTTTTTTTTTTT...T",
    "T......===+++................++++++......~~~~...........++++++.TTTTTTTTTTTTT...T",
    "T......===+++..................++++++....~~~~.........+++++++..TTTTTTTTTTTTT...T",
    "T......===+++..............*****++++++....~~~~.....++++++++++...TTTTTTTTTTT....T",
    "T......===+++..............******+++++++..~~~~..+++++++++++++.....TTTTTTT......T",
    "T.........+++..............******..++++++.~~~~++++++++++=.+++........T.........T",
    "T.........+++..............******...+++++++++++++++++====.+++..................T",
    "T.........+++..............******.....++++++++++++..=====++++.......*****......T",
    "T.........+++..........................+++++++++.........++++.....+++****......T",
    "T.........+++............................++++~...........+++.....++++****......T",
    "T.........+++.............................+++~.T.........+++..T.+++++****......T",
    "T.........+++.............................+++TTTTTTTT....+++TTTT++++*****......T",
    "T.........+++...........................TT+++TTTTTTTTTT.T+++TTT++++TT..........T",
    "T.........+++..........................TTTTTTTTTTTTTTTTTT+++TT+++++TTT.........T",
    "T...._____________....................TTTTTTTTTTTTTTTTTT++++T+++++TTTTT........T",
    "T...._^^^^^_______...................TTTTTTTTTTTTTTTTTTT+++++++++TTTTTT........T",
    "T...._#___#__^^^^^...................TTTTTTTTTTTTTTTTTTT+++T++++TTTTTTT........T",
    "T...._#___#__#___#...................TTTTTTTTTTTTTTTTTT++++++++++TTTTTTT.......T",
    "T...._#___#______#..................TTTTTTTTTTTTTTTTTTT++++++++++TTTTTT........T",
    "T...._##_##______#......====.........TTTTTTTTTTTTTTTTTT++++++++++TTTTTT........T",
    "T....________##_##......====.........TTTTTTTTTTTTTTTTTT++++++++TTTTTTTT........T",
    "T....__________+++......====.........TTTTTTTTTTTTTTTT++++++++TTTTTTTTT.........T",
    "T....__________+++......====..........TTTTTTTTTTTTT++++++++TTTTTTTTTT..........T",
    "T....__++++++++++++++++++++++++++++++++++++++++++++++++++++TTTTTTTT............T",
    "T....__+++++++++++++++++++++++++++++++++++++++++++++++++++++..T................T",
    "T....__+++++++++++++++++++++++++++++++++++++++++++++++++++++++.................T",
    "T....__________+++...++......................~~T~.......++++++++...............T",
    "T....__^^^_^^__+++...++......................~~~~.........++++++++.............T",
    "T....__#____#_____...++......................~~~~...........++++++++...........T",
    "T....__#____#_____...++++.........*****......~~~~.............++++++++.........T",
    "T....__###_##_____.....+++++......*****.......~~~~..........====++++++++.......T",
    "T.........................+++++...*****.......~~~~..........======++++++++.....T",
    "T............................++++.*****.......~~~~........T.======..++++++.....T",
    "T.............................+++.............~~~~....TTTTTTTTT===....++++*....T",
    "T.............................+++.............~~~~..TTTTTTTTTTTTT=.....****....T",
    "T.......................======+++............++++++TTTTTTTTTTTTTTT.....***TT...T",
    "T.......................======+++............++++++TTTTTTTTTTTTTTT.....***TT...T",
    "T...................###########C############..~~~~TTTTTTTTTTTTTTTTT.......TT...T",
    "T...................######+++++++++====#####..~~~~.TTTTTTTTTTTTTTT........TT...T",
    "T...................####++++####++++====####..~~~~.TTTTTTTTTTTTTTT........TT...T",
    "T...................###++++++##+++++++++####..~~~~..TTTTTTTTTTTTT.........TT...T",
    "T...................###++##++++++++##++++###..~~~~....TTTTTTTTT..TTTTTTTTTTT...T",
    "T...................###++++++++###++++++####..~~~~........T......TTTTTTTTTTT...T",
    "T...................#####++==++++++==+++####..~~~~.............................T",
    "T...................####++++++++####+++++###...................................T",
    "T...................##########++############...................................T",
    "TTTTTTTTTTTTTTTTTTTTTTTTTTTT+++++++++++++++TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT"
  ];

  const EAST_EXPANSION = [
    "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT",
    "T######################################T",
    "T#C+++++++____#______+++++++__________#T",
    "T#+++++++____#______+#####+++_________#T",
    "T#+++####++++#______+#___#++++________#T",
    "T#+++#__#++++++++++++#___#+++++_______#T",
    "T#+++#__######+++++++#___#+++++_______#T",
    "T#+++____#____#+++++++___#++####++____#T",
    "T#+++____#____#+++++++___#++#__#++____#T",
    "T###++++#____#####++++++#++#__#++_____#T",
    "T#__#++++#________++++++++++#__#++____#T",
    "T#__#++++######____++++++####__#++____#T",
    "T#__++++++++++#____++++++++++++#++____#T",
    "T#__++++++++++#____+++++########++____#T",
    "T######################################T",
    "++++++++++++++....TT.TTTT.TTTT.TTTT.TTTT",
    "++++++++++++++....T.TTTT.TTTT.TTTT.TTTTT",
    "++++++++++++++.....TTTT.TTTT.TTTT.TTTT.T",
    "++++++++++++++.........................T",
    "++++++++++++++.........................T",
    "++++++++++++++.........................T",
    "++++++++++++++.........................T",
    "+.......~~~~..............*..*..*......T",
    "+.......~~~~.............*..*..*..*....T",
    "+.......~~~~............*..*..*..*.....T",
    "+.......~~~~..............*..*..*......T",
    "+.......~~~~.............*..*..*..*....T",
    "+.......~~~~............*..*..*..*.....T",
    "+++++++++++++++++++.......*..*..*......T",
    "+++++++++++++++++++......*..*..*..*....T",
    "++++++++++++++++++++++..*..*..*..*.....T",
    "++++++++++++++++++++++....*..*..*......T",
    "++++++++++++++++++++++...*..*..*..*....T",
    "++++++++++++++++++++++..*..*..*..*.....T",
    "++++++++++++++++++++++.................T",
    "++++++++++++++++++++++.................T",
    "+.................++++...###..######...T",
    "+.................++++...#..++.....#...T",
    "+.................++++...#.........#...T",
    "+.................++++...#.....++..#...T",
    "+.................++++...#...+++...#...T",
    "+.................++++...#...+++...+...T",
    "+.................++++...#...+++...#...T",
    "+.................++++...#.........#...T",
    "+.................++++...#.........#...T",
    "+.................++++...#..++.....#...T",
    "+.................++++...######..###...T",
    "+.................++++.................T",
    "+.................++++.................T",
    "+++++++++++++++++++++++++++++++++++++++T",
    "++======+++++++++++++++++++++++++++++++T",
    "++======+++++++++++++++++++++++++++++++T",
    "+.======..........++++.................T",
    "+.======......._^^^^^_________.........T",
    "+.======.......__#__#___#__#__.........T",
    "+.======~~~~...__#__#___#__#__.........T",
    "+.======~~~~..._______________.........T",
    "+.======~~~~..._______________.........T",
    "+++++++++++++++++++++++++++___.........T",
    "+++++++++++++++++++++++_______.........T",
    "+++++++++++++++++++++++................T",
    "+++++++++++++++++++++++................T",
    "+++++++++++++++++++++++................T",
    "+++++++++++++++++++++++.TT.TTT.TTT.TTT.T",
    "+++++++++++++++++++++++.T.TTT.TTT.TTT.TT",
    "+++++++++++++++++++++++..TTT.TTT.TTT.TTT",
    "+++++++++++++++++++++++.TTT.TTT.TTT.TTTT",
    "+.......................TT.TTT.TTT.TTT.T",
    "+.......................T.TTT.TTT.TTT.TT",
    "+........................TTT.TTT.TTT.TTT",
    "+.......................TTT.TTT.TTT.TTTT",
    "TTTTTTTTTTTTTTTTTT+++++++++++++++++++++T"
  ];

  const SOUTH_EXPANSION = [
    "TTTTTTTTTTTTTTTTTTTTTTTTTTTT+++++++++++++++TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT++++++TTTTTTTTTTTTTTTT",
    "T......................############++############.................................................+++++................T",
    "T......................#.......++++++++++.......#...................~~~~~.........................+++++................T",
    "T...TT.TT.TT.TT.TT.....#.......++++++++++.......#...................~~~~~...TTTT.TTTT.T...........+++++................T",
    "T..TT.TT.TT.TT.TT.T....#.......++++++++++.......#...===========.....~~~~~...TTTT.TTTT.T...........+++++................T",
    "T..T.TT.TT.TT.TT.TT....#.======++++++++++.......#...===========.....~~~~~.........................+++++................T",
    "T...TT.TT.TT.TT.TT.....#.======++++++++++.#####.#...===========.....~~~~~...TTTT.TTTT.T...........+++++................T",
    "T..TT.TT.TT.TT.TT.T....#.======++++++++++.#####.#...===========.....~~~~~...TTTT.TTTT.T...........+++++................T",
    "T..T.TT.TT.TT.TT.TT....#.======++++++++++.#####.#...===========.....~~~~~...TTTT.TTTT.T...........+++++................T",
    "T...TT.TT.TT.TT.TT.....#.======++++++++++.#####.#...................~~~~~...TTTT.TTTT.T...........+++++................T",
    "T..TT.TT.TT.TT.TT.T....#.======++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++................T",
    "T..T.TT.TT.TT.TT.TT....#.======+++++++++++++++++++++++++++++++++++++++++++++TTTT+TTTT+T++++++++++++++++................T",
    "T...TT.TT.TT.TT.TT.....#.======+++++++++++++++++++++++++++++++++++++++++++++TTTT+TTTT+T++++++++++++++++................T",
    "T..TT.TT.TT.TT.TT.T....#.======++++++++++.......#...................~~~~~...TTTT.TTTT.T...########+++++###########.....T",
    "T..T.TT.TT.TT.TT.TT....#.......++++++++++.......#......*..*..*..*...~~~~~...TTTT.TTTT.T...#.......+++++..........#.....T",
    "T...TT.TT.TT.TT.TT.....#.......++++++++++.......#.....*..*..*..*....~~~~~.................#.......+++++..........#.....T",
    "T..TT.TT.TT.TT.TT.T....##########++++++##########.......*..*..*.....~~~~~...TTTT.TTTT.T...#.......+++++..........#.....T",
    "T..T.TT.TT.TT.TT.TT....................................*..*..*..*...~~~~~...TTTT.TTTT.T...#.......++++++++.......#.....T",
    "T...TT.TT.TT.TT.TT....................................*..*..*..*....~~~~~...TTTT.TTTT.T...#.......++++++++.......+.....T",
    "T..TT.TT.TT.TT.TT.T.....................................*..*..*.....~~~~~...TTTT.TTTT.T...#.......++++++++.......#.....T",
    "T..T.TT.TT.TT.TT.TT.................................................~~~~~.................#.......++++++++.......#.....T",
    "T...................................................................~~~~~.................#.......+++++..........#.....T",
    "T.........................................................................................########################.....T",
    "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT"
  ];

  const SOUTH_GATE_ROW = "TTTTTTTTTTTTTTTTTT+++++TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT.............+++++++++++++++.......T";

  const DEEP_SOUTH_EXPANSION = [
    "TTTTTTTTTTTTTTTTTT+++++TTTT...............................~~~~~~~~~~~~~...........TTTTTTT.......+++++++++++++++++++++..T",
    "TTTTTTTTTTTTTTTTTT+++++TTTTTT.............................~~~~~~~~~~~~~.......TTTTTTT..........+++++++.###########.....T",
    "TTTTTTTTTTTTTTTTTT+++++TT.................................~~~~~~~~~~~~~.....................++++++++...#.........#.....T",
    "TTTTTTTTTTTTTTTTTT+++++...................................~~~~~~~~~~~~~.................+++++++++......#..=====..#.....T",
    "TTTTTTTTTTTTTTTTTT+++++...................................~~~~~~~~~~~~~...............++++***++........#..=====..#.....T",
    "TTTTTTTTTTTTTTTTTT+++++...................................~~~~~~~~~~~~~.............++++****+..........#..=====..#.....T",
    "TTTTTTTTTTTTTTTTTT+++++...................................~~~~~~~~~~~~~...........+++++++++............###########.....T",
    "TTTTTTTTTTTTTTTTTT+++++TT.................................~~~~~~~~~~~~~.........+++++++++++.TTTTT...+++++++++++++++++..T",
    "TTTTTTTTTTTTTTTTTT+++++TTTTTT.............................~~~~~~~~~~~~~.......+++++++++++...TTTTT...+++++++++++++++++..T",
    "TTTTTTTTTTTTTTTTTT+++++TTTTTTTT...........................~~~~~~~~~~~~~.....+++++++++++.TTTTTTTTT...+++++++++++++++++..T",
    "TTTTTTTTTTTTTTTTTT+++++TT.................................~~~~~~~~~~~~~...+++++++++++...TTTTTTTTT.+++++++++++++........T",
    "TTTTTTTTTTTTTTTTTT+++++TT.................................~~~~~~~~~~~~~.+++++++++++.....TTTTTTTTT...+++++++++..........T",
    "TTTTTTTTTTTTTTTTTT+++++TTTTTTTT...........................~~~~~~~~~~~~+++++++++++.......TTTTTTTTTTTTTTT++++++++........T",
    "TTTTTTTTTTTTTTTTTT+++++TTTTTTTTTTTT.......................~~~~~~~~~~~~+++++++++++++++++++++++++++++++++++++++++........T",
    "TTTTTTTTTTTTTTTTTT+++++TTTTTTTTTTTT.......................~~~~~~~~~~~~.............++++++++++++++......................T",
    "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT"
  ];

  const ECLIPSE_GATE_ROW = "TTTTTTTTTTTTTTTTTT+++++TTTTT.........................TTTTTTTTTTTTT.................++++++++++++++++++++++..............T";

  const CHAPTER2_EXPANSION = [
    "TTTTTTTTTTTTTTTTTT+++++TTT...........................~~~~~~~~~~~~~............................+++++++++................T",
    "TTTTTTTTTTTTTTTTTT+++++TT............................~~~~~~~~~~~~~..........................._+++++++++++++++++_.......T",
    "TTTTTTTTTTTTTTTTTT+++++T.............................~~~~~~~~~~~~~..........................._+++++++++++++++++_.......T",
    "TTTTTTTTTTTTTTTTTT+++++..............................~~~~~~~~~~~~~....*..*..*..*..*..........________++++_______.......T",
    "TTTTTTTTTTTTTTTTTT+++++..............................~~~~~~~~~~~~~....*..*..*..*..*..........________++++_______.......T",
    "TTTTTTTTTTTTTTTTTT+++++...............=========......~~~~~~~~~~~~~....*..*..*..*..*..........________++++_______.......T",
    "TTTTTTTTTTTTTTTTTT+++++...............=========......~~~~~~~~~~~~~...........................________++++_______.......T",
    "TTTTTTTTTTTTTTTTTT+++++...............=========......~~~~~~~~~~~~~............................+++++++++++..............T",
    "TTTTTTTTTTTTTTTTTT+++++.#########++++#######++++###########~~~~~~~............................+++++++++++....++++++....T",
    "TTTTTTTTTTTTTTTTTT+++++.#________++++_______++++__________#~~~~~~~............................+++++++++++....++++++....T",
    "TTTTTTTTTTTTTTTTTT+++++.#_______#+++++++++#_______________#~~~~~~~......######++++#######++++######.+++++...####+####..T",
    "TTTTTTTTTTTTTTTTTT+++++.#_____+++++####+++++++____________#~~~~~~~......#.......+++++++++++++..++++++++++...####+####..T",
    "TTTTTTTTTTTTTTTTTT+++++.#_____#+++++++++#_________________#~~~~~~~......#.......+++++++++++++...+++++++++...####+####..T",
    "TTTTTTTTTTTTTTTTTT+++++.#_________++++++_________++++_____#~~~~~~~......#..++...+++++++++....++++++++++++...####+####..T",
    "TTTTTTTTTTTTTTTTTT+++++.##########++++++#########++++######~~~~~~~......#.....+++++++++....+++++++++++..#....++++......T",
    "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT",
  ];

  const VOID_GATE_ROW = "TTTTTTTTTTTTTTTTTT+++++T##########+C++++###################TTTTTTT................+++++++++++++++++++++++..............T";

  const CHAPTER3_EXPANSION = [
    "TTTTTTTTTTTTTTTTTT+++++...............................~~~~~~~~~~~~................+++++++++++++++++++++++..............T",
    "TTTTTTTTTTTTTTTTTTTT____^^^^^_____+++++____^^^^^......~~~~~~~~~~~~................++++++__^^^^^_+++++^^____............T",
    "TTTTTTTTTTTTTTTTTTTT____^___^_____+++++____^___^..#####~~~~~~~~~~~................++++++__^^^^^_+++++^^____............T",
    "TTTTTTTTTTTTTTTTTTT.____^___^__+++++++++___^____..#___#~~~~~~~~~~~................++++++__+++++++++++++____............T",
    "TTTTTTTTTTTTTTTTTT..++++_____++#########++_____+.+#_+_#~~~~~~~~~~~................++++++__+++++++++++^^____............T",
    "TTTTTTTTTTTTTTTTT...++++_____++#_______#++_____+.+#___#~~~~~~~~~~~....*..*..*..*..*+++++__^^^^^_+++++^^____............T",
    "TTTTTTTTTTTTTTTT....++++_____++#___+___#++_____+.+##+##~~~~~~~~~~~....*..*..*..*..*.....__^^^^^_+++++^^____............T",
    "TTTTTTTTTTTTTTTT....+++++++++++#___+___#+++++++++++++++++++++++++++++++++++++++++++++...........+++++..................T",
    "TTTTTTTTTTTTTTTT....++++_____++####+####++_____+......~~~~~~~~~~~~....*..*..*..*..*.............+++++..................T",
    "TTTTTTTTTTTTTTTT......................................~~~~~~~~~~~~..####++++++####..##++++++####+++++####..............T",
    "TTTTTTTTTTTTTTTT......................................~~~~~~~~~~~~..#.....++++++++++++++++++..++++++++++#..............T",
    "TTTTTTTTTTTTTTTT......................................~~~~~~~~~~~~..#..+++++++++++....++++++++++++++++..#..............T",
    "TTTTTTTTTTTTTTTT......................................~~~~~~~~~~~~..#.....+++++++++++++++++++++++++++...#..............T",
    "TTTTTTTTTTTTTTTT......................................~~~~~~~~~~~~..#.....+++++++++++++++++++++++++++...#..............T",
    "TTTTTTTTTTTTTTTT......................................~~~~~~~~~~~~..#.....+++++++++++++++++++++++++++...#..............T",
    "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT",
  ];

  const FROST_GATE_ROW = "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT+++++++TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT";

  const CHAPTER4_EXPANSION = [
    "T.............................................................................+++++++..................................T",
    "T.TTTTTTTT..........................~~~~~~~~~.................................+++++++..................................T",
    "T.TTTTTTTT........=======...........~~~~~~~~~.=======.........................+++++++..................................T",
    "T.TT..............=======...........~~~~~~~~~.=======.........................+++++++..................................T",
    "T.TT..............+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++......T",
    "T.TT...................++.........++~~~~~~+++............++..........+.................+...............++..............T",
    "T.TTTTTTTT.._______________________.~~~~~~~~~.............+.............TTTTTTT.........................+..............T",
    "T.TTTTTTTT..__^^^^^^^_____^^^^^^^__.~~~~~~~~~.....########C############.TTTTTTT.............###########++++##########..T",
    "T.TTTTTTTT..__^^^^^^^_____^^^^^^^__.~~~~~~~~~.....########+############.TTTTTTT.********....###########++++##########..T",
    "T.TTTTTTTT.._______________________.~~~~~~~~~.....+#______+_____+____##.TTTTTTT.********....##_____________________##..T",
    "T.TTTTTTTT.._______________________.~~~~~~~~~.....+#______+_____+____##.TTTTTTT.********....+#_____________________##..T",
    "T.TTTTTTTT.._______________________.~~~~~~~~~.....+#+++++++++++++++++##.TTTTTTT.............+#+++++++++++++++++++++##..T",
    "T.TTTTTTTT..________++++++++++++++++++++++++++++++##______+_____+____##++++++++++++++++++++++#_____________________##..T",
    "T.TTTTTTTT.........................+~~~~~~~~~....+##______+_____+____##.TTTTTTT...........++##_____________________##..T",
    "T...................................~~~~~~~~~.....#####################.....................#########################..T",
    "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT",
  ];

  // Fixed, human-editable geography. Each feature is a named polyline with a
  // tile and width. Move/add points to reshape ridges, rivers, and roads.
  // Terrain is painted first; roads are carved last to create readable passes.
  const GEOGRAPHY_FEATURES = {
    terrain: [
      { id: "skyspine-west-ridge", tile: "#", width: 4, points: [[3, 74], [10, 76], [16, 80], [21, 86], [25, 94]] },
      { id: "skyspine-east-ridge", tile: "#", width: 3, points: [[36, 73], [42, 76], [47, 81], [53, 86], [60, 94]] },
      { id: "highland-south-ridge", tile: "#", width: 3, points: [[28, 97], [35, 100], [42, 105], [49, 111]] },
      { id: "highland-pine-belt", tile: "T", width: 4, points: [[5, 91], [11, 96], [15, 103], [17, 111]] },
      { id: "moon-west-woods", tile: "T", width: 3, points: [[27, 111], [32, 115], [36, 119]] },
      { id: "black-sun-crags", tile: "#", width: 2, points: [[51, 128], [57, 133], [64, 137], [71, 142]] },
      { id: "world-river", tile: "~", width: 2, points: [[68, 72], [70, 79], [67, 87], [69, 95], [62, 102], [63, 110], [60, 118], [61, 126], [60, 134], [61, 142]] },
    ],
    roads: [
      { id: "highland-main-road", tile: "+", width: 2, points: [[30, 71], [31, 78], [38, 83], [48, 84], [58, 83], [69, 84], [81, 84], [94, 82], [102, 82]] },
      { id: "highland-valley-road", tile: "+", width: 1, points: [[30, 71], [34, 82], [38, 91], [48, 94], [58, 92], [69, 90], [82, 91], [96, 90], [103, 89]] },
      { id: "highland-ridge-shortcut", tile: "+", width: 1, points: [[32, 73], [40, 76], [49, 78], [58, 78], [67, 82], [79, 84]] },
      { id: "moon-east-road", tile: "+", width: 2, points: [[103, 94], [102, 103], [103, 111], [102, 116]] },
      { id: "moon-west-pilgrim-road", tile: "+", width: 1, points: [[103, 94], [94, 98], [86, 101], [76, 103], [69, 109], [81, 113], [94, 116], [102, 116]] },
      { id: "mist-shrine-branch", tile: "+", width: 1, points: [[76, 103], [71, 110], [68, 117], [72, 122]] },
      { id: "black-market-north-road", tile: "+", width: 2, points: [[102, 119], [98, 124], [98, 129], [88, 132], [78, 132], [68, 134], [58, 132], [48, 132]] },
      { id: "black-market-south-road", tile: "+", width: 1, points: [[48, 138], [58, 140], [70, 140], [80, 140], [88, 135], [98, 133]] },
      { id: "obsidian-bridge-road", tile: "+", width: 1, points: [[48, 135], [54, 135], [61, 136], [68, 136], [75, 135], [82, 133], [88, 132]] },
    ],
  };

  const TERRAIN_DETAILS = [
    { id: "grassland-camp", x: 20, y: 33, rows: ["....==....", "..****.."] },
    { id: "river-fork-farm", x: 22, y: 50, rows: ["..==..***.."] },
    { id: "river-fork-marker", x: 72, y: 50, rows: ["..==.."] },
    { id: "smuggler-north-camp", x: 28, y: 96, rows: ["..==..**.."] },
    { id: "smuggler-broken-wall", x: 72, y: 96, rows: ["..####.."] },
    { id: "smuggler-thorn-field", x: 34, y: 100, rows: ["..****.."] },
    { id: "smuggler-old-stall", x: 84, y: 100, rows: ["..==.."] },
    { id: "regen-cave-ruin", x: 30, y: 104, rows: ["..####.."] },
    { id: "regen-cave-garden", x: 78, y: 104, rows: ["..****.."] },
    { id: "regen-side-supply", x: 34, y: 122, rows: ["..==.."] },
    { id: "regen-moss-field", x: 58, y: 122, rows: ["..****.."] },
    { id: "mist-shrine-court", x: 64, y: 118, rows: [
      "....######++++######....",
      "..##....++++++++....##..",
      "..#..**..++++..**..#....",
      "..#....++++++++....#....",
      "..#....++++++++....#....",
      "..#..++++++++++..#......",
      "..#..**..++++..**..#....",
      "..##....++++++++....##..",
      "....######++++++++++....",
    ] },
    { id: "black-market-city", x: 15, y: 128, rows: [
      "#####+++++########+++++###########",
      "#^^^^_____#^^^^^^#_____#^^^^^____#",
      "#^__^__+++#__++_#+++++#^___^_+++#",
      "#____++++++++++++++++++++++++____#",
      "#_+++++____+++++++____+++++++____#",
      "#_+++++____+++++++____+++++++____#",
      "#_++++++++++++++++++++++++++++++_#",
      "#_+++++____+++++++____+++++++____#",
      "#____++++++++++++++++++++++++____#",
      "#_^^^__++++#^^^^^#++++__^^^^^___#",
      "#_^_^__++++#^___^#++++__^___^___#",
      "#_____+++++_______+++++__________#",
      "#####+++++########+++++###########",
      "....+++++..........+++++...........",
      "....+++++..........+++++...........",
    ] },
    { id: "black-market-catacomb-door", x: 47, y: 130, rows: ["C"] },
    { id: "frost-tower-doors", x: 43, y: 148, rows: ["C++C"] },
    { id: "frost-watchtower-floors", x: 88, y: 18, rows: [
      "###############T###############",
      "#C____________#T#C____________#",
      "#_#######_###_#T#_###########_#",
      "#_____#_______#T#_____#_______#",
      "#####_#_#####_#T#####_#_#####_#",
      "#_____#_____#_#T#_____#_____#_#",
      "#_#########_#_#T#_###_#####_#_#",
      "#_________#___#T#_#_________#_#",
      "#_#####_#_###_#T#_#_#######_#_#",
      "#_#_____#_____#T#___#_____#___#",
      "#_#_#########_#T###_#_###_###_#",
      "#_#___________#T#___#___#_____#",
      "#_###########_#T#_#####_#####_#",
      "#____________C#T#_________C_CC#",
      "###############T###############",
    ] },
    { id: "black-sun-thorn-field", x: 60, y: 136, rows: ["..****.."] },
    { id: "black-sun-muster-ground", x: 68, y: 136, rows: ["..==.."] },
    { id: "black-sun-bone-yard", x: 110, y: 136, rows: ["..**.."] },
  ];

  function applyTerrainDetails(rows) {
    const detailed = rows.slice();
    for (const detail of TERRAIN_DETAILS) {
      for (let dy = 0; dy < detail.rows.length; dy += 1) {
        const y = detail.y + dy;
        const row = detailed[y];
        if (!row) continue;
        const chars = row.split("");
        const pattern = detail.rows[dy];
        for (let dx = 0; dx < pattern.length; dx += 1) {
          const x = detail.x + dx;
          if (x > 0 && x < chars.length - 1) chars[x] = pattern[dx];
        }
        detailed[y] = chars.join("");
      }
    }
    return detailed;
  }

  function paintFeatureDisc(grid, cx, cy, radius, tile) {
    for (let y = Math.floor(cy - radius); y <= Math.ceil(cy + radius); y += 1) {
      if (y <= 0 || y >= grid.length - 1) continue;
      for (let x = Math.floor(cx - radius); x <= Math.ceil(cx + radius); x += 1) {
        if (x <= 0 || x >= grid[y].length - 1) continue;
        if (Math.hypot(x - cx, y - cy) <= radius + 0.25) grid[y][x] = tile;
      }
    }
  }

  function paintFeatureLine(grid, feature) {
    for (let index = 1; index < feature.points.length; index += 1) {
      const [x1, y1] = feature.points[index - 1];
      const [x2, y2] = feature.points[index];
      const steps = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1));
      for (let step = 0; step <= steps; step += 1) {
        const t = steps === 0 ? 0 : step / steps;
        paintFeatureDisc(
          grid,
          Math.round(x1 + (x2 - x1) * t),
          Math.round(y1 + (y2 - y1) * t),
          feature.width,
          feature.tile,
        );
      }
    }
  }

  function applyGeographyFeatures(rows) {
    const grid = rows.map((row) => row.split(""));
    for (const feature of GEOGRAPHY_FEATURES.terrain) paintFeatureLine(grid, feature);
    for (const feature of GEOGRAPHY_FEATURES.roads) paintFeatureLine(grid, feature);
    return grid.map((row) => row.join(""));
  }

  function connectEastEdge(row, y) {
    const open = (y >= 15 && y <= 21) || (y >= 28 && y <= 35) || (y >= 49 && y <= 51) || (y >= 58 && y <= 66);
    return open ? `${row.slice(0, -1)}+` : row;
  }

  const ASSEMBLED_WORLD = [
    ...BASE_MAP.map((row, y) => connectEastEdge(row, y) + EAST_EXPANSION[y]),
    ...SOUTH_EXPANSION.slice(0, -1),
    SOUTH_GATE_ROW,
    ...DEEP_SOUTH_EXPANSION.slice(0, -1),
    ECLIPSE_GATE_ROW,
    ...CHAPTER2_EXPANSION.slice(0, -1),
    VOID_GATE_ROW,
    ...CHAPTER3_EXPANSION.slice(0, -1),
    FROST_GATE_ROW,
    ...CHAPTER4_EXPANSION,
  ];
  const WORLD_MAP = applyTerrainDetails(applyGeographyFeatures(ASSEMBLED_WORLD));

  const WORLD_OBJECTS = [
    { type: "npc", npcType: "elder", x: 9, y: 47, offsetX: 3, offsetY: 2, w: 10, h: 12, dir: "down" },
    { type: "npc", npcType: "smith", x: 15, y: 48, offsetX: 4, offsetY: 1, w: 10, h: 12, dir: "left" },
    { type: "npc", npcType: "healer", x: 13, y: 43, offsetX: 3, offsetY: 2, w: 10, h: 12, dir: "down" },
    { type: "npc", npcType: "frontier", x: 33, y: 59, offsetX: 3, offsetY: 2, w: 10, h: 12, dir: "left" },
    { type: "npc", npcType: "frontier", x: 108, y: 58, offsetX: 3, offsetY: 2, w: 10, h: 12, dir: "left" },
    { type: "npc", npcType: "frontier", x: 108, y: 116, offsetX: 3, offsetY: 2, w: 10, h: 12, dir: "left" },
    { type: "npc", npcType: "frontier", x: 104, y: 132, offsetX: 3, offsetY: 2, w: 10, h: 12, dir: "left" },
    { type: "npc", npcType: "merchant", x: 35, y: 131, offsetX: 3, offsetY: 2, w: 10, h: 12, dir: "down" },
    { type: "npc", npcType: "guide", x: 40, y: 132, offsetX: 3, offsetY: 2, w: 10, h: 12, dir: "left" },
    { type: "npc", npcType: "guard", x: 47, y: 135, offsetX: 3, offsetY: 2, w: 10, h: 12, dir: "right" },
    { type: "npc", npcType: "villager", x: 24, y: 134, offsetX: 3, offsetY: 2, w: 10, h: 12, dir: "down" },
    { type: "npc", npcType: "villager", x: 36, y: 135, offsetX: 3, offsetY: 2, w: 10, h: 12, dir: "up" },
    { type: "npc", npcType: "guard", x: 99, y: 130, offsetX: 3, offsetY: 2, w: 10, h: 12, dir: "down" },
    { type: "npc", npcType: "villager", x: 96, y: 116, offsetX: 3, offsetY: 2, w: 10, h: 12, dir: "right" },
    { type: "npc", npcType: "villager", x: 101, y: 57, offsetX: 3, offsetY: 2, w: 10, h: 12, dir: "left" },
    { type: "npc", npcType: "porter", x: 7, y: 50, offsetX: 3, offsetY: 2, w: 10, h: 12, dir: "right" },
    { type: "npc", npcType: "villager", x: 11, y: 51, offsetX: 3, offsetY: 2, w: 10, h: 12, dir: "up" },
    { type: "npc", npcType: "guard", x: 17, y: 49, offsetX: 3, offsetY: 2, w: 10, h: 12, dir: "left" },
    { type: "npc", npcType: "porter", x: 29, y: 60, offsetX: 3, offsetY: 2, w: 10, h: 12, dir: "up" },
    { type: "npc", npcType: "guard", x: 26, y: 58, offsetX: 3, offsetY: 2, w: 10, h: 12, dir: "right" },
    { type: "npc", npcType: "villager", x: 34, y: 60, offsetX: 3, offsetY: 2, w: 10, h: 12, dir: "left" },
    { type: "npc", npcType: "porter", x: 98, y: 58, offsetX: 3, offsetY: 2, w: 10, h: 12, dir: "right" },
    { type: "npc", npcType: "guard", x: 106, y: 56, offsetX: 3, offsetY: 2, w: 10, h: 12, dir: "down" },
    { type: "npc", npcType: "porter", x: 99, y: 116, offsetX: 3, offsetY: 2, w: 10, h: 12, dir: "right" },
    { type: "npc", npcType: "guard", x: 105, y: 117, offsetX: 3, offsetY: 2, w: 10, h: 12, dir: "left" },
    { type: "npc", npcType: "porter", x: 93, y: 132, offsetX: 3, offsetY: 2, w: 10, h: 12, dir: "right" },
    { type: "npc", npcType: "villager", x: 101, y: 133, offsetX: 3, offsetY: 2, w: 10, h: 12, dir: "left" },
    { type: "npc", npcType: "porter", x: 31, y: 135, offsetX: 3, offsetY: 2, w: 10, h: 12, dir: "right" },
    { type: "npc", npcType: "guard", x: 21, y: 132, offsetX: 3, offsetY: 2, w: 10, h: 12, dir: "right" },
    { type: "npc", npcType: "villager", x: 43, y: 133, offsetX: 3, offsetY: 2, w: 10, h: 12, dir: "left" },
    { type: "npc", npcType: "villager", x: 27, y: 131, offsetX: 3, offsetY: 2, w: 10, h: 12, dir: "down" },
    { type: "npc", npcType: "villager", x: 39, y: 134, offsetX: 3, offsetY: 2, w: 10, h: 12, dir: "up" },
    { type: "npc", npcType: "guard", x: 45, y: 131, offsetX: 3, offsetY: 2, w: 10, h: 12, dir: "left" },
    { type: "npc", npcType: "villager", x: 96, y: 58, offsetX: 3, offsetY: 2, w: 10, h: 12, dir: "right" },
    { type: "npc", npcType: "villager", x: 106, y: 115, offsetX: 3, offsetY: 2, w: 10, h: 12, dir: "down" },
    { type: "npc", npcType: "guard", x: 90, y: 130, offsetX: 3, offsetY: 2, w: 10, h: 12, dir: "right" },
    { type: "npc", npcType: "villager", x: 32, y: 133, offsetX: 3, offsetY: 2, w: 10, h: 12, dir: "left" },
    { type: "npc", npcType: "guard", x: 47, y: 132, offsetX: 3, offsetY: 2, w: 10, h: 12, dir: "down" },
    { type: "npc", npcType: "guard", x: 96, y: 114, offsetX: 3, offsetY: 2, w: 10, h: 12, dir: "right" },
    { type: "npc", npcType: "villager", x: 104, y: 59, offsetX: 3, offsetY: 2, w: 10, h: 12, dir: "up" },
    { type: "npc", npcType: "guard", x: 23, y: 131, offsetX: 3, offsetY: 2, w: 10, h: 12, dir: "right" },
    { type: "npc", npcType: "villager", x: 25, y: 135, offsetX: 3, offsetY: 2, w: 10, h: 12, dir: "up" },
    { type: "npc", npcType: "villager", x: 46, y: 134, offsetX: 3, offsetY: 2, w: 10, h: 12, dir: "left" },
    { type: "npc", npcType: "guard", x: 17, y: 131, offsetX: 3, offsetY: 2, w: 10, h: 12, dir: "right" },
    { type: "npc", npcType: "villager", x: 20, y: 137, offsetX: 3, offsetY: 2, w: 10, h: 12, dir: "down" },
    { type: "npc", npcType: "villager", x: 24, y: 140, offsetX: 3, offsetY: 2, w: 10, h: 12, dir: "right" },
    { type: "npc", npcType: "villager", x: 29, y: 138, offsetX: 3, offsetY: 2, w: 10, h: 12, dir: "left" },
    { type: "npc", npcType: "guard", x: 34, y: 140, offsetX: 3, offsetY: 2, w: 10, h: 12, dir: "up" },
    { type: "npc", npcType: "villager", x: 39, y: 138, offsetX: 3, offsetY: 2, w: 10, h: 12, dir: "down" },
    { type: "npc", npcType: "villager", x: 44, y: 140, offsetX: 3, offsetY: 2, w: 10, h: 12, dir: "left" },
    { type: "npc", npcType: "guard", x: 47, y: 137, offsetX: 3, offsetY: 2, w: 10, h: 12, dir: "left" },
    { type: "npc", npcType: "guard", x: 95, y: 54, offsetX: 3, offsetY: 2, w: 10, h: 12, dir: "right" },
    { type: "npc", npcType: "villager", x: 109, y: 55, offsetX: 3, offsetY: 2, w: 10, h: 12, dir: "left" },
    { type: "npc", npcType: "villager", x: 95, y: 115, offsetX: 3, offsetY: 2, w: 10, h: 12, dir: "right" },
    { type: "npc", npcType: "guard", x: 109, y: 117, offsetX: 3, offsetY: 2, w: 10, h: 12, dir: "left" },
    { type: "npc", npcType: "guard", x: 90, y: 133, offsetX: 3, offsetY: 2, w: 10, h: 12, dir: "right" },
    { type: "npc", npcType: "villager", x: 105, y: 131, offsetX: 3, offsetY: 2, w: 10, h: 12, dir: "left" },
    { type: "npc", npcType: "frontier", x: 24, y: 153, offsetX: 3, offsetY: 2, w: 10, h: 12, dir: "down" },
    { type: "npc", npcType: "frostSmith", x: 21, y: 154, offsetX: 3, offsetY: 2, w: 10, h: 12, dir: "right" },
    { type: "npc", npcType: "porter", x: 16, y: 154, offsetX: 3, offsetY: 2, w: 10, h: 12, dir: "right" },
    { type: "npc", npcType: "guide", x: 31, y: 151, offsetX: 3, offsetY: 2, w: 10, h: 12, dir: "left" },
    { type: "npc", npcType: "guard", x: 33, y: 154, offsetX: 3, offsetY: 2, w: 10, h: 12, dir: "left" },
    { type: "npc", npcType: "guard", x: 13, y: 150, offsetX: 3, offsetY: 2, w: 10, h: 12, dir: "right" },
    { type: "npc", npcType: "villager", x: 19, y: 151, offsetX: 3, offsetY: 2, w: 10, h: 12, dir: "down" },
    { type: "npc", npcType: "villager", x: 29, y: 154, offsetX: 3, offsetY: 2, w: 10, h: 12, dir: "up" },
  ];

  globalThis.DRAGON_HUNTER_WORLD_MAP = {
    width: 120,
    height: 160,
    rows: WORLD_MAP,
    objects: WORLD_OBJECTS,
  };
})();
