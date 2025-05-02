/*
	===========================
	HSDN METAR/TAF Parser Class
	===========================

	Version: 0.55.6b

	Based on GetWx script by Mark Woodward.

	(c) 2013-2020, Information Networks, Ltd. (http://www.hsdn.org/)
	(c) 2001-2006, Mark Woodward (http://woody.cowpi.com/phpscripts/)

		This script is a PHP library which allows to parse the METAR and TAF code,
	and convert it to an array of data parameters. These METAR or TAF can be given
	in the form of the ICAO code string (in this case, the script will receive data
	from the NOAA website) or in raw format (just METAR/TAF code string). METAR or
	TAF code parsed using the syntactic analysis and regular expressions. It solves
	the problem of parsing the data in the presence of any error in the code METAR
	or TAF. In addition to the return METAR parameters, the script also displays the
	interpreted (easy to understand) information of these parameters.
*/

class Metar {
	private result: {
		raw: string | null;
		taf: boolean | null;
		taf_flag: string | null;
		station: string | null;
		observed_date: string | null;
		observed_day: number | null;
		observed_time: string | null;
		observed_age: string | null;
		wind_speed: number | null;
		wind_speed_kt: number | null;
		wind_gust_speed: number | null;
		wind_gust_speed_kt: number | null;
		wind_direction: number | null;
		wind_direction_label: string | null;
		wind_direction_varies: boolean | null;
		varies_wind_min: number | null;
		varies_wind_min_label: string | null;
		varies_wind_max: number | null;
		varies_wind_max_label: string | null;
		visibility: number | null;
		visibility_report: string | null;
		visibility_min: number | null;
		visibility_min_direction: string | null;
		runways_visual_range: any[] | null;
		present_weather: any[] | null;
		present_weather_report: string | null;
		clouds: any[] | null;
		clouds_report: string | null;
		clouds_report_ft: string | null;
		cloud_height: number | null;
		cloud_height_ft: number | null;
		cavok: boolean | null;
		temperature: number | null;
		temperature_f: number | null;
		dew_point: number | null;
		dew_point_f: number | null;
		humidity: number | null;
		heat_index: number | null;
		heat_index_f: number | null;
		wind_chill: number | null;
		wind_chill_f: number | null;
		barometer: number | null;
		barometer_in: number | null;
		recent_weather: any[] | null;
		recent_weather_report: string | null;
		runways_report: any[] | null;
		runways_snoclo: boolean | null;
		wind_shear_all_runways: boolean | null;
		wind_shear_runways: any[] | null;
		forecast_temperature_min: any[] | null;
		forecast_temperature_max: any[] | null;
		trends: any[] | null;
		remarks: string | null;
	} = {
		raw: null,
		taf: null,
		taf_flag: null,
		station: null,
		observed_date: null,
		observed_day: null,
		observed_time: null,
		observed_age: null,
		wind_speed: null,
		wind_speed_kt: null,
		wind_gust_speed: null,
		wind_gust_speed_kt: null,
		wind_direction: null,
		wind_direction_label: null,
		wind_direction_varies: null,
		varies_wind_min: null,
		varies_wind_min_label: null,
		varies_wind_max: null,
		varies_wind_max_label: null,
		visibility: null,
		visibility_report: null,
		visibility_min: null,
		visibility_min_direction: null,
		runways_visual_range: null,
		present_weather: null,
		present_weather_report: null,
		clouds: null,
		clouds_report: null,
		clouds_report_ft: null,
		cloud_height: null,
		cloud_height_ft: null,
		cavok: null,
		temperature: null,
		temperature_f: null,
		dew_point: null,
		dew_point_f: null,
		humidity: null,
		heat_index: null,
		heat_index_f: null,
		wind_chill: null,
		wind_chill_f: null,
		barometer: null,
		barometer_in: null,
		recent_weather: null,
		recent_weather_report: null,
		runways_report: null,
		runways_snoclo: null,
		wind_shear_all_runways: null,
		wind_shear_runways: null,
		forecast_temperature_min: null,
		forecast_temperature_max: null,
		trends: null,
		remarks: null,
	};

	private method_names: string[] = [
		'taf',
		'station',
		'time',
		'station_type',
		'wind',
		'varies_wind',
		'visibility',
		'visibility_min',
		'runway_vr',
		'present_weather',
		'clouds',
		'temperature',
		'pressure',
		'recent_weather',
		'runways_report',
		'wind_shear',
		'forecast_temperature',
		'trends',
		'remarks',
	];

	private weather_intensity_codes: { [key: string]: string } = {
		'-': 'light',
		'+': 'strong',
		'VC': 'in the vicinity',
	};

	private weather_char_codes: { [key: string]: string } = {
		'MI': 'shallow',
		'PR': 'partial',
		'BC': 'patches of',
		'DR': 'low drifting',
		'BL': 'blowing',
		'SH': 'showers of',
		'TS': 'thunderstorms',
		'FZ': 'freezing',
	};

	private weather_type_codes: { [key: string]: string } = {
		'DZ': 'drizzle',
		'RA': 'rain',
		'SN': 'snow',
		'SG': 'snow grains',
		'IC': 'ice crystals',
		'PL': 'ice pellets',
		'GR': 'hail',
		'GS': 'small hail',
		'UP': 'unknown',
		'BR': 'mist',
		'FG': 'fog',
		'FU': 'smoke',
		'VA': 'volcanic ash',
		'DU': 'widespread dust',
		'SA': 'sand',
		'HZ': 'haze',
		'PY': 'spray',
		'PO': 'well-developed dust/sand whirls',
		'SQ': 'squalls',
		'FC': 'funnel cloud, tornado, or waterspout',
		'SS': 'sandstorm/duststorm',
	};

	private cloud_codes: { [key: string]: string } = {
		'NSW': 'no significant weather are observed',
		'NSC': 'no significant clouds are observed',
		'NCD': 'nil cloud detected',
		'SKC': 'no significant changes expected',
		'CLR': 'clear skies',
		'NOBS': 'no observation',
		'FEW': 'a few',
		'SCT': 'scattered',
		'BKN': 'broken sky',
		'OVC': 'overcast sky',
		'VV': 'vertical visibility',
	};

	private cloud_type_codes: { [key: string]: string } = {
		'CB': 'cumulonimbus',
		'TCU': 'towering cumulus',
	};

	private rvr_tendency_codes: { [key: string]: string } = {
		'D': 'decreasing',
		'U': 'increasing',
		'N': 'no tendency',
	};

	private rvr_prefix_codes: { [key: string]: string } = {
		'P': 'more',
		'M': 'less',
	};

	private runway_deposits_codes: { [key: string]: string } = {
		'0': 'clear and dry',
		'1': 'damp',
		'2': 'wet or water patches',
		'3': 'rime or frost covered',
		'4': 'dry snow',
		'5': 'wet snow',
		'6': 'slush',
		'7': 'ice',
		'8': 'compacted or rolled snow',
		'9': 'frozen ruts or ridges',
		'/': 'not reported',
	};

	private runway_deposits_extent_codes: { [key: string]: string } = {
		'1': 'from 10% or less',
		'2': 'from 11% to 25%',
		'5': 'from 26% to 50%',
		'9': 'from 51% to 100%',
		'/': '',
	};

	private runway_deposits_depth_codes: { [key: string]: string } = {
		'00': 'less than 1 mm',
		'92': '10 cm',
		'93': '15 cm',
		'94': '20 cm',
		'95': '25 cm',
		'96': '30 cm',
		'97': '35 cm',
		'98': '40 cm or more',
		'99': 'closed',
		'//': '',
	};

	private runway_friction_codes: { [key: string]: string } = {
		'91': 'poor',
		'92': 'medium/poor',
		'93': 'medium',
		'94': 'medium/good',
		'95': 'good',
		'99': 'figures unreliable',
		'//': '',
	};

	private trends_flag_codes: { [key: string]: string } = {
		'BECMG': 'expected to arise soon',
		'TEMPO': 'expected to arise temporarily',
		'INTER': 'expected to arise intermittent',
		'PROV': 'provisional forecast',
		'CNL': 'cancelled forecast',
		'NIL': 'nil forecast',
	};

	private trends_time_codes: { [key: string]: string } = {
		'AT': 'at',
		'FM': 'from',
		'TL': 'until',
	};

	private direction_codes: string[] = [
		'N', 'NNE', 'NE', 'ENE',
		'E', 'ESE', 'SE', 'SSE',
		'S', 'SSW', 'SW', 'WSW',
		'W', 'WNW', 'NW', 'NNW',
	];

	private errors: string[] | null = null;
	private debug: string[] | null = null;
	private debug_enabled: boolean;

	private raw: string;
	private raw_parts: string[] = [];
	private method: number = 0;
	private part: number = 0;

	constructor(raw: string, taf: boolean = false, debug: boolean = false, icao: boolean = true) {
		this.debug_enabled = debug;

		if (icao && /^[A-Z]{1}[A-Z0-9]{3}$/.test(raw)) {
			raw = this.download_raw(raw, taf);
		}

		if (!raw) {
			throw new Error('The METAR or TAF information is not presented.');
		}

		const raw_lines = raw.split('\n', 2);

		if (raw_lines[1]) {
			raw = raw_lines[1].trim();

			const observed_time = new Date(raw_lines[0].trim()).getTime() / 1000;

			if (observed_time !== 0) {
				this.set_observed_date(observed_time);

				this.set_debug('Observation date is set from the METAR/TAF in first line of the file content: ' + raw_lines[0].trim());
			}
		} else {
			raw = raw_lines[0].trim();
		}

		this.raw = raw.trim().replace(/[\s\t]+/g, ' ').replace(/=$/, '');

		if (taf) {
			this.set_debug('Information presented as TAF or trend.');
		} else {
			this.set_debug('Information presented as METAR.');
		}

		this.set_result_value('taf', taf);
		this.set_result_value('raw', this.raw);
	}

