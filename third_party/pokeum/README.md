# pokeum

Parts of Dexup's card scanner are adapted from [pokeum](https://github.com/TBLgGamin/pokeum)
by TBLgGamin, distributed under the MIT License (see [LICENSE](LICENSE)).

| Dexup file | Adapted from |
| --- | --- |
| `src/lib/quality.js` | `frontend/src/lib/quality.ts` |
| `src/lib/useAutoCapture.js` | `frontend/src/composables/useAutoCapture.ts` |
| `src/lib/scan.js` (`extractCardNumber`) | `app/signals/ocr.py` (`parse_collector_number`) |
| `src/lib/scan.js` (`matchPokemonName`) | `app/signals/name.py` (title-band name matching) |
