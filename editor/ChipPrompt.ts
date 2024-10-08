/*
Copyright (C) 2018 John Nesky

Permission is hereby granted, free of charge, to any person obtaining a copy of 
this software and associated documentation files (the "Software"), to deal in 
the Software without restriction, including without limitation the rights to 
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies 
of the Software, and to permit persons to whom the Software is furnished to do 
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all 
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, 
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE 
SOFTWARE.
*/

import { Prompt } from "./Prompt";
import { HTML } from "imperative-html/dist/esm/elements-strict";
import { SongDocument } from "./SongDocument";
import { SongEditor } from "./SongEditor";

	const {button, div, a} = HTML;
	export class ChipPrompt implements Prompt {
		private readonly _cancelButton: HTMLButtonElement = button({}, [div("Close")]);
		
		public readonly container: HTMLDivElement = div({class: "prompt", style: "width: 250px;"}, 
			div({ style: "font-size: 2em" }, div("Chip and Noise")),
			div({ style: "text-align: left;" }, div('Mostly popularized by early Retro video games, such as Super Mario Bros. or Pokemon, Chip and Noise sound effects are used in the chiptune music of the past and the modern electronic music of today.')),
			div({ style: "text-align: left;" }, div('Chip is normally used for the main track, bassline, and melody. Many people who use the original beepbox will be familiar with the Waveforms it uses; Triangle, Square, Pulse Wide, Etc.. ' +
			'Sandbox expands that list way more than needed, each waveform having a unique sound.')),
			div({ style: "text-align: left;" }, div('Noise, otherwise called Drums, go hand in hand with Chip, being used for background noise, having a distinct different from chip.')),
			div({ style: "text-align: left;" }, div('A rather overcomplecated example of the two in use can be found in '),
			a({ target:"_blank", href:"#6n73z0sbu1kbl1de00tcm0x0y0Hea7g1djvi9r1o3321343000T0w1f0d1c0q0G0M0B0h0v0T0w1f1d1c0q0G0M0B0h0v1T0w1f0d1c0q0G0M0B0h0v0T0w1f0d1c0q0G0M0B0h0v0T0w1f0d1c0q0G0M0B0h0v0T0w1f0d1c0q0G0M0B0h0v0T0w1f0d1c0q0G0M0B0h0v0T0w1f0d1c0q0G0M0B0h0v0T0w1f0d1c0q0G0M0B0h0v0T0w1f0d1c0q0G0M0B0h0v0T1d1c0B0M0AaF6_bV1v0Q0000Pfff9E0001T1d1c0B0M0A5F4_eV4v0Q0002Pff55E0011T1d1c0B0M0AcF8_8V1v0Q0000PffffE1111T1d1c0B0M0AcF8_8V1v0Q0000PffffE1111T1d1c0B0M0AcF8_8V1v0Q0000PffffE1111T1d1c0B0M0AcF8_8V1v0Q0000PffffE1111T1d1c0B0M0AcF8_8V1v0Q0000PffffE1111T1d1c0B0M0AcF8_8V1v0Q0000PffffE1111T1d1c0B0M0AcF8_8V1v0Q0000PffffE1111T1d1c0B0M0AcF8_8V1v0Q0000PffffE1111T0wgf1d1c0q1G0M0B0h0v3T0w1f1d1c0q0G0M0B0h0v0T0w1f1d1c0q0G0M0B0h0v0T0w1f1d1c0q0G0M0B0h0v0T0w1f1d1c0q0G0M0B0h0v0T0w1f1d1c0q0G0M0B0h0v0T0w1f1d1c0q0G0M0B0h0v0T0w1f1d1c0q0G0M0B0h0v0T0w1f1d1c0q0G0M0B0h0v0T0w1f1d1c0q0G0M0B0h0v0T0whf1d1c0q0G0M0B0h0v0T0whfcd1c0q0G0M0B0h0v0T0w1f0d1c0q0G0M0B0h0v0T0w1f1d1c0q0G0M0B0h0v0T0w1f1d1c0q0G0M0B0h0v0T0w1f1d1c0q0G0M0B0h0v0T0w1f1d1c0q0G0M0B0h0v0T0w1f1d1c0q0G0M0B0h0v0T0w1f1d1c0q0G0M0B0h0v0T0w1f1d1c0q0G0M0B0h0v0T0wdf1d1c0q0G0M0B0h0v0T0w1f1d1c0q0G0M0B0h0v0T0w1f1d1c0q0G0M0B0h0v0T0w1f1d1c0q0G0M0B0h0v0T0w1f1d1c0q0G0M0B0h0v0T0w1f1d1c0q0G0M0B0h0v0T0w1f1d1c0q0G0M0B0h0v0T0w1f1d1c0q0G0M0B0h0v0T0w1f1d1c0q0G0M0B0h0v0T0w1f1d1c0q0G0M0B0h0v0T0wef1d1c0q0G0M0B6hev0T0w0f0d1c0q0G0M0B3h0v0T0w1f1d1c0q0G0M0B0h0v0T0w1f1d1c0q0G0M0B0h0v0T0w1f1d1c0q0G0M0B0h0v0T0w1f1d1c0q0G0M0B0h0v0T0w1f1d1c0q0G0M0B0h0v0T0w1f1d1c0q0G0M0B0h0v0T0w1f1d1c0q0G0M0B0h0v0T0w1f1d1c0q0G0M0B0h0v0T1d6c0B0M0A0F0_cV1v0Q0000Pf000E0111T0w1f1d1c0q0G0M0B0h0v0T0w1f1d1c0q0G0M0B0h0v0T0w1f1d1c0q0G0M0B0h0v0T0w1f1d1c0q0G0M0B0h0v0T0w1f1d1c0q0G0M0B0h0v0T0w1f1d1c0q0G0M0B0h0v0T0w1f1d1c0q0G0M0B0h0v0T0w1f1d1c0q0G0M0B0h0v0T0w1f1d1c0q0G0M0B0h0v0T0w5d1v1G0q0B0M0T0w0d1v3G0q0B0M0T0w5d1v1G0q0B0M0T0w5d1v1G0q0B0M0T0w5d1v1G0q0B0M0T0w5d1v1G0q0B0M0T0w5d1v1G0q0B0M0T0w5d1v1G0q0B0M0T0w5d1v1G0q0B0M0T0w5d1v1G0q0B0M0T0w6d1v1G0q0B0M0T0w4d1v0G0q0B0M0T0w6d1v1G0q0B0M0T0w6d1v1G0q0B0M0T0w6d1v1G0q0B0M0T0w6d1v1G0q0B0M0T0w6d1v1G0q0B0M0T0w6d1v1G0q0B0M0T0w6d1v1G0q0B0M0T0w6d1v1G0q0B0M0T0w1d1v0G0q0B0M0T0w0d1v1G0q0B0M0T0w1d1v0G0q0B0M0T0w1d1v0G0q0B0M0T0w1d1v0G0q0B0M0T0w1d1v0G0q0B0M0T0w1d1v0G0q0B0M0T0w1d1v0G0q0B0M0T0w1d1v0G0q0B0M0T0w1d1v0G0q0B0M0b121300000000000000000000000000000008454645461217121700000000000000000000000000000123242325000000062324232700000000000000000000000623242325898a898b898b898b0000001213121412151214121312161215121412151214000000001213121412131217121812180000001213121412131214121312151213121467686769abacabad121312141213121e0000000000000000000000123415670000000089ab8cdefghifjkl0000000000000000000000000000000000000000000000000000001213121512131214000000006abc6789121312141213121d00000000000000000000000000000004560123000000000000000000000000000000000456012704580129a000112222222222222222222222232222222311111114000000002222222222222222500000000011223333333333333333333333343333333611112222000000003333333333333333000250000000123435343634353436343534373435343gf0008889abacabad343534363435343ef000000000p2nn2Vcsy45m5EpcbE47wKID9UCXFx7wcwM70zL_E47xVKWogVlkoNCdMoU6gg00000000000000000000CJQIstrwMMKr7w0xnx0xAguwgu3rKKNzNNxXUa007cfK30VFZlgu4bJP70033u046_MwQY449zt1ejQggwKCPoy8nBxISf1CThSXs0eKP6dFIuNAO000000000000000000ISfh2G239xg80qXj3A5Eagl0F1g2w500V4INYId-xIYd08gVZFzO6wd5550syj65FJWvcxqr5Ixcw00000000000000000001jehy6CyGOCwdZJd43hhg6CGCyFcbgg04QW0XtBd2oS1I3o6127cJFEcoX8uCy-8aq1SmQQgd550WqGqaKd100UwuTpjhNwr0S1wgBOEuCy-8aq2TMRd433QQ5GHFEGKwbySmQQ6cd5dd2CD9A00000000000000019GsqmgmCDPm5cZ6CCgjoZ89fuGI319Jv8udFFHTsgAgUz1i5Mu4j64CFNBzws8kFzP9mQRkxParqugsSh3ppGdkBjCMm0QTkxV0cotyGSDwa231itky6ZnjY_cWwgAQA-l9b3gH2Auzjj8qBi6kwqHgMlaj7F1TWGrd_494e8Mkxs5ijIZ7360000000002CcTQkkkkkkgd5555550peyyyyyyy1EEEEEEE3jhhhhhhhg6wd5550qaaaaaaaagRxw0M8gSkkkkkkk6cqpVhg5cucy1E3Ap0U6yC2wq1MgY0Ap6C4HGFwV6GC2JGL71lRSTOkz8O9x7BkllMd0WNSk1Mfewq0U5A3GAxQk5MWTkkkkkkk9Ip0w000000000000000CdjziMw4Q-MFzxkOcxjjt8SnmmgJZJEkPNp6gFGbxcuTo6SiGH2HIvdMOa2Et-iAqqyUldzScQf4RlQxjscE0000000000000000002FwAsewt0W1zE7gewt0NQ3E7gn3gewa0Zp8W50ougGr7co200000000000000000000000F0siE9k4G2gkM81A0E1g381A0E1g381A0E1g381A0E1g0ug381g2w6g381g2w6g381g2w6g381g2w0sw6g2w50cw6g2w50cw6g1420k2S0k0E05idn8cosw740E1g381A0E1g381A0UwI0000000000000000000000juwv8kN88Q4q0QxkQkugVMmowep8qICwVgsGIAdmjmi6Eejmi6H9Eek7aH93lARA1G3BlAxGOq3B1OGOsyqpFCCgVgsGIAdmjgsEelmjAjjdcV0qwVlp8qICwQOjFCCqp2C041820k0E1A0O0k0E1A0O0k0E1A0O0k0E0781A0E1g381A0E1gw5Dc1jcD93AzPwRQ1FF3i6Cwddd0WgQQ1FF3i6Cwddc2eEdl0qqgQxFEEEEE7i6Cwdd8q2t550rwZtmi6H9EdcBv3gGr6Ip0ub3NtV8qICwQOog0000000000000"}, div("this demo")),
				div('.  (Warning: Includes FM)'),
			),
			this._cancelButton,
         );

			constructor(private _doc: SongDocument, private _songEditor: SongEditor) {
				this._cancelButton.addEventListener("click", this._close);
			}
			private _close = (): void => { 
				this._doc.undo();
			}
			
			public cleanUp = (): void => { 
				this._cancelButton.removeEventListener("click", this._close);
            };
    }