	public __get(parameter: string): any {
		if (this.result.hasOwnProperty(parameter)) {
			return this.result[parameter];
		}

		return null;
	}

	public parse(): any {
		this.raw_parts = this.raw.split(' ');

		let current_method = 0;

		while (this.part < this.raw_parts.length) {
			this.method = current_method;

			while (this.method < this.method_names.length) {
				const method = 'get_' + this.method_names[this.method];
				const token = this.raw_parts[this.part];

				if ((this as any)[method](token) === true) {
					this.set_debug('Token "' + token + '" is parsed by method: ' + method + ', ' +
						(this.method - current_method) + ' previous methods skipped.');

					current_method = this.method;

					this.method++;

					break;
				}

				this.method++;
			}

			if (current_method !== this.method - 1) {
				this.set_error('Unknown token: ' + this.raw_parts[this.part]);
				this.set_debug('Token "' + this.raw_parts[this.part] + '" is NOT PARSED, ' +
					(this.method - current_method) + ' methods attempted.');
			}

			this.part++;
		}

		if (this.result.taf === true) {
			for (const parameter in this.result) {
				if (this.result[parameter] === null) {
					delete this.result[parameter];
				}
			}
		}

		return this.result;
	}

	public debug(): string[] | null {
		return this.debug;
	}

	public errors(): string[] | null {
		return this.errors;
	}

	private download_raw(icao: string, taf: boolean = false): string {
		let url: string;

		if (taf) {
			url = 'http://tgftp.nws.noaa.gov/data/forecasts/taf/stations/' + icao + '.TXT';
		} else {
			url = 'http://tgftp.nws.noaa.gov/data/observations/metar/stations/' + icao + '.TXT';
		}

		const raw = fetch(url).then(response => response.text());

		if (!raw) {
			throw new Error('Error while downloading METAR or TAF information');
		}

		this.set_debug('METAR/TAF information downloaded from: ' + url);

		return raw;
	}

	private set_observed_date(time_utc: number): void {
		const local = time_utc + new Date().getTimezoneOffset() * 60;
		const now = Math.floor(Date.now() / 1000);

		this.set_result_value('observed_date', new Date(local * 1000).toUTCString());

		const time_diff = Math.floor((now - local) / 60);

		if (time_diff < 91) {
			this.set_result_value('observed_age', time_diff + ' min. ago');
		} else {
			this.set_result_value('observed_age', Math.floor(time_diff / 60) + ':' + ('0' + (time_diff % 60)).slice(-2) + ' hr. ago');
		}
	}

	private set_result_value(parameter: string, value: any, only_is_null: boolean = false): void {
		if (only_is_null) {
			if (this.result[parameter] === null) {
				this.result[parameter] = value;

				this.set_debug('Set value "' + value + '" (' + typeof value + ') for null parameter: ' + parameter);
			}
		} else {
			this.result[parameter] = value;

			this.set_debug('Set value "' + value + '" (' + typeof value + ') for parameter: ' + parameter);
		}
	}

	private set_result_group(parameter: string, group: any): void {
		if (this.result[parameter] === null) {
			this.result[parameter] = [];
		}

		(this.result[parameter] as any[]).push(group);

		this.set_debug('Add new group value (' + typeof group + ') for parameter: ' + parameter);
	}

	private set_result_report(parameter: string, report: string, separator: string = ';'): void {
		this.result[parameter] += separator + ' ' + report;

		if (this.result[parameter] !== null) {
			this.result[parameter] = this.result[parameter].charAt(0).toUpperCase() + this.result[parameter].slice(1).trim();
		}

		this.set_debug('Add group report value "' + report + '" for parameter: ' + parameter);
	}

	private set_debug(text: string): void {
		if (this.debug_enabled) {
			if (this.debug === null) {
				this.debug = [];
			}

			this.debug.push(text);
		}
	}

	private set_error(text: string): void {
		if (this.errors === null) {
			this.errors = [];
		}

		this.errors.push(text);
	}

	private get_taf(part: string): boolean {
		if (part !== 'TAF') {
			return false;
		}

		if (this.raw_parts[this.part + 1] === 'COR' || this.raw_parts[this.part + 1] === 'AMD') {
			this.set_result_value('taf_flag', this.raw_parts[this.part + 1], true);

			this.part++;
		}

		this.set_debug('TAF information detected.');

		this.set_result_value('taf', true);

		return true;
	}

	private get_station(part: string): boolean {
		if (!/^[A-Z]{1}[A-Z0-9]{3}$/.test(part)) {
			return false;
		}

		this.set_result_value('station', part);

		this.method++;

		return true;
	}

