# Fodderator
A DCC RPG 0-level funnel character generator API script for use in the Roll20 VTT.

## Usage
When the script is run, it rolls some dice and rolls on some Rollable Tables (see below) that the Judge provides. You end up with a pre-filled character sheet. The assumption is made that the Judge is using either the official DCC RPG used in Roll20 or a custom character sheet that uses the same field names. If the field names are different, you'll either need to edit the sheet or this script.

To generate a character, in the Roll20 chat window type the following and press enter:

    !fodder CAMPAIGNTYPE

CAMPAIGNTYPE determines the set of tables to use to determine occupations, equipment, etc.

Currently available types:

* core - The default DCC character options.
* crawl - Options from the Crawl! zine.
* brokenmoon - Crawling Under A Broken Moon zine options.

Examples:
!fodder core
!fodder crawl

### Macros

It's suggested that a Judge create a macro that the players can then click on or run. You can easily specify your campaign type this way.

### Rollable Tables
These are used to randomly select occupations, starting equipment, birth augur and optionally races. Just copy and paste the contents of the files that you want from the *tables* folder into the chat on Roll20. You won't see a message or response from Roll20. At a minimum, the core tables must be entered: Occupations-Core, Birth-Augur-Lucky-Roll-Core, and Equipment-Core.

If a table doesn't exist with the correct name, that part of the character isn't created. For example, if you don't import an equipment table, characters you create with the script won't include results from an equipment roll.

### Setting up a macro for your players
I've found the easiest and fastest way to get your players rolling up characters is to create a macro in Roll20. All they need to do after that is click the button and give the character a name.

Example of setting a macro up for the core rules:

1. Create a Roll20 macro
1. Put the following text in it:

    !fodder core

1. Set Visible To Players to All Players.
1. Click Save Changes.
1. Players can go to the macro section and select "in bar".
1. Players then click the macro and give it a name at the prompt.
1. The character is given a character sheet and now shows up in the Journal!
