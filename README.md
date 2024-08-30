# Modded Beepbox: SOURCE

## The Source

Modbox: Source is a decompilation project undertaken by Neptendo, with assistance from LeoV. Intended to 
decompile [Modbox Beta's](https://github.com/ModdedBeepbox/beta) javascript code into Beepbox's Typescript files.
Through this basically all of Modded Beepbox's secrets locked behind a javascript key are now released to the world.

## Modded Beepbox

Modbox is an online tool for sketching and sharing instrumental melodies.
Try it out [here](https://moddedbeepbox.github.io/)!

All song data is packaged into the URL at the top of your browser. When you make
changes to the song, the URL is updated to reflect your changes. When you are
satisfied with your song, just copy and paste the URL to save and share your
song!

Modbox was a passion project, and will remain free to use.
If you find it valuable and have the means, any gratuity to
[John Nesky](http://www.johnnesky.com/) for his work on Beepbox through his
[PayPal](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=QZJTX9GRYEV9N&currency_code=USD) would be appreciated!

BeepBox is developed by John Nesky. This source
code is available under the [MIT license](LICENSE.md).

Modded Beepbox was originally developed by [Theepicosity, DAzombieRE, and Quirby64](https://github.com/ModdedBeepbox)

## Compiling

Due to how old ModBox was, it was built off of the back of an old version of Beepbox.
Because of this, compiling will be a lot different to what one may expect.

The code is written in an older version of TypeScript, which requires Node & npm so
[install those first](https://nodejs.org/en/download). To contribute changes,
you'll also need [git](https://github.com/git-guides/install-git). 
Then to build this project, open the command line and run:
```
npm install typescript@2.7.1 uglify-js@2.8.22
MSYS_NO_PATHCONV=1 ./compile_beepbox_editor.sh
```
(Note: MSYS_NO_PATHCONV=1 only applies to Windows machines.)

## Code

The [ts/](ts) folder contains all the code of Modded Beepbox, including its synth.ts.
The synth is required to play Beepbox songs out loud, and you could use this code in your own projects, like a web
game. After compiling the synth code, open website/synth_example.html to see a
demo using it. To rebuild just the synth code, run:

```
MSYS_NO_PATHCONV=1 ./compile_beepbox_synth.sh
```

The editor.ts file has additional code to display the online song
editor interface. After compiling the editor code, open website/index.html to
see the editor interface. To rebuild just the editor code, run:

```
MSYS_NO_PATHCONV=1 ./compile_beepbox_editor.sh
```

The [beepbox-synth/](beepbox-synth) folder contains index.html files to view the interfaces.
The build process outputs JavaScript files into this folder.

## Dependencies

Most of the dependencies are listed in [package.json](package.json), although
I'd like to note that BeepBox also has an indirect, optional dependency on
[lamejs](https://www.npmjs.com/package/lamejs) via
[jsdelivr](https://www.jsdelivr.com/) for exporting .mp3 files. If the user
attempts to export an .mp3 file, BeepBox will direct the browser to download
that dependency on demand.
