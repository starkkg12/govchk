// テーマスタイル処理
export function handleThemeStyle(theme) {
	document.documentElement.style.setProperty('--el-color-primary', theme)
	for (let i = 1; i <= 9; i++) {
		document.documentElement.style.setProperty(`--el-color-primary-light-${i}`, `${getLightColor(theme, i / 10)}`)
	}
	for (let i = 1; i <= 9; i++) {
		document.documentElement.style.setProperty(`--el-color-primary-dark-${i}`, `${getDarkColor(theme, i / 10)}`)
	}
}

// hex値をRgb値に変換
export function hexToRgb(str) {
	str = str.replace('#', '')
	let hexs = str.match(/../g)
	for (let i = 0; i < 3; i++) {
		hexs[i] = parseInt(hexs[i], 16)
	}
	return hexs
}

// rgb値をHex値に変換
export function rgbToHex(r, g, b) {
	let hexs = [r.toString(16), g.toString(16), b.toString(16)]
	for (let i = 0; i < 3; i++) {
		if (hexs[i].length == 1) {
			hexs[i] = `0${hexs[i]}`
		}
	}
	return `#${hexs.join('')}`
}

// 浅色取得
export function getLightColor(color, level) {
	let rgb = hexToRgb(color)
	for (let i = 0; i < 3; i++) {
		rgb[i] = Math.floor((255 - rgb[i]) * level + rgb[i])
	}
	return rgbToHex(rgb[0], rgb[1], rgb[2])
}

// 暗い色取得
export function getDarkColor(color, level) {
	let rgb = hexToRgb(color)
	for (let i = 0; i < 3; i++) {
		rgb[i] = Math.floor(rgb[i] * (1 - level))
	}
	return rgbToHex(rgb[0], rgb[1], rgb[2])
}

export function htmlspecialchars(str){
	return (str + '').replace(/&/g,'&amp;')
					 .replace(/"/g,'&quot;')
					 .replace(/'/g,'&#039;')
					 .replace(/</g,'&lt;')
					 .replace(/>/g,'&gt;'); 
  }
  
export function htmlspecialchars_decode(string, quote_style) {
	//       discuss at: http://phpjs.org/functions/htmlspecialchars_decode/
	//      original by: Mirek Slugen
	//      improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
	//      bugfixed by: Mateusz "loonquawl" Zalega
	//      bugfixed by: Onno Marsman
	//      bugfixed by: Brett Zamir (http://brett-zamir.me)
	//      bugfixed by: Brett Zamir (http://brett-zamir.me)
	//         input by: ReverseSyntax
	//         input by: Slawomir Kaniecki
	//         input by: Scott Cariss
	//         input by: Francois
	//         input by: Ratheous
	//         input by: Mailfaker (http://www.weedem.fr/)
	//       revised by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
	// reimplemented by: Brett Zamir (http://brett-zamir.me)
	//        example 1: htmlspecialchars_decode("<p>this -&gt; &quot;</p>", 'ENT_NOQUOTES');
	//        returns 1: '<p>this -> &quot;</p>'
	//        example 2: htmlspecialchars_decode("&amp;quot;");
	//        returns 2: '&quot;'
  
	var optTemp = 0,
	  i = 0,
	  noquotes = false;
	if (typeof quote_style === 'undefined') {
	  quote_style = 2;
	}
	string = string.toString()
	  .replace(/&lt;/g, '<')
	  .replace(/&gt;/g, '>');
	var OPTS = {
	  'ENT_NOQUOTES': 0,
	  'ENT_HTML_QUOTE_SINGLE': 1,
	  'ENT_HTML_QUOTE_DOUBLE': 2,
	  'ENT_COMPAT': 2,
	  'ENT_QUOTES': 3,
	  'ENT_IGNORE': 4
	};
	if (quote_style === 0) {
	  noquotes = true;
	}
	if (typeof quote_style !== 'number') {
	  // Allow for a single string or an array of string flags
	  quote_style = [].concat(quote_style);
	  for (i = 0; i < quote_style.length; i++) {
		// Resolve string input to bitwise e.g. 'PATHINFO_EXTENSION' becomes 4
		if (OPTS[quote_style[i]] === 0) {
		  noquotes = true;
		} else if (OPTS[quote_style[i]]) {
		  optTemp = optTemp | OPTS[quote_style[i]];
		}
	  }
	  quote_style = optTemp;
	}
	if (quote_style & OPTS.ENT_HTML_QUOTE_SINGLE) {
	  string = string.replace(/&#0*39;/g, "'"); // PHP doesn't currently escape if more than one 0, but it should
	  // string = string.replace(/&apos;|&#x0*27;/g, "'"); // This would also be useful here, but not a part of PHP
	}
	if (!noquotes) {
	  string = string.replace(/&quot;/g, '"');
	}
	// Put this in last place to avoid escape being double-decoded
	string = string.replace(/&amp;/g, '&');
  
	return string;
  }

export function getMonths(month) {
	var dateArr = [];
	var date = new Date();
	var year = date.getFullYear();
	date.setMonth(date.getMonth() +1, 1);
	for (var i = 0; i < month; i++) {
		date.setMonth(date.getMonth() - 1);
		var m = date.getMonth() + 1;
		m = m < 10 ? "0" + m : m;
		dateArr.push(date.getFullYear() + "-" +m);
	}
	return dateArr;
}

export function getLastDate(month) {
	var arr = month.split('-');
	var date = new Date(arr[0], arr[1], 0);
	return date.getDate();
}

export function removeHTML(conttent) {
	let str = htmlspecialchars_decode(conttent);
	return str.replace(/(<([^>]+)>)/ig, '');
}