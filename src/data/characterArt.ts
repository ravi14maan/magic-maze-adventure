import type { CharacterId } from "./characters";

const makeSvgUrl = (svg: string): string =>
  "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);

const svgDefs = `
<defs>
 <linearGradient id="skin" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#ffe9d7"/><stop offset="1" stop-color="#eab29b"/></linearGradient>
 <linearGradient id="hair" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#e7a26c"/><stop offset="1" stop-color="#70402f"/></linearGradient>
 <linearGradient id="dress" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#f9c6ed"/><stop offset="1" stop-color="#9260cf"/></linearGradient>
 <filter id="shadow"><feGaussianBlur stdDeviation="7"/></filter>
</defs>`;

const characterSvg: Partial<Record<CharacterId, string>> = {
  witch: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 380 520">${svgDefs}
  <ellipse cx="190" cy="495" rx="82" ry="12" fill="#271e48" opacity=".18" filter="url(#shadow)"/>
  <path d="M145 375L136 470L178 470L190 386L209 470L250 470L227 374" fill="#4a356d" stroke="#30244e" stroke-width="8"/>
  <path d="M130 461Q157 450 181 466L181 492L127 492Z M206 466Q233 450 255 465L258 492L204 492Z" fill="#6f4aa1" stroke="#30244e" stroke-width="7"/>
  <path d="M132 250Q190 220 248 250L270 424Q190 466 102 424Z" fill="#47316f" stroke="#2e2255" stroke-width="8"/>
  <path d="M132 348Q190 375 249 348L270 421Q190 462 102 421Z" fill="#7450a6" stroke="#bd8ee8" stroke-width="5"/>
  <path d="M143 258L106 331L128 344L165 294 M239 258L276 326L254 342L222 294" fill="none" stroke="#eab89c" stroke-width="18" stroke-linecap="round"/>
  <circle cx="190" cy="168" r="78" fill="url(#skin)" stroke="#c98e7d" stroke-width="5"/>
  <path d="M110 168Q90 77 188 61Q282 65 270 175Q247 112 215 111Q189 130 160 108Q129 121 110 168Z" fill="#47305f" stroke="#241c42" stroke-width="8"/>
  <path d="M112 163Q87 220 125 266L146 204L142 160Z M265 160Q291 220 255 266L237 204L240 158Z" fill="#47305f" stroke="#241c42" stroke-width="7"/>
  <path d="M111 133Q163 116 185 132Q215 90 270 122L286 144L99 150Z" fill="#372452" stroke="#241c42" stroke-width="7"/>
  <path d="M185 135L226 22L250 132Z" fill="#513377" stroke="#241c42" stroke-width="8"/>
  <path d="M105 140Q190 125 283 142" fill="none" stroke="#b58be1" stroke-width="13"/>
  <path d="M145 177Q159 162 175 177 M205 177Q222 162 237 177" fill="none" stroke="#563747" stroke-width="6" stroke-linecap="round"/>
  <ellipse cx="160" cy="187" rx="14" ry="21" fill="#fff"/><ellipse cx="220" cy="187" rx="14" ry="21" fill="#fff"/>
  <ellipse cx="162" cy="190" rx="9" ry="15" fill="#7252c8"/><ellipse cx="218" cy="190" rx="9" ry="15" fill="#7252c8"/>
  <circle cx="165" cy="182" r="5" fill="#fff"/><circle cx="221" cy="182" r="5" fill="#fff"/>
  <ellipse cx="135" cy="219" rx="13" ry="7" fill="#f08da8" opacity=".6"/><ellipse cx="245" cy="219" rx="13" ry="7" fill="#f08da8" opacity=".6"/>
  <path d="M174 229Q190 242 207 228" fill="none" stroke="#9a4c68" stroke-width="6" stroke-linecap="round"/>
  <path d="M274 278L322 211" stroke="#8a65c8" stroke-width="9" stroke-linecap="round"/><path d="M321 202L334 175L347 205L376 214L351 232L348 262L330 239L302 247L313 220Z" fill="#fff0a1" stroke="#e1a84e" stroke-width="5"/>
  <g fill="#ffeaa0"><path d="M65 78L73 58L81 78L101 86L81 94L73 114L65 94L45 86Z"/><path d="M290 91L297 75L304 91L322 98L304 105L297 123L290 105L272 98Z"/></g>
  </svg>`,
  fairy: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 380 520">${svgDefs}
  <ellipse cx="190" cy="495" rx="84" ry="12" fill="#3d3871" opacity=".17" filter="url(#shadow)"/>
  <path d="M145 250C35 130 27 244 108 320C133 341 157 320 166 293Z" fill="#b9fff1" opacity=".8" stroke="#69c7d1" stroke-width="7"/>
  <path d="M235 250C345 130 353 244 272 320C247 341 223 320 214 293Z" fill="#cce4ff" opacity=".82" stroke="#80addd" stroke-width="7"/>
  <path d="M149 259Q190 225 231 259L258 381Q190 418 122 381Z" fill="#65c9a4" stroke="#398e79" stroke-width="7"/>
  <path d="M126 374Q190 402 254 374L286 430Q190 468 94 430Z" fill="#a6e6c4" stroke="#62b996" stroke-width="7"/>
  <path d="M145 370L136 468L176 468L190 388L209 468L245 468L226 369" fill="#e6c6a9" stroke="#9a6a61" stroke-width="7"/>
  <path d="M133 462Q158 450 181 466L181 492L129 492Z M206 466Q230 450 253 466L256 492L204 492Z" fill="#6eae91" stroke="#3c806f" stroke-width="7"/>
  <path d="M143 258L106 331L127 344L164 295 M237 258L276 319L259 340L222 297" fill="none" stroke="#eab89c" stroke-width="17" stroke-linecap="round"/>
  <circle cx="190" cy="168" r="78" fill="url(#skin)" stroke="#c98e7d" stroke-width="5"/>
  <path d="M109 170Q90 78 187 62Q281 65 270 176Q248 112 212 111Q189 132 158 108Q128 121 109 170Z" fill="url(#hair)" stroke="#6c3c35" stroke-width="8"/>
  <path d="M116 163Q84 218 126 268L144 206L143 159Z M263 159Q294 216 255 268L238 204L239 158Z" fill="#a96a45" stroke="#6c3c35" stroke-width="7"/>
  <path d="M127 133Q160 95 190 126Q220 88 251 127" fill="none" stroke="#ffd5a8" stroke-width="10"/>
  <ellipse cx="160" cy="187" rx="15" ry="22" fill="#fff"/><ellipse cx="220" cy="187" rx="15" ry="22" fill="#fff"/>
  <ellipse cx="162" cy="190" rx="9" ry="16" fill="#4776a8"/><ellipse cx="218" cy="190" rx="9" ry="16" fill="#4776a8"/>
  <circle cx="165" cy="182" r="5" fill="#fff"/><circle cx="221" cy="182" r="5" fill="#fff"/>
  <path d="M143 155Q159 143 176 153 M204 153Q222 142 238 154" fill="none" stroke="#674035" stroke-width="6" stroke-linecap="round"/>
  <ellipse cx="135" cy="219" rx="13" ry="7" fill="#f08da8" opacity=".55"/><ellipse cx="245" cy="219" rx="13" ry="7" fill="#f08da8" opacity=".55"/>
  <path d="M174 229Q190 242 207 228" fill="none" stroke="#9a4c68" stroke-width="6" stroke-linecap="round"/>
  <path d="M145 106L160 80L178 103L190 65L204 103L223 81L238 109" fill="#e5c67e" stroke="#9e784b" stroke-width="5"/>
  <path d="M190 68L199 88L190 101L181 88Z" fill="#71dcd2" stroke="#fff" stroke-width="3"/>
  <path d="M292 278L322 217" stroke="#a780c5" stroke-width="8"/><path d="M319 205L329 182L341 206L364 212L344 230L340 253L326 236L303 242L311 220Z" fill="#fff0a1" stroke="#dca55b" stroke-width="4"/>
  <path d="M57 95Q77 54 100 93Q125 124 88 151Q62 146 57 95Z M284 95Q307 52 333 91Q355 128 322 153Q295 147 284 95Z" fill="#d8fff6" opacity=".55" stroke="#85cedb" stroke-width="5"/>
  </svg>`,
  "dragon-rider": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 380 520">${svgDefs}
  <ellipse cx="190" cy="494" rx="86" ry="12" fill="#25474b" opacity=".18" filter="url(#shadow)"/>
  <path d="M147 370L137 466L176 466L190 390L209 466L246 466L226 370" fill="#315675" stroke="#244158" stroke-width="8"/>
  <path d="M130 462Q156 451 181 467L181 492L128 492Z M206 467Q231 451 254 466L257 492L205 492Z" fill="#b7634b" stroke="#774345" stroke-width="7"/>
  <path d="M137 249Q190 221 242 249L259 380Q191 407 121 380Z" fill="#269d91" stroke="#1c6768" stroke-width="8"/>
  <path d="M153 250L190 296L227 250" fill="none" stroke="#f8d27c" stroke-width="8"/>
  <path d="M126 376L251 376L278 428Q190 463 102 428Z" fill="#c28a53" stroke="#87573d" stroke-width="7"/>
  <path d="M141 257L102 330L125 345L162 295 M240 257L278 315L259 340L223 295" fill="none" stroke="#eab89c" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="190" cy="168" r="78" fill="url(#skin)" stroke="#c98e7d" stroke-width="5"/>
  <path d="M108 171Q89 77 186 62Q281 65 271 176Q247 111 213 112Q183 132 160 107Q129 121 108 171Z" fill="#9e6445" stroke="#69402f" stroke-width="8"/>
  <path d="M116 161Q87 220 128 259L145 206L143 157Z M263 158Q292 214 252 260L239 205L238 157Z" fill="#824c35" stroke="#5a342d" stroke-width="7"/>
  <path d="M122 122Q161 90 191 122Q222 88 256 124" fill="none" stroke="#eabf91" stroke-width="10"/>
  <ellipse cx="160" cy="187" rx="15" ry="22" fill="#fff"/><ellipse cx="220" cy="187" rx="15" ry="22" fill="#fff"/>
  <ellipse cx="162" cy="190" rx="9" ry="16" fill="#46649c"/><ellipse cx="218" cy="190" rx="9" ry="16" fill="#46649c"/>
  <circle cx="165" cy="182" r="5" fill="#fff"/><circle cx="221" cy="182" r="5" fill="#fff"/>
  <path d="M143 155Q158 143 176 153 M204 153Q222 142 238 154" fill="none" stroke="#674035" stroke-width="6" stroke-linecap="round"/>
  <ellipse cx="135" cy="219" rx="13" ry="7" fill="#f08da8" opacity=".55"/><ellipse cx="245" cy="219" rx="13" ry="7" fill="#f08da8" opacity=".55"/>
  <path d="M174 229Q190 242 207 228" fill="none" stroke="#9a4c68" stroke-width="6" stroke-linecap="round"/>
  <path d="M123 117Q190 82 259 117" fill="none" stroke="#d8a253" stroke-width="10"/>
  <circle cx="150" cy="108" r="22" fill="#6e8d9a" stroke="#f0c77c" stroke-width="6"/><circle cx="150" cy="108" r="13" fill="#243d4d"/>
  <circle cx="230" cy="108" r="22" fill="#6e8d9a" stroke="#f0c77c" stroke-width="6"/><circle cx="230" cy="108" r="13" fill="#243d4d"/>
  <path d="M263 258Q287 213 327 224Q362 236 343 278Q323 309 286 284Z" fill="#66c8ae" stroke="#287e70" stroke-width="7"/>
  <path d="M281 230L272 199L300 218 M324 227L350 201L347 237" fill="#7ed9bf" stroke="#287e70" stroke-width="6"/>
  <ellipse cx="318" cy="250" rx="8" ry="12" fill="#fff"/><circle cx="321" cy="251" r="4" fill="#1f3441"/>
  <path d="M293 281Q310 296 330 280" fill="none" stroke="#287e70" stroke-width="5"/>
  </svg>`,
  "star-explorer": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 380 520">${svgDefs}
  <ellipse cx="190" cy="493" rx="87" ry="12" fill="#213b73" opacity=".18" filter="url(#shadow)"/>
  <rect x="245" y="250" width="55" height="138" rx="22" fill="#31549c" stroke="#1d3777" stroke-width="8"/>
  <rect x="255" y="275" width="35" height="54" rx="10" fill="#67e5ed"/>
  <path d="M146 370L136 465L175 465L190 389L209 465L247 465L227 370" fill="#2b4387" stroke="#20336c" stroke-width="8"/>
  <path d="M130 462Q157 450 181 466L181 492L128 492Z M206 466Q231 450 254 466L257 492L205 492Z" fill="#ec765f" stroke="#9b4b56" stroke-width="7"/>
  <path d="M139 248Q190 220 241 248L260 380Q190 407 120 380Z" fill="#428fe0" stroke="#2455a0" stroke-width="8"/>
  <path d="M163 252L190 297L217 252" fill="none" stroke="#b7edff" stroke-width="8"/>
  <path d="M190 296L190 371" stroke="#ffd36a" stroke-width="6"/>
  <path d="M136 380L247 380L279 429Q190 462 100 429Z" fill="#315bb2" stroke="#243e80" stroke-width="7"/>
  <path d="M139 257L102 331L125 346L162 295 M241 257L278 316L258 340L223 295" fill="none" stroke="#edbd9f" stroke-width="17" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="190" cy="168" r="78" fill="url(#skin)" stroke="#c98e7d" stroke-width="5"/>
  <path d="M110 169Q91 77 187 61Q282 65 270 177Q247 112 213 112Q187 129 160 108Q129 121 110 169Z" fill="#664b47" stroke="#302d48" stroke-width="8"/>
  <path d="M115 160Q87 216 126 257L145 205L141 157Z M264 158Q293 213 254 258L238 205L239 158Z" fill="#473848" stroke="#302d48" stroke-width="7"/>
  <path d="M125 126Q161 91 190 122Q222 87 255 126" fill="none" stroke="#aa856d" stroke-width="9"/>
  <ellipse cx="160" cy="187" rx="15" ry="22" fill="#fff"/><ellipse cx="220" cy="187" rx="15" ry="22" fill="#fff"/>
  <ellipse cx="162" cy="190" rx="9" ry="16" fill="#3d73ad"/><ellipse cx="218" cy="190" rx="9" ry="16" fill="#3d73ad"/>
  <circle cx="165" cy="182" r="5" fill="#fff"/><circle cx="221" cy="182" r="5" fill="#fff"/>
  <path d="M143 155Q158 143 176 153 M204 153Q222 142 238 154" fill="none" stroke="#674035" stroke-width="6" stroke-linecap="round"/>
  <ellipse cx="135" cy="219" rx="13" ry="7" fill="#f08da8" opacity=".55"/><ellipse cx="245" cy="219" rx="13" ry="7" fill="#f08da8" opacity=".55"/>
  <path d="M174 229Q190 242 207 228" fill="none" stroke="#9a4c68" stroke-width="6" stroke-linecap="round"/>
  <path d="M119 117Q190 82 261 117" fill="none" stroke="#f9d36e" stroke-width="9"/>
  <path d="M190 75L202 101L230 105L210 124L214 151L190 137L166 151L170 124L150 105L178 101Z" fill="#ffdf79" stroke="#bb8a50" stroke-width="5"/>
  <path d="M177 310L190 293L204 310L198 338L182 338Z" fill="#ffdc64" stroke="#fff3bd" stroke-width="5"/>
  </svg>`,
  "crystal-knight": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 380 520">${svgDefs}
  <ellipse cx="188" cy="494" rx="88" ry="12" fill="#30255c" opacity=".18" filter="url(#shadow)"/>
  <path d="M133 250Q190 219 247 250L282 435Q190 474 95 432Z" fill="#8c68c6" stroke="#4d397e" stroke-width="8"/>
  <path d="M144 260L168 407 M242 260L222 422" stroke="#e3d9ff" stroke-width="7"/>
  <path d="M146 370L137 465L176 465L190 389L209 465L247 465L228 369" fill="#637aa8" stroke="#41557f" stroke-width="8"/>
  <path d="M130 463Q156 450 181 466L183 492L128 492Z M205 466Q231 451 255 466L258 492L204 492Z" fill="#5f6cb1" stroke="#3d467e" stroke-width="7"/>
  <path d="M139 248Q190 219 241 248L259 377Q190 407 121 377Z" fill="#b3d4eb" stroke="#657fae" stroke-width="8"/>
  <path d="M152 252L190 293L229 252L243 359Q190 380 137 359Z" fill="#8bb3dc" stroke="#f3fdff" stroke-width="6"/>
  <path d="M190 291L190 370" stroke="#e8fbff" stroke-width="7"/>
  <path d="M163 305L180 324L162 345L144 324Z M218 305L237 324L218 345L200 324Z" fill="#916bd9" stroke="#e6eaff" stroke-width="4"/>
  <path d="M139 257L102 329L124 344L163 296 M240 257L277 315L258 341L223 296" fill="none" stroke="#edbd9f" stroke-width="17" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M279 282Q319 269 341 286L335 371Q312 409 287 375Z" fill="#75c7eb" stroke="#43589a" stroke-width="8"/>
  <path d="M308 293L320 324L347 330L326 350L330 376L308 360L284 376L289 350L269 330L294 324Z" fill="#d3f7ff" stroke="#fff" stroke-width="5"/>
  <circle cx="190" cy="168" r="77" fill="url(#skin)" stroke="#c98e7d" stroke-width="5"/>
  <path d="M110 168Q91 78 187 62Q281 65 270 175Q248 111 214 112Q184 130 159 108Q129 121 110 168Z" fill="#483d65" stroke="#2d2849" stroke-width="8"/>
  <path d="M116 162Q86 217 125 262L144 205L142 157Z M263 158Q294 216 255 262L238 204L238 157Z" fill="#483d65" stroke="#2d2849" stroke-width="7"/>
  <path d="M126 124Q160 88 190 121Q218 87 255 126" fill="none" stroke="#c3a9ed" stroke-width="9"/>
  <ellipse cx="160" cy="187" rx="15" ry="22" fill="#fff"/><ellipse cx="220" cy="187" rx="15" ry="22" fill="#fff"/>
  <ellipse cx="162" cy="190" rx="9" ry="16" fill="#6b6ac7"/><ellipse cx="218" cy="190" rx="9" ry="16" fill="#6b6ac7"/>
  <circle cx="165" cy="182" r="5" fill="#fff"/><circle cx="221" cy="182" r="5" fill="#fff"/>
  <path d="M143 155Q158 143 176 153 M204 153Q222 142 238 154" fill="none" stroke="#473d64" stroke-width="6" stroke-linecap="round"/>
  <ellipse cx="135" cy="219" rx="13" ry="7" fill="#f08da8" opacity=".55"/><ellipse cx="245" cy="219" rx="13" ry="7" fill="#f08da8" opacity=".55"/>
  <path d="M174 229Q190 242 207 228" fill="none" stroke="#9a4c68" stroke-width="6" stroke-linecap="round"/>
  <path d="M131 120L149 80L170 108L190 57L212 109L233 80L251 120" fill="#d7f4ff" stroke="#7183bb" stroke-width="7" stroke-linejoin="round"/>
  <path d="M190 65L201 91L190 107L178 91Z" fill="#b8f7ff"/>
  </svg>`,
  "ice-mage": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 380 520">${svgDefs}
  <ellipse cx="190" cy="495" rx="84" ry="12" fill="#35577b" opacity=".16" filter="url(#shadow)"/>
  <path d="M148 370L137 468L177 468L190 388L209 468L247 468L227 370" fill="#75a8d2" stroke="#4d7fa8" stroke-width="8"/>
  <path d="M132 462Q156 451 181 466L181 492L130 492Z M206 466Q232 450 255 465L258 492L205 492Z" fill="#b4edfa" stroke="#6fa6cd" stroke-width="7"/>
  <path d="M140 249Q190 220 241 249L262 378Q190 414 118 378Z" fill="#85d8f1" stroke="#4c9fca" stroke-width="8"/>
  <path d="M127 368Q190 393 253 368L284 425Q190 467 96 425Z" fill="#c5f3ff" stroke="#77bbd9" stroke-width="7"/>
  <path d="M147 261L105 331L128 346L165 295 M237 261L279 322L257 341L221 294" fill="none" stroke="#f2c8b4" stroke-width="18" stroke-linecap="round"/>
  <circle cx="190" cy="168" r="78" fill="url(#skin)" stroke="#c98e7d" stroke-width="5"/>
  <path d="M110 171Q91 77 188 62Q282 65 271 176Q246 111 214 111Q186 130 160 108Q128 121 110 171Z" fill="#c2e8f5" stroke="#709dbd" stroke-width="8"/>
  <path d="M116 163Q87 220 127 262L145 205L143 159Z M264 159Q293 217 254 262L238 204L239 159Z" fill="#8fc3df" stroke="#709dbd" stroke-width="7"/>
  <path d="M127 123Q160 90 190 122Q221 88 255 125" fill="none" stroke="#fff" stroke-width="10"/>
  <ellipse cx="160" cy="187" rx="15" ry="22" fill="#fff"/><ellipse cx="220" cy="187" rx="15" ry="22" fill="#fff"/>
  <ellipse cx="162" cy="190" rx="9" ry="16" fill="#4b9dc7"/><ellipse cx="218" cy="190" rx="9" ry="16" fill="#4b9dc7"/>
  <circle cx="165" cy="182" r="5" fill="#fff"/><circle cx="221" cy="182" r="5" fill="#fff"/>
  <path d="M143 155Q158 143 176 153 M204 153Q222 142 238 154" fill="none" stroke="#62798e" stroke-width="6" stroke-linecap="round"/>
  <ellipse cx="135" cy="219" rx="13" ry="7" fill="#f08da8" opacity=".55"/><ellipse cx="245" cy="219" rx="13" ry="7" fill="#f08da8" opacity=".55"/>
  <path d="M174 229Q190 242 207 228" fill="none" stroke="#9a4c68" stroke-width="6" stroke-linecap="round"/>
  <path d="M140 123L155 82L176 111L190 55L209 111L229 82L242 123" fill="#f1ffff" stroke="#79b5d8" stroke-width="7"/>
  <path d="M190 61L203 94L190 109L176 94Z" fill="#80e8ff" stroke="#fff" stroke-width="4"/>
  <path d="M284 286L321 217" stroke="#6ca4d8" stroke-width="9" stroke-linecap="round"/><path d="M318 201L329 176L340 202L365 210L344 230L340 255L326 236L302 244L311 221Z" fill="#b9f7ff" stroke="#6da6d4" stroke-width="4"/>
  </svg>`,
  prince: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 380 520">${svgDefs}
  <ellipse cx="190" cy="494" rx="84" ry="12" fill="#273b65" opacity=".16" filter="url(#shadow)"/>
  <path d="M142 365L134 465L176 465L190 383L209 465L246 465L229 365" fill="#34568c" stroke="#233a68" stroke-width="8"/>
  <path d="M128 462Q155 450 180 466L182 492L126 492Z M205 466Q230 450 254 465L258 492L203 492Z" fill="#9f5d49" stroke="#683a3a" stroke-width="7"/>
  <path d="M142 244Q190 221 239 244L257 380Q190 405 123 380Z" fill="#4e8ed6" stroke="#2e5a9b" stroke-width="8"/>
  <path d="M155 251L190 293L226 251" fill="none" stroke="#f4d27d" stroke-width="9"/>
  <path d="M126 375L253 375L274 427Q190 456 104 427Z" fill="#e0bd7e" stroke="#9d7d51" stroke-width="7"/>
  <path d="M140 255L106 327L127 344L164 294 M240 255L276 314L256 340L222 294" fill="none" stroke="#f1c4a8" stroke-width="17" stroke-linecap="round"/>
  <circle cx="190" cy="168" r="78" fill="url(#skin)" stroke="#c98e7d" stroke-width="5"/>
  <path d="M109 171Q90 78 187 62Q281 65 271 175Q247 111 213 112Q184 130 159 108Q128 121 109 171Z" fill="#78513a" stroke="#4a322c" stroke-width="8"/>
  <path d="M115 163Q88 216 126 257L145 205L142 158Z M264 158Q293 215 255 257L239 204L239 158Z" fill="#684531" stroke="#4a322c" stroke-width="7"/>
  <path d="M126 123Q160 89 190 121Q219 88 255 125" fill="none" stroke="#c89965" stroke-width="8"/>
  <ellipse cx="160" cy="187" rx="15" ry="22" fill="#fff"/><ellipse cx="220" cy="187" rx="15" ry="22" fill="#fff"/>
  <ellipse cx="162" cy="190" rx="9" ry="16" fill="#4068a7"/><ellipse cx="218" cy="190" rx="9" ry="16" fill="#4068a7"/>
  <circle cx="165" cy="182" r="5" fill="#fff"/><circle cx="221" cy="182" r="5" fill="#fff"/>
  <path d="M143 155Q158 143 176 153 M204 153Q222 142 238 154" fill="none" stroke="#674035" stroke-width="6" stroke-linecap="round"/>
  <ellipse cx="135" cy="219" rx="13" ry="7" fill="#f08da8" opacity=".55"/><ellipse cx="245" cy="219" rx="13" ry="7" fill="#f08da8" opacity=".55"/>
  <path d="M174 229Q190 242 207 228" fill="none" stroke="#9a4c68" stroke-width="6" stroke-linecap="round"/>
  <path d="M151 117L164 77L180 106L190 59L205 106L221 77L233 117Z" fill="#f8d876" stroke="#a67b43" stroke-width="6"/>
  <path d="M190 66L199 89L190 102L181 89Z" fill="#8ce8e2" stroke="#fff" stroke-width="3"/>
  </svg`
};

const LEGACY_ALIAS: Partial<Record<CharacterId, CharacterId>> = {
  "male-explorer": "star-explorer",
  knight: "crystal-knight"
};

const EXISTING_ART: Partial<Record<CharacterId, string>> = {
  "normal-girl": "normal-girl.webp",
  "normal-boy": "normal-boy.webp",
  unicorn: "unicorn.webp",
  princess: "princess.webp",
  mermaid: "mermaid.webp"
};

export function canonicalCharacterArtId(id: CharacterId): CharacterId {
  return LEGACY_ALIAS[id] ?? id;
}

export function getCharacterArtUrl(id: CharacterId): string {
  const canonical = canonicalCharacterArtId(id);
  const inline = characterSvg[canonical];
  if (inline) return makeSvgUrl(inline);
  const filename = EXISTING_ART[canonical];
  return "assets/characters/" + (filename ?? "normal-boy.webp");
}

export function getCharacterArtBackgroundStyle(id: CharacterId): string {
  return [
    'background-image:url("' + getCharacterArtUrl(id) + '")',
    "background-size:contain",
    "background-position:center bottom",
    "background-repeat:no-repeat"
  ].join(";");
}
