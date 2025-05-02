## HSDN METAR/TAF Parser Class

This script is a TypeScript library which allows to parse the METAR and TAF code, and convert it to an array of data parameters. These METAR or TAF can be given in the form of the ICAO code string (in this case, the script will receive data from the NOAA website) or in raw format (just METAR/TAF code string). METAR or TAF code parsed using the syntactic analysis and regular expressions. It solves the problem of parsing the data in the presence of any error in the code METAR or TAF. In addition to the return METAR parameters, the script also displays the interpreted (easy to understand) information of these parameters.

Script based on GetWx script http://woody.cowpi.com/phpscripts/getwx.php.txt by Mark Woodward.

### Usage example:
```typescript
import { Metar } from './src/Metar';

// Raw METAR code string
const raw = 'UWSS 231500Z 14007MPS 9999 -SHRA BR BKN033CB OVC066 03/M02 Q1019 R12/220395 NOSIG RMK QFE752';

// Create class instance for parse METAR string with debug output enable
const metar = new Metar(raw, false, true);

// Parse METAR
const parameters = metar.parse();

console.log(parameters); // get parsed parameters as array

// Debug information
const debug = metar.debug();

console.log(debug); // get debug information as array

// Get any parsed parameter, e.g. 'clouds_report'
console.log(metar.clouds_report);
```

### Demonstration
- http://dev.hsdn.org/wdparser/metar/

### License
    HSDN METAR/TAF Parser Class

    Copyright (C) 2013-2020, Information Networks, Ltd.
    Copyright (C) 2001-2006, Mark Woodward

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program. If not, see <http://www.gnu.org/licenses/>.
