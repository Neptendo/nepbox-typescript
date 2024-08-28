// Copyright (c) 2012-2022 John Nesky and contributing authors, distributed under the MIT license, see accompanying the LICENSE.md file.

import { HTML } from "imperative-html/dist/esm/elements-strict";
import {DictionaryArray, BeepBoxOption, toNameMap} from "../synth/SynthConfig";
import { Song } from "../synth/synth";

export interface ChannelColors extends BeepBoxOption {
    readonly secondaryChannel: string;
    readonly primaryChannel: string;
    readonly secondaryNote: string;
    readonly primaryNote: string;
}


export class ColorConfig {
	public static colorLookup: Map<number, ChannelColors> = new Map<number, ChannelColors>();
	public static usesPianoScheme: boolean = false;
	private static readonly _themeMap: {[K: string]: string} = {
		"default": `
            :root {
				--page-margin: black;
				--editor-background: black;
				--hover-preview: white;
				--playhead: white;
				--primary-text: white;
				--secondary-text: #999;
				--inverted-text: black;
				--text-selection: rgba(119,68,255,0.99);
				--box-selection-fill: rgba(255,255,255,0.2);
				--loop-accent: #9900cc;
				--link-accent: #98f;
				--ui-widget-background: #363636;
				--ui-widget-focus: #777;
				--pitch-background: #444;
				--tonic: #864;
				--fifth-note: #468;
                --volume-icon: #777777;
				--octave-scrollbar: #444;
				--scrollbar-octave: #864;
				--channel-box: #444;

				--pitch1-secondary-channel: #0099a1;
				--pitch1-primary-channel:   #25f3ff;
				--pitch1-secondary-note:    #0099a1;
				--pitch1-primary-note:      #25f3ff;
				--pitch2-secondary-channel: #439143;
				--pitch2-primary-channel:   #44ff44;
				--pitch2-secondary-note:    #439143;
				--pitch2-primary-note:      #44ff44;
				--pitch3-secondary-channel: #a1a100;
				--pitch3-primary-channel:   #ffff25;
				--pitch3-secondary-note:    #a1a100;
				--pitch3-primary-note:      #ffff25;
				--pitch4-secondary-channel: #c75000;
				--pitch4-primary-channel:   #ff9752;
				--pitch4-secondary-note:    #c75000;
				--pitch4-primary-note:      #ff9752;
				--pitch5-secondary-channel: #d020d0;
				--pitch5-primary-channel:   #FF90FF;
				--pitch5-secondary-note:    #d020d0;
				--pitch5-primary-note:      #ff90ff;
				--pitch6-secondary-channel: #552377;
				--pitch6-primary-channel:   #9f31ea;
				--pitch6-secondary-note:    #552377;
				--pitch6-primary-note:      #9f31ea;
				--pitch7-secondary-channel: #221b89;
				--pitch7-primary-channel:   #2b6aff;
				--pitch7-secondary-note:    #221b89;
				--pitch7-primary-note:      #2b6aff;
				--pitch8-secondary-channel: #00995f;
				--pitch8-primary-channel:   #00ff9f;
				--pitch8-secondary-note:    #00995f;
				--pitch8-primary-note:      #00ff9f;
				--pitch9-secondary-channel: #d6b03e;
				--pitch9-primary-channel:   #ffbf00;
				--pitch9-secondary-note:    #d6b03e;
				--pitch9-primary-note:      #ffbf00;
				--pitch10-secondary-channel:#b25915;
				--pitch10-primary-channel:  #d85d00;
				--pitch10-secondary-note:   #b25915;
				--pitch10-primary-note:     #d85d00;

				--pitch11-secondary-channel:#891a60;
				--pitch11-primary-channel:  #ff00a1;
				--pitch11-secondary-note:   #891a60;
				--pitch11-primary-note:     #ff00a1;

				--pitch12-secondary-channel:#965cbc;
				--pitch12-primary-channel:  #c26afc;
				--pitch12-secondary-note:   #965cbc;
				--pitch12-primary-note:     #c26afc;

				--noise1-secondary-channel: #991010;
				--noise1-primary-channel:   #ff1616;
				--noise1-secondary-note:    #991010;
				--noise1-primary-note:      #ff1616;
				--noise2-secondary-channel: #aaaaaa;
				--noise2-primary-channel:   #ffffff;
				--noise2-secondary-note:    #aaaaaa;
				--noise2-primary-note:      #ffffff;
				--noise3-secondary-channel: #5869BD;
				--noise3-primary-channel:   #768dfc;
				--noise3-secondary-note:    #5869BD;
				--noise3-primary-note:      #768dfc;
				--noise4-secondary-channel: #7c9b42;
				--noise4-primary-channel:   #a5ff00;
				--noise4-secondary-note:    #7c9b42;
				--noise4-primary-note:      #a5ff00;
            }
        `,
		"nepbox": `
            :root {
				--page-margin: black;
				--editor-background: black;
				--hover-preview: white;
				--playhead: white;
				--primary-text: #00fff5;
				--secondary-text: #999;
				--inverted-text: black;
				--text-selection: rgba(119,68,255,0.99);
				--box-selection-fill: rgba(255,255,255,0.2);
				--loop-accent: #00fff5;
				--link-accent: #98f;
				--ui-widget-background: #363636;
				--ui-widget-focus: #777;
				--pitch-background: #0a2d44;
				--tonic: #9150ff;
				--fifth-note: #990000;
                --volume-icon: #00fff5;
				--octave-scrollbar: #484848;
				--scrollbar-octave: #9150ff;
				--channel-box: #444;

				--pitch1-secondary-channel: #c13cbf;
				--pitch1-primary-channel: #f75dff;
				--pitch1-secondary-note: #b930a2;
				--pitch1-primary-note: #fca5ff;
				--pitch2-secondary-channel: #800000;
				--pitch2-primary-channel: #f00;
				--pitch2-secondary-note: #8c2121;
				--pitch2-primary-note: #ff5252;
				--pitch3-secondary-channel: #004bb3;
				--pitch3-primary-channel: #1792ff;
				--pitch3-secondary-note: #005cb3;
				--pitch3-primary-note: #00ffe9;
				--pitch4-secondary-channel: #a48800;
				--pitch4-primary-channel: #fb0;
				--pitch4-secondary-note: #9c4100;
				--pitch4-primary-note: #ffd84e;
				--pitch5-secondary-channel: #6c0000;
				--pitch5-primary-channel:   #ff3e3e;
				--pitch5-secondary-note:    #6c0000;
				--pitch5-primary-note:      #ff3e3e;
				--pitch6-secondary-channel:#d25a00;
				--pitch6-primary-channel:  #fdff00;
				--pitch6-secondary-note:   #d25a00;
				--pitch6-primary-note:     #fdff00;
				--pitch7-secondary-channel: #046000;
				--pitch7-primary-channel:   #0c79ff;
				--pitch7-secondary-note:    #046000;
				--pitch7-primary-note:      #0c79ff;
				--pitch8-secondary-channel:#3b2bae;
				--pitch8-primary-channel:  #d85d00;
				--pitch8-secondary-note:   #3b2bae;
				--pitch8-primary-note:     #d85d00;
				--pitch9-secondary-channel: #d6b03e;
				--pitch9-primary-channel:   #ffbf00;
				--pitch9-secondary-note:    #d6b03e;
				--pitch9-primary-note:      #ffbf00;
				--pitch10-secondary-channel:#b25915;
				--pitch10-primary-channel:  #d85d00;
				--pitch10-secondary-note:   #b25915;
				--pitch10-primary-note:     #d85d00;
				--pitch11-secondary-channel:#891a60;
				--pitch11-primary-channel:  #ff00a1;
				--pitch11-secondary-note:   #891a60;
				--pitch11-primary-note:     #ff00a1;
				--pitch12-secondary-channel:#965cbc;
				--pitch12-primary-channel:  #c26afc;
				--pitch12-secondary-note:   #965cbc;
				--pitch12-primary-note:     #c26afc;
				--noise1-secondary-channel: #868686;
				--noise1-primary-channel: #fff;
				--noise1-secondary-note: #868686;
				--noise1-primary-note: #fff;
				--noise2-secondary-channel: #805300;
				--noise2-primary-channel: #ff8c00;
				--noise2-secondary-note: #6a3500;
				--noise2-primary-note: #a85400;
				--noise3-secondary-channel: #5869BD;
				--noise3-primary-channel:   #768dfc;
				--noise3-secondary-note:    #5869BD;
				--noise3-primary-note:      #768dfc;
				--noise4-secondary-channel: #7c9b42;
				--noise4-primary-channel:   #a5ff00;
				--noise4-secondary-note:    #7c9b42;
				--noise4-primary-note:      #a5ff00;
            }
        `,
		"modbox2": `
            :root {
                --page-margin: black;
				--editor-background: black;
				--hover-preview: white;
				--playhead: white;
				--primary-text: white;
				--secondary-text: #999;
				--inverted-text: black;
				--text-selection: rgba(119,68,255,0.99);
				--box-selection-fill: rgba(255,255,255,0.2);
				--loop-accent: #00ff00;
				--link-accent: #98f;
				--ui-widget-background: #363636;
				--ui-widget-focus: #777;
				--pitch-background: #444;
				--tonic: #c4ffa3;
				--fifth-note: #96fffb;
                --volume-icon: #c4ffa3;
				--octave-scrollbar: #00ff00;
				--scrollbar-octave: #fff;
				--channel-box: #444;

				--pitch1-secondary-channel: #0099a1;
				--pitch1-primary-channel:   #25f3ff;
				--pitch1-secondary-note:    #0099a1;
				--pitch1-primary-note:      #25f3ff;
				--pitch2-secondary-channel: #439143;
				--pitch2-primary-channel:   #44ff44;
				--pitch2-secondary-note:    #439143;
				--pitch2-primary-note:      #44ff44;
				--pitch3-secondary-channel: #a1a100;
				--pitch3-primary-channel:   #ffff25;
				--pitch3-secondary-note:    #a1a100;
				--pitch3-primary-note:      #ffff25;
				--pitch4-secondary-channel: #c75000;
				--pitch4-primary-channel:   #ff9752;
				--pitch4-secondary-note:    #c75000;
				--pitch4-primary-note:      #ff9752;
				--pitch5-secondary-channel: #d020d0;
				--pitch5-primary-channel:   #FF90FF;
				--pitch5-secondary-note:    #d020d0;
				--pitch5-primary-note:      #ff90ff;
				--pitch6-secondary-channel: #552377;
				--pitch6-primary-channel:   #9f31ea;
				--pitch6-secondary-note:    #552377;
				--pitch6-primary-note:      #9f31ea;
				--pitch7-secondary-channel: #221b89;
				--pitch7-primary-channel:   #2b6aff;
				--pitch7-secondary-note:    #221b89;
				--pitch7-primary-note:      #2b6aff;
				--pitch8-secondary-channel: #00995f;
				--pitch8-primary-channel:   #00ff9f;
				--pitch8-secondary-note:    #00995f;
				--pitch8-primary-note:      #00ff9f;
				--pitch9-secondary-channel: #d6b03e;
				--pitch9-primary-channel:   #ffbf00;
				--pitch9-secondary-note:    #d6b03e;
				--pitch9-primary-note:      #ffbf00;
				--pitch10-secondary-channel:#b25915;
				--pitch10-primary-channel:  #d85d00;
				--pitch10-secondary-note:   #b25915;
				--pitch10-primary-note:     #d85d00;

				--pitch11-secondary-channel:#891a60;
				--pitch11-primary-channel:  #ff00a1;
				--pitch11-secondary-note:   #891a60;
				--pitch11-primary-note:     #ff00a1;

				--pitch12-secondary-channel:#965cbc;
				--pitch12-primary-channel:  #c26afc;
				--pitch12-secondary-note:   #965cbc;
				--pitch12-primary-note:     #c26afc;

				--noise1-secondary-channel: #991010;
				--noise1-primary-channel:   #ff1616;
				--noise1-secondary-note:    #991010;
				--noise1-primary-note:      #ff1616;
				--noise2-secondary-channel: #aaaaaa;
				--noise2-primary-channel:   #ffffff;
				--noise2-secondary-note:    #aaaaaa;
				--noise2-primary-note:      #ffffff;
				--noise3-secondary-channel: #5869BD;
				--noise3-primary-channel:   #768dfc;
				--noise3-secondary-note:    #5869BD;
				--noise3-primary-note:      #768dfc;
				--noise4-secondary-channel: #7c9b42;
				--noise4-primary-channel:   #a5ff00;
				--noise4-secondary-note:    #7c9b42;
				--noise4-primary-note:      #a5ff00;
            }
		`,
		"artic": `
		:root {
				--page-margin: black;
				--editor-background: black;
				--hover-preview: white;
				--playhead: white;
				--primary-text: white;
				--secondary-text: #999;
				--inverted-text: black;
				--text-selection: rgba(119,68,255,0.99);
				--box-selection-fill: rgba(255,255,255,0.2);
				--loop-accent: #ffffff;
				--link-accent: #98f;
				--ui-widget-background: #363636;
				--ui-widget-focus: #777;
				--pitch-background: #444;
				--tonic: #eafffe;
				--fifth-note: #b7f1ff;
				--octave-scrollbar: #a5eeff;
				--scrollbar-octave: #cefffd;
				--volume-icon: #42dcff;	

				--pitch1-secondary-channel: #0099a1;
				--pitch1-primary-channel:   #25f3ff;
				--pitch1-secondary-note:    #0099a1;
				--pitch1-primary-note:      #25f3ff;
				--pitch2-secondary-channel: #439143;
				--pitch2-primary-channel:   #44ff44;
				--pitch2-secondary-note:    #439143;
				--pitch2-primary-note:      #44ff44;
				--pitch3-secondary-channel: #a1a100;
				--pitch3-primary-channel:   #ffff25;
				--pitch3-secondary-note:    #a1a100;
				--pitch3-primary-note:      #ffff25;
				--pitch4-secondary-channel: #c75000;
				--pitch4-primary-channel:   #ff9752;
				--pitch4-secondary-note:    #c75000;
				--pitch4-primary-note:      #ff9752;
				--pitch5-secondary-channel: #d020d0;
				--pitch5-primary-channel:   #FF90FF;
				--pitch5-secondary-note:    #d020d0;
				--pitch5-primary-note:      #ff90ff;
				--pitch6-secondary-channel: #552377;
				--pitch6-primary-channel:   #9f31ea;
				--pitch6-secondary-note:    #552377;
				--pitch6-primary-note:      #9f31ea;
				--pitch7-secondary-channel: #221b89;
				--pitch7-primary-channel:   #2b6aff;
				--pitch7-secondary-note:    #221b89;
				--pitch7-primary-note:      #2b6aff;
				--pitch8-secondary-channel: #00995f;
				--pitch8-primary-channel:   #00ff9f;
				--pitch8-secondary-note:    #00995f;
				--pitch8-primary-note:      #00ff9f;
				--pitch9-secondary-channel: #d6b03e;
				--pitch9-primary-channel:   #ffbf00;
				--pitch9-secondary-note:    #d6b03e;
				--pitch9-primary-note:      #ffbf00;
				--pitch10-secondary-channel:#b25915;
				--pitch10-primary-channel:  #d85d00;
				--pitch10-secondary-note:   #b25915;
				--pitch10-primary-note:     #d85d00;
				--pitch11-secondary-channel:#891a60;
				--pitch11-primary-channel:  #ff00a1;
				--pitch11-secondary-note:   #891a60;
				--pitch11-primary-note:     #ff00a1;
				--pitch12-secondary-channel:#965cbc;
				--pitch12-primary-channel:  #c26afc;
				--pitch12-secondary-note:   #965cbc;
				--pitch12-primary-note:     #c26afc;
				--noise1-secondary-channel: #991010;
				--noise1-primary-channel:   #ff1616;
				--noise1-secondary-note:    #991010;
				--noise1-primary-note:      #ff1616;
				--noise2-secondary-channel: #aaaaaa;
				--noise2-primary-channel:   #ffffff;
				--noise2-secondary-note:    #aaaaaa;
				--noise2-primary-note:      #ffffff;
				--noise3-secondary-channel: #5869BD;
				--noise3-primary-channel:   #768dfc;
				--noise3-secondary-note:    #5869BD;
				--noise3-primary-note:      #768dfc;
				--noise4-secondary-channel: #7c9b42;
				--noise4-primary-channel:   #a5ff00;
				--noise4-secondary-note:    #7c9b42;
				--noise4-primary-note:      #a5ff00;
				}
		`,
		"Cinnamon Roll": `
		:root {
				--page-margin: black;
				--editor-background: black;
				--hover-preview: white;
				--playhead: white;
				--primary-text: white;
				--secondary-text: #999;
				--inverted-text: black;
				--text-selection: rgba(119,68,255,0.99);
				--box-selection-fill: rgba(255,255,255,0.2);
				--loop-accent: #ba8418;
				--link-accent: #98f;
				--ui-widget-background: #363636;
				--ui-widget-focus: #777;
				--pitch-background: #444;
				--pitch1-background: #f5bb00;
				--pitch2-background: #f5bb00;
				--pitch3-background: #f5bb00;
				--pitch4-background: #f5bb00;
				--pitch5-background: #f5bb00;
				--pitch6-background: #f5bb00;
				--pitch8-background: #f5bb00;
				--pitch9-background: #f5bb00;
				--pitch10-background: #f5bb00;
				--pitch11-background: #f5bb00;
				--pitch12-background: #f5bb00;
				--tonic: #f5bb00;
				--fifth-note: #f5bb00;
				--volume-icon: #ba8418;	

				--octave-scrollbar: #e59900;
				--scrollbar-octave: #ffff25;

				--pitch1-secondary-channel: #0099a1;
				--pitch1-primary-channel:   #25f3ff;
				--pitch1-secondary-note:    #0099a1;
				--pitch1-primary-note:      #25f3ff;
				--pitch2-secondary-channel: #439143;
				--pitch2-primary-channel:   #44ff44;
				--pitch2-secondary-note:    #439143;
				--pitch2-primary-note:      #44ff44;
				--pitch3-secondary-channel: #a1a100;
				--pitch3-primary-channel:   #ffff25;
				--pitch3-secondary-note:    #a1a100;
				--pitch3-primary-note:      #ffff25;
				--pitch4-secondary-channel: #c75000;
				--pitch4-primary-channel:   #ff9752;
				--pitch4-secondary-note:    #c75000;
				--pitch4-primary-note:      #ff9752;
				--pitch5-secondary-channel: #d020d0;
				--pitch5-primary-channel:   #FF90FF;
				--pitch5-secondary-note:    #d020d0;
				--pitch5-primary-note:      #ff90ff;
				--pitch6-secondary-channel: #552377;
				--pitch6-primary-channel:   #9f31ea;
				--pitch6-secondary-note:    #552377;
				--pitch6-primary-note:      #9f31ea;
				--pitch7-secondary-channel: #221b89;
				--pitch7-primary-channel:   #2b6aff;
				--pitch7-secondary-note:    #221b89;
				--pitch7-primary-note:      #2b6aff;
				--pitch8-secondary-channel: #00995f;
				--pitch8-primary-channel:   #00ff9f;
				--pitch8-secondary-note:    #00995f;
				--pitch8-primary-note:      #00ff9f;
				--pitch9-secondary-channel: #d6b03e;
				--pitch9-primary-channel:   #ffbf00;
				--pitch9-secondary-note:    #d6b03e;
				--pitch9-primary-note:      #ffbf00;
				--pitch10-secondary-channel:#b25915;
				--pitch10-primary-channel:  #d85d00;
				--pitch10-secondary-note:   #b25915;
				--pitch10-primary-note:     #d85d00;
				--pitch11-secondary-channel:#891a60;
				--pitch11-primary-channel:  #ff00a1;
				--pitch11-secondary-note:   #891a60;
				--pitch11-primary-note:     #ff00a1;
				--pitch12-secondary-channel:#965cbc;
				--pitch12-primary-channel:  #c26afc;
				--pitch12-secondary-note:   #965cbc;
				--pitch12-primary-note:     #c26afc;
				--noise1-secondary-channel: #991010;
				--noise1-primary-channel:   #ff1616;
				--noise1-secondary-note:    #991010;
				--noise1-primary-note:      #ff1616;
				--noise2-secondary-channel: #aaaaaa;
				--noise2-primary-channel:   #ffffff;
				--noise2-secondary-note:    #aaaaaa;
				--noise2-primary-note:      #ffffff;
				--noise3-secondary-channel: #5869BD;
				--noise3-primary-channel:   #768dfc;
				--noise3-secondary-note:    #5869BD;
				--noise3-primary-note:      #768dfc;
				--noise4-secondary-channel: #7c9b42;
				--noise4-primary-channel:   #a5ff00;
				--noise4-secondary-note:    #7c9b42;
				--noise4-primary-note:      #a5ff00;
				}
		`,
		"Ocean": `
		:root {
				--page-margin: black;
				--editor-background: black;
				--hover-preview: white;
				--playhead: white;
				--primary-text: white;
				--secondary-text: #999;
				--inverted-text: black;
				--text-selection: rgba(119,68,255,0.99);
				--box-selection-fill: rgba(255,255,255,0.2);
				--loop-accent: #5982ff;
				--link-accent: #98f;
				--ui-widget-background: #363636;
				--ui-widget-focus: #777;
				--pitch-background: #444;
				--tonic: #090b3a;
				--fifth-note: #3f669b;
				--volume-icon: #090b3a;	

				--octave-scrollbar: #4449a3;
				--scrollbar-octave: #3dffdb;

				--pitch1-secondary-channel: #0099a1;
				--pitch1-primary-channel:   #25f3ff;
				--pitch1-secondary-note:    #0099a1;
				--pitch1-primary-note:      #25f3ff;
				--pitch2-secondary-channel: #439143;
				--pitch2-primary-channel:   #44ff44;
				--pitch2-secondary-note:    #439143;
				--pitch2-primary-note:      #44ff44;
				--pitch3-secondary-channel: #a1a100;
				--pitch3-primary-channel:   #ffff25;
				--pitch3-secondary-note:    #a1a100;
				--pitch3-primary-note:      #ffff25;
				--pitch4-secondary-channel: #c75000;
				--pitch4-primary-channel:   #ff9752;
				--pitch4-secondary-note:    #c75000;
				--pitch4-primary-note:      #ff9752;
				--pitch5-secondary-channel: #d020d0;
				--pitch5-primary-channel:   #FF90FF;
				--pitch5-secondary-note:    #d020d0;
				--pitch5-primary-note:      #ff90ff;
				--pitch6-secondary-channel: #552377;
				--pitch6-primary-channel:   #9f31ea;
				--pitch6-secondary-note:    #552377;
				--pitch6-primary-note:      #9f31ea;
				--pitch7-secondary-channel: #221b89;
				--pitch7-primary-channel:   #2b6aff;
				--pitch7-secondary-note:    #221b89;
				--pitch7-primary-note:      #2b6aff;
				--pitch8-secondary-channel: #00995f;
				--pitch8-primary-channel:   #00ff9f;
				--pitch8-secondary-note:    #00995f;
				--pitch8-primary-note:      #00ff9f;
				--pitch9-secondary-channel: #d6b03e;
				--pitch9-primary-channel:   #ffbf00;
				--pitch9-secondary-note:    #d6b03e;
				--pitch9-primary-note:      #ffbf00;
				--pitch10-secondary-channel:#b25915;
				--pitch10-primary-channel:  #d85d00;
				--pitch10-secondary-note:   #b25915;
				--pitch10-primary-note:     #d85d00;
				--pitch11-secondary-channel:#891a60;
				--pitch11-primary-channel:  #ff00a1;
				--pitch11-secondary-note:   #891a60;
				--pitch11-primary-note:     #ff00a1;
				--pitch12-secondary-channel:#965cbc;
				--pitch12-primary-channel:  #c26afc;
				--pitch12-secondary-note:   #965cbc;
				--pitch12-primary-note:     #c26afc;
				--noise1-secondary-channel: #991010;
				--noise1-primary-channel:   #ff1616;
				--noise1-secondary-note:    #991010;
				--noise1-primary-note:      #ff1616;
				--noise2-secondary-channel: #aaaaaa;
				--noise2-primary-channel:   #ffffff;
				--noise2-secondary-note:    #aaaaaa;
				--noise2-primary-note:      #ffffff;
				--noise3-secondary-channel: #5869BD;
				--noise3-primary-channel:   #768dfc;
				--noise3-secondary-note:    #5869BD;
				--noise3-primary-note:      #768dfc;
				--noise4-secondary-channel: #7c9b42;
				--noise4-primary-channel:   #a5ff00;
				--noise4-secondary-note:    #7c9b42;
				--noise4-primary-note:      #a5ff00;
				}
		`,
		"rainbow": `
		:root {
				--page-margin: black;
				--editor-background: black;
				--hover-preview: white;
				--playhead: white;
				--primary-text: white;
				--secondary-text: #999;
				--inverted-text: black;
				--text-selection: rgba(119,68,255,0.99);
				--box-selection-fill: rgba(255,255,255,0.2);
				--loop-accent: #ff0000;
				--link-accent: #98f;
				--ui-widget-background: #363636;
				--ui-widget-focus: #777;

				--pitch-background: #444; 
				--tonic: #ffaaaa; 
				--pitch1-background: #ffceaa; 
				--pitch2-background: #ffdfaa; 
				--pitch3-background: #fff5aa; 
				--pitch4-background: #e8ffaa;
				--pitch5-background: #bfffb2; 
				--pitch6-background: #b2ffc8; 
				--fifth-note: #b2ffe4; 
				--pitch8-background: #b2f3ff; 
				--pitch9-background: #b2b3ff; 
				--pitch10-background: #e0b2ff; 
				--pitch11-background: #ffafe9; 
				--octave-scrollbar: #43ff00; 
				--volume-icon: #ff00cb;	

				--octave-scrollbar: #43ff00;
				--scrollbar-octave: #0400ff;

				--pitch1-secondary-channel: #0099a1;
				--pitch1-primary-channel:   #25f3ff;
				--pitch1-secondary-note:    #0099a1;
				--pitch1-primary-note:      #25f3ff;
				--pitch2-secondary-channel: #439143;
				--pitch2-primary-channel:   #44ff44;
				--pitch2-secondary-note:    #439143;
				--pitch2-primary-note:      #44ff44;
				--pitch3-secondary-channel: #a1a100;
				--pitch3-primary-channel:   #ffff25;
				--pitch3-secondary-note:    #a1a100;
				--pitch3-primary-note:      #ffff25;
				--pitch4-secondary-channel: #c75000;
				--pitch4-primary-channel:   #ff9752;
				--pitch4-secondary-note:    #c75000;
				--pitch4-primary-note:      #ff9752;
				--pitch5-secondary-channel: #d020d0;
				--pitch5-primary-channel:   #FF90FF;
				--pitch5-secondary-note:    #d020d0;
				--pitch5-primary-note:      #ff90ff;
				--pitch6-secondary-channel: #552377;
				--pitch6-primary-channel:   #9f31ea;
				--pitch6-secondary-note:    #552377;
				--pitch6-primary-note:      #9f31ea;
				--pitch7-secondary-channel: #221b89;
				--pitch7-primary-channel:   #2b6aff;
				--pitch7-secondary-note:    #221b89;
				--pitch7-primary-note:      #2b6aff;
				--pitch8-secondary-channel: #00995f;
				--pitch8-primary-channel:   #00ff9f;
				--pitch8-secondary-note:    #00995f;
				--pitch8-primary-note:      #00ff9f;
				--pitch9-secondary-channel: #d6b03e;
				--pitch9-primary-channel:   #ffbf00;
				--pitch9-secondary-note:    #d6b03e;
				--pitch9-primary-note:      #ffbf00;
				--pitch10-secondary-channel:#b25915;
				--pitch10-primary-channel:  #d85d00;
				--pitch10-secondary-note:   #b25915;
				--pitch10-primary-note:     #d85d00;
				--pitch11-secondary-channel:#891a60;
				--pitch11-primary-channel:  #ff00a1;
				--pitch11-secondary-note:   #891a60;
				--pitch11-primary-note:     #ff00a1;
				--pitch12-secondary-channel:#965cbc;
				--pitch12-primary-channel:  #c26afc;
				--pitch12-secondary-note:   #965cbc;
				--pitch12-primary-note:     #c26afc;
				--noise1-secondary-channel: #991010;
				--noise1-primary-channel:   #ff1616;
				--noise1-secondary-note:    #991010;
				--noise1-primary-note:      #ff1616;
				--noise2-secondary-channel: #aaaaaa;
				--noise2-primary-channel:   #ffffff;
				--noise2-secondary-note:    #aaaaaa;
				--noise2-primary-note:      #ffffff;
				--noise3-secondary-channel: #5869BD;
				--noise3-primary-channel:   #768dfc;
				--noise3-secondary-note:    #5869BD;
				--noise3-primary-note:      #768dfc;
				--noise4-secondary-channel: #7c9b42;
				--noise4-primary-channel:   #a5ff00;
				--noise4-secondary-note:    #7c9b42;
				--noise4-primary-note:      #a5ff00;
				}
		`,
		"float": `
		:root {
				--page-margin: black;
				--editor-background: black;
				--hover-preview: white;
				--playhead: white;
				--primary-text: white;
				--secondary-text: #999;
				--inverted-text: black;
				--text-selection: rgba(119,68,255,0.99);
				--box-selection-fill: rgba(255,255,255,0.2);
				--loop-accent: #ff0000;
				--link-accent: #98f;
				--ui-widget-background: #363636;
				--ui-widget-focus: #777;
				--volume-icon: #878787;	

				--pitch-background: #444; 
				--tonic: #ffffff; 
				--pitch1-background: #ededed;  
				--pitch2-background: #cecece;  
				--pitch3-background: #bababa;  
				--pitch4-background: #afafaf;
				--pitch5-background: #a5a5a5; 
				--pitch6-background: #999999; 
				--fifth-note: #8e8e8e; 
				--pitch8-background: #828282; 
				--pitch9-background: #777777; 
				--pitch10-background: #565656; 
				--pitch11-background: #282828; 
				--octave-scrollbar: #ffffff; 
				--scrollbar-octave: #c9c9c9;

				--pitch1-secondary-channel: #0099a1;
				--pitch1-primary-channel:   #25f3ff;
				--pitch1-secondary-note:    #0099a1;
				--pitch1-primary-note:      #25f3ff;
				--pitch2-secondary-channel: #439143;
				--pitch2-primary-channel:   #44ff44;
				--pitch2-secondary-note:    #439143;
				--pitch2-primary-note:      #44ff44;
				--pitch3-secondary-channel: #a1a100;
				--pitch3-primary-channel:   #ffff25;
				--pitch3-secondary-note:    #a1a100;
				--pitch3-primary-note:      #ffff25;
				--pitch4-secondary-channel: #c75000;
				--pitch4-primary-channel:   #ff9752;
				--pitch4-secondary-note:    #c75000;
				--pitch4-primary-note:      #ff9752;
				--pitch5-secondary-channel: #d020d0;
				--pitch5-primary-channel:   #FF90FF;
				--pitch5-secondary-note:    #d020d0;
				--pitch5-primary-note:      #ff90ff;
				--pitch6-secondary-channel: #552377;
				--pitch6-primary-channel:   #9f31ea;
				--pitch6-secondary-note:    #552377;
				--pitch6-primary-note:      #9f31ea;
				--pitch7-secondary-channel: #221b89;
				--pitch7-primary-channel:   #2b6aff;
				--pitch7-secondary-note:    #221b89;
				--pitch7-primary-note:      #2b6aff;
				--pitch8-secondary-channel: #00995f;
				--pitch8-primary-channel:   #00ff9f;
				--pitch8-secondary-note:    #00995f;
				--pitch8-primary-note:      #00ff9f;
				--pitch9-secondary-channel: #d6b03e;
				--pitch9-primary-channel:   #ffbf00;
				--pitch9-secondary-note:    #d6b03e;
				--pitch9-primary-note:      #ffbf00;
				--pitch10-secondary-channel:#b25915;
				--pitch10-primary-channel:  #d85d00;
				--pitch10-secondary-note:   #b25915;
				--pitch10-primary-note:     #d85d00;
				--pitch11-secondary-channel:#891a60;
				--pitch11-primary-channel:  #ff00a1;
				--pitch11-secondary-note:   #891a60;
				--pitch11-primary-note:     #ff00a1;
				--pitch12-secondary-channel:#965cbc;
				--pitch12-primary-channel:  #c26afc;
				--pitch12-secondary-note:   #965cbc;
				--pitch12-primary-note:     #c26afc;
				--noise1-secondary-channel: #991010;
				--noise1-primary-channel:   #ff1616;
				--noise1-secondary-note:    #991010;
				--noise1-primary-note:      #ff1616;
				--noise2-secondary-channel: #aaaaaa;
				--noise2-primary-channel:   #ffffff;
				--noise2-secondary-note:    #aaaaaa;
				--noise2-primary-note:      #ffffff;
				--noise3-secondary-channel: #5869BD;
				--noise3-primary-channel:   #768dfc;
				--noise3-secondary-note:    #5869BD;
				--noise3-primary-note:      #768dfc;
				--noise4-secondary-channel: #7c9b42;
				--noise4-primary-channel:   #a5ff00;
				--noise4-secondary-note:    #7c9b42;
				--noise4-primary-note:      #a5ff00;
				}
		`,
		"windows": `
		:root {
				--page-margin: black;
				--editor-background: black;
				--hover-preview: white;
				--playhead: white;
				--primary-text: white;
				--secondary-text: #999;
				--inverted-text: black;
				--text-selection: rgba(119,68,255,0.99);
				--box-selection-fill: rgba(255,255,255,0.2);
				--loop-accent: #ff0000;
				--link-accent: #98f;
				--ui-widget-background: #363636;
				--ui-widget-focus: #777;
				--volume-icon: #15a0db;	

				--tonic: #da4e2a;
				--fifth-note: #5d9511;
				--pitch-background: #444;

				--octave-scrollbar: #295294; 
				--scrollbar-octave: #fdd01d;

				--pitch1-secondary-channel: #0099a1;
				--pitch1-primary-channel:   #25f3ff;
				--pitch1-secondary-note:    #0099a1;
				--pitch1-primary-note:      #25f3ff;
				--pitch2-secondary-channel: #439143;
				--pitch2-primary-channel:   #44ff44;
				--pitch2-secondary-note:    #439143;
				--pitch2-primary-note:      #44ff44;
				--pitch3-secondary-channel: #a1a100;
				--pitch3-primary-channel:   #ffff25;
				--pitch3-secondary-note:    #a1a100;
				--pitch3-primary-note:      #ffff25;
				--pitch4-secondary-channel: #c75000;
				--pitch4-primary-channel:   #ff9752;
				--pitch4-secondary-note:    #c75000;
				--pitch4-primary-note:      #ff9752;
				--pitch5-secondary-channel: #d020d0;
				--pitch5-primary-channel:   #FF90FF;
				--pitch5-secondary-note:    #d020d0;
				--pitch5-primary-note:      #ff90ff;
				--pitch6-secondary-channel: #552377;
				--pitch6-primary-channel:   #9f31ea;
				--pitch6-secondary-note:    #552377;
				--pitch6-primary-note:      #9f31ea;
				--pitch7-secondary-channel: #221b89;
				--pitch7-primary-channel:   #2b6aff;
				--pitch7-secondary-note:    #221b89;
				--pitch7-primary-note:      #2b6aff;
				--pitch8-secondary-channel: #00995f;
				--pitch8-primary-channel:   #00ff9f;
				--pitch8-secondary-note:    #00995f;
				--pitch8-primary-note:      #00ff9f;
				--pitch9-secondary-channel: #d6b03e;
				--pitch9-primary-channel:   #ffbf00;
				--pitch9-secondary-note:    #d6b03e;
				--pitch9-primary-note:      #ffbf00;
				--pitch10-secondary-channel:#b25915;
				--pitch10-primary-channel:  #d85d00;
				--pitch10-secondary-note:   #b25915;
				--pitch10-primary-note:     #d85d00;
				--pitch11-secondary-channel:#891a60;
				--pitch11-primary-channel:  #ff00a1;
				--pitch11-secondary-note:   #891a60;
				--pitch11-primary-note:     #ff00a1;
				--pitch12-secondary-channel:#965cbc;
				--pitch12-primary-channel:  #c26afc;
				--pitch12-secondary-note:   #965cbc;
				--pitch12-primary-note:     #c26afc;
				--noise1-secondary-channel: #991010;
				--noise1-primary-channel:   #ff1616;
				--noise1-secondary-note:    #991010;
				--noise1-primary-note:      #ff1616;
				--noise2-secondary-channel: #aaaaaa;
				--noise2-primary-channel:   #ffffff;
				--noise2-secondary-note:    #aaaaaa;
				--noise2-primary-note:      #ffffff;
				--noise3-secondary-channel: #5869BD;
				--noise3-primary-channel:   #768dfc;
				--noise3-secondary-note:    #5869BD;
				--noise3-primary-note:      #768dfc;
				--noise4-secondary-channel: #7c9b42;
				--noise4-primary-channel:   #a5ff00;
				--noise4-secondary-note:    #7c9b42;
				--noise4-primary-note:      #a5ff00;
				}
		`,
		"grassland": `
		:root {
				--page-margin: black;
				--editor-background: black;
				--hover-preview: white;
				--playhead: white;
				--primary-text: white;
				--secondary-text: #999;
				--inverted-text: black;
				--text-selection: rgba(119,68,255,0.99);
				--box-selection-fill: rgba(255,255,255,0.2);
				--loop-accent: #a0d168;
				--link-accent: #98f;
				--ui-widget-background: #363636;
				--ui-widget-focus: #777;
				--volume-icon: #74bc21;	

				--tonic: #20330a;
				--fifth-note: #74bc21;
				--pitch-background: #444;

				--octave-scrollbar: #74bc21; 
				--scrollbar-octave: #20330a;

				--pitch1-secondary-channel: #0099a1;
				--pitch1-primary-channel:   #25f3ff;
				--pitch1-secondary-note:    #0099a1;
				--pitch1-primary-note:      #25f3ff;
				--pitch2-secondary-channel: #439143;
				--pitch2-primary-channel:   #44ff44;
				--pitch2-secondary-note:    #439143;
				--pitch2-primary-note:      #44ff44;
				--pitch3-secondary-channel: #a1a100;
				--pitch3-primary-channel:   #ffff25;
				--pitch3-secondary-note:    #a1a100;
				--pitch3-primary-note:      #ffff25;
				--pitch4-secondary-channel: #c75000;
				--pitch4-primary-channel:   #ff9752;
				--pitch4-secondary-note:    #c75000;
				--pitch4-primary-note:      #ff9752;
				--pitch5-secondary-channel: #d020d0;
				--pitch5-primary-channel:   #FF90FF;
				--pitch5-secondary-note:    #d020d0;
				--pitch5-primary-note:      #ff90ff;
				--pitch6-secondary-channel: #552377;
				--pitch6-primary-channel:   #9f31ea;
				--pitch6-secondary-note:    #552377;
				--pitch6-primary-note:      #9f31ea;
				--pitch7-secondary-channel: #221b89;
				--pitch7-primary-channel:   #2b6aff;
				--pitch7-secondary-note:    #221b89;
				--pitch7-primary-note:      #2b6aff;
				--pitch8-secondary-channel: #00995f;
				--pitch8-primary-channel:   #00ff9f;
				--pitch8-secondary-note:    #00995f;
				--pitch8-primary-note:      #00ff9f;
				--pitch9-secondary-channel: #d6b03e;
				--pitch9-primary-channel:   #ffbf00;
				--pitch9-secondary-note:    #d6b03e;
				--pitch9-primary-note:      #ffbf00;
				--pitch10-secondary-channel:#b25915;
				--pitch10-primary-channel:  #d85d00;
				--pitch10-secondary-note:   #b25915;
				--pitch10-primary-note:     #d85d00;
				--pitch11-secondary-channel:#891a60;
				--pitch11-primary-channel:  #ff00a1;
				--pitch11-secondary-note:   #891a60;
				--pitch11-primary-note:     #ff00a1;
				--pitch12-secondary-channel:#965cbc;
				--pitch12-primary-channel:  #c26afc;
				--pitch12-secondary-note:   #965cbc;
				--pitch12-primary-note:     #c26afc;
				--noise1-secondary-channel: #991010;
				--noise1-primary-channel:   #ff1616;
				--noise1-secondary-note:    #991010;
				--noise1-primary-note:      #ff1616;
				--noise2-secondary-channel: #aaaaaa;
				--noise2-primary-channel:   #ffffff;
				--noise2-secondary-note:    #aaaaaa;
				--noise2-primary-note:      #ffffff;
				--noise3-secondary-channel: #5869BD;
				--noise3-primary-channel:   #768dfc;
				--noise3-secondary-note:    #5869BD;
				--noise3-primary-note:      #768dfc;
				--noise4-secondary-channel: #7c9b42;
				--noise4-primary-channel:   #a5ff00;
				--noise4-secondary-note:    #7c9b42;
				--noise4-primary-note:      #a5ff00;
				}
		`,
		"dessert": `
		:root {
				--page-margin: black;
				--editor-background: black;
				--hover-preview: white;
				--playhead: white;
				--primary-text: white;
				--secondary-text: #999;
				--inverted-text: black;
				--text-selection: rgba(119,68,255,0.99);
				--box-selection-fill: rgba(255,255,255,0.2);
				--loop-accent: #ff6254;
				--link-accent: #98f;
				--ui-widget-background: #363636;
				--ui-widget-focus: #777;
				--volume-icon: #ff0000;	

				--tonic: #fffc5b;
				--fifth-note: #ff5e3a;
				--pitch-background: #444;

				--octave-scrollbar: #ff5e3a; 
				--scrollbar-octave: #fffc5b;

				--pitch1-secondary-channel: #0099a1;
				--pitch1-primary-channel:   #25f3ff;
				--pitch1-secondary-note:    #0099a1;
				--pitch1-primary-note:      #25f3ff;
				--pitch2-secondary-channel: #439143;
				--pitch2-primary-channel:   #44ff44;
				--pitch2-secondary-note:    #439143;
				--pitch2-primary-note:      #44ff44;
				--pitch3-secondary-channel: #a1a100;
				--pitch3-primary-channel:   #ffff25;
				--pitch3-secondary-note:    #a1a100;
				--pitch3-primary-note:      #ffff25;
				--pitch4-secondary-channel: #c75000;
				--pitch4-primary-channel:   #ff9752;
				--pitch4-secondary-note:    #c75000;
				--pitch4-primary-note:      #ff9752;
				--pitch5-secondary-channel: #d020d0;
				--pitch5-primary-channel:   #FF90FF;
				--pitch5-secondary-note:    #d020d0;
				--pitch5-primary-note:      #ff90ff;
				--pitch6-secondary-channel: #552377;
				--pitch6-primary-channel:   #9f31ea;
				--pitch6-secondary-note:    #552377;
				--pitch6-primary-note:      #9f31ea;
				--pitch7-secondary-channel: #221b89;
				--pitch7-primary-channel:   #2b6aff;
				--pitch7-secondary-note:    #221b89;
				--pitch7-primary-note:      #2b6aff;
				--pitch8-secondary-channel: #00995f;
				--pitch8-primary-channel:   #00ff9f;
				--pitch8-secondary-note:    #00995f;
				--pitch8-primary-note:      #00ff9f;
				--pitch9-secondary-channel: #d6b03e;
				--pitch9-primary-channel:   #ffbf00;
				--pitch9-secondary-note:    #d6b03e;
				--pitch9-primary-note:      #ffbf00;
				--pitch10-secondary-channel:#b25915;
				--pitch10-primary-channel:  #d85d00;
				--pitch10-secondary-note:   #b25915;
				--pitch10-primary-note:     #d85d00;
				--pitch11-secondary-channel:#891a60;
				--pitch11-primary-channel:  #ff00a1;
				--pitch11-secondary-note:   #891a60;
				--pitch11-primary-note:     #ff00a1;
				--pitch12-secondary-channel:#965cbc;
				--pitch12-primary-channel:  #c26afc;
				--pitch12-secondary-note:   #965cbc;
				--pitch12-primary-note:     #c26afc;
				--noise1-secondary-channel: #991010;
				--noise1-primary-channel:   #ff1616;
				--noise1-secondary-note:    #991010;
				--noise1-primary-note:      #ff1616;
				--noise2-secondary-channel: #aaaaaa;
				--noise2-primary-channel:   #ffffff;
				--noise2-secondary-note:    #aaaaaa;
				--noise2-primary-note:      #ffffff;
				--noise3-secondary-channel: #5869BD;
				--noise3-primary-channel:   #768dfc;
				--noise3-secondary-note:    #5869BD;
				--noise3-primary-note:      #768dfc;
				--noise4-secondary-channel: #7c9b42;
				--noise4-primary-channel:   #a5ff00;
				--noise4-secondary-note:    #7c9b42;
				--noise4-primary-note:      #a5ff00;
				}
		`,
		"kahootiest": `
		:root {
				--page-margin: black;
				--editor-background: black;
				--hover-preview: white;
				--playhead: white;
				--primary-text: white;
				--secondary-text: #999;
				--inverted-text: black;
				--text-selection: rgba(119,68,255,0.99);
				--box-selection-fill: rgba(255,255,255,0.2);
				--loop-accent: #ff3355;
				--link-accent: #98f;
				--ui-widget-background: #363636;
				--ui-widget-focus: #777;
				--volume-icon: #66bf39;	

				--tonic: #45a3e5;
				--fifth-note: #864cbf;
				--pitch-background: #444;

				--octave-scrollbar: #eb670f; 
				--scrollbar-octave: #ff3355;

				--pitch1-secondary-channel: #0099a1;
				--pitch1-primary-channel:   #25f3ff;
				--pitch1-secondary-note:    #0099a1;
				--pitch1-primary-note:      #25f3ff;
				--pitch2-secondary-channel: #439143;
				--pitch2-primary-channel:   #44ff44;
				--pitch2-secondary-note:    #439143;
				--pitch2-primary-note:      #44ff44;
				--pitch3-secondary-channel: #a1a100;
				--pitch3-primary-channel:   #ffff25;
				--pitch3-secondary-note:    #a1a100;
				--pitch3-primary-note:      #ffff25;
				--pitch4-secondary-channel: #c75000;
				--pitch4-primary-channel:   #ff9752;
				--pitch4-secondary-note:    #c75000;
				--pitch4-primary-note:      #ff9752;
				--pitch5-secondary-channel: #d020d0;
				--pitch5-primary-channel:   #FF90FF;
				--pitch5-secondary-note:    #d020d0;
				--pitch5-primary-note:      #ff90ff;
				--pitch6-secondary-channel: #552377;
				--pitch6-primary-channel:   #9f31ea;
				--pitch6-secondary-note:    #552377;
				--pitch6-primary-note:      #9f31ea;
				--pitch7-secondary-channel: #221b89;
				--pitch7-primary-channel:   #2b6aff;
				--pitch7-secondary-note:    #221b89;
				--pitch7-primary-note:      #2b6aff;
				--pitch8-secondary-channel: #00995f;
				--pitch8-primary-channel:   #00ff9f;
				--pitch8-secondary-note:    #00995f;
				--pitch8-primary-note:      #00ff9f;
				--pitch9-secondary-channel: #d6b03e;
				--pitch9-primary-channel:   #ffbf00;
				--pitch9-secondary-note:    #d6b03e;
				--pitch9-primary-note:      #ffbf00;
				--pitch10-secondary-channel:#b25915;
				--pitch10-primary-channel:  #d85d00;
				--pitch10-secondary-note:   #b25915;
				--pitch10-primary-note:     #d85d00;
				--pitch11-secondary-channel:#891a60;
				--pitch11-primary-channel:  #ff00a1;
				--pitch11-secondary-note:   #891a60;
				--pitch11-primary-note:     #ff00a1;
				--pitch12-secondary-channel:#965cbc;
				--pitch12-primary-channel:  #c26afc;
				--pitch12-secondary-note:   #965cbc;
				--pitch12-primary-note:     #c26afc;
				--noise1-secondary-channel: #991010;
				--noise1-primary-channel:   #ff1616;
				--noise1-secondary-note:    #991010;
				--noise1-primary-note:      #ff1616;
				--noise2-secondary-channel: #aaaaaa;
				--noise2-primary-channel:   #ffffff;
				--noise2-secondary-note:    #aaaaaa;
				--noise2-primary-note:      #ffffff;
				--noise3-secondary-channel: #5869BD;
				--noise3-primary-channel:   #768dfc;
				--noise3-secondary-note:    #5869BD;
				--noise3-primary-note:      #768dfc;
				--noise4-secondary-channel: #7c9b42;
				--noise4-primary-channel:   #a5ff00;
				--noise4-secondary-note:    #7c9b42;
				--noise4-primary-note:      #a5ff00;
				}
		`,
		"beambit": `
		:root {
				--page-margin: black;
				--editor-background: black;
				--hover-preview: white;
				--playhead: white;
				--primary-text: white;
				--secondary-text: #999;
				--inverted-text: black;
				--text-selection: rgba(119,68,255,0.99);
				--box-selection-fill: rgba(255,255,255,0.2);
				--loop-accent: #fefe00;
				--link-accent: #98f;
				--ui-widget-background: #363636;
				--ui-widget-focus: #777;
				--volume-icon: #fefe00;	

				--pitch-background: #444;

				--tonic: #fefe00;
				--pitch1-background: #111111; 
				--pitch2-background: #111111; 
				--pitch3-background: #111111; 
				--pitch4-background: #fa0103;
				--pitch5-background: #111111; 
				--pitch6-background: #111111; 
				--fifth-note: #111111; 
				--pitch8-background: #0001fc; 
				--pitch9-background: #111111; 
				--pitch10-background: #111111; 
				--pitch11-background: #111111;

				--octave-scrollbar: #0001fc; 
				--scrollbar-octave: #fa0103;

				--pitch1-secondary-channel: #0099a1;
				--pitch1-primary-channel:   #25f3ff;
				--pitch1-secondary-note:    #0099a1;
				--pitch1-primary-note:      #25f3ff;
				--pitch2-secondary-channel: #439143;
				--pitch2-primary-channel:   #44ff44;
				--pitch2-secondary-note:    #439143;
				--pitch2-primary-note:      #44ff44;
				--pitch3-secondary-channel: #a1a100;
				--pitch3-primary-channel:   #ffff25;
				--pitch3-secondary-note:    #a1a100;
				--pitch3-primary-note:      #ffff25;
				--pitch4-secondary-channel: #c75000;
				--pitch4-primary-channel:   #ff9752;
				--pitch4-secondary-note:    #c75000;
				--pitch4-primary-note:      #ff9752;
				--pitch5-secondary-channel: #d020d0;
				--pitch5-primary-channel:   #FF90FF;
				--pitch5-secondary-note:    #d020d0;
				--pitch5-primary-note:      #ff90ff;
				--pitch6-secondary-channel: #552377;
				--pitch6-primary-channel:   #9f31ea;
				--pitch6-secondary-note:    #552377;
				--pitch6-primary-note:      #9f31ea;
				--pitch7-secondary-channel: #221b89;
				--pitch7-primary-channel:   #2b6aff;
				--pitch7-secondary-note:    #221b89;
				--pitch7-primary-note:      #2b6aff;
				--pitch8-secondary-channel: #00995f;
				--pitch8-primary-channel:   #00ff9f;
				--pitch8-secondary-note:    #00995f;
				--pitch8-primary-note:      #00ff9f;
				--pitch9-secondary-channel: #d6b03e;
				--pitch9-primary-channel:   #ffbf00;
				--pitch9-secondary-note:    #d6b03e;
				--pitch9-primary-note:      #ffbf00;
				--pitch10-secondary-channel:#b25915;
				--pitch10-primary-channel:  #d85d00;
				--pitch10-secondary-note:   #b25915;
				--pitch10-primary-note:     #d85d00;
				--pitch11-secondary-channel:#891a60;
				--pitch11-primary-channel:  #ff00a1;
				--pitch11-secondary-note:   #891a60;
				--pitch11-primary-note:     #ff00a1;
				--pitch12-secondary-channel:#965cbc;
				--pitch12-primary-channel:  #c26afc;
				--pitch12-secondary-note:   #965cbc;
				--pitch12-primary-note:     #c26afc;
				--noise1-secondary-channel: #991010;
				--noise1-primary-channel:   #ff1616;
				--noise1-secondary-note:    #991010;
				--noise1-primary-note:      #ff1616;
				--noise2-secondary-channel: #aaaaaa;
				--noise2-primary-channel:   #ffffff;
				--noise2-secondary-note:    #aaaaaa;
				--noise2-primary-note:      #ffffff;
				--noise3-secondary-channel: #5869BD;
				--noise3-primary-channel:   #768dfc;
				--noise3-secondary-note:    #5869BD;
				--noise3-primary-note:      #768dfc;
				--noise4-secondary-channel: #7c9b42;
				--noise4-primary-channel:   #a5ff00;
				--noise4-secondary-note:    #7c9b42;
				--noise4-primary-note:      #a5ff00;
				}
		`,
		"egg": `
		:root {
				--page-margin: black;
				--editor-background: black;
				--hover-preview: white;
				--playhead: white;
				--primary-text: white;
				--secondary-text: #999;
				--inverted-text: black;
				--text-selection: rgba(119,68,255,0.99);
				--box-selection-fill: rgba(255,255,255,0.2);
				--loop-accent: #6b003a;
				--link-accent: #98f;
				--ui-widget-background: #363636;
				--ui-widget-focus: #777;
				--volume-icon: #f01d7a;	

				--tonic: #fffafa;
				--fifth-note: #ff91ce;
				--pitch-background: #444;

				--octave-scrollbar: #ffb1f4; 
				--scrollbar-octave: #b4001b;

				--pitch1-secondary-channel: #0099a1;
				--pitch1-primary-channel:   #25f3ff;
				--pitch1-secondary-note:    #0099a1;
				--pitch1-primary-note:      #25f3ff;
				--pitch2-secondary-channel: #439143;
				--pitch2-primary-channel:   #44ff44;
				--pitch2-secondary-note:    #439143;
				--pitch2-primary-note:      #44ff44;
				--pitch3-secondary-channel: #a1a100;
				--pitch3-primary-channel:   #ffff25;
				--pitch3-secondary-note:    #a1a100;
				--pitch3-primary-note:      #ffff25;
				--pitch4-secondary-channel: #c75000;
				--pitch4-primary-channel:   #ff9752;
				--pitch4-secondary-note:    #c75000;
				--pitch4-primary-note:      #ff9752;
				--pitch5-secondary-channel: #d020d0;
				--pitch5-primary-channel:   #FF90FF;
				--pitch5-secondary-note:    #d020d0;
				--pitch5-primary-note:      #ff90ff;
				--pitch6-secondary-channel: #552377;
				--pitch6-primary-channel:   #9f31ea;
				--pitch6-secondary-note:    #552377;
				--pitch6-primary-note:      #9f31ea;
				--pitch7-secondary-channel: #221b89;
				--pitch7-primary-channel:   #2b6aff;
				--pitch7-secondary-note:    #221b89;
				--pitch7-primary-note:      #2b6aff;
				--pitch8-secondary-channel: #00995f;
				--pitch8-primary-channel:   #00ff9f;
				--pitch8-secondary-note:    #00995f;
				--pitch8-primary-note:      #00ff9f;
				--pitch9-secondary-channel: #d6b03e;
				--pitch9-primary-channel:   #ffbf00;
				--pitch9-secondary-note:    #d6b03e;
				--pitch9-primary-note:      #ffbf00;
				--pitch10-secondary-channel:#b25915;
				--pitch10-primary-channel:  #d85d00;
				--pitch10-secondary-note:   #b25915;
				--pitch10-primary-note:     #d85d00;
				--pitch11-secondary-channel:#891a60;
				--pitch11-primary-channel:  #ff00a1;
				--pitch11-secondary-note:   #891a60;
				--pitch11-primary-note:     #ff00a1;
				--pitch12-secondary-channel:#965cbc;
				--pitch12-primary-channel:  #c26afc;
				--pitch12-secondary-note:   #965cbc;
				--pitch12-primary-note:     #c26afc;
				--noise1-secondary-channel: #991010;
				--noise1-primary-channel:   #ff1616;
				--noise1-secondary-note:    #991010;
				--noise1-primary-note:      #ff1616;
				--noise2-secondary-channel: #aaaaaa;
				--noise2-primary-channel:   #ffffff;
				--noise2-secondary-note:    #aaaaaa;
				--noise2-primary-note:      #ffffff;
				--noise3-secondary-channel: #5869BD;
				--noise3-primary-channel:   #768dfc;
				--noise3-secondary-note:    #5869BD;
				--noise3-primary-note:      #768dfc;
				--noise4-secondary-channel: #7c9b42;
				--noise4-primary-channel:   #a5ff00;
				--noise4-secondary-note:    #7c9b42;
				--noise4-primary-note:      #a5ff00;
				}
		`,
		"Poniryoshka": `
		:root {
				--page-margin: black;
				--editor-background: black;
				--hover-preview: white;
				--playhead: white;
				--primary-text: white;
				--secondary-text: #999;
				--inverted-text: black;
				--text-selection: rgba(119,68,255,0.99);
				--box-selection-fill: rgba(255,255,255,0.2);
				--loop-accent: #4b4b4b;
				--link-accent: #98f;
				--ui-widget-background: #363636;
				--ui-widget-focus: #777;
				--volume-icon: #ffc100;	

				--tonic: #1a2844;
				--fifth-note: #dabbe6;
				--pitch4-background: #faf4c3;
				--pitch-background: #444;

				--octave-scrollbar: #5f4c99; 
				--scrollbar-octave: #ff8291;

				--pitch1-secondary-channel: #0099a1;
				--pitch1-primary-channel:   #25f3ff;
				--pitch1-secondary-note:    #0099a1;
				--pitch1-primary-note:      #25f3ff;
				--pitch2-secondary-channel: #439143;
				--pitch2-primary-channel:   #44ff44;
				--pitch2-secondary-note:    #439143;
				--pitch2-primary-note:      #44ff44;
				--pitch3-secondary-channel: #a1a100;
				--pitch3-primary-channel:   #ffff25;
				--pitch3-secondary-note:    #a1a100;
				--pitch3-primary-note:      #ffff25;
				--pitch4-secondary-channel: #c75000;
				--pitch4-primary-channel:   #ff9752;
				--pitch4-secondary-note:    #c75000;
				--pitch4-primary-note:      #ff9752;
				--pitch5-secondary-channel: #d020d0;
				--pitch5-primary-channel:   #FF90FF;
				--pitch5-secondary-note:    #d020d0;
				--pitch5-primary-note:      #ff90ff;
				--pitch6-secondary-channel: #552377;
				--pitch6-primary-channel:   #9f31ea;
				--pitch6-secondary-note:    #552377;
				--pitch6-primary-note:      #9f31ea;
				--pitch7-secondary-channel: #221b89;
				--pitch7-primary-channel:   #2b6aff;
				--pitch7-secondary-note:    #221b89;
				--pitch7-primary-note:      #2b6aff;
				--pitch8-secondary-channel: #00995f;
				--pitch8-primary-channel:   #00ff9f;
				--pitch8-secondary-note:    #00995f;
				--pitch8-primary-note:      #00ff9f;
				--pitch9-secondary-channel: #d6b03e;
				--pitch9-primary-channel:   #ffbf00;
				--pitch9-secondary-note:    #d6b03e;
				--pitch9-primary-note:      #ffbf00;
				--pitch10-secondary-channel:#b25915;
				--pitch10-primary-channel:  #d85d00;
				--pitch10-secondary-note:   #b25915;
				--pitch10-primary-note:     #d85d00;
				--pitch11-secondary-channel:#891a60;
				--pitch11-primary-channel:  #ff00a1;
				--pitch11-secondary-note:   #891a60;
				--pitch11-primary-note:     #ff00a1;
				--pitch12-secondary-channel:#965cbc;
				--pitch12-primary-channel:  #c26afc;
				--pitch12-secondary-note:   #965cbc;
				--pitch12-primary-note:     #c26afc;
				--noise1-secondary-channel: #991010;
				--noise1-primary-channel:   #ff1616;
				--noise1-secondary-note:    #991010;
				--noise1-primary-note:      #ff1616;
				--noise2-secondary-channel: #aaaaaa;
				--noise2-primary-channel:   #ffffff;
				--noise2-secondary-note:    #aaaaaa;
				--noise2-primary-note:      #ffffff;
				--noise3-secondary-channel: #5869BD;
				--noise3-primary-channel:   #768dfc;
				--noise3-secondary-note:    #5869BD;
				--noise3-primary-note:      #768dfc;
				--noise4-secondary-channel: #7c9b42;
				--noise4-primary-channel:   #a5ff00;
				--noise4-secondary-note:    #7c9b42;
				--noise4-primary-note:      #a5ff00;
				}
		`,
		"gameboy": `
		:root {
				--page-margin: black;
				--editor-background: black;
				--hover-preview: white;
				--playhead: white;
				--primary-text: white;
				--secondary-text: #999;
				--inverted-text: black;
				--text-selection: rgba(119,68,255,0.99);
				--box-selection-fill: rgba(255,255,255,0.2);
				--loop-accent: #9bbc0f;
				--link-accent: #98f;
				--ui-widget-background: #363636;
				--ui-widget-focus: #777;
				--volume-icon: #8bac0f;	

				--tonic: #9bbc0f; 
				--pitch1-background: #9bbc0f; 
				--pitch2-background: #9bbc0f; 
				--pitch3-background: #9bbc0f; 
				--pitch4-background: #9bbc0f;
				--pitch5-background: #9bbc0f; 
				--pitch6-background: #306230; 
				--fifth-note: #306230; 
				--pitch8-background: #306230; 
				--pitch9-background: #0f380f; 
				--pitch10-background: #0f380f; 
				--pitch11-background: #0f380f; 
				--pitch-background: #444;

				--octave-scrollbar: #9bbc0f; 
				--scrollbar-octave: #8bac0f;

				--pitch1-secondary-channel: #0099a1;
				--pitch1-primary-channel:   #25f3ff;
				--pitch1-secondary-note:    #0099a1;
				--pitch1-primary-note:      #25f3ff;
				--pitch2-secondary-channel: #439143;
				--pitch2-primary-channel:   #44ff44;
				--pitch2-secondary-note:    #439143;
				--pitch2-primary-note:      #44ff44;
				--pitch3-secondary-channel: #a1a100;
				--pitch3-primary-channel:   #ffff25;
				--pitch3-secondary-note:    #a1a100;
				--pitch3-primary-note:      #ffff25;
				--pitch4-secondary-channel: #c75000;
				--pitch4-primary-channel:   #ff9752;
				--pitch4-secondary-note:    #c75000;
				--pitch4-primary-note:      #ff9752;
				--pitch5-secondary-channel: #d020d0;
				--pitch5-primary-channel:   #FF90FF;
				--pitch5-secondary-note:    #d020d0;
				--pitch5-primary-note:      #ff90ff;
				--pitch6-secondary-channel: #552377;
				--pitch6-primary-channel:   #9f31ea;
				--pitch6-secondary-note:    #552377;
				--pitch6-primary-note:      #9f31ea;
				--pitch7-secondary-channel: #221b89;
				--pitch7-primary-channel:   #2b6aff;
				--pitch7-secondary-note:    #221b89;
				--pitch7-primary-note:      #2b6aff;
				--pitch8-secondary-channel: #00995f;
				--pitch8-primary-channel:   #00ff9f;
				--pitch8-secondary-note:    #00995f;
				--pitch8-primary-note:      #00ff9f;
				--pitch9-secondary-channel: #d6b03e;
				--pitch9-primary-channel:   #ffbf00;
				--pitch9-secondary-note:    #d6b03e;
				--pitch9-primary-note:      #ffbf00;
				--pitch10-secondary-channel:#b25915;
				--pitch10-primary-channel:  #d85d00;
				--pitch10-secondary-note:   #b25915;
				--pitch10-primary-note:     #d85d00;
				--pitch11-secondary-channel:#891a60;
				--pitch11-primary-channel:  #ff00a1;
				--pitch11-secondary-note:   #891a60;
				--pitch11-primary-note:     #ff00a1;
				--pitch12-secondary-channel:#965cbc;
				--pitch12-primary-channel:  #c26afc;
				--pitch12-secondary-note:   #965cbc;
				--pitch12-primary-note:     #c26afc;
				--noise1-secondary-channel: #991010;
				--noise1-primary-channel:   #ff1616;
				--noise1-secondary-note:    #991010;
				--noise1-primary-note:      #ff1616;
				--noise2-secondary-channel: #aaaaaa;
				--noise2-primary-channel:   #ffffff;
				--noise2-secondary-note:    #aaaaaa;
				--noise2-primary-note:      #ffffff;
				--noise3-secondary-channel: #5869BD;
				--noise3-primary-channel:   #768dfc;
				--noise3-secondary-note:    #5869BD;
				--noise3-primary-note:      #768dfc;
				--noise4-secondary-channel: #7c9b42;
				--noise4-primary-channel:   #a5ff00;
				--noise4-secondary-note:    #7c9b42;
				--noise4-primary-note:      #a5ff00;
				}
		`,
		"woodkid": `
		:root {
				--page-margin: black;
				--editor-background: black;
				--hover-preview: white;
				--playhead: white;
				--primary-text: white;
				--secondary-text: #999;
				--inverted-text: black;
				--text-selection: rgba(119,68,255,0.99);
				--box-selection-fill: rgba(255,255,255,0.2);
				--loop-accent: #e83c4e;
				--link-accent: #98f;
				--ui-widget-background: #363636;
				--ui-widget-focus: #777;
				--volume-icon: #ef3027;	

				--tonic: #fff6fe;
				--pitch1-background: #41323b;
				--pitch2-background: #41323b;
				--pitch3-background: #41323b;
				--pitch4-background: #fff6fe;
				--pitch5-background: #41323b;
				--pitch6-background: #41323b;
				--fifth-note: #fff6fe;
				--pitch8-background: #41323b;
				--pitch9-background: #41323b;
				--pitch10-background: #41323b;
				--pitch11-background: #41323b;
				--pitch-background: #444;

				--octave-scrollbar: #ef3027; 
				--scrollbar-octave: #ffedca;

				--pitch1-secondary-channel: #0099a1;
				--pitch1-primary-channel:   #25f3ff;
				--pitch1-secondary-note:    #0099a1;
				--pitch1-primary-note:      #25f3ff;
				--pitch2-secondary-channel: #439143;
				--pitch2-primary-channel:   #44ff44;
				--pitch2-secondary-note:    #439143;
				--pitch2-primary-note:      #44ff44;
				--pitch3-secondary-channel: #a1a100;
				--pitch3-primary-channel:   #ffff25;
				--pitch3-secondary-note:    #a1a100;
				--pitch3-primary-note:      #ffff25;
				--pitch4-secondary-channel: #c75000;
				--pitch4-primary-channel:   #ff9752;
				--pitch4-secondary-note:    #c75000;
				--pitch4-primary-note:      #ff9752;
				--pitch5-secondary-channel: #d020d0;
				--pitch5-primary-channel:   #FF90FF;
				--pitch5-secondary-note:    #d020d0;
				--pitch5-primary-note:      #ff90ff;
				--pitch6-secondary-channel: #552377;
				--pitch6-primary-channel:   #9f31ea;
				--pitch6-secondary-note:    #552377;
				--pitch6-primary-note:      #9f31ea;
				--pitch7-secondary-channel: #221b89;
				--pitch7-primary-channel:   #2b6aff;
				--pitch7-secondary-note:    #221b89;
				--pitch7-primary-note:      #2b6aff;
				--pitch8-secondary-channel: #00995f;
				--pitch8-primary-channel:   #00ff9f;
				--pitch8-secondary-note:    #00995f;
				--pitch8-primary-note:      #00ff9f;
				--pitch9-secondary-channel: #d6b03e;
				--pitch9-primary-channel:   #ffbf00;
				--pitch9-secondary-note:    #d6b03e;
				--pitch9-primary-note:      #ffbf00;
				--pitch10-secondary-channel:#b25915;
				--pitch10-primary-channel:  #d85d00;
				--pitch10-secondary-note:   #b25915;
				--pitch10-primary-note:     #d85d00;
				--pitch11-secondary-channel:#891a60;
				--pitch11-primary-channel:  #ff00a1;
				--pitch11-secondary-note:   #891a60;
				--pitch11-primary-note:     #ff00a1;
				--pitch12-secondary-channel:#965cbc;
				--pitch12-primary-channel:  #c26afc;
				--pitch12-secondary-note:   #965cbc;
				--pitch12-primary-note:     #c26afc;
				--noise1-secondary-channel: #991010;
				--noise1-primary-channel:   #ff1616;
				--noise1-secondary-note:    #991010;
				--noise1-primary-note:      #ff1616;
				--noise2-secondary-channel: #aaaaaa;
				--noise2-primary-channel:   #ffffff;
				--noise2-secondary-note:    #aaaaaa;
				--noise2-primary-note:      #ffffff;
				--noise3-secondary-channel: #5869BD;
				--noise3-primary-channel:   #768dfc;
				--noise3-secondary-note:    #5869BD;
				--noise3-primary-note:      #768dfc;
				--noise4-secondary-channel: #7c9b42;
				--noise4-primary-channel:   #a5ff00;
				--noise4-secondary-note:    #7c9b42;
				--noise4-primary-note:      #a5ff00;
				}
		`,
		"midnight": `
		:root {
				--page-margin: black;
				--editor-background: black;
				--hover-preview: white;
				--playhead: white;
				--primary-text: white;
				--secondary-text: #999;
				--inverted-text: black;
				--text-selection: rgba(119,68,255,0.99);
				--box-selection-fill: rgba(255,255,255,0.2);
				--loop-accent: #445566;
				--link-accent: #98f;
				--ui-widget-background: #363636;
				--ui-widget-focus: #777;
				--volume-icon: #aa5599;	

				--tonic: #222222;
				--pitch1-background: #222222;
				--pitch2-background: #222222;
				--pitch3-background: #222222;
				--pitch4-background: #222222;
				--pitch5-background: #222222;
				--pitch6-background:#222222;
				--fifth-note: #444444;
				--pitch8-background: #222222;
				--pitch9-background: #222222;
				--pitch10-background: #222222;
				--pitch11-background: #222222;
				--pitch-background: #444;

				--octave-scrollbar: #444444; 
				--scrollbar-octave: #aa5599;

				--pitch1-secondary-channel: #0099a1;
				--pitch1-primary-channel:   #25f3ff;
				--pitch1-secondary-note:    #0099a1;
				--pitch1-primary-note:      #25f3ff;
				--pitch2-secondary-channel: #439143;
				--pitch2-primary-channel:   #44ff44;
				--pitch2-secondary-note:    #439143;
				--pitch2-primary-note:      #44ff44;
				--pitch3-secondary-channel: #a1a100;
				--pitch3-primary-channel:   #ffff25;
				--pitch3-secondary-note:    #a1a100;
				--pitch3-primary-note:      #ffff25;
				--pitch4-secondary-channel: #c75000;
				--pitch4-primary-channel:   #ff9752;
				--pitch4-secondary-note:    #c75000;
				--pitch4-primary-note:      #ff9752;
				--pitch5-secondary-channel: #d020d0;
				--pitch5-primary-channel:   #FF90FF;
				--pitch5-secondary-note:    #d020d0;
				--pitch5-primary-note:      #ff90ff;
				--pitch6-secondary-channel: #552377;
				--pitch6-primary-channel:   #9f31ea;
				--pitch6-secondary-note:    #552377;
				--pitch6-primary-note:      #9f31ea;
				--pitch7-secondary-channel: #221b89;
				--pitch7-primary-channel:   #2b6aff;
				--pitch7-secondary-note:    #221b89;
				--pitch7-primary-note:      #2b6aff;
				--pitch8-secondary-channel: #00995f;
				--pitch8-primary-channel:   #00ff9f;
				--pitch8-secondary-note:    #00995f;
				--pitch8-primary-note:      #00ff9f;
				--pitch9-secondary-channel: #d6b03e;
				--pitch9-primary-channel:   #ffbf00;
				--pitch9-secondary-note:    #d6b03e;
				--pitch9-primary-note:      #ffbf00;
				--pitch10-secondary-channel:#b25915;
				--pitch10-primary-channel:  #d85d00;
				--pitch10-secondary-note:   #b25915;
				--pitch10-primary-note:     #d85d00;
				--pitch11-secondary-channel:#891a60;
				--pitch11-primary-channel:  #ff00a1;
				--pitch11-secondary-note:   #891a60;
				--pitch11-primary-note:     #ff00a1;
				--pitch12-secondary-channel:#965cbc;
				--pitch12-primary-channel:  #c26afc;
				--pitch12-secondary-note:   #965cbc;
				--pitch12-primary-note:     #c26afc;
				--noise1-secondary-channel: #991010;
				--noise1-primary-channel:   #ff1616;
				--noise1-secondary-note:    #991010;
				--noise1-primary-note:      #ff1616;
				--noise2-secondary-channel: #aaaaaa;
				--noise2-primary-channel:   #ffffff;
				--noise2-secondary-note:    #aaaaaa;
				--noise2-primary-note:      #ffffff;
				--noise3-secondary-channel: #5869BD;
				--noise3-primary-channel:   #768dfc;
				--noise3-secondary-note:    #5869BD;
				--noise3-primary-note:      #768dfc;
				--noise4-secondary-channel: #7c9b42;
				--noise4-primary-channel:   #a5ff00;
				--noise4-secondary-note:    #7c9b42;
				--noise4-primary-note:      #a5ff00;
				}
		`,
		"snedbox": `
		:root {
			--page-margin: black;
			--editor-background: black;
			--hover-preview: white;
			--playhead: white;
			--primary-text: white;
			--secondary-text: #999;
			--inverted-text: black;
			--text-selection: rgba(119,68,255,0.99);
			--box-selection-fill: rgba(255,255,255,0.2);
			--loop-accent: #a53a3d;
			--link-accent: #98f;
			--ui-widget-background: #363636;
			--ui-widget-focus: #777;
			--pitch-background: #444;
			--tonic: #864;
			--fifth-note: #60389b;
			--pitch4-background: #10997e;
			--volume-icon: #a53a3d;
			--octave-scrollbar: #444;
			--scrollbar-octave: #a53a3d;
			--channel-box: #444;

			--pitch1-secondary-channel: #0099a1;
			--pitch1-primary-channel:   #25f3ff;
			--pitch1-secondary-note:    #0099a1;
			--pitch1-primary-note:      #25f3ff;
			--pitch2-secondary-channel: #439143;
			--pitch2-primary-channel:   #44ff44;
			--pitch2-secondary-note:    #439143;
			--pitch2-primary-note:      #44ff44;
			--pitch3-secondary-channel: #a1a100;
			--pitch3-primary-channel:   #ffff25;
			--pitch3-secondary-note:    #a1a100;
			--pitch3-primary-note:      #ffff25;
			--pitch4-secondary-channel: #c75000;
			--pitch4-primary-channel:   #ff9752;
			--pitch4-secondary-note:    #c75000;
			--pitch4-primary-note:      #ff9752;
			--pitch5-secondary-channel: #d020d0;
			--pitch5-primary-channel:   #FF90FF;
			--pitch5-secondary-note:    #d020d0;
			--pitch5-primary-note:      #ff90ff;
			--pitch6-secondary-channel: #552377;
			--pitch6-primary-channel:   #9f31ea;
			--pitch6-secondary-note:    #552377;
			--pitch6-primary-note:      #9f31ea;
			--pitch7-secondary-channel: #221b89;
			--pitch7-primary-channel:   #2b6aff;
			--pitch7-secondary-note:    #221b89;
			--pitch7-primary-note:      #2b6aff;
			--pitch8-secondary-channel: #00995f;
			--pitch8-primary-channel:   #00ff9f;
			--pitch8-secondary-note:    #00995f;
			--pitch8-primary-note:      #00ff9f;
			--pitch9-secondary-channel: #d6b03e;
			--pitch9-primary-channel:   #ffbf00;
			--pitch9-secondary-note:    #d6b03e;
			--pitch9-primary-note:      #ffbf00;
			--pitch10-secondary-channel:#b25915;
			--pitch10-primary-channel:  #d85d00;
			--pitch10-secondary-note:   #b25915;
			--pitch10-primary-note:     #d85d00;

			--pitch11-secondary-channel:#891a60;
			--pitch11-primary-channel:  #ff00a1;
			--pitch11-secondary-note:   #891a60;
			--pitch11-primary-note:     #ff00a1;

			--pitch12-secondary-channel:#965cbc;
			--pitch12-primary-channel:  #c26afc;
			--pitch12-secondary-note:   #965cbc;
			--pitch12-primary-note:     #c26afc;

			--noise1-secondary-channel: #991010;
			--noise1-primary-channel:   #ff1616;
			--noise1-secondary-note:    #991010;
			--noise1-primary-note:      #ff1616;
			--noise2-secondary-channel: #aaaaaa;
			--noise2-primary-channel:   #ffffff;
			--noise2-secondary-note:    #aaaaaa;
			--noise2-primary-note:      #ffffff;
			--noise3-secondary-channel: #5869BD;
			--noise3-primary-channel:   #768dfc;
			--noise3-secondary-note:    #5869BD;
			--noise3-primary-note:      #768dfc;
			--noise4-secondary-channel: #7c9b42;
			--noise4-primary-channel:   #a5ff00;
			--noise4-secondary-note:    #7c9b42;
			--noise4-primary-note:      #a5ff00;
		}
	`,
	"unnamed": `
	:root {
			--page-margin: black;
			--editor-background: black;
			--hover-preview: white;
			--playhead: white;
			--primary-text: white;
			--secondary-text: #999;
			--inverted-text: black;
			--text-selection: rgba(119,68,255,0.99);
			--box-selection-fill: rgba(255,255,255,0.2);
			--loop-accent: #ffffff;
			--link-accent: #98f;
			--ui-widget-background: #363636;
			--ui-widget-focus: #777;
			--pitch-background: #444;
			--pitch1-background: #ffffa0;
			--pitch2-background: #ffffa0;
			--pitch3-background: #ffffa0;
			--pitch4-background: #ffffa0;
			--pitch5-background: #ffffa0;
			--pitch6-background: #ffffa0;
			--pitch8-background: #ffffa0;
			--pitch9-background: #ffffa0;
			--pitch10-background: #ffffa0;
			--pitch11-background: #ffffa0;
			--pitch12-background: #ffffa0;
			--tonic: #ffffa0;
			--fifth-note: #ffffa0;
			--volume-icon: #ffffff;	

			--octave-scrollbar: #ffffff;
			--scrollbar-octave: #ffffff;

			--pitch1-secondary-channel: #0099a1;
			--pitch1-primary-channel:   #25f3ff;
			--pitch1-secondary-note:    #0099a1;
			--pitch1-primary-note:      #25f3ff;
			--pitch2-secondary-channel: #439143;
			--pitch2-primary-channel:   #44ff44;
			--pitch2-secondary-note:    #439143;
			--pitch2-primary-note:      #44ff44;
			--pitch3-secondary-channel: #a1a100;
			--pitch3-primary-channel:   #ffff25;
			--pitch3-secondary-note:    #a1a100;
			--pitch3-primary-note:      #ffff25;
			--pitch4-secondary-channel: #c75000;
			--pitch4-primary-channel:   #ff9752;
			--pitch4-secondary-note:    #c75000;
			--pitch4-primary-note:      #ff9752;
			--pitch5-secondary-channel: #d020d0;
			--pitch5-primary-channel:   #FF90FF;
			--pitch5-secondary-note:    #d020d0;
			--pitch5-primary-note:      #ff90ff;
			--pitch6-secondary-channel: #552377;
			--pitch6-primary-channel:   #9f31ea;
			--pitch6-secondary-note:    #552377;
			--pitch6-primary-note:      #9f31ea;
			--pitch7-secondary-channel: #221b89;
			--pitch7-primary-channel:   #2b6aff;
			--pitch7-secondary-note:    #221b89;
			--pitch7-primary-note:      #2b6aff;
			--pitch8-secondary-channel: #00995f;
			--pitch8-primary-channel:   #00ff9f;
			--pitch8-secondary-note:    #00995f;
			--pitch8-primary-note:      #00ff9f;
			--pitch9-secondary-channel: #d6b03e;
			--pitch9-primary-channel:   #ffbf00;
			--pitch9-secondary-note:    #d6b03e;
			--pitch9-primary-note:      #ffbf00;
			--pitch10-secondary-channel:#b25915;
			--pitch10-primary-channel:  #d85d00;
			--pitch10-secondary-note:   #b25915;
			--pitch10-primary-note:     #d85d00;
			--pitch11-secondary-channel:#891a60;
			--pitch11-primary-channel:  #ff00a1;
			--pitch11-secondary-note:   #891a60;
			--pitch11-primary-note:     #ff00a1;
			--pitch12-secondary-channel:#965cbc;
			--pitch12-primary-channel:  #c26afc;
			--pitch12-secondary-note:   #965cbc;
			--pitch12-primary-note:     #c26afc;
			--noise1-secondary-channel: #991010;
			--noise1-primary-channel:   #ff1616;
			--noise1-secondary-note:    #991010;
			--noise1-primary-note:      #ff1616;
			--noise2-secondary-channel: #aaaaaa;
			--noise2-primary-channel:   #ffffff;
			--noise2-secondary-note:    #aaaaaa;
			--noise2-primary-note:      #ffffff;
			--noise3-secondary-channel: #5869BD;
			--noise3-primary-channel:   #768dfc;
			--noise3-secondary-note:    #5869BD;
			--noise3-primary-note:      #768dfc;
			--noise4-secondary-channel: #7c9b42;
			--noise4-primary-channel:   #a5ff00;
			--noise4-secondary-note:    #7c9b42;
			--noise4-primary-note:      #a5ff00;
			}
	`,
	"piano": `
	:root {
			--page-margin: black;
			--editor-background: black;
			--hover-preview: white;
			--playhead: white;
			--primary-text: white;
			--secondary-text: #999;
			--inverted-text: black;
			--text-selection: rgba(119,68,255,0.99);
			--box-selection-fill: rgba(255,255,255,0.2);
			--loop-accent: #ffffff;
			--link-accent: #98f;
			--ui-widget-background: #363636;
			--ui-widget-focus: #777;

			--use-piano-scheme: true;

			--pitch-background: #444;
			--volume-icon: #ff0000;	

			--tonic: #ffffff;
			--white-tonic: #fff;
			--black-tonic: #222;
			--fifth-note: #7a7a7a;

			--octave-scrollbar: #211616;
			--scrollbar-octave: #ff4c4c;
			--pitch-white-key: #bfbfbf;
			--pitch-black-key: #7a7a7a;

			--pitch1-secondary-channel: #0099a1;
			--pitch1-primary-channel:   #25f3ff;
			--pitch1-secondary-note:    #0099a1;
			--pitch1-primary-note:      #25f3ff;
			--pitch2-secondary-channel: #439143;
			--pitch2-primary-channel:   #44ff44;
			--pitch2-secondary-note:    #439143;
			--pitch2-primary-note:      #44ff44;
			--pitch3-secondary-channel: #a1a100;
			--pitch3-primary-channel:   #ffff25;
			--pitch3-secondary-note:    #a1a100;
			--pitch3-primary-note:      #ffff25;
			--pitch4-secondary-channel: #c75000;
			--pitch4-primary-channel:   #ff9752;
			--pitch4-secondary-note:    #c75000;
			--pitch4-primary-note:      #ff9752;
			--pitch5-secondary-channel: #d020d0;
			--pitch5-primary-channel:   #FF90FF;
			--pitch5-secondary-note:    #d020d0;
			--pitch5-primary-note:      #ff90ff;
			--pitch6-secondary-channel: #552377;
			--pitch6-primary-channel:   #9f31ea;
			--pitch6-secondary-note:    #552377;
			--pitch6-primary-note:      #9f31ea;
			--pitch7-secondary-channel: #221b89;
			--pitch7-primary-channel:   #2b6aff;
			--pitch7-secondary-note:    #221b89;
			--pitch7-primary-note:      #2b6aff;
			--pitch8-secondary-channel: #00995f;
			--pitch8-primary-channel:   #00ff9f;
			--pitch8-secondary-note:    #00995f;
			--pitch8-primary-note:      #00ff9f;
			--pitch9-secondary-channel: #d6b03e;
			--pitch9-primary-channel:   #ffbf00;
			--pitch9-secondary-note:    #d6b03e;
			--pitch9-primary-note:      #ffbf00;
			--pitch10-secondary-channel:#b25915;
			--pitch10-primary-channel:  #d85d00;
			--pitch10-secondary-note:   #b25915;
			--pitch10-primary-note:     #d85d00;
			--pitch11-secondary-channel:#891a60;
			--pitch11-primary-channel:  #ff00a1;
			--pitch11-secondary-note:   #891a60;
			--pitch11-primary-note:     #ff00a1;
			--pitch12-secondary-channel:#965cbc;
			--pitch12-primary-channel:  #c26afc;
			--pitch12-secondary-note:   #965cbc;
			--pitch12-primary-note:     #c26afc;
			--noise1-secondary-channel: #991010;
			--noise1-primary-channel:   #ff1616;
			--noise1-secondary-note:    #991010;
			--noise1-primary-note:      #ff1616;
			--noise2-secondary-channel: #aaaaaa;
			--noise2-primary-channel:   #ffffff;
			--noise2-secondary-note:    #aaaaaa;
			--noise2-primary-note:      #ffffff;
			--noise3-secondary-channel: #5869BD;
			--noise3-primary-channel:   #768dfc;
			--noise3-secondary-note:    #5869BD;
			--noise3-primary-note:      #768dfc;
			--noise4-secondary-channel: #7c9b42;
			--noise4-primary-channel:   #a5ff00;
			--noise4-secondary-note:    #7c9b42;
			--noise4-primary-note:      #a5ff00;
			}
	`,
	"halloween": `
	:root {
				--page-margin: black;
				--editor-background: black;
				--hover-preview: white;
				--playhead: white;
				--primary-text: white;
				--secondary-text: #999;
				--inverted-text: black;
				--text-selection: rgba(119,68,255,0.99);
				--box-selection-fill: rgba(255,255,255,0.2);
				--loop-accent: #9e2200;
				--link-accent: #98f;
				--ui-widget-background: #363636;
				--ui-widget-focus: #777;
				--volume-icon: #9e2200;	

				--tonic: #681701;
				--pitch1-background: #754a3f;
				--pitch2-background: #754a3f;
				--pitch3-background: #754a3f;
				--pitch4-background: #754a3f;
				--pitch5-background: #754a3f;
				--pitch6-background:#754a3f;
				--fifth-note: #914300;
				--pitch8-background: #754a3f;
				--pitch9-background: #754a3f;
				--pitch10-background: #754a3f;
				--pitch11-background: #754a3f;
				--pitch-background: #444;

				--octave-scrollbar: #9e2200; 
				--scrollbar-octave: #701800;

				--pitch1-secondary-channel: #0099a1;
				--pitch1-primary-channel:   #25f3ff;
				--pitch1-secondary-note:    #0099a1;
				--pitch1-primary-note:      #25f3ff;
				--pitch2-secondary-channel: #439143;
				--pitch2-primary-channel:   #44ff44;
				--pitch2-secondary-note:    #439143;
				--pitch2-primary-note:      #44ff44;
				--pitch3-secondary-channel: #a1a100;
				--pitch3-primary-channel:   #ffff25;
				--pitch3-secondary-note:    #a1a100;
				--pitch3-primary-note:      #ffff25;
				--pitch4-secondary-channel: #c75000;
				--pitch4-primary-channel:   #ff9752;
				--pitch4-secondary-note:    #c75000;
				--pitch4-primary-note:      #ff9752;
				--pitch5-secondary-channel: #d020d0;
				--pitch5-primary-channel:   #FF90FF;
				--pitch5-secondary-note:    #d020d0;
				--pitch5-primary-note:      #ff90ff;
				--pitch6-secondary-channel: #552377;
				--pitch6-primary-channel:   #9f31ea;
				--pitch6-secondary-note:    #552377;
				--pitch6-primary-note:      #9f31ea;
				--pitch7-secondary-channel: #221b89;
				--pitch7-primary-channel:   #2b6aff;
				--pitch7-secondary-note:    #221b89;
				--pitch7-primary-note:      #2b6aff;
				--pitch8-secondary-channel: #00995f;
				--pitch8-primary-channel:   #00ff9f;
				--pitch8-secondary-note:    #00995f;
				--pitch8-primary-note:      #00ff9f;
				--pitch9-secondary-channel: #d6b03e;
				--pitch9-primary-channel:   #ffbf00;
				--pitch9-secondary-note:    #d6b03e;
				--pitch9-primary-note:      #ffbf00;
				--pitch10-secondary-channel:#b25915;
				--pitch10-primary-channel:  #d85d00;
				--pitch10-secondary-note:   #b25915;
				--pitch10-primary-note:     #d85d00;
				--pitch11-secondary-channel:#891a60;
				--pitch11-primary-channel:  #ff00a1;
				--pitch11-secondary-note:   #891a60;
				--pitch11-primary-note:     #ff00a1;
				--pitch12-secondary-channel:#965cbc;
				--pitch12-primary-channel:  #c26afc;
				--pitch12-secondary-note:   #965cbc;
				--pitch12-primary-note:     #c26afc;
				--noise1-secondary-channel: #991010;
				--noise1-primary-channel:   #ff1616;
				--noise1-secondary-note:    #991010;
				--noise1-primary-note:      #ff1616;
				--noise2-secondary-channel: #aaaaaa;
				--noise2-primary-channel:   #ffffff;
				--noise2-secondary-note:    #aaaaaa;
				--noise2-primary-note:      #ffffff;
				--noise3-secondary-channel: #5869BD;
				--noise3-primary-channel:   #768dfc;
				--noise3-secondary-note:    #5869BD;
				--noise3-primary-note:      #768dfc;
				--noise4-secondary-channel: #7c9b42;
				--noise4-primary-channel:   #a5ff00;
				--noise4-secondary-note:    #7c9b42;
				--noise4-primary-note:      #a5ff00;
			}
	`,
	"frozen": `
	:root {
				--page-margin: black;
				--editor-background: black;
				--hover-preview: white;
				--playhead: white;
				--primary-text: white;
				--secondary-text: #999;
				--inverted-text: black;
				--text-selection: rgba(119,68,255,0.99);
				--box-selection-fill: rgba(255,255,255,0.2);
				--loop-accent: #38ef17;
				--link-accent: #98f;
				--ui-widget-background: #363636;
				--ui-widget-focus: #777;
				--volume-icon: #ed2d2d;	

				--tonic: #88bce8; 
				--pitch1-background: #99c8ef; 
				--pitch2-background: #abd3f4; 
				--pitch3-background: #b8d7f2; 
				--pitch4-background: #cbe0f2;
				--pitch5-background: #e5f0f9; 
				--pitch6-background: #ffffff; 
				--fifth-note: #e5f0f9; 
				--pitch8-background: #cbe0f2; 
				--pitch9-background: #b8d7f2; 
				--pitch10-background: #abd3f4; 
				--pitch11-background: #99c8ef;
				--pitch-background: #444;

				--octave-scrollbar: #ffffff; 
				--scrollbar-octave: #ed2d2d;

				--pitch1-secondary-channel: #0099a1;
				--pitch1-primary-channel:   #25f3ff;
				--pitch1-secondary-note:    #0099a1;
				--pitch1-primary-note:      #25f3ff;
				--pitch2-secondary-channel: #439143;
				--pitch2-primary-channel:   #44ff44;
				--pitch2-secondary-note:    #439143;
				--pitch2-primary-note:      #44ff44;
				--pitch3-secondary-channel: #a1a100;
				--pitch3-primary-channel:   #ffff25;
				--pitch3-secondary-note:    #a1a100;
				--pitch3-primary-note:      #ffff25;
				--pitch4-secondary-channel: #c75000;
				--pitch4-primary-channel:   #ff9752;
				--pitch4-secondary-note:    #c75000;
				--pitch4-primary-note:      #ff9752;
				--pitch5-secondary-channel: #d020d0;
				--pitch5-primary-channel:   #FF90FF;
				--pitch5-secondary-note:    #d020d0;
				--pitch5-primary-note:      #ff90ff;
				--pitch6-secondary-channel: #552377;
				--pitch6-primary-channel:   #9f31ea;
				--pitch6-secondary-note:    #552377;
				--pitch6-primary-note:      #9f31ea;
				--pitch7-secondary-channel: #221b89;
				--pitch7-primary-channel:   #2b6aff;
				--pitch7-secondary-note:    #221b89;
				--pitch7-primary-note:      #2b6aff;
				--pitch8-secondary-channel: #00995f;
				--pitch8-primary-channel:   #00ff9f;
				--pitch8-secondary-note:    #00995f;
				--pitch8-primary-note:      #00ff9f;
				--pitch9-secondary-channel: #d6b03e;
				--pitch9-primary-channel:   #ffbf00;
				--pitch9-secondary-note:    #d6b03e;
				--pitch9-primary-note:      #ffbf00;
				--pitch10-secondary-channel:#b25915;
				--pitch10-primary-channel:  #d85d00;
				--pitch10-secondary-note:   #b25915;
				--pitch10-primary-note:     #d85d00;
				--pitch11-secondary-channel:#891a60;
				--pitch11-primary-channel:  #ff00a1;
				--pitch11-secondary-note:   #891a60;
				--pitch11-primary-note:     #ff00a1;
				--pitch12-secondary-channel:#965cbc;
				--pitch12-primary-channel:  #c26afc;
				--pitch12-secondary-note:   #965cbc;
				--pitch12-primary-note:     #c26afc;
				--noise1-secondary-channel: #991010;
				--noise1-primary-channel:   #ff1616;
				--noise1-secondary-note:    #991010;
				--noise1-primary-note:      #ff1616;
				--noise2-secondary-channel: #aaaaaa;
				--noise2-primary-channel:   #ffffff;
				--noise2-secondary-note:    #aaaaaa;
				--noise2-primary-note:      #ffffff;
				--noise3-secondary-channel: #5869BD;
				--noise3-primary-channel:   #768dfc;
				--noise3-secondary-note:    #5869BD;
				--noise3-primary-note:      #768dfc;
				--noise4-secondary-channel: #7c9b42;
				--noise4-primary-channel:   #a5ff00;
				--noise4-secondary-note:    #7c9b42;
				--noise4-primary-note:      #a5ff00;
			}
	`,
	}