	private get_time(part: string): boolean {
		const match = part.match(/^([0-9]{2})([0-9]{2})([0-9]{2})Z$/);

		if (!match) {
			return false;
		}

		const day = parseInt(match[1], 10);
		const hour = parseInt(match[2], 10);
		const minute = parseInt(match[3], 10);

		if (this.result.observed_date === null) {
			const observed_time = new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), day, hour, minute)).getTime() / 1000;

			if (day > new Date().getUTCDate()) {
				observed_time = new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth() - 1, day, hour, minute)).getTime() / 1000;
			}

			this.set_observed_date(observed_time);

			this.set_debug('Observation date is set from the METAR/TAF information (presented in format: ddhhmmZ)');
		}

		this.set_result_value('observed_day', day);
		this.set_result_value('observed_time', match[2] + ':' + match[3] + ' UTC');

		this.method++;

		return true;
	}

	private get_station_type(part: string): boolean {
		if (part !== 'AUTO' && part !== 'COR') {
			return false;
		}

		this.method++;

		return true;
	}

	private get_wind(part: string): boolean {
		const match = part.match(/^([0-9]{3}|VRB|\/{3})P?([\/0-9]{2,3}|\/{2})(GP?([0-9]{2,3}))?(KT|MPS|KPH)$/);

		if (!match) {
			return false;
		}

		this.set_result_value('wind_direction_varies', false, true);

		if (match[1] === '///' && match[2] === '//') {
		} else {
			const unit = match[5];

			this.set_result_value('wind_speed', this.convert_speed(parseInt(match[2], 10), unit));
			this.set_result_value('wind_speed_kt', this.convert_speed(parseInt(match[2], 10), unit, 'KT'));

			if (match[1] === 'VRB') {
				this.set_result_value('wind_direction_varies', true);
			} else {
				const direction = parseInt(match[1], 10);

				if (direction >= 0 && direction <= 360) {
					this.set_result_value('wind_direction', direction);
					this.set_result_value('wind_direction_label', this.convert_direction_label(direction));
				}
			}

			if (match[4]) {
				this.set_result_value('wind_gust_speed', this.convert_speed(parseInt(match[4], 10), unit));
				this.set_result_value('wind_gust_speed_kt', this.convert_speed(parseInt(match[4], 10), unit, 'KT'));
			}
		}

		this.method++;

		return true;
	}

	private get_varies_wind(part: string): boolean {
		const match = part.match(/^([0-9]{3})V([0-9]{3})$/);

		if (!match) {
			return false;
		}

		const min_direction = parseInt(match[1], 10);
		const max_direction = parseInt(match[2], 10);

		if (min_direction >= 0 && min_direction <= 360) {
			this.set_result_value('varies_wind_min', min_direction);
			this.set_result_value('varies_wind_min_label', this.convert_direction_label(min_direction));
		}

		if (max_direction >= 0 && max_direction <= 360) {
			this.set_result_value('varies_wind_max', max_direction);
			this.set_result_value('varies_wind_max_label', this.convert_direction_label(max_direction));
		}

		this.method++;

		return true;
	}

	private get_visibility(part: string): boolean {
		const match = part.match(/^(CAVOK|([0-9]{4})|(M)?([0-9]{0,2})?(([1357])\/(2|4|8|16))?SM|\/\/\/)$/);

		if (!match) {
			return false;
		}

		this.set_result_value('cavok', false, true);

		if (match[1] === 'CAVOK' || match[1] === '9999') {
			this.set_result_value('visibility', 10000);
			this.set_result_value('visibility_report', 'Greater than 10 km');

			if (match[1] === 'CAVOK') {
				this.set_result_value('cavok', true);

				this.method += 4;
			}
		} else if (match[1] === '////') {
		} else {
			let prefix = '';

			let visibility: number;

			if (match[2]) {
				visibility = parseInt(match[2], 10);
			} else {
				if (match[3]) {
					prefix = 'Less than ';
				}

				if (match[7]) {
					visibility = parseInt(match[4], 10) + parseInt(match[6], 10) / parseInt(match[7], 10);
				} else {
					visibility = parseInt(match[4], 10);
				}

				visibility = this.convert_distance(visibility, 'SM');
			}

			let unit = ' meters';

			if (visibility <= 1) {
				unit = ' meter';
			}

			this.set_result_value('visibility', visibility);
			this.set_result_value('visibility_report', prefix + visibility + unit);
		}

		return true;
	}

	private get_visibility_min(part: string): boolean {
		const match = part.match(/^([0-9]{4})(NE|NW|SE|SW|N|E|S|W)?$/);

		if (!match) {
			return false;
		}

		this.set_result_value('visibility_min', parseInt(match[1], 10));

		if (match[2]) {
			this.set_result_value('visibility_min_direction', match[2]);
		}

		this.method++;

		return true;
	}

	private get_runway_vr(part: string): boolean {
		const match = part.match(/^R([0-9]{2}[LCR]?)\/(([PM])?([0-9]{4})V)?([PM])?([0-9]{4})(FT)?\/?([UDN]?)$/);

		if (!match) {
			return false;
		}

		if (parseInt(match[1], 10) > 36 || parseInt(match[1], 10) < 1) {
			return false;
		}

		let unit = 'M';

		if (match[6] === 'FT') {
			unit = 'FT';
		}

		const observed: any = {
			runway: match[1],
			variable: null,
			variable_prefix: null,
			interval_min: null,
			interval_max: null,
			tendency: null,
			report: null,
		};

		if (match[8] && this.rvr_tendency_codes[match[8]]) {
			observed.tendency = match[8];
		}

		if (match[6]) {
			if (match[4]) {
				observed.interval_min = this.convert_distance(parseInt(match[4], 10), unit);
				observed.interval_max = this.convert_distance(parseInt(match[6], 10), unit);

				if (match[5]) {
					observed.variable_prefix = match[5];
				}
			} else {
				observed.variable = this.convert_distance(parseInt(match[6], 10), unit);
			}
		}

		if (observed.runway) {
			const report: string[] = [];

			if (observed.variable !== null) {
				unit = ' meters';

				if (observed.variable <= 1) {
					unit = ' meter';
				}
				report.push(observed.variable + unit);
			} else if (observed.interval_min !== null && observed.interval_max !== null) {
				if (this.rvr_prefix_codes[observed.variable_prefix]) {
					report.push('varying from a min. of ' + observed.interval_min + ' meters until a max. of ' +
						this.rvr_prefix_codes[observed.variable_prefix] + ' that ' +
						observed.interval_max + ' meters');
				} else {
					report.push('varying from a min. of ' + observed.interval_min + ' meters until a max. of ' +
						observed.interval_max + ' meters');
				}
			}

			if (observed.tendency !== null) {
				if (this.rvr_tendency_codes[observed.tendency]) {
					report.push('and ' + this.rvr_tendency_codes[observed.tendency]);
				}
			}

			observed.report = report.join(' ');
		}

		this.set_result_group('runways_visual_range', observed);

		return true;
	}

	private get_present_weather(part: string): boolean {
		return this.decode_weather(part, 'present');
	}

	private get_clouds(part: string): boolean {
		const match = part.match(/^((NSW|NSC|NCD|CLR|SKC|NOBS|\/\/\/\/)|((VV|FEW|SCT|BKN|OVC|\/\/\/)([0-9]{3}|\/\/\/)(CB|TCU|\/\/\/)?))$/);

		if (!match) {
			return false;
		}

		const observed: any = {
			amount: null,
			height: null,
			height_ft: null,
			type: null,
			report: null,
		};

		if (match[2]) {
			if (this.cloud_codes[match[2]]) {
				observed.amount = match[2];
			}
		} else if (match[5]) {
			observed.height = this.convert_distance(parseInt(match[5], 10) * 100, 'FT');
			observed.height_ft = parseInt(match[5], 10) * 100;

			if (this.result.cloud_height === null || observed.height < this.result.cloud_height) {
				this.set_result_value('cloud_height', observed.height);
				this.set_result_value('cloud_height_ft', observed.height_ft);
			}

			if (this.cloud_codes[match[4]]) {
				observed.amount = match[4];
			}
		}

		if (match[6]) {
			if (this.cloud_type_codes[match[6]] && match[4] !== 'VV') {
				observed.type = match[6];
			}
		}

		if (observed.amount !== null) {
			const report: string[] = [];
			const report_ft: string[] = [];

			report.push(this.cloud_codes[observed.amount]);
			report_ft.push(this.cloud_codes[observed.amount]);

			if (observed.height) {
				if (observed.type !== null) {
					report.push('at ' + observed.height + ' meters, ' + this.cloud_type_codes[observed.type]);
				} else {
					report.push('at ' + observed.height + ' meters');
				}
			}
			if (observed.height_ft) {
				if (observed.type !== null) {
					report_ft.push('at ' + observed.height_ft + ' feet, ' + this.cloud_type_codes[observed.type]);
				} else {
					report_ft.push('at ' + observed.height_ft + ' feet');
				}
			}
			observed.report = report.join(' ');
			observed.report_ft = report_ft.join(' ');

			this.set_result_report('clouds_report', report.join(' '));
			this.set_result_report('clouds_report_ft', report_ft.join(' '));
		}

		this.set_result_group('clouds', observed);

		return true;
	}

	private get_temperature(part: string): boolean {
		const match = part.match(/^(M?[0-9]{2})\/(M?[0-9]{2}|[X]{2})?$/);

		if (!match) {
			return false;
		}

		this.set_result_value('clouds_report', 'Clear skies', true);
		this.set_result_value('present_weather_report', 'Dry', true);

		const temperature_c = parseInt(match[1].replace('M', '-'), 10);
		const temperature_f = Math.round(1.8 * temperature_c + 32);

		this.set_result_value('temperature', temperature_c);
		this.set_result_value('temperature_f', temperature_f);

		this.calculate_wind_chill(temperature_f);

		if (match[2] && match[2] !== 'XX') {
			const dew_point_c = parseInt(match[2].replace('M', '-'), 10);
			const dew_point_f = Math.round(1.8 * dew_point_c + 32);
			const rh = Math.round(100 * Math.pow((112 - (0.1 * temperature_c) + dew_point_c) / (112 + (0.9 * temperature_c)), 8));

			this.set_result_value('dew_point', dew_point_c);
			this.set_result_value('dew_point_f', dew_point_f);
			this.set_result_value('humidity', rh);

			this.calculate_heat_index(temperature_f, rh);
		}

		this.method++;

		return true;
	}

	private get_pressure(part: string): boolean {
		const match = part.match(/^(Q|A)(\/\/\/\/|[0-9]{4})$/);

		if (!match) {
			return false;
		}

		let pressure = parseInt(match[2], 10);

		if (match[1] === 'A') {
			pressure /= 100;
		}

		this.set_result_value('barometer', pressure);
		this.set_result_value('barometer_in', Math.round(0.02953 * pressure * 100) / 100);

		this.method++;

		return true;
	}

	private get_recent_weather(part: string): boolean {
		return this.decode_weather(part, 'recent', 'RE');
	}

	private get_runways_report(part: string): boolean {
		const match = part.match(/^R?\/?(SNOCLO|([0-9]{2}[LCR]?)\/?(CLRD|([0-9]{1}|\/)([0-9]{1}|\/)([0-9]{2}|\/\/))([0-9]{2}|\/\/))$/);

		if (!match) {
			return false;
		}

		this.set_result_value('runways_snoclo', false, true);

		if (match[1] === 'SNOCLO') {
			this.set_result_value('runways_snoclo', true);
		} else {
			const observed: any = {
				runway: match[2],
				deposits: null,
				deposits_extent: null,
				deposits_depth: null,
				friction: null,
				report: null,
			};

			if (match[3] === 'CLRD') {
				observed.deposits = 0;
			} else {
				const deposits = match[4];

				if (this.runway_deposits_codes[deposits]) {
					observed.deposits = deposits;
				}

				const deposits_extent = match[5];

				if (this.runway_deposits_extent_codes[deposits_extent]) {
					observed.deposits_extent = deposits_extent;
				}

				const deposits_depth = match[6];

				if (parseInt(deposits_depth, 10) >= 1 && parseInt(deposits_depth, 10) <= 90) {
					observed.deposits_depth = parseInt(deposits_depth, 10);
				} else if (this.runway_deposits_depth_codes[deposits_depth]) {
					observed.deposits_depth = deposits_depth;
				}
			}

			const friction = match[7];

			if (parseInt(friction, 10) > 0 && parseInt(friction, 10) <= 90) {
				observed.friction = Math.round(parseInt(friction, 10) / 100 * 100) / 100;
			} else if (this.runway_friction_codes[friction]) {
				observed.friction = friction;
			}

			const report: string[] = [];

			if (observed.deposits !== null) {
				report.push(this.runway_deposits_codes[observed.deposits]);

				if (observed.deposits_extent !== null) {
					report.push('contamination ' + this.runway_deposits_extent_codes[observed.deposits_extent]);
				}

				if (observed.deposits_depth !== null) {
					if (observed.deposits_depth === '99') {
						report.push('runway closed');
					} else if (this.runway_deposits_depth_codes[observed.deposits_depth]) {
						report.push('deposit is ' + this.runway_deposits_depth_codes[observed.deposits_depth] + ' deep');
					} else {
						report.push('deposit is ' + observed.deposits_depth + ' mm deep');
					}
				}
			}

			if (observed.friction !== null) {
				if (this.runway_friction_codes[observed.friction]) {
					report.push('a braking action is ' + this.runway_friction_codes[observed.friction]);
				} else {
					report.push('a friction coefficient is ' + observed.friction);
				}
			}

			observed.report = report.join(', ');

			this.set_result_group('runways_report', observed);
		}

		return true;
	}

	private get_wind_shear(part: string): boolean {
		if (part !== 'WS') {
			return false;
		}

		this.set_result_value('wind_shear_all_runways', false, true);

		this.part++;

		if (this.raw_parts.slice(this.part, this.part + 2).join(' ') === 'ALL RWY') {
			this.set_result_value('wind_shear_all_runways', true);

			this.part += 2;
		} else if (this.raw_parts[this.part]) {
			const match = this.raw_parts[this.part].match(/^R(WY)?([0-9]{2}[LCR]?)$/);

			if (!match) {
				return false;
			}

			if (parseInt(match[2], 10) > 36 || parseInt(match[2], 10) < 1) {
				return false;
			}

			this.set_result_group('wind_shear_runways', match[2]);
		} else {
			return false;
		}

		return true;
	}

	private get_forecast_temperature(part: string): boolean {
		const match = part.match(/^(TX|TN)(M?[0-9]{2})\/([0-9]{2})?([0-9]{2})Z$/);

		if (!match) {
			return false;
		}

		const temperature_c = parseInt(match[2].replace('M', '-'), 10);
		const temperature_f = Math.round(1.8 * temperature_c + 32);

		const forecast: any = {
			value: temperature_c,
			value_f: temperature_f,
			day: null,
			time: null,
		};

		if (match[3]) {
			forecast.day = parseInt(match[3], 10);
		}

		forecast.time = match[4] + ':00 UTC';

		const parameter = match[1] === 'TN' ? 'forecast_temperature_min' : 'forecast_temperature_max';

		this.set_result_group(parameter, forecast);

		return true;
	}

	private get_trends(part: string): boolean {
		const match = part.match(/^((NOSIG|BECMG|TEMPO|INTER|CNL|NIL|PROV|(PROB)([0-9]{2})|(AT|FM|TL)([0-9]{2})?([0-9]{2})([0-9]{2}))|(([0-9]{2})([0-9]{2}))/(([0-9]{2})([0-9]{2})))$/);

		if (!match) {
			return false;
		}

		if (this.part <= 4) {
			this.set_result_value('taf', true);
		}

		if (match[2] === 'NOSIG') {
			return true;
		}

		const trend: any = {
			flag: null,
			probability: null,
			period: {
				flag: null,
				day: null,
				time: null,
				from_day: null,
				from_time: null,
				to_day: null,
				to_time: null,
			},
			period_report: null,
		};

		const raw_parts: string[] = [];

		while (this.part < this.raw_parts.length) {
			const match = this.raw_parts[this.part].match(/^((NOSIG|BECMG|TEMPO|INTER|CNL|NIL|PROV|(PROB)([0-9]{2})|(AT|FM|TL)([0-9]{2})?([0-9]{2})([0-9]{2}))|(([0-9]{2})([0-9]{2}))/(([0-9]{2})([0-9]{2})))$/);

			if (match) {
				if (match[2] && this.trends_flag_codes[match[2]]) {
					trend.flag = match[2];
				} else if (match[3] === 'PROB') {
					trend.probability = match[4];
				} else if (match[8] && this.trends_time_codes[match[5]]) {
					trend.period.flag = match[5];

					if (match[6]) {
						trend.period.day = parseInt(match[6], 10);
					}

					trend.period.time = match[7] + ':' + match[8] + ' UTC';
				} else if (match[14]) {
					trend.period.from_day = match[10];
					trend.period.from_time = match[11] + ':00 UTC';
					trend.period.to_day = match[13];
					trend.period.to_time = match[14] + ':00 UTC';
				}
			} else if (this.raw_parts[this.part] === 'RMK') {
				if (raw_parts.length > 0) {
					this.part--;
				}

				break;
			} else {
				raw_parts.push(this.raw_parts[this.part]);
			}

			this.part++;

			if (raw_parts.length > 0) {
				if (!this.raw_parts[this.part] || this.raw_parts[this.part].match(/^((NOSIG|BECMG|TEMPO|INTER|CNL|NIL|PROV|(PROB)([0-9]{2})|(AT|FM|TL)([0-9]{2})?([0-9]{2})([0-9]{2}))|(([0-9]{2})([0-9]{2}))/(([0-9]{2})([0-9]{2})))$/)) {
					this.part--;

					break;
				}
			}
		}

		if (raw_parts.length === 0) {
			if (trend.flag !== 'CNL' && trend.flag !== 'NIL') {
				this.part--;

				return false;
			}
		} else {
			const parser = new Metar(raw_parts.join(' '), true, this.debug_enabled, false);

			const parsed = parser.parse();

			if (parsed) {
				delete parsed.taf;

				if (Object.keys(parsed).length > 0) {
					Object.assign(trend, parsed);
				}
			}

			const debug = parser.debug();

			if (debug) {
				for (const message of debug) {
					this.set_debug('Recursion: ' + message);
				}
			}

			const errors = parser.errors();

			if (errors) {
				for (const message of errors) {
					this.set_error('Recursion: ' + message);
				}
			}
		}

		const report: string[] = [];

		if (trend.flag !== null) {
			report.push(this.trends_flag_codes[trend.flag]);
		}

		if (trend.period.flag !== null) {
			if (trend.period.day !== null) {
				report.push(this.trends_time_codes[trend.period.flag] +
					' a ' + trend.period.day + ' day of the month on ' + trend.period.time);
			} else {
				report.push(this.trends_time_codes[trend.period.flag] + ' ' + trend.period.time);
			}
		}

		if (trend.period.from_day !== null && trend.period.to_day !== null) {
			report.push('from a ' + trend.period.from_day + ' day of the month on ' + trend.period.from_time);
			report.push('to a ' + trend.period.to_day + ' day of the month on ' + trend.period.to_time);
		}

		if (trend.probability !== null) {
			report.push('probability ' + trend.probability + '% of the conditions existing');
		}

		if (report.length > 0) {
			trend.period_report = report.join(', ');
		}

		this.set_result_group('trends', trend);

		return true;
	}

	private get_remarks(part: string): boolean {
		if (part !== 'RMK') {
			return false;
		}

		this.part++;

		const remarks: string[] = [];

		while (this.part < this.raw_parts.length) {
			if (this.raw_parts[this.part]) {
				remarks.push(this.raw_parts[this.part]);
			}

			this.part++;
		}

		if (remarks.length > 0) {
			this.set_result_value('remarks', remarks.join(' '));
		}

		this.method++;

		return true;
	}

	private decode_weather(part: string, method: string, regexp_prefix: string = ''): boolean {
		const wx_codes = Object.keys({ ...this.weather_char_codes, ...this.weather_type_codes }).join('|');

		const match = part.match(new RegExp(`^${regexp_prefix}([-+]|VC)?(${wx_codes})?(${wx_codes})?(${wx_codes})?(${wx_codes})?$`));

		if (!match) {
			return false;
		}

		const observed: any = {
			intensity: null,
			types: null,
			characteristics: null,
			report: null,
		};

		if (match[1]) {
			observed.intensity = match[1];
		}

		for (const code of match.slice(1)) {
			if (this.weather_type_codes[code]) {
				if (observed.types === null) {
					observed.types = [];
				}

				observed.types.push(code);
			}

			if (this.weather_char_codes[code]) {
				observed.characteristics = code;
			}
		}

		if (observed.characteristics !== null || observed.types !== null) {
			const report: string[] = [];

			if (observed.intensity !== null) {
				if (observed.intensity === 'VC') {
					report.push(this.weather_intensity_codes[observed.intensity] + ',');
				} else {
					report.push(this.weather_intensity_codes[observed.intensity]);
				}
			}

			if (observed.characteristics !== null) {
				report.push(this.weather_char_codes[observed.characteristics]);
			}

			if (observed.types !== null) {
				for (const code of observed.types) {
					report.push(this.weather_type_codes[code]);
				}
			}

			observed.report = report.join(' ');

			this.set_result_report(method + '_weather_report', report.join(' '));
		}

		this.set_result_group(method + '_weather', observed);

		return true;
	}

	private calculate_heat_index(temperature_f: number, rh: number): void {
		if (temperature_f > 79 && rh > 39) {
			let hi_f = -42.379 + 2.04901523 * temperature_f + 10.14333127 * rh - 0.22475541 * temperature_f * rh;
			hi_f += -0.00683783 * Math.pow(temperature_f, 2) - 0.05481717 * Math.pow(rh, 2);
			hi_f += 0.00122874 * Math.pow(temperature_f, 2) * rh + 0.00085282 * temperature_f * Math.pow(rh, 2);
			hi_f += -0.00000199 * Math.pow(temperature_f, 2) * Math.pow(rh, 2);
			hi_f = Math.round(hi_f);
			const hi_c = Math.round((hi_f - 32) / 1.8);

			this.set_result_value('heat_index', hi_c);
			this.set_result_value('heat_index_f', hi_f);
		}
	}

	private calculate_wind_chill(temperature_f: number): void {
		if (temperature_f < 51 && this.result.wind_speed !== 0) {
			const windspeed = Math.round(2.23694 * this.result.wind_speed);

			if (windspeed > 3) {
				let chill_f = 35.74 + 0.6215 * temperature_f - 35.75 * Math.pow(windspeed, 0.16);
				chill_f += 0.4275 * temperature_f * Math.pow(windspeed, 0.16);
				chill_f = Math.round(chill_f);
				const chill_c = Math.round((chill_f - 32) / 1.8);

				this.set_result_value('wind_chill', chill_c);
				this.set_result_value('wind_chill_f', chill_f);
			}
		}
	}

	private convert_speed(speed: number, from_unit: string, return_unit: string = 'MPS'): number | null {
		const conversion_factors: { [key: string]: { [key: string]: number } } = {
			'KT': { 'KT': 1, 'KPH': 1.852, 'MPS': 0.514444 },
			'KPH': { 'KT': 0.539957, 'KPH': 1, 'MPS': 0.277778 },
			'MPS': { 'KT': 1.943844, 'KPH': 3.6, 'MPS': 1 },
		};

		if (!conversion_factors[from_unit] || !conversion_factors[return_unit]) {
			return null;
		}

		const conversion_factor = conversion_factors[from_unit][return_unit];
		return Math.round(conversion_factor * speed * 100) / 100;
	}

	private convert_distance(distance: number, from_unit: string, return_unit: string = 'M'): number | null {
		const conversion_factors: { [key: string]: { [key: string]: number } } = {
			'FT': { 'FT': 1, 'SM': 0.000189394, 'M': 0.3048 },
			'SM': { 'FT': 5279.99, 'SM': 1, 'M': 1609.34 },
			'M': { 'FT': 3.28084, 'SM': 0.000621371, 'M': 1 },
		};

		if (!conversion_factors[from_unit] || !conversion_factors[return_unit]) {
			return null;
		}

		const conversion_factor = conversion_factors[from_unit][return_unit];
		return Math.round(conversion_factor * distance);
	}

	private convert_direction_label(direction: number): string | null {
		if (direction >= 0 && direction <= 360) {
			return this.direction_codes[Math.round(direction / 22.5) % 16];
		}

		return null;
	}
}
