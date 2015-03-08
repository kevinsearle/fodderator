# Fodderator
A DCC RPG 0-level funnel character generator API script for use in the Roll20 VTT.

## Usage
When the script is run, it rolls some dice and rolls on some Rollable Tables (see below) that the Judge provides. You end up with a pre-filled character sheet. The assumption is made that the Judge is using either the official DCC RPG used in Roll20 or a custom character sheet that uses the same field names. If the field names are different, you'll either need to edit the sheet or this script.

There are two main ways to generate characters with Fodderator:

1. In the Roll20 chat window type the following and press enter:

    !fodder charactername.
    
1. Create a macro that the players can then click on (see below).

### Rollable Tables
These are used to randomly select occupations, starting equipment, birth augur and optionally races. While a separate race isn't typically chosen in DCC, it was for the campaign I used the script on so the support is there. Just copy and paste the contents of the files in the *tables* folder into the chat on Roll20. You won't see a message or reponse from Roll20. Check to see if it exists in Rollable Tables and try not to do this multiple times per table. I've noticed some odd behavior with Roll20 trying to re-insert table data.

In order for a table to be used it must be named one of the following:

* Occupations
* Birth-Augur-Lucky-Roll
* Equipment
* Races (optional)

If a table doesn't exist with the correct name, that part of the character isn't created. For example, if you don't populate a table called Occupations, characters you create with the script won't include an occupation.

The tables included were used in a campaign that I was running when I wrote this script. They aren't "vanilla" DCC RPG, so adjust as you need to. Not having a rollable table in your Roll20 campaign that correspondes to the names.

#### Birth Augur Table

The data in this table follows a specific format: string:string. The first string is the flavor text for a Birth Augur, e.g. "Harsh Winter'. The string after the colon symbol is mechanical text, e.g. "All attack rolls".

### Setting up a macro for your players
I've found the easiest way to get your players rolling up characters the fastest is to create a macro in Roll20. All they need to do after that is click the button and give the character a name.

1. Create a Roll20 macro
1. Put the following text in it:

    !fodder ?{Character name (can be changed later)|New Character}
    
1. Save the macro.
1. Players can go to the macro section and select "in bar".
1. Players then click the macro and give it a name at the prompt.
1. The character is given a character sheet and now shows up in the Journal!