    public static readonly pageMargin: string = "var(--page-margin, black)";
    public static readonly editorBackground: string = "var(--editor-background, black)";
    public static readonly hoverPreview: string = "var(--hover-preview, white)";
    public static readonly playhead: string = "var(--playhead, white)";
    public static readonly primaryText: string = "var(--primary-text, white)";
    public static readonly secondaryText: string = "var(--secondary-text, #999)";
    public static readonly invertedText: string = "var(--inverted-text, black)";
    public static readonly textSelection: string = "var(--text-selection, rgba(119,68,255,0.99))";
    public static readonly boxSelectionFill: string = "var(--box-selection-fill, rgba(255,255,255,0.2))";
    public static readonly loopAccent: string = "var(--loop-accent, #9900cc)";
    public static readonly linkAccent: string = "var(--link-accent, #98f)";
    public static readonly uiWidgetBackground: string = "var(--ui-widget-background, #444)";
    public static readonly uiWidgetFocus: string = "var(--ui-widget-focus)";
    public static readonly pitchBackground: string = "var(--pitch-background, #444)";
    public static readonly tonic: string = "var(--tonic, #864)";
    public static readonly fifthNote: string = "var(--fifth-note, #468)";

	public static readonly pitch1Background: string = "var(--pitch1-background, var(--pitch-background, #444))";
	public static readonly pitch2Background: string = "var(--pitch2-background, var(--pitch-background, #444))";
	public static readonly pitch3Background: string = "var(--pitch3-background, var(--pitch-background, #444))";
	public static readonly pitch4Background: string = "var(--pitch4-background, var(--pitch-background, #444))";
	public static readonly pitch5Background: string = "var(--pitch5-background, var(--pitch-background, #444))";
	public static readonly pitch6Background: string = "var(--pitch6-background, var(--pitch-background, #444))";
	// no need for a 7th since that's the --fifth-note's job
	public static readonly pitch8Background: string = "var(--pitch8-background, var(--pitch-background, #444))";
	public static readonly pitch9Background: string = "var(--pitch9-background, var(--pitch-background, #444))";
	public static readonly pitch10Background: string = "var(--pitch10-background, var(--pitch-background, #444))";
	public static readonly pitch11Background: string = "var(--pitch11-background, var(--pitch-background, #444))";
    public static readonly volumeIcon: string = "var(--volume-icon, #777777)";
	public static readonly octaveScrollbar: string = "var(--octave-scrollbar, #444444)";
	public static readonly scrollbarOctave: string = "var(--scrollbar-octave, #886644)";
	public static readonly channelBox: string = "var(--channel-box, #444444)";
	public static readonly blackPianoKey: string = "var(--black-piano-key, #000)";
	public static readonly whitePianoKey: string = "var(--white-piano-key, #fff)";
	
