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
    version: "0.0.3",
    sheetVersion: "1.5.1", // DCC_Tabbed_Sheet version
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
                    sendChat('API', "/direct <h6>Generating character</h6> (please do not generate another until this one is done!)");
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
          Fodder.luckyRoll.attr = values[2];
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

    resolveOccupation: function(values) {
      Fodder.occupation = values[0];
      occupation = values[0];

      var weapon = values[1].split('|');
      var weaponType = weapon[0];
      var weaponName = weapon[1];
      var weaponDamage = weapon[2];
      var weaponHands = weapon[3];
      var weaponRanges = weapon[4];
      var weaponRangedType = weapon[5];

      Fodder.weapon = {
        name: weaponName,
        damage: weaponDamage,
        attackType: weaponType,
        handedness: weaponHands
      };
      if (weaponType === 'ranged') {
        Fodder.weapon.ammo = randomInteger(6);
      } else if (weaponType === 'both') {
        Fodder.weapon.ammo = 1; // ie. dagger, handaxe
      }
      if (weaponType === 'ranged' || weaponType === 'both') {
        Fodder.weapon.rangedType = 'Missile';
        if (weaponRangedType === 'Thrown') {
          Fodder.weapon.rangedType = 'Thrown';
        }
        Fodder.weapon.rangedDistance = weaponRanges;
      }
      Fodder.trade = values[2];
    },

    rollOccupation: function () {
      var occupation = "";
      sendChat("API", "/roll 1t[" + Fodder.OccupationTable + "]", function (result) {
        var content = JSON.parse(result[0].content);
        var values = content.rolls[0].results[0].tableItem.name.split(':');
        Fodder.occupation = values[0];
        occupation = values[0];

        /*
         * Find all entries that need to be re-evaluated
         * ie: $subtable-Farmer-Core:melee|Pitchfork|1d8|1||:$subtable-Farm-Animals-Core
         */
        var indicesNeedingEval = [];
        _.each(values, function(value, index) {
          var subtableRegexp = new RegExp(/^\$subtable-(.*)$/);

          var match = subtableRegexp.exec(values[index]);
          if (match !== undefined && match !== null) {
            indicesNeedingEval.push(index);
          }
        });

        /*
         * Build the command to evaluate the subtables all at once
         * ie: [[1t[Farmer-Core]]] [[1t[Farm-Animals-Core]]]
         */
        var evalString = _.map(indicesNeedingEval, function(index) {
          var subtableRegexp = new RegExp(/^\$subtable-(.*)$/);
          var match = subtableRegexp.exec(values[index]);
          return `[[1t[${match[1]}]]]`;
        }).join(" ");

        if (evalString) {
          /*
           * Evaluate the subtable rolls and replace the values with the results
           */
          const command = `/roll ${evalString}`;
          sendChat("API", command, function(result) {
            var content = JSON.parse(result[0].content);
            var rollResults = _.map(result[0].inlinerolls, function(roll) {
              return roll.results.rolls[0].results[0].tableItem.name;
            });
            _.each(indicesNeedingEval, function(valuesIndex, rollIndex) {
              values[valuesIndex] = rollResults[rollIndex];
            });
            Fodder.resolveOccupation(values);
          });
        } else {
          Fodder.resolveOccupation(values);
        }
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
      const workerOptions = ["current", "max"];
      let createObjWithWorker = function(type, options) {
        return createObj(type, _.omit(options, workerOptions)).setWithWorker(_.pick(options, workerOptions));
      };
      var character = createObj("character", {
          avatar: Fodder.defaultAvatar,
          name: Fodder.name,
          bio: "",
          gmnotes: "Player: " + Fodder.player + "<br>Generated by script Fodderator.js version " + Fodder.version,
          archived: false,
          inplayerjournals: "all",
          controlledby: Fodder.id
      });

      createObjWithWorker('attribute', {
          name: 'player_name',
          current: Fodder.player,
          characterid: character.id
      });
      createObjWithWorker('attribute', {
          name: 'Name',
          current: Fodder.name,
          characterid: character.id
      });
      createObjWithWorker('attribute', {
          name: 'Languages',
          current: 'Common',
          characterid: character.id
      });
      createObjWithWorker('attribute', {
          name: 'Speed',
          current: 30,
          characterid: character.id
      });
      createObjWithWorker('attribute', {
          name: 'Level',
          current: '0',
          max: '10',
          characterid: character.id
      });
      createObjWithWorker('attribute', {
          name: 'XP',
          current: 0,
          max: 10,
          characterid: character.id
      });
      createObjWithWorker('attribute', {
          name: 'str',
          current: Fodder.strength,
          max: Fodder.strength,
          characterid: character.id
      });
      createObjWithWorker('attribute', {
        name: 'agi',
        current: Fodder.agility,
        max: Fodder.agility,
        characterid: character.id
      });
      createObjWithWorker('attribute', {
          name: 'sta',
          current: Fodder.stamina,
          max: Fodder.stamina,
          characterid: character.id
      });
      createObjWithWorker('attribute', {
          name: 'per',
          current: Fodder.personality,
          max: Fodder.personality,
          characterid: character.id
      });
      createObjWithWorker('attribute', {
          name: 'int',
          current: Fodder.intelligence,
          max: Fodder.intelligence,
          characterid: character.id
      });
      createObjWithWorker('attribute', {
          name: 'luck',
          current: Fodder.luck,
          max: Fodder.luck,
          characterid: character.id
      });
      createObjWithWorker('attribute', {
          name: 'strMax',
          current: Fodder.strength,
          characterid: character.id
      });
      createObjWithWorker('attribute', {
          name: 'agiMax',
          current: Fodder.agility,
          characterid: character.id
      });
      createObjWithWorker('attribute', {
          name: 'staMax',
          current: Fodder.stamina,
          characterid: character.id
      });
      createObjWithWorker('attribute', {
          name: 'perMax',
          current: Fodder.personality,
          characterid: character.id
      });
      createObjWithWorker('attribute', {
          name: 'intMax',
          current: Fodder.intelligence,
          characterid: character.id
      });
      createObjWithWorker('attribute', {
          name: 'luckMax',
          current: Fodder.luck,
          characterid: character.id
      });
      createObjWithWorker('attribute', {
        name: 'luckStarting',
        current: Fodder.luck,
        max: Fodder.luck,
        characterid: character.id
      });
      createObjWithWorker('attribute', {
          name: 'HP',
          current: Fodder.hp,
          max: Fodder.hp,
          characterid: character.id
      });
      createObjWithWorker('attribute', {
          name: 'CP',
          current: Fodder.cp,
          characterid: character.id
      });
      createObjWithWorker('attribute', {
          name: 'BirthAugur',
          current: Fodder.luckyRoll.birthAugur,
          characterid: character.id
      });
      createObjWithWorker('attribute', {
          name: 'LuckyRoll',
          current: Fodder.luckyRoll.detail,
          characterid: character.id
      });
      if (Fodder.luckyRoll.attr && Fodder.luckyRoll.attr.indexOf("special") === -1) {
        createObjWithWorker('attribute', {
          name: Fodder.luckyRoll.attr,
          current: Fodder.luckyRoll.attr === 'armorClassLuckyRoll' ? "on" : "[[@{luckStartingMod}]]",
          characterid: character.id
        });
      }
      if (typeof Fodder.race != "undefined") {
        createObjWithWorker('attribute', {
            name: 'Race',
            current: Fodder.race,
            characterid: character.id
        });
      }
      createObjWithWorker('attribute', {
          name: 'Occupation',
          current: Fodder.occupation,
          characterid: character.id
      });
      if (Fodder.weapon.attackType === 'melee' || Fodder.weapon.attackType === 'both') {
          const rowId = Fodder.generateRowID();
          const prefix = `repeating_meleeweapon_${rowId}`;
          createObjWithWorker('attribute', {
              name: `${prefix}_meleeWeaponName`,
              current: Fodder.weapon.name,
              characterid: character.id
          });
          createObjWithWorker('attribute', {
              name: `${prefix}_meleeDmg`,
              current: Fodder.weapon.damage,
              characterid: character.id
          });
          createObjWithWorker('attribute', {
              name: `${prefix}_meleeAttackWielded`,
              current: Fodder.weapon.handedness,
              characterid: character.id
          });
          if (Fodder.luckyRoll.attr === "special_zeroWeaponLuckyRoll") {
            createObjWithWorker('attribute', {
                name: `${prefix}_zeroWeaponLuckyRoll`,
                current: "@{luckStartingMod}",
                characterid: character.id
            });
          }
      }
      if (Fodder.weapon.attackType === 'ranged' || Fodder.weapon.attackType === 'both') {
          const rowId = Fodder.generateRowID();
          const prefix = `repeating_rangedweapon_${rowId}`;
          createObjWithWorker('attribute', {
              name: `${prefix}_rangedAmmo`,
              current: Fodder.weapon.ammo,
              characterid: character.id
          });
          createObjWithWorker('attribute', {
              name: `${prefix}_rangedWeaponName`,
              current: Fodder.weapon.name,
              characterid: character.id
          });
          const [distShort, distMed, distLong] = Fodder.weapon.rangedDistance.split('/');
          createObjWithWorker('attribute', {
              name: `${prefix}_rangedDistanceShort`,
              current: distShort,
              characterid: character.id
          });
          createObjWithWorker('attribute', {
              name: `${prefix}_rangedDistanceMed`,
              current: distMed,
              characterid: character.id
          });
          createObjWithWorker('attribute', {
              name: `${prefix}_rangedDistanceLong`,
              current: distLong,
              characterid: character.id
          });
          createObjWithWorker('attribute', {
              name: `${prefix}_rangedDmg`,
              current: Fodder.weapon.damage,
              characterid: character.id
          });
          if (Fodder.luckyRoll.attr === "special_zeroWeaponLuckyRoll") {
            createObjWithWorker('attribute', {
                name: `${prefix}_zeroRangedWeaponLuckyRoll`,
                current: "@{luckStartingMod}",
                characterid: character.id
            });
          }
          createObjWithWorker('attribute', {
            name: `${prefix}_rangedAttackDice`,
            current: "d20",
            characterid: character.id
          });
          createObjWithWorker('attribute', {
            name: `${prefix}_rangedWeaponType`,
            current: Fodder.weapon.rangedType,
            characterid: character.id
          });
      }
      createObjWithWorker('attribute', {
          name: 'Equipment',
          current: Fodder.trade + "\n" + Fodder.equipment,
          characterid: character.id
      });
      createObjWithWorker('attribute', {
          name: '_charsheetVersion',
          current: Fodder.sheetVersion,
          characterid: character.id
      });
    },

    generateUUID: (function() {
        "use strict";

        var a = 0, b = [];
        return function() {
            var c = (new Date()).getTime() + 0, d = c === a;
            a = c;
            for (var e = new Array(8), f = 7; 0 <= f; f--) {
                e[f] = "-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz".charAt(c % 64);
                c = Math.floor(c / 64);
            }
            c = e.join("");
            if (d) {
                for (f = 11; 0 <= f && 63 === b[f]; f--) {
                    b[f] = 0;
                }
                b[f]++;
            } else {
                for (f = 0; 12 > f; f++) {
                    b[f] = Math.floor(64 * Math.random());
                }
            }
            for (f = 0; 12 > f; f++){
                c += "-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz".charAt(b[f]);
            }
            return c;
        };
    }()),

    generateRowID: function () {
        "use strict";
        return Fodder.generateUUID().replace(/_/g, "Z");
    }

};

on("ready", function () {
    Fodder.listen();
});
