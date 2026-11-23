export const WORLD_ART_ORDER = [
  "underwater", "candy", "forest", "crystal",
  "ice", "space", "castle", "ghost",
  "fairy", "dragon", "sky", "volcano",
  "desert", "rainbow-city"
] as const;

type WorldArtId = typeof WORLD_ART_ORDER[number];

const SCENES: Record<WorldArtId, string> = {
  underwater: `
    <rect width="960" height="540" fill="url(#ocean)"/>
    <path d="M0 0H960V190Q760 130 590 190T250 175T0 190Z" fill="#8cf5ff" opacity=".15"/>
    <g fill="#d8ffff" opacity=".22"><path d="M80 0h34l180 390H215Z"/><path d="M390 0h28l130 390h-45Z"/><path d="M760 0h42l145 390h-55Z"/></g>
    <g fill="#164c78" opacity=".85"><path d="M0 345L90 250 165 325 245 205 340 350 430 270 520 350 620 235 730 345 825 250 960 350V540H0Z"/></g>
    <g fill="#246c91"><path d="M70 355V220h34v-45h54v45h35v135Z"/><path d="M650 360V205h44v-55h58v55h42v155Z"/></g>
    <g fill="none" stroke="#8ed5d0" stroke-width="19" opacity=".85"><path d="M65 270V190Q145 85 225 190V270"/><path d="M390 310V245Q470 155 550 245V310"/><path d="M690 270V185Q770 90 850 185V270"/></g>
    <g fill="#4c8c9c"><rect x="55" y="265" width="24" height="110" rx="6"/><rect x="210" y="265" width="24" height="110" rx="6"/><rect x="380" y="305" width="22" height="82" rx="5"/><rect x="535" y="305" width="22" height="82" rx="5"/></g>
    <g fill="#ff6ea9"><path d="M0 540q25-130 75-155 40 80 25 155q55-115 105-95 10 75-30 95h110q-25-60 5-105 45 50 35 105Z"/><path d="M690 540q25-110 65-145 35 65 25 145q55-110 100-88 12 68-30 88h110q-30-55 0-95 45 42 40 95Z"/></g>
    <g fill="#22c8ad"><path d="M170 540q-30-170 35-245 40 120 30 245q45-175 100-205 18 125-30 205Z"/><path d="M560 540q-20-150 30-225 40 95 30 225q45-145 95-180 15 105-25 180Z"/></g>
    <g fill="#ffb14f"><circle cx="300" cy="390" r="18"/><circle cx="325" cy="415" r="13"/><circle cx="850" cy="380" r="16"/></g>
    <g fill="none" stroke="#e3ffff" stroke-width="4" opacity=".65"><circle cx="280" cy="90" r="14"/><circle cx="335" cy="150" r="8"/><circle cx="835" cy="110" r="18"/><circle cx="610" cy="70" r="6"/></g>
    <path d="M0 475Q180 420 340 475T650 470T960 465V540H0Z" fill="#063b65" opacity=".62"/>
  `,
  candy: `
    <rect width="960" height="540" fill="url(#candySky)"/>
    <circle cx="790" cy="90" r="74" fill="#fff5c7" opacity=".75"/>
    <path d="M0 350Q130 235 290 345T610 335T960 350V540H0Z" fill="#f58ac4"/>
    <path d="M0 425Q180 330 360 420T720 415T960 420V540H0Z" fill="#d95c9c"/>
    <g fill="#fff0cf" stroke="#d97caf" stroke-width="8"><path d="M70 360V190h62v-58l48-55 50 55v58h60v170Z"/><path d="M610 360V155h78V85l58-65 60 65v70h76v205Z"/></g>
    <g fill="#a878d4" stroke="#ffe8fa" stroke-width="8"><path d="M115 190v-58l65-75 65 75v58Z"/><path d="M665 155V85l80-80 80 80v70Z"/></g>
    <g fill="#ffca64"><rect x="95" y="250" width="28" height="55" rx="14"/><rect x="220" y="250" width="28" height="55" rx="14"/><rect x="650" y="225" width="30" height="62" rx="15"/><rect x="800" y="225" width="30" height="62" rx="15"/></g>
    <g stroke="#fff8f2" stroke-width="13" fill="none"><path d="M390 380V210a58 58 0 1 1 116 0v170"/><path d="M450 380V250a34 34 0 1 1 68 0v130"/></g>
    <g><path d="M350 210v-95" stroke="#fff" stroke-width="9"/><circle cx="350" cy="90" r="54" fill="#f36ba8" stroke="#fff2d7" stroke-width="10"/><circle cx="350" cy="90" r="31" fill="#ffdf83"/><path d="M315 90h70M350 55v70" stroke="#fff" stroke-width="7"/></g>
    <g fill="#8bd7bd"><circle cx="60" cy="455" r="62"/><circle cx="260" cy="475" r="42"/><circle cx="900" cy="455" r="68"/></g>
    <g fill="#fff5df"><circle cx="430" cy="120" r="8"/><circle cx="550" cy="175" r="7"/><circle cx="585" cy="95" r="5"/><circle cx="260" cy="250" r="6"/></g>
  `,
  forest: `
    <rect width="960" height="540" fill="url(#forestSky)"/>
    <circle cx="760" cy="80" r="95" fill="#fff4b1" opacity=".45"/>
    <path d="M0 345Q180 235 360 350T700 335T960 345V540H0Z" fill="#286f55"/>
    <g fill="#174d42"><path d="M25 0h70v540H25Z"/><path d="M245 0h72v540h-72Z"/><path d="M710 0h76v540h-76Z"/><path d="M875 0h55v540h-55Z"/></g>
    <g fill="#27865b"><circle cx="55" cy="120" r="130"/><circle cx="205" cy="155" r="125"/><circle cx="365" cy="105" r="145"/><circle cx="760" cy="145" r="155"/><circle cx="920" cy="130" r="130"/></g>
    <g fill="#4dbb78"><circle cx="105" cy="225" r="75"/><circle cx="285" cy="245" r="85"/><circle cx="695" cy="240" r="92"/><circle cx="865" cy="245" r="76"/></g>
    <path d="M450 145Q520 100 590 150L635 390H410Z" fill="#a7ece0" opacity=".75"/><path d="M475 165Q530 125 570 165L600 370H445Z" fill="#f5ffff" opacity=".38"/>
    <g fill="#d8a66d"><path d="M95 410V285h18v-35l45-35 45 35v35h18v125Z"/><path d="M740 410V300h20v-38l48-38 48 38v38h20v110Z"/></g>
    <g fill="#f6d6a0"><path d="M130 285v-35l28-25 28 25v35Z"/><path d="M780 300v-38l28-24 28 24v38Z"/></g>
    <g fill="#ff91c1"><circle cx="200" cy="445" r="15"/><circle cx="235" cy="460" r="10"/><circle cx="800" cy="430" r="17"/><circle cx="840" cy="450" r="12"/></g>
    <g fill="#ffe78c"><circle cx="425" cy="235" r="6"/><circle cx="640" cy="280" r="5"/><circle cx="860" cy="250" r="7"/><circle cx="320" cy="350" r="5"/></g>
    <path d="M0 480Q230 410 420 475T780 470T960 480V540H0Z" fill="#194d42"/>
  `,
  crystal: `
    <rect width="960" height="540" fill="url(#caveSky)"/>
    <path d="M0 0H960V150Q760 85 600 150T280 145T0 165Z" fill="#17133f"/>
    <g fill="#211a55"><path d="M0 0h75l65 170 55-170h90l-80 210H90Z"/><path d="M420 0h75l55 145 58-145h95l-90 215H455Z"/><path d="M800 0h70l45 130 45-130Z"/></g>
    <g fill="#573ba5"><path d="M20 540l80-245 80 245Z"/><path d="M240 540l75-285 90 285Z"/><path d="M720 540l95-300 95 300Z"/></g>
    <g fill="#56d7ff"><path d="M145 540l65-275 62 275Z"/><path d="M430 540l78-320 78 320Z"/><path d="M650 540l58-245 62 245Z"/></g>
    <g fill="#b98aff"><path d="M205 540l42-180 48 180Z"/><path d="M510 540l48-225 52 225Z"/><path d="M790 540l45-190 48 190Z"/></g>
    <g fill="none" stroke="#b8faff" stroke-width="9" opacity=".35"><path d="M0 385Q210 290 430 385T960 380"/><path d="M0 445Q230 360 500 445T960 440"/></g>
    <g fill="#fff"><circle cx="185" cy="210" r="4"/><circle cx="550" cy="170" r="5"/><circle cx="835" cy="250" r="4"/><circle cx="330" cy="115" r="3"/></g>
    <g fill="#ff77d5" opacity=".85"><circle cx="330" cy="400" r="12"/><circle cx="605" cy="360" r="9"/><circle cx="865" cy="420" r="13"/></g>
  `,
  ice: `
    <rect width="960" height="540" fill="url(#iceSky)"/>
    <circle cx="760" cy="85" r="85" fill="#fff" opacity=".55"/>
    <path d="M0 380L105 145 245 380Z M170 390L400 50 625 390Z M510 390L710 130 900 390Z M760 390L880 85 1020 390Z" fill="#9eddf5"/>
    <path d="M400 50L330 190 405 145 455 215 485 150 560 210Z" fill="#f3ffff"/>
    <path d="M0 420Q220 330 440 420T960 410V540H0Z" fill="#83cdea"/>
    <g fill="#347fae"><path d="M610 400V235h65v-48l52-70 54 70v48h63v165Z"/><path d="M130 420V310h35v-35l35-42 38 42v35h35v110Z"/></g>
    <g fill="#e8fbff" stroke="#b2edff" stroke-width="6"><path d="M625 235v-48l52-70 54 70v48Z"/><path d="M145 310v-35l55-65 55 65v35Z"/></g>
    <g fill="#fff"><circle cx="180" cy="130" r="5"/><circle cx="305" cy="85" r="4"/><circle cx="860" cy="200" r="5"/><circle cx="510" cy="160" r="4"/></g>
    <g stroke="#eaffff" stroke-width="7" opacity=".8"><path d="M50 450l25 40 20-40 25 40"/><path d="M820 430l20 35 25-35 25 35"/></g>
  `,
  space: `
    <rect width="960" height="540" fill="url(#spaceSky)"/>
    <g fill="#fff"><circle cx="60" cy="70" r="3"/><circle cx="390" cy="55" r="4"/><circle cx="600" cy="90" r="3"/><circle cx="870" cy="310" r="4"/><circle cx="130" cy="360" r="3"/><circle cx="420" cy="290" r="3"/><circle cx="910" cy="55" r="2"/><circle cx="680" cy="470" r="3"/></g>
    <circle cx="230" cy="185" r="112" fill="#9b83eb"/><path d="M120 175Q220 80 335 180Q260 300 140 255Z" fill="#6f5ac6" opacity=".8"/>
    <ellipse cx="230" cy="185" rx="205" ry="48" fill="none" stroke="#f3b8ff" stroke-width="17" transform="rotate(-20 230 185)"/>
    <circle cx="745" cy="160" r="145" fill="#d96fa8"/><circle cx="700" cy="115" r="130" fill="#f0a4c7" opacity=".45"/><ellipse cx="745" cy="160" rx="230" ry="55" fill="none" stroke="#7eeaff" stroke-width="18" transform="rotate(16 745 160)"/>
    <path d="M0 440Q160 360 330 450T650 440T960 430V540H0Z" fill="#17194f"/>
    <g fill="#5745a2"><path d="M80 460l75-120 85 120Z"/><path d="M450 475l90-150 100 150Z"/><path d="M760 470l80-130 90 130Z"/></g>
    <g fill="#9cecff"><path d="M475 450l55-95 55 95Z"/><path d="M820 460l35-70 40 70Z"/></g>
  `,
  castle: `
    <rect width="960" height="540" fill="url(#castleSky)"/>
    <circle cx="800" cy="75" r="95" fill="#fff2b9" opacity=".55"/>
    <path d="M0 390Q160 320 310 390T650 380T960 390V540H0Z" fill="#528e79"/>
    <g fill="#6c4b91" stroke="#d6b6ee" stroke-width="8"><path d="M110 450V210h110V130l70-80 70 80v80h110v240Z"/><path d="M540 450V175h105V95l68-80 68 80v80h105v275Z"/></g>
    <g fill="#a88bd7" stroke="#f2e5ff" stroke-width="7"><path d="M145 210v-85l75-95 75 95v85Z"/><path d="M575 175V95l70-80 68 80v80Z"/></g>
    <g fill="#ffe188"><rect x="155" y="280" width="24" height="55" rx="11"/><rect x="255" y="280" width="24" height="55" rx="11"/><rect x="590" y="250" width="24" height="65" rx="11"/><rect x="700" y="250" width="24" height="65" rx="11"/></g>
    <g fill="#54b983"><circle cx="65" cy="450" r="70"/><circle cx="900" cy="450" r="75"/></g>
    <path d="M0 500q90-100 180 0M780 500q90-100 180 0" stroke="#ffe1a2" stroke-width="15" fill="none"/>
  `,
  ghost: `
    <rect width="960" height="540" fill="url(#ghostSky)"/>
    <circle cx="750" cy="90" r="95" fill="#e2ebff" opacity=".9"/><circle cx="780" cy="72" r="87" fill="#b8c9ef" opacity=".5"/>
    <path d="M0 420Q190 350 360 420T700 420T960 420V540H0Z" fill="#6979a9" opacity=".35"/>
    <g fill="#302d59"><path d="M70 440V265h90v-70l60-65 62 65v70h88v175Z"/><path d="M460 450V220h110v-75l75-85 76 85v75h110v230Z"/><path d="M790 450V290h70v-55l45-55 45 55v55h80v160Z"/></g>
    <g fill="#dfeaff"><rect x="120" y="320" width="22" height="40" rx="12"/><rect x="205" y="320" width="22" height="40" rx="12"/><rect x="530" y="285" width="30" height="48" rx="15"/><rect x="635" y="285" width="30" height="48" rx="15"/></g>
    <g fill="none" stroke="#b4c5f3" stroke-width="8" opacity=".45"><path d="M30 470q90-80 180 0t180 0"/><path d="M600 485q90-80 180 0t180 0"/></g>
    <path d="M320 280q-35-50 0-75 30-55 75-5 33 30 4 80l-5 55h-75Z" fill="#f7fbff"/><circle cx="350" cy="280" r="6" fill="#485a8b"/><circle cx="383" cy="280" r="6" fill="#485a8b"/>
  `,
  fairy: `
    <rect width="960" height="540" fill="url(#fairySky)"/>
    <circle cx="780" cy="80" r="110" fill="#fff2cf" opacity=".4"/>
    <g fill="#2d936d"><path d="M0 450Q70 210 175 400Q240 190 335 450Z"/><path d="M640 450Q740 160 830 420Q890 210 980 450Z"/></g>
    <g fill="#63c78b"><circle cx="155" cy="235" r="115"/><circle cx="280" cy="285" r="98"/><circle cx="765" cy="235" r="130"/><circle cx="890" cy="290" r="98"/></g>
    <g fill="#ff92c3"><g><circle cx="420" cy="390" r="31"/><circle cx="380" cy="360" r="27"/><circle cx="460" cy="360" r="27"/><circle cx="420" cy="320" r="27"/><circle cx="420" cy="430" r="27"/></g><g><circle cx="610" cy="410" r="35"/><circle cx="570" cy="375" r="28"/><circle cx="650" cy="375" r="28"/><circle cx="610" cy="335" r="28"/></g></g>
    <g fill="#ffe88c"><circle cx="420" cy="385" r="16"/><circle cx="610" cy="410" r="18"/><circle cx="510" cy="180" r="6"/><circle cx="565" cy="250" r="5"/><circle cx="700" cy="165" r="7"/></g>
    <g fill="#fff" opacity=".6"><circle cx="90" cy="95" r="4"/><circle cx="350" cy="120" r="3"/><circle cx="870" cy="160" r="4"/></g>
    <path d="M0 500Q190 430 380 495T760 490T960 500V540H0Z" fill="#4b9b77"/>
  `,
  dragon: `
    <rect width="960" height="540" fill="url(#dragonSky)"/>
    <path d="M0 430L120 195 280 430Z M190 430L415 80 640 430Z M520 430L710 160 900 430Z" fill="#346e72"/>
    <path d="M415 80l-70 125 80-48 55 88 48-118Z" fill="#b6e2d0"/>
    <path d="M470 120Q525 250 500 330Q480 410 560 470" stroke="#b2f5f4" stroke-width="46" fill="none"/><path d="M470 120Q525 250 500 330Q480 410 560 470" stroke="#efffff" stroke-width="14" fill="none"/>
    <g fill="#2b815e"><path d="M40 450V300h28v150Z"/><path d="M18 340q36-75 72 0q-36-22-72 0Z"/><path d="M840 450V275h32v175Z"/><path d="M815 325q44-90 90 0q-45-30-90 0Z"/></g>
    <g fill="#ffe4a5"><ellipse cx="170" cy="475" rx="180" ry="34"/><ellipse cx="720" cy="475" rx="220" ry="40"/></g>
    <g fill="#ffb35f"><circle cx="430" cy="115" r="8"/><circle cx="520" cy="180" r="6"/><circle cx="680" cy="95" r="5"/></g>
  `,
  sky: `
    <rect width="960" height="540" fill="url(#skySky)"/>
    <circle cx="770" cy="95" r="100" fill="#fff3ba" opacity=".65"/>
    <g fill="#fff"><ellipse cx="160" cy="190" rx="130" ry="42"/><ellipse cx="225" cy="160" rx="86" ry="52"/><ellipse cx="675" cy="220" rx="150" ry="48"/><ellipse cx="740" cy="185" rx="85" ry="54"/></g>
    <g fill="#67baa4"><path d="M55 320Q165 215 290 320L235 425H110Z"/><path d="M380 390Q520 245 660 390L600 495H445Z"/><path d="M690 325Q805 220 930 325L880 425H745Z"/></g>
    <g fill="#657da9"><path d="M110 412l150 0-75 115Z"/><path d="M450 470l170 0-85 120Z"/><path d="M760 415l150 0-75 115Z"/></g>
    <g fill="#b4f0d3"><path d="M90 320q55-50 110 0Z"/><path d="M420 385q75-70 150 0Z"/><path d="M730 320q55-55 120 0Z"/></g>
    <g fill="#fff"><path d="M90 290q70-65 140 0"/><path d="M420 350q85-75 170 0"/></g>
  `,
  volcano: `
    <rect width="960" height="540" fill="url(#volcanoSky)"/>
    <circle cx="740" cy="100" r="120" fill="#ffb34c" opacity=".25"/>
    <path d="M0 440L130 255 280 430 410 120 600 455 730 175 870 435 960 310V540H0Z" fill="#4d3147"/>
    <path d="M410 120l-45 95 50-42 48 65 38-70Z M730 175l-45 95 50-40 40 60 35-70Z" fill="#ffbc64"/>
    <path d="M410 170Q380 250 420 315Q455 390 420 480" stroke="#ff793c" stroke-width="28" fill="none"/><path d="M730 220Q695 300 730 355Q765 430 730 510" stroke="#ffb23a" stroke-width="25" fill="none"/>
    <g fill="#ffb05a" opacity=".8"><circle cx="230" cy="120" r="6"/><circle cx="540" cy="90" r="8"/><circle cx="855" cy="165" r="6"/><circle cx="640" cy="270" r="5"/></g>
    <path d="M0 495Q160 430 320 500T660 490T960 495V540H0Z" fill="#2e2438"/>
  `,
  desert: `
    <rect width="960" height="540" fill="url(#desertSky)"/>
    <circle cx="760" cy="100" r="110" fill="#fff3c8" opacity=".7"/>
    <path d="M0 350Q140 270 300 350T630 340T960 350V540H0Z" fill="#e8af68"/><path d="M0 440Q190 330 380 445T750 430T960 440V540H0Z" fill="#bd754d"/>
    <g fill="#b87958"><path d="M350 410V190h65v-70l60-75 60 75v70h75v220Z"/><path d="M650 410V260h50v-48l45-55 45 55v48h55v150Z"/></g>
    <g fill="#efc08b" stroke="#9b5d4b" stroke-width="6"><path d="M380 190v-68l95-115 95 115v68Z"/><path d="M666 260v-50l80-90 80 90v50Z"/></g>
    <g fill="#267f68"><path d="M120 450q-25-120 5-200 42 45 40 200Z"/><path d="M142 290q-70-8-92-60 70-15 98 45Z"/><path d="M150 330q75-20 103-76 10 75-80 100Z"/></g>
    <g fill="#f6d9a4"><circle cx="270" cy="420" r="9"/><circle cx="300" cy="435" r="6"/><circle cx="850" cy="390" r="8"/></g>
  `,
  "rainbow-city": `
    <rect width="960" height="540" fill="url(#rainbowSky)"/>
    <circle cx="770" cy="80" r="100" fill="#fff2b4" opacity=".7"/>
    <g fill="#a496e3"><path d="M0 430V260h105v-55l55-55 55 55v55h105v170Z"/><path d="M260 430V200h110v-70l68-60 68 60v70h110v230Z"/><path d="M600 430V250h100v-60l60-55 65 55v60h100v180Z"/></g>
    <g fill="#fff4cb"><rect x="35" y="285" width="22" height="36" rx="6"/><rect x="100" y="285" width="22" height="36" rx="6"/><rect x="310" y="255" width="26" height="40" rx="6"/><rect x="385" y="255" width="26" height="40" rx="6"/><rect x="660" y="300" width="24" height="36" rx="6"/><rect x="725" y="300" width="24" height="36" rx="6"/></g>
    <path d="M155 470Q300 90 480 90Q650 90 800 470" stroke="#f07aa8" stroke-width="36" fill="none"/><path d="M190 470Q320 145 480 145Q625 145 765 470" stroke="#ffe078" stroke-width="28" fill="none"/><path d="M225 470Q340 200 480 200Q600 200 730 470" stroke="#73dec1" stroke-width="23" fill="none"/><path d="M260 470Q360 255 480 255Q580 255 695 470" stroke="#73cfff" stroke-width="18" fill="none"/>
    <g fill="#fff"><circle cx="90" cy="120" r="5"/><circle cx="520" cy="75" r="6"/><circle cx="880" cy="210" r="5"/></g>
  `
};