	public static readonly pitchChannels: DictionaryArray<ChannelColors> = toNameMap([
        {
            name: "pitch1", // cyan
            secondaryChannel: "var(--pitch1-secondary-channel)",
            primaryChannel: "var(--pitch1-primary-channel)",
            secondaryNote: "var(--pitch1-secondary-note)",
            primaryNote: "var(--pitch1-primary-note)",
        }, {
            name: "pitch2", // yellow
            secondaryChannel: "var(--pitch2-secondary-channel)",
            primaryChannel: "var(--pitch2-primary-channel)",
            secondaryNote: "var(--pitch2-secondary-note)",
            primaryNote: "var(--pitch2-primary-note)",
        }, {
            name: "pitch3", // orange
            secondaryChannel: "var(--pitch3-secondary-channel)",
            primaryChannel: "var(--pitch3-primary-channel)",
            secondaryNote: "var(--pitch3-secondary-note)",
            primaryNote: "var(--pitch3-primary-note)",
        }, {
            name: "pitch4", // green
            secondaryChannel: "var(--pitch4-secondary-channel)",
            primaryChannel: "var(--pitch4-primary-channel)",
            secondaryNote: "var(--pitch4-secondary-note)",
            primaryNote: "var(--pitch4-primary-note)",
        }, {
            name: "pitch5", // magenta
            secondaryChannel: "var(--pitch5-secondary-channel)",
            primaryChannel: "var(--pitch5-primary-channel)",
            secondaryNote: "var(--pitch5-secondary-note)",
            primaryNote: "var(--pitch5-primary-note)",
        }, {
            name: "pitch6", // blue
            secondaryChannel: "var(--pitch6-secondary-channel)",
            primaryChannel: "var(--pitch6-primary-channel)",
            secondaryNote: "var(--pitch6-secondary-note)",
            primaryNote: "var(--pitch6-primary-note)",
        }, {
            name: "pitch7", // olive
            secondaryChannel: "var(--pitch7-secondary-channel)",
            primaryChannel: "var(--pitch7-primary-channel)",
            secondaryNote: "var(--pitch7-secondary-note)",
            primaryNote: "var(--pitch7-primary-note)",
        }, {
            name: "pitch8", // red
            secondaryChannel: "var(--pitch8-secondary-channel)",
            primaryChannel: "var(--pitch8-primary-channel)",
            secondaryNote: "var(--pitch8-secondary-note)",
            primaryNote: "var(--pitch8-primary-note)",
        }, {
            name: "pitch9", // teal
            secondaryChannel: "var(--pitch9-secondary-channel)",
            primaryChannel: "var(--pitch9-primary-channel)",
            secondaryNote: "var(--pitch9-secondary-note)",
            primaryNote: "var(--pitch9-primary-note)",
        }, {
            name: "pitch10", // purple
            secondaryChannel: "var(--pitch10-secondary-channel)",
            primaryChannel: "var(--pitch10-primary-channel)",
            secondaryNote: "var(--pitch10-secondary-note)",
            primaryNote: "var(--pitch10-primary-note)",
        },
		{
            name: "pitch11", // teal
            secondaryChannel: "var(--pitch11-secondary-channel)",
            primaryChannel: "var(--pitch11-primary-channel)",
            secondaryNote: "var(--pitch11-secondary-note)",
            primaryNote: "var(--pitch11-primary-note)",
        }, {
            name: "pitch12", // purple
            secondaryChannel: "var(--pitch12-secondary-channel)",
            primaryChannel: "var(--pitch12-primary-channel)",
            secondaryNote: "var(--pitch12-secondary-note)",
            primaryNote: "var(--pitch12-primary-note)",
        },
    ]);
	public static readonly noiseChannels: DictionaryArray<ChannelColors> = toNameMap([
        {
            name: "noise1", // gray
            secondaryChannel: "var(--noise1-secondary-channel)",
            primaryChannel: "var(--noise1-primary-channel)",
            secondaryNote: "var(--noise1-secondary-note)",
            primaryNote: "var(--noise1-primary-note)",
        }, {
            name: "noise2", // brown
            secondaryChannel: "var(--noise2-secondary-channel)",
            primaryChannel: "var(--noise2-primary-channel)",
            secondaryNote: "var(--noise2-secondary-note)",
            primaryNote: "var(--noise2-primary-note)",
        }, {
            name: "noise3", // azure
            secondaryChannel: "var(--noise3-secondary-channel)",
            primaryChannel: "var(--noise3-primary-channel)",
            secondaryNote: "var(--noise3-secondary-note)",
            primaryNote: "var(--noise3-primary-note)",
        }, {
            name: "noise4", // purple
            secondaryChannel: "var(--noise4-secondary-channel)",
            primaryChannel: "var(--noise4-primary-channel)",
            secondaryNote: "var(--noise4-secondary-note)",
            primaryNote: "var(--noise4-primary-note)",
        },
    ]);

	public static getChannelColor(song: Song, channel: number): ChannelColors {
		return channel < song.pitchChannelCount
			? ColorConfig.pitchChannels[channel % ColorConfig.pitchChannels.length]
			: ColorConfig.noiseChannels[(channel - song.pitchChannelCount) % ColorConfig.noiseChannels.length];
	}
		private static readonly _styleElement: HTMLStyleElement = document.head.appendChild(HTML.style({type: "text/css"}));
		
	public static setTheme(theme: string): void {
		this._styleElement.textContent = this._themeMap[theme];
		this.usesPianoScheme = (getComputedStyle(this._styleElement).getPropertyValue("--use-piano-scheme").trim() == "true");
		console.log("use-piano-scheme: "+this.usesPianoScheme);
	}
}