# Fodderator
A DCC RPG 0-level funnel character generator API script for use in the Roll20 VTT.

## Usage
When the script is run, it rolls some dice and rolls on some Rollable Tables (see below) that the Judge provides. You end up with a pre-filled character sheet. The assumption is made that the Judge is using either the official DCC RPG used in Roll20 or a custom character sheet that uses the same field names. If the field names are different, you'll either need to edit the sheet or this script.

There are two main ways to generate characters with Fodderator:

1. In the Roll20 chat window type the following and press enter:

    !fodder charactername.
    
1. Create a macro that the players can then click on.

### Setting up a macro for your players
I've found the easiest way to get your players rolling up characters the fastest is to create a macro in Roll20. All they need to do after that is click the button and give the character a name.

1. Create a Roll20 macro
1. Put the following text in it:

    !fodder ?{Character name (can be changed later)|New Character}
    
1. Save the macro.
1. Players can go to the macro section and select "in bar".
1. Players then click the macro and give it a name at the prompt.
1. The character is given a character sheet and now shows up in the Journal!