const DEFS = `<defs>
  <linearGradient id="ocean" x2="0" y2="1"><stop stop-color="#003d75"/><stop offset=".38" stop-color="#087fae"/><stop offset=".72" stop-color="#12bfd0"/><stop offset="1" stop-color="#043c65"/></linearGradient>
  <linearGradient id="candySky" x2="0" y2="1"><stop stop-color="#ff91d0"/><stop offset=".55" stop-color="#ffd9ae"/><stop offset="1" stop-color="#e86cae"/></linearGradient>
  <linearGradient id="forestSky" x2="0" y2="1"><stop stop-color="#9ce9b2"/><stop offset=".6" stop-color="#4bb87a"/><stop offset="1" stop-color="#174d42"/></linearGradient>
  <linearGradient id="caveSky" x2="0" y2="1"><stop stop-color="#14123f"/><stop offset=".55" stop-color="#5742a4"/><stop offset="1" stop-color="#17123e"/></linearGradient>
  <linearGradient id="iceSky" x2="0" y2="1"><stop stop-color="#68cfff"/><stop offset=".58" stop-color="#d8f8ff"/><stop offset="1" stop-color="#62b6df"/></linearGradient>
  <linearGradient id="spaceSky" x2="0" y2="1"><stop stop-color="#090f36"/><stop offset=".6" stop-color="#352777"/><stop offset="1" stop-color="#15113c"/></linearGradient>
  <linearGradient id="castleSky" x2="0" y2="1"><stop stop-color="#ffd27a"/><stop offset=".6" stop-color="#dfa3a9"/><stop offset="1" stop-color="#7660aa"/></linearGradient>
  <linearGradient id="ghostSky" x2="0" y2="1"><stop stop-color="#20234e"/><stop offset=".6" stop-color="#687bb6"/><stop offset="1" stop-color="#252a4a"/></linearGradient>
  <linearGradient id="fairySky" x2="0" y2="1"><stop stop-color="#ffb9d9"/><stop offset=".6" stop-color="#f2c7e0"/><stop offset="1" stop-color="#5cbb95"/></linearGradient>
  <linearGradient id="dragonSky" x2="0" y2="1"><stop stop-color="#7acdbd"/><stop offset=".6" stop-color="#9cd8aa"/><stop offset="1" stop-color="#347c78"/></linearGradient>
  <linearGradient id="skySky" x2="0" y2="1"><stop stop-color="#65caff"/><stop offset=".6" stop-color="#c7f1ff"/><stop offset="1" stop-color="#dbefff"/></linearGradient>
  <linearGradient id="volcanoSky" x2="0" y2="1"><stop stop-color="#d95c4c"/><stop offset=".6" stop-color="#a13d4c"/><stop offset="1" stop-color="#3b263d"/></linearGradient>
  <linearGradient id="desertSky" x2="0" y2="1"><stop stop-color="#ffd68c"/><stop offset=".6" stop-color="#f3bb79"/><stop offset="1" stop-color="#d9875d"/></linearGradient>
  <linearGradient id="rainbowSky" x2="0" y2="1"><stop stop-color="#9d94ed"/><stop offset=".6" stop-color="#f2bfe3"/><stop offset="1" stop-color="#79d1c4"/></linearGradient>
</defs>`;

export function getWorldAtlasUrl(): string {
  const parts = WORLD_ART_ORDER.map((id, index) =>
    '<g transform="translate(' + ((index % 4) * 960) + ' ' + (Math.floor(index / 4) * 540) + ')">' + SCENES[id] + '</g>'
  ).join("");
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="3840" height="2160" viewBox="0 0 3840 2160">' + DEFS + parts + '</svg>';
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}

export function getWorldArtPosition(backdrop: string): { column: number; row: number } {
  const index = WORLD_ART_ORDER.indexOf(backdrop as WorldArtId);
  const safeIndex = index >= 0 ? index : 0;
  return { column: safeIndex % 4, row: Math.floor(safeIndex / 4) };
}

export function getWorldArtStyle(backdrop: string): string {
  const { column, row } = getWorldArtPosition(backdrop);
  return [
    "background-image:url('" + getWorldAtlasUrl() + "')",
    "background-size:400% 400%",
    "background-position:" + ((column / 3) * 100) + "% " + ((row / 3) * 100) + "%",
    "background-repeat:no-repeat"
  ].join(";");
}
