/**
 * Generates new 0-level characters. See the README.md file for detailed
 * setup instructions.
 *
 * Syntax: !fodder option
 *
 * option determines which set of rollable tables will be used for occupation,
 *        equipment, and options such as race or physical makeup
 */

var Fodder = Fodder || {
    version: '0.0.2',
    defaultAvatar: "https://s3.amazonaws.com/files.d20.io/images/7165064/VtQt1TimmSc8rxdHH4daxg/med.jpg?1421350799",
    output: [],

    listen: function () {
        on('chat:message', function (msg) {
            // Exit if not an api command
            if (msg.type != "api") {
                return;
            }
            if (msg.content.indexOf("!fodder ") != -1) {
                var input = msg.content.split(" ");
                if (input[1] == "help") {
                    Fodder.showHelp();
                } else {
                    Fodder.setTables(input[1]);
                    sendChat('API', "/direct <h6>Generating character</h6>");
                    Fodder.generate(msg, Fodder.printSheet, Fodder.save);
                }
            } else if (msg.content.indexOf("!fodder") != -1) {
                Fodder.showHelp();
            }
        });
    },

    setTables: function (ruleset) {
        var defaultTable = {
            occupation: "Occupations-Core",
            luck: "Birth-Augur-Lucky-Roll-Core",
            equipment: "Equipment-Core"
        };

        switch (ruleset) {
            case "brokenmoon":
                Fodder.RaceTable = 'Races-CUaBM';
                Fodder.OccupationTable = 'Occupations-CUaBM';
                Fodder.LuckTable = defaultTable.luck;
                Fodder.EquipmentTable = 'Equipment-CUaBM';
                break;
            case "crawl":
                Fodder.OccupationTable = 'Occupations-Crawl';
                Fodder.LuckTable = defaultTable.luck;
                Fodder.EquipmentTable = defaultTable.equipment;
                break;
            case "core":
            default:
                Fodder.OccupationTable = defaultTable.occupation;
                Fodder.LuckTable = defaultTable.luck;
                Fodder.EquipmentTable = defaultTable.equipment;
        }
    },

    showHelp: function () {
        sendChat("API", "/direct <table style='background: #DCD9D5; border-radius: 20px; font-size: 10px;'>" +
            "<thead><tr><th>Help</th></tr></thead>" +
            "<tbody>" +
            "<tr><td><strong>!fodder</strong><br><strong>!fodder help</strong><br>Show this help screen.</td></tr>" +
            "<tr><td><strong>!fodder core</strong><br>Use default core DCC tables.</td></tr>" +
            "<tr><td><strong>!fodder brokenmoon</strong><br>Use Crawling Under A Broken Moon tables, including mutants and robots.</td></tr>" +
            "<tr><td><strong>!fodder crawl</strong><br>Use Crawl! tables for zero-level character generation, including gnomes and physical characteristics.</td></tr>" +
            "<tr><td> </td></tr>" +
            "</td></tr></tbody></table>");
    },

    generate: function (msg, outputCallback, saveCallback) {
        Fodder.id = msg.playerid;
        Fodder.player = msg.who;
        Fodder.name = msg.who + " #" + (findObjs({_type: "character", controlledby: msg.playerid}).length + 1)
        Fodder.gender = Fodder.rollGender();
        Fodder.strength = Fodder.rollAbility();
        Fodder.strengthMod = Fodder.calcMod(Fodder.strength);
        Fodder.agility = Fodder.rollAbility();
        Fodder.agilityMod = Fodder.calcMod(Fodder.agility);
        Fodder.stamina = Fodder.rollAbility();
        Fodder.staminaMod = Fodder.calcMod(Fodder.stamina);
        Fodder.personality = Fodder.rollAbility();
        Fodder.personalityMod = Fodder.calcMod(Fodder.personality);
        Fodder.intelligence = Fodder.rollAbility();
        Fodder.intelligenceMod = Fodder.calcMod(Fodder.intelligence);
        Fodder.luck = Fodder.rollAbility();
        Fodder.luckMod = Fodder.calcMod(Fodder.luck);
        Fodder.hp = Fodder.rollHP(Fodder.staminaMod);
        Fodder.cp = Fodder.rollCoin();
        if (typeof Fodder.LuckTable != 'undefined') {
            Fodder.rollLuckyRoll();
        }
        if (typeof Fodder.RaceTable != 'undefined') {
          Fodder.rollRace();
        }
        if (typeof Fodder.OccupationTable != 'undefined') {
          Fodder.rollOccupation();
        }
        if (typeof Fodder.EquipmentTable != 'undefined') {
          Fodder.rollEquipment();
        }

        if (typeof outputCallback === "function") {
          setTimeout(outputCallback, 2500, msg, saveCallback);
        }
    },

    /* Should account for more than male and female? */
    rollGender: function () {
      var coinFlip = randomInteger(100);
      if (coinFlip <= 50) {
        return "Male";
      } else {
        return "Female";
      }
    },

    rollAbility: function () {
      return randomInteger(6) + randomInteger(6) + randomInteger(6);
    },

    calcMod: function (ability) {
      return Math.floor((0.0009 * ability * ability * ability) + (-0.029 * ability * ability) + (0.6 * ability) + 0.41) - 4;
    },

    rollLuckyRoll: function () {
      Fodder.luckyRoll = {};
      sendChat("API", "/roll 1t[" + Fodder.LuckTable + "]", function (result) {
          var content = JSON.parse(result[0].content);
          var values = content.rolls[0].results[0].tableItem.name.split(':');
          Fodder.luckyRoll.birthAugur = values[0];
          Fodder.luckyRoll.detail = values[1];
      });
    },

    rollHP: function (staminaMod) {
        var hp = randomInteger(4) + staminaMod;
        if (hp <= 0) {
            hp = 1;
        }
        return hp;
    },

    rollCoin: function () {
        return randomInteger(12) + randomInteger(12) + randomInteger(12) + randomInteger(12) + randomInteger(12);
    },

    rollRace: function () {
        Fodder.race = '';
        sendChat("API", "/roll 1t[" + Fodder.RaceTable + "]", function (result) {
            var content = JSON.parse(result[0].content);
            Fodder.race = content.rolls[0].results[0].tableItem.name;
        });
    },

    rollOccupation: function () {
      var occupation = "";
      sendChat("API", "/roll 1t[" + Fodder.OccupationTable + "]", function (result, occupation) {
          var content = JSON.parse(result[0].content);
          var values = content.rolls[0].results[0].tableItem.name.split(':');
          Fodder.occupation = values[0];
          occupation = values[0];

          var weapon = values[1].split('|');
          var handedness = 1;
          if (weapon[4] == 2) {
              handedness = 1.1;
          }
          Fodder.weapon = {
            name: weapon[1],
            damage: weapon[2],
            damageType: weapon[3],
            attackType: weapon[0],
            handedness: handedness
          };
          if (weapon[0] === 'Ranged') {
            Fodder.weapon.ammo = randomInteger(6);
            Fodder.weapon.rangedType = '@{DEX}';
            if (weapon[5] == 'Thrown') {
                Fodder.weapon.rangedType = '@{STR}';
            }
            Fodder.weapon.rangedDistance = weapon[4]
          }
          Fodder.trade = values[2];
      });
    },

    rollEquipment: function () {
        sendChat("API", "/roll 1t[" + Fodder.EquipmentTable + "]", function (result) {
            var content = JSON.parse(result[0].content);
            Fodder.equipment = content.rolls[0].results[0].tableItem.name;
        });
    },

    printSheet: function (msg, saveCallback) {
      var styleLabel = "style='font-weight: bold; padding: 5px;'";
      var styleVal = "style='padding: 5px;'";
      Fodder.output['name'] = "<thead><tr><th colspan='2' style='background: #8C8173; padding: 5px;'>" + Fodder.name + "</th></tr></thead>";
      Fodder.output['gender'] = "<tr><td " + styleLabel + ">Gender</td><td " + styleVal + ">" + Fodder.gender + "</td></tr>";
      if (Fodder.race != undefined) {
        Fodder.output['race'] = "<tr><td " + styleLabel + ">Race</td><td " + styleVal + ">" + Fodder.race + "</td></tr>";
      } else {
        Fodder.output['race'] = "";
      }
      if (Fodder.occupation != undefined) {
        Fodder.output['occupation'] = "<tr><td " + styleLabel + ">Occupation</td><td " + styleVal + ">" + Fodder.occupation + "</td></tr>";
      } else {
        Fodder.output['occupation'] = "";
      }
      Fodder.output['abilities'] = "<tr><td " + styleLabel + ">Strength</td><td " + styleVal + ">" + Fodder.strength + ' (' + Fodder.strengthMod + ')' +
          "</td></tr><tr><td " + styleLabel + ">Agility</td><td " + styleVal + ">" + Fodder.agility + ' (' + Fodder.agilityMod + ')' +
          "</td></tr><tr><td " + styleLabel + ">Stamina</td><td " + styleVal + ">" + Fodder.stamina + ' (' + Fodder.staminaMod + ')' +
          "</td></tr><tr><td " + styleLabel + ">Personality</td><td " + styleVal + ">" + Fodder.personality + ' (' + Fodder.personalityMod + ')' +
          "</td></tr><tr><td " + styleLabel + ">Intelligence</td><td " + styleVal + ">" + Fodder.intelligence + ' (' + Fodder.intelligenceMod + ')' +
          "</td></tr><tr><td " + styleLabel + ">Luck</td><td " + styleVal + ">" + Fodder.luck + ' (' + Fodder.luckMod + ')' +
          "</td></tr>";
      Fodder.output['hitpoints'] = "<tr><td " + styleLabel + ">Hit Points</td><td " + styleVal + ">" + Fodder.hp + "</td></tr>";
      if (Fodder.luckyRoll != undefined) {
        Fodder.output['luck'] = "<tr><td " + styleLabel + ">Birth Augur</td><td " + styleVal + ">" + Fodder.luckyRoll.birthAugur + "</td></tr><tr><td style='font-weight: bold; padding: 5px;'>Lucky Roll</td><td style='padding: 5px;'>" + Fodder.luckyRoll.detail + "</td></tr>";
      } else {
        Fodder.output['luck'] = "";
      }
      if (Fodder.weapon != undefined) {
        Fodder.output['weapon'] = "<tr><td style='font-weight: bold; padding: 5px;'>Weapon</td><td style='padding: 5px;'>" + Fodder.weapon.name + " (" + Fodder.weapon.damage + ")</td></tr>";
      } else {
        Fodder.output['weapon'] = "";
      }
      if (Fodder.trade != undefined) {
        Fodder.output['trade'] = "<tr><td style='font-weight: bold; padding: 5px;'>Trade Good</td><td style='padding: 5px;'>" + Fodder.trade + "</td></tr>";
      } else {
        Fodder.output['trade'] = "";
      }
      if (Fodder.equipment != undefined) {
            Fodder.output['equipment'] = "<tr><td style='font-weight: bold; padding: 5px;'>Equipment</td><td style='padding: 5px;'>" + Fodder.equipment + "</td></tr>";
      } else {
        Fodder.output['equipment'] = "";
      }
      Fodder.output['copper'] = "<tr><td " + styleLabel + ">Copper Pieces</td><td " + styleVal + ">" + Fodder.cp + "</td></tr>";


      //Fodder.output['size'] = "<tr><td style='font-weight: bold; padding: 5px;'>Height</td><td style='padding: 5px;'>" + Fodder.size.height + "</td></tr>" +
      //  "<tr><td style='font-weight: bold; padding: 5px;'>Weight</td><td style='padding: 5px;'>" + Fodder.size.weight + "</td></tr>";

      sendChat(msg.who, "/direct <table style='background: #DCD9D5; border-radius: 20px; font-size: 10px;'>" + Fodder.output['name'] +
          "<tbody>" +
          Fodder.output['gender'] +
          Fodder.output['race'] +
          Fodder.output['occupation'] +
          Fodder.output['abilities'] +
          Fodder.output['hitpoints'] +
          Fodder.output['luck'] +
          Fodder.output['weapon'] +
          Fodder.output['trade'] +
          Fodder.output['equipment'] +
          Fodder.output['copper'] +
          "</tbody></table>");

      if (typeof saveCallback === "function") {
        saveCallback();
      }
    },

    save: function() {
      var character = createObj("character", {
          avatar: Fodder.defaultAvatar,
          name: Fodder.name,
          bio: "",
          gmnotes: "Player: " + Fodder.player + "<br>Generated by script Fodderator.js version " + Fodder.version,
          archived: false,
          inplayerjournals: "all",
          controlledby: Fodder.id
      });

      createObj('attribute', {
          name: 'player_name',
          current: Fodder.player,
          _characterid: character.id
      });
      createObj('attribute', {
          name: 'Name',
          current: Fodder.name,
          _characterid: character.id
      });
      createObj('attribute', {
          name: 'gender',
          current: Fodder.gender,
          _characterid: character.id
      });
      createObj('attribute', {
          name: 'Languages',
          current: 'Common',
          _characterid: character.id
      });
      createObj('attribute', {
          name: 'Speed',
          current: 30,
          _characterid: character.id
      });
      createObj('attribute', {
          name: 'Level',
          current: '0',
          max: '10',
          _characterid: character.id
      });
      createObj('attribute', {
          name: 'XP',
          current: 0,
          max: 10,
          _characterid: character.id
      });
      createObj('attribute', {
          name: 'Strength',
          current: Fodder.strength,
          max: Fodder.strength,
          _characterid: character.id
      });
      createObj('attribute', {
          name: 'Agility',
          current: Fodder.agility,
          max: Fodder.agility,
          _characterid: character.id
      });
      createObj('attribute', {
          name: 'Stamina',
          current: Fodder.stamina,
          max: Fodder.stamina,
          _characterid: character.id
      });
      createObj('attribute', {
          name: 'Personality',
          current: Fodder.personality,
          max: Fodder.personality,
          _characterid: character.id
      });
      createObj('attribute', {
          name: 'Intelligence',
          current: Fodder.intelligence,
          max: Fodder.intelligence,
          _characterid: character.id
      });
      createObj('attribute', {
          name: 'Luck',
          current: Fodder.luck,
          max: Fodder.luck,
          _characterid: character.id
      });
      createObj('attribute', {
          name: 'Luck_Starting',
          current: Fodder.luck,
          max: Fodder.luck,
          _characterid: character.id
      });
      createObj('attribute', {
          name: 'HP',
          current: Fodder.hp,
          max: Fodder.hp,
          _characterid: character.id
      });
      createObj('attribute', {
          name: 'CP',
          current: Fodder.cp,
          _characterid: character.id
      });
      createObj('attribute', {
          name: 'BirthAugur',
          current: Fodder.luckyRoll.birthAugur,
          _characterid: character.id
      });
      createObj('attribute', {
          name: 'LuckyRoll',
          current: Fodder.luckyRoll.detail,
          _characterid: character.id
      });
      if (typeof Fodder.race != "undefined") {
        createObj('attribute', {
            name: 'Race',
            current: Fodder.race,
            _characterid: character.id
        });
      }
      createObj('attribute', {
          name: 'Occupation',
          current: Fodder.occupation,
          _characterid: character.id
      });
      if (Fodder.weapon.attackType === 'Melee') {
          createObj('attribute', {
              name: 'MeleeWeaponName1',
              current: Fodder.weapon.name,
              _characterid: character.id
          });
          createObj('attribute', {
              name: 'MeleeDmg1',
              current: Fodder.weapon.damage,
              _characterid: character.id
          });
          createObj('attribute', {
              name: 'MeleeDmgType1',
              current: Fodder.weapon.damageType,
              _characterid: character.id
          });
          createObj('attribute', {
              name: 'MeleeAttackWielded1_Zero',
              current: Fodder.weapon.handedness,
              _characterid: character.id
          });
      } else {
          createObj('attribute', {
              name: "RangedAmmo1",
              current: Fodder.weapon.ammo,
              _characterid: character.id
          });
          createObj('attribute', {
              name: 'RangedWeaponName1',
              current: Fodder.weapon.name,
              _characterid: character.id
          });
          createObj('attribute', {
              name: 'RangedDistance1',
              current: Fodder.weapon.rangedDistance,
              _characterid: character.id
          });
          createObj('attribute', {
              name: 'RangedType1',
              current: Fodder.weapon.rangedType,
              _characterid: character.id
          });
          createObj('attribute', {
              name: 'RangedDmg1',
              current: Fodder.weapon.damage,
              _characterid: character.id
          });
      }
      createObj('attribute', {
          name: 'Equipment',
          current: Fodder.trade + "\n" + Fodder.equipment,
          _characterid: character.id
      });
    }

};

on("ready", function () {
    Fodder.listen();
});
