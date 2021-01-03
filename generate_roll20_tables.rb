#!/usr/bin/env ruby

# Reads the .yml files in ./data/ and emits !import-table commands to be used
# in roll20

require 'yaml'

class Fodder
  WEAPONS_TABLE_FILE="./data/weapons.yml"
  OCCUPATIONS_TABLE_FILE="./data/occupations.yml"
  BIRTH_AUGUR_TABLE_FILE="./data/birth_augur.yml"
  EQUIPMENT_TABLE_FILE="./data/equipment.yml"
  WEAPONS = YAML.load_file(WEAPONS_TABLE_FILE)

  def build_weapons_table
    result = ""
    table_name = "Weapons-Core"
    result += "!import-table --#{table_name} --show\n"
    weapons = YAML.load_file(WEAPONS_TABLE_FILE)
    weapons.each do |weapon|
      str_bonus = weapon["str_bonus"] ? "Thrown" : "Normal"
      ranged_data = weapon["ranges"] ? weapon["ranges"].values.sort.join("/") : ""
      item = [weapon["type"], weapon["name"], weapon["dmg_die"], weapon["hands"], ranged_data, str_bonus].join("|");
      result += "!import-table-item --#{table_name} --#{item} --1 --\n"
    end
    result
  end

  def build_weapon_item(weapon, name=nil)
    str_bonus = weapon["str_bonus"] ? "Thrown" : weapon["type"] == "melee" ? "" : "Normal"
    ranged_data = weapon["ranges"] ? weapon["ranges"].values.sort.join("/") : ""
    name ||= weapon["name"]
    [weapon["type"], name, weapon["dmg_die"], weapon["hands"], ranged_data, str_bonus].join("|");
  end

  def find_weapon(name, theme)
    result = WEAPONS["Weapons-#{theme}"].find { |weapon| weapon["name"].downcase == name.downcase }
    raise "Weapon not found under theme '#{theme}': #{name}" unless result
    result
  end

  def build_birth_augur_table
    result = ""
    table_name = "Birth-Augur-Lucky-Roll-Core"
    result += "!import-table --#{table_name} --show\n"
    augurs = YAML.load_file(BIRTH_AUGUR_TABLE_FILE)["Birth-Augur-Lucky-Roll-Core"].flatten
    augurs.each do |augur|
      item = %w[birth_augur lucky_roll attr].map{|key| augur[key]}.join(":")
      result += "!import-table-item --#{table_name} --#{item} --1 --\n"
    end
    result
  end

  def build_equipment_table(theme)
    result = ""
    table_name = "Equipment-#{theme}"
    result += "!import-table --#{table_name} --show\n"
    equipment = YAML.load_file(EQUIPMENT_TABLE_FILE)["Equipment-#{theme}"].flatten
    equipment.each do |e|
      result += "!import-table-item --#{table_name} --#{e} --1 --\n"
    end
    result
  end

  def build_occupations_table(theme, weapons_theme: "Core")
    result = ""
    table_name = "Occupations-#{theme}"
    result += "!import-table --#{table_name} --show\n"
    occupations = YAML.load_file(OCCUPATIONS_TABLE_FILE)["Occupations-#{theme}"].flatten
    occupations.each do |occupation|
      weapon = occupation["starting_weapon"]
      if weapon =~ /(.*) \(as (.*)\)/
        weapon_alias = $1
        weapon = $2
      end
      weapon_data = build_weapon_item(find_weapon(weapon, weapons_theme), weapon_alias)
      item = [occupation["occupation"], weapon_data, occupation["trade_item"]].join(":")
      result += "!import-table-item --#{table_name} --#{item} --#{occupation["weight"] || 1} --\n"
    end
    result
  end

  def write_table(table_prefix, theme, data)
    File.write("./tables/individual/#{table_prefix}-#{theme}.txt", data)
  end
end

fodder = Fodder.new

fodder.write_table("Birth-Augur-Lucky-Roll", "Core", fodder.build_birth_augur_table)
fodder.write_table("Equipment", "Core", fodder.build_equipment_table("Core"))
fodder.write_table("Equipment", "CUaBM", fodder.build_equipment_table("CUaBM"))
fodder.write_table("Occupations", "Core", fodder.build_occupations_table("Core"))
fodder.write_table("Occupations", "Crawl", fodder.build_occupations_table("Crawl"))
fodder.write_table("Occupations", "CUaBM", fodder.build_occupations_table("CUaBM", weapons_theme: "CUaBM"))

# build the global file:
`ls tables/individual/*.txt | xargs cat > tables/Global.txt`
