import type { CharacterId } from "./characters";

/** Original scalable SVG artwork for the four additional heroes. */
const fairy = \`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 380 520">
<defs>
 <linearGradient id="wing" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#eaffff" stop-opacity=".95"/><stop offset=".55" stop-color="#8fe9e3" stop-opacity=".65"/><stop offset="1" stop-color="#c18bf4" stop-opacity=".7"/></linearGradient>
 <linearGradient id="dress" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#ffb9dc"/><stop offset=".55" stop-color="#cb7df3"/><stop offset="1" stop-color="#8254cf"/></linearGradient>
 <linearGradient id="hair" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#f6b8d9"/><stop offset="1" stop-color="#a96bd7"/></linearGradient>
 <radialGradient id="skin"><stop stop-color="#ffe4d5"/><stop offset="1" stop-color="#f3bca9"/></radialGradient>
 <filter id="shadow"><feGaussianBlur stdDeviation="7"/></filter>
</defs>
<ellipse cx="190" cy="493" rx="85" ry="13" fill="#503a8d" opacity=".18" filter="url(#shadow)"/>
<path d="M148 252 C45 145 25 230 89 315 C114 349 142 332 166 296Z" fill="url(#wing)" stroke="#75c8d8" stroke-width="7"/>
<path d="M230 252 C335 145 356 230 291 315 C266 349 237 332 214 296Z" fill="url(#wing)" stroke="#75c8d8" stroke-width="7"/>
<path d="M125 248 C38 188 43 298 128 349 C157 366 173 326 165 292Z" fill="url(#wing)" stroke="#a58ad9" stroke-width="5"/>
<path d="M254 248 C342 188 338 298 252 349 C223 366 208 326 215 292Z" fill="url(#wing)" stroke="#a58ad9" stroke-width="5"/>
<path d="M158 370 L145 471 L175 471 L192 388 L211 471 L243 471 L225 366" fill="#edc4d8" stroke="#9664bd" stroke-width="7" stroke-linejoin="round"/>
<path d="M140 465 Q163 451 181 468 L181 490 Q155 503 133 486Z M203 468 Q225 450 249 465 L254 486 Q232 503 207 490Z" fill="#6b5ad0" stroke="#413a91" stroke-width="6"/>
<path d="M147 250 Q190 220 233 250 L253 375 Q191 407 126 375Z" fill="url(#dress)" stroke="#9254cb" stroke-width="7"/>
<path d="M126 366 Q191 391 253 366 L286 430 Q194 469 94 430Z" fill="#d78cf4" stroke="#9056c8" stroke-width="7"/>
<path d="M112 420 Q190 448 270 420" fill="none" stroke="#fff0fb" stroke-width="10" stroke-linecap="round"/>
<path d="M143 257 Q190 282 237 257" fill="none" stroke="#fff1ff" stroke-width="9"/>
<path d="M138 253 L107 309 M242 253 L274 307" stroke="#f0c4ae" stroke-width="18" stroke-linecap="round"/>
<circle cx="190" cy="176" r="84" fill="url(#skin)" stroke="#d28f8d" stroke-width="5"/>
<path d="M106 177 Q87 76 182 67 Q278 62 275 168 Q260 112 225 110 Q190 126 163 104 Q137 116 106 177Z" fill="url(#hair)" stroke="#8955a6" stroke-width="8"/>
<path d="M104 174 Q72 215 119 270 Q141 286 141 230 L145 175Z M263 168 Q302 214 260 270 Q239 286 238 229 L236 174Z" fill="url(#hair)" stroke="#8955a6" stroke-width="7"/>
<path d="M119 140 Q156 89 185 131 Q213 86 253 140" fill="none" stroke="#ffe0f2" stroke-width="13" stroke-linecap="round"/>
<ellipse cx="160" cy="183" rx="16" ry="24" fill="#fff"/><ellipse cx="220" cy="183" rx="16" ry="24" fill="#fff"/>
<ellipse cx="163" cy="186" rx="10" ry="17" fill="#58429c"/><ellipse cx="217" cy="186" rx="10" ry="17" fill="#58429c"/>
<circle cx="166" cy="177" r="5" fill="#fff"/><circle cx="220" cy="177" r="5" fill="#fff"/>
<path d="M143 152 Q158 140 175 151 M205 151 Q223 139 239 152" fill="none" stroke="#68416f" stroke-width="7" stroke-linecap="round"/>
<ellipse cx="133" cy="220" rx="15" ry="8" fill="#f18eac" opacity=".6"/><ellipse cx="246" cy="220" rx="15" ry="8" fill="#f18eac" opacity=".6"/>
<path d="M177 229 Q190 242 204 228" fill="none" stroke="#a14d78" stroke-width="6" stroke-linecap="round"/>
<path d="M174 93 L190 52 L205 93Z" fill="#ffe076" stroke="#a78046" stroke-width="5"/><circle cx="190" cy="90" r="12" fill="#85eee1" stroke="#fff" stroke-width="4"/>
<path d="M278 276 L312 217" stroke="#9b72dc" stroke-width="8" stroke-linecap="round"/><path d="M309 211 L319 188 L330 211 L353 216 L332 231 L330 254 L314 236 L292 240 L303 221Z" fill="#fff09a" stroke="#e3a94e" stroke-width="4"/>
<path d="M85 93 L89 78 L94 93 L110 98 L94 104 L89 121 L84 104 L69 98Z M294 100 L299 86 L304 100 L318 105 L304 111 L299 126 L294 111 L280 105Z" fill="#fff3a5"/>
</svg>\`;

const dragonRider = \`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 380 520">
<defs>
 <linearGradient id="coat" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#59d5bd"/><stop offset="1" stop-color="#137c79"/></linearGradient>
 <linearGradient id="hair" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#d98a4e"/><stop offset="1" stop-color="#7c3d2d"/></linearGradient>
 <linearGradient id="dragon" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#ffb75d"/><stop offset="1" stop-color="#e45c52"/></linearGradient>
 <radialGradient id="skin"><stop stop-color="#ffe4cd"/><stop offset="1" stop-color="#efb999"/></radialGradient>
</defs>
<ellipse cx="188" cy="495" rx="84" ry="12" fill="#273d4c" opacity=".18"/>
<!-- little dragon companion -->
<path d="M246 226 Q272 179 324 198 Q356 212 349 246 Q340 277 301 267 L273 294 L253 267Z" fill="url(#dragon)" stroke="#8e3f49" stroke-width="8"/>
<path d="M276 203 L265 177 L295 193 M316 203 L336 181 L335 214" fill="#f8ca72" stroke="#8e3f49" stroke-width="7" stroke-linejoin="round"/>
<path d="M274 231 Q247 210 247 186 Q280 192 291 221" fill="#75d9cb" stroke="#398b8a" stroke-width="6"/>
<path d="M302 266 Q317 294 340 298" fill="none" stroke="#e65c50" stroke-width="13" stroke-linecap="round"/>
<circle cx="311" cy="225" r="8" fill="#fff"/><circle cx="313" cy="226" r="4" fill="#283a49"/>
<path d="M326 247 Q336 255 346 248" fill="none" stroke="#7b3342" stroke-width="5"/>
<!-- legs and boots -->
<path d="M150 370 L141 468 L177 468 L190 388 L206 468 L241 468 L225 363" fill="#334f6e" stroke="#233851" stroke-width="8" stroke-linejoin="round"/>
<path d="M132 464 Q157 451 181 469 L181 493 L128 493Z M204 468 Q229 450 252 466 L254 493 L204 493Z" fill="#bc5d45" stroke="#743c42" stroke-width="7"/>
<!-- coat/costume -->
<path d="M141 245 Q190 218 239 245 L260 382 Q195 408 121 382Z" fill="url(#coat)" stroke="#245e69" stroke-width="8"/>
<path d="M140 251 L190 306 L240 251 L252 378 Q191 408 126 378Z" fill="#2cafa4" stroke="#d3b36e" stroke-width="6"/>
<path d="M165 252 L190 294 L215 252" fill="none" stroke="#ffd77b" stroke-width="8"/>
<path d="M132 375 L248 375 L279 429 Q190 461 101 429Z" fill="#d78e48" stroke="#7c563e" stroke-width="7"/>
<path d="M132 428 Q190 446 247 428" fill="none" stroke="#ffe1a0" stroke-width="9"/>
<!-- arms -->
<path d="M139 259 L100 335 L121 348 L162 300 M237 258 L279 314 L265 337 L223 302" fill="none" stroke="#eab797" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M101 332 L81 359 M277 317 L297 343" stroke="#eab797" stroke-width="17" stroke-linecap="round"/>
<!-- face -->
<circle cx="190" cy="169" r="78" fill="url(#skin)" stroke="#c98973" stroke-width="5"/>
<path d="M110 171 Q97 76 188 64 Q276 64 270 177 Q251 117 212 114 Q185 138 158 111 Q128 128 110 171Z" fill="url(#hair)" stroke="#75412f" stroke-width="8"/>
<path d="M115 161 Q82 217 121 255 Q141 270 145 218 L142 158Z M264 156 Q288 207 257 245 L238 206 L240 159Z" fill="url(#hair)" stroke="#75412f" stroke-width="7"/>
<path d="M128 117 Q165 82 197 121 Q226 82 257 125" fill="none" stroke="#edb47e" stroke-width="9" stroke-linecap="round"/>
<ellipse cx="159" cy="177" rx="15" ry="22" fill="#fff"/><ellipse cx="220" cy="177" rx="15" ry="22" fill="#fff"/>
<ellipse cx="161" cy="179" rx="9" ry="16" fill="#365d9c"/><ellipse cx="218" cy="179" rx="9" ry="16" fill="#365d9c"/>
<circle cx="165" cy="171" r="5" fill="#fff"/><circle cx="222" cy="171" r="5" fill="#fff"/>
<path d="M143 146 Q158 136 176 145 M205 145 Q220 136 238 147" fill="none" stroke="#6c3d32" stroke-width="6" stroke-linecap="round"/>
<ellipse cx="137" cy="211" rx="13" ry="8" fill="#f18e9e" opacity=".55"/><ellipse cx="245" cy="211" rx="13" ry="8" fill="#f18e9e" opacity=".55"/>
<path d="M174 226 Q190 241 207 225" fill="none" stroke="#9b4c55" stroke-width="6" stroke-linecap="round"/>
<!-- headband and star -->
<path d="M128 114 Q188 81 250 113" fill="none" stroke="#ffcf68" stroke-width="9"/>
<path d="M189 89 L198 70 L207 89 L228 93 L212 107 L209 127 L192 114 L174 123 L179 103 L164 91Z" fill="#ffe17b" stroke="#a37c4e" stroke-width="4"/>
</svg>\`;

const starExplorer = \`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 380 520">
<defs>
 <linearGradient id="suit" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#51b6f6"/><stop offset="1" stop-color="#2854aa"/></linearGradient>
 <linearGradient id="hair" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#76503f"/><stop offset="1" stop-color="#282941"/></linearGradient>
 <radialGradient id="skin"><stop stop-color="#ffe5d0"/><stop offset="1" stop-color="#edb39a"/></radialGradient>
 <linearGradient id="visor"><stop stop-color="#bffaff"/><stop offset="1" stop-color="#4b9bd7"/></linearGradient>
</defs>
<ellipse cx="190" cy="492" rx="88" ry="12" fill="#173765" opacity=".18"/>
<!-- backpack -->
<rect x="244" y="255" width="54" height="135" rx="22" fill="#344d93" stroke="#20336c" stroke-width="8"/>
<rect x="254" y="273" width="35" height="56" rx="10" fill="#75e5eb"/>
<!-- legs -->
<path d="M145 367 L137 465 L174 465 L190 383 L210 465 L246 465 L227 367" fill="#263c7b" stroke="#1d3165" stroke-width="8"/>
<path d="M129 463 Q156 452 180 466 L182 493 L128 493Z M206 465 Q233 453 254 466 L258 493 L204 493Z" fill="#f07a60" stroke="#9c4b58" stroke-width="7"/>
<!-- suit -->
<path d="M139 240 Q190 213 242 241 L260 381 Q195 404 121 381Z" fill="url(#suit)" stroke="#244b92" stroke-width="8"/>
<path d="M165 251 L190 295 L216 251" fill="none" stroke="#d4f9ff" stroke-width="8"/>
<path d="M190 295 L190 371" stroke="#f5c96a" stroke-width="6"/>
<path d="M137 381 L246 381 L280 431 Q190 460 99 431Z" fill="#3f66b4" stroke="#253a79" stroke-width="7"/>
<path d="M122 421 Q190 447 259 421" fill="none" stroke="#8de5ee" stroke-width="9"/>
<!-- arms -->
<path d="M140 255 L101 334 L124 347 L163 296 M241 255 L278 320 L259 339 L223 296" fill="none" stroke="#edb99e" stroke-width="17" stroke-linecap="round" stroke-linejoin="round"/>
<!-- face -->
<circle cx="190" cy="169" r="78" fill="url(#skin)" stroke="#c88a74" stroke-width="5"/>
<path d="M111 165 Q93 78 187 60 Q282 65 269 172 Q249 112 212 109 Q188 124 162 109 Q131 117 111 165Z" fill="url(#hair)" stroke="#302e43" stroke-width="8"/>
<path d="M114 160 Q91 212 122 247 L143 204 L141 159Z M264 157 Q289 207 256 249 L238 203 L240 158Z" fill="url(#hair)" stroke="#302e43" stroke-width="7"/>
<path d="M119 130 Q161 91 186 120 Q215 85 255 126" fill="none" stroke="#a77d60" stroke-width="8"/>
<ellipse cx="159" cy="177" rx="15" ry="22" fill="#fff"/><ellipse cx="220" cy="177" rx="15" ry="22" fill="#fff"/>
<ellipse cx="160" cy="179" rx="9" ry="16" fill="#3a66ad"/><ellipse cx="219" cy="179" rx="9" ry="16" fill="#3a66ad"/>
<circle cx="164" cy="172" r="5" fill="#fff"/><circle cx="222" cy="172" r="5" fill="#fff"/>
<path d="M143 145 Q158 135 175 145 M205 145 Q221 134 237 145" fill="none" stroke="#43374a" stroke-width="6" stroke-linecap="round"/>
<ellipse cx="136" cy="211" rx="13" ry="8" fill="#f18e9e" opacity=".55"/><ellipse cx="245" cy="211" rx="13" ry="8" fill="#f18e9e" opacity=".55"/>
<path d="M174 226 Q191 239 207 225" fill="none" stroke="#9b4c55" stroke-width="6" stroke-linecap="round"/>
<!-- headband -->
<path d="M119 120 Q187 85 260 120" fill="none" stroke="#ffe071" stroke-width="9"/>
<path d="M177 95 L190 63 L203 95 L235 101 L211 121 L208 151 L184 133 L157 145 L165 117 L145 99Z" fill="#fff2a0" stroke="#d19d4d" stroke-width="4"/>
<circle cx="190" cy="112" r="12" fill="#6ce3e8" stroke="#fff" stroke-width="4"/>
<!-- chest badge -->
<path d="M190 312 L198 332 L220 334 L203 348 L208 370 L190 358 L172 370 L177 348 L160 334 L182 332Z" fill="#ffd25e" stroke="#fff1ad" stroke-width="4"/>
</svg>\`;

const crystalKnight = \`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 380 520">
<defs>
 <linearGradient id="armor" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#dff6ff"/><stop offset=".55" stop-color="#91bce0"/><stop offset="1" stop-color="#566baf"/></linearGradient>
 <linearGradient id="cape" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#c08df5"/><stop offset="1" stop-color="#573d9b"/></linearGradient>
 <linearGradient id="hair" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#564775"/><stop offset="1" stop-color="#272344"/></linearGradient>
 <radialGradient id="skin"><stop stop-color="#ffe7d5"/><stop offset="1" stop-color="#eab49d"/></radialGradient>
</defs>
<ellipse cx="190" cy="493" rx="91" ry="12" fill="#30255c" opacity=".18"/>
<!-- cape -->
<path d="M134 258 Q190 225 247 257 L283 435 Q195 476 95 431Z" fill="url(#cape)" stroke="#493582" stroke-width="8"/>
<path d="M134 275 L166 407 M245 275 L222 420" stroke="#e1c9ff" stroke-width="7" opacity=".8"/>
<!-- legs -->
<path d="M146 370 L137 464 L176 464 L190 385 L209 464 L247 464 L228 369" fill="#647cac" stroke="#435885" stroke-width="8"/>
<path d="M130 463 Q156 450 181 466 L183 493 L128 493Z M205 466 Q231 451 256 466 L258 493 L204 493Z" fill="#5367ac" stroke="#34447e" stroke-width="7"/>
<!-- armor torso -->
<path d="M139 247 Q190 217 240 247 L259 375 Q191 405 122 375Z" fill="url(#armor)" stroke="#617cae" stroke-width="8"/>
<path d="M151 251 L190 291 L230 250 L243 358 Q190 381 136 358Z" fill="#8fb9db" stroke="#e4f8ff" stroke-width="6"/>
<path d="M190 290 L190 370" stroke="#d6f2ff" stroke-width="7"/>
<path d="M161 302 L180 321 L161 344 L143 320Z M218 302 L238 320 L218 344 L200 321Z" fill="#8f70d2" stroke="#effaff" stroke-width="4"/>
<path d="M128 372 L250 372 L274 421 Q190 448 105 421Z" fill="#a7cce5" stroke="#526c9d" stroke-width="7"/>
<!-- shield -->
<path d="M277 283 Q319 268 340 285 L335 370 Q312 408 287 375Z" fill="#75c6e7" stroke="#415799" stroke-width="8"/>
<path d="M306 291 L321 326 L346 330 L326 350 L330 375 L306 360 L283 375 L287 350 L268 330 L293 326Z" fill="#c6f7ff" stroke="#fff" stroke-width="5"/>
<!-- arms -->
<path d="M139 254 L104 329 L125 345 L162 292 M241 254 L274 312 L258 331 L224 293" fill="none" stroke="#e9b69e" stroke-width="17" stroke-linecap="round" stroke-linejoin="round"/>
<!-- face -->
<circle cx="190" cy="169" r="77" fill="url(#skin)" stroke="#c78e7f" stroke-width="5"/>
<path d="M111 168 Q94 79 186 62 Q280 65 270 174 Q253 114 216 112 Q184 128 162 108 Q133 120 111 168Z" fill="url(#hair)" stroke="#302644" stroke-width="8"/>
<path d="M115 165 Q87 210 122 254 L143 204 L140 160Z M264 161 Q291 211 257 254 L238 204 L240 160Z" fill="url(#hair)" stroke="#302644" stroke-width="7"/>
<path d="M123 125 Q160 88 189 121 Q218 87 257 126" fill="none" stroke="#9d90c7" stroke-width="9"/>
<ellipse cx="159" cy="177" rx="15" ry="22" fill="#fff"/><ellipse cx="220" cy="177" rx="15" ry="22" fill="#fff"/>
<ellipse cx="160" cy="179" rx="9" ry="16" fill="#47529d"/><ellipse cx="219" cy="179" rx="9" ry="16" fill="#47529d"/>
<circle cx="164" cy="171" r="5" fill="#fff"/><circle cx="222" cy="171" r="5" fill="#fff"/>
<path d="M143 145 Q158 135 175 145 M205 145 Q221 135 237 145" fill="none" stroke="#473d64" stroke-width="6" stroke-linecap="round"/>
<ellipse cx="136" cy="210" rx="13" ry="8" fill="#f18e9e" opacity=".55"/><ellipse cx="245" cy="210" rx="13" ry="8" fill="#f18e9e" opacity=".55"/>
<path d="M175 225 Q190 240 206 224" fill="none" stroke="#9b4c55" stroke-width="6" stroke-linecap="round"/>
<!-- crystal tiara -->
<path d="M131 121 L148 82 L169 109 L190 58 L214 110 L235 81 L252 124" fill="#bfefff" stroke="#637cb7" stroke-width="7" stroke-linejoin="round"/>
<path d="M190 65 L200 91 L190 105 L179 91Z" fill="#e6ffff"/>
</svg>\`;

const svgArt: Partial<Record<CharacterId, string>> = {
  fairy, "dragon-rider": dragonRider, "star-explorer": starExplorer, "crystal-knight": crystalKnight
};

export function getCharacterArtUrl(id: CharacterId): string {
  const inline = svgArt[id];
  if (inline) return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(inline);
  const fileById: Record<string, string> = {
    prince: "princess", "male-explorer": "star-explorer", knight: "crystal-knight"
  };
  return "assets/characters/" + (fileById[id] ?? id) + ".webp";
}
