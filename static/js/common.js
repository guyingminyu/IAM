/**
 * 公用函数库
 * @author 903513116@qq.com
 * @param $
 */
(function($) {
    c = {
        opacity : 0.9, // 遮罩层透明度,从 0.0 （完全透明）到 1.0（完全不透明）
        showBack : true, // 显示遮罩背景层
        showLoading : true, // 显示loading示意
        goldenRatio : .382, // 黄金分割比例
        timeout : 10000,// ajax请求超时时间
        artDialog : {
            width : 'auto',
            height : 'auto'
        },
        zindex : {
            def : 100000
        },
        gritter : {
            position : 'bottom-right',
            class_name : 'gritter-success',
            fade_in_speed : 'medium',
            fade_out_speed : 100,
            time : 4000
        },
        img : {
            width : 200,// 大图显示默认宽度
            height : 200,// 大图显示默认高度
        }
    };

    /**
     * 数据类型判断
     * @param val 要判断的变量
     * @param convert 判断前是否需要先强制转换
     * @return boolean
     */
    $._isArray = function(val) {
        return val && typeof val == 'object' && val.constructor == Array;
    };
    $._isObject = function(val) {
        return val && typeof val == 'object' && val.constructor == Object;
    };
    $._isJson = function(val) {
        return val && typeof val == 'object' && Object.prototype.toString.call(val).toLowerCase() == '[object object]';
    };
    $._isString = function(val) {
        return val && typeof val == 'string' && val.constructor == String;
    };
    $._isNumeric = function(val) {
        return !isNaN(Number(val));
    };
    $.isPositiveInteger = function(val) {
        var pattern = /^[1-9][0-9]{0,}$/;
        return pattern.test(Number(val));
    };
    $.isInteger = function(val) {
        var pattern = /^[0-9]{1,}$/;
        return pattern.test(Number(val));
    };
    $._isBoolean = function(val) {
        return val && typeof val === 'boolean' && val.constructor == Boolean;
    };
    $._isFunction = function(val) {
        return val && typeof val === 'function' && Object.prototype.toString.call(val).toLowerCase() == '[object function]';
    };
    $._isEmpty = function(val, outNumZero) {
        if (typeof val == 'undefined' || val == null) {
            return true;
        }
        if ($._isNumeric(val) && outNumZero) {
            return Number(val) == 0;
        } else if ($._isString(val)) {
            return val.trim() == '';
        } else if ($._isJson(val)) {
            return $.jsonLen(val) == 0;
        } else if ($._isArray(val) || $._isObject(val)) {
            return val.length == 0;
        }
        return val ? false : true;
    }
    /**
     * 浏览器设备判断
     */
    $.ie = function() {
        return /msie/.test(navigator.userAgent.toLowerCase());
    };
    $.windows = function() {
        return navigator.userAgent.match(/Windows/i) ? true : false;
    };
    $.ios = function() {
        return navigator.userAgent.match(/iPhone|iPod|iPad/i) ? true : false;
    };
    $.android = function() {
        return navigator.userAgent.match(/Android|Linux/i) ? true : false;
    };
    $.getBrowserName = function() {
        var nav = navigator.userAgent.toLowerCase();
        if (nav.indexOf('msie') > 0) {
            nav = 'ie';
        } else if (nav.indexOf('firefox') > 0) {
            nav = 'firefox';
        } else if (nav.indexOf('safari') > 0) {
            nav = 'safari';
        } else if (nav.indexOf('camino') > 0) {
            nav = 'camino';
        } else if (nav.indexOf('gecko') > 0) {
            nav = 'gecko';
        } else if (nav.indexOf('chrome') > 0) {
            nav = 'chrome';
        }
        return nav;
    };

    /**
     * 当前日期时间
     */
    $.nowDTime = function() {
        var date = new Date();
        var seperator1 = "-";
        var seperator2 = ":";
        var month = date.getMonth() + 1;
        var strDate = date.getDate();
        if (month >= 1 && month <= 9) {
            month = "0" + month;
        }
        if (strDate >= 0 && strDate <= 9) {
            strDate = "0" + strDate;
        }
        var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate + " " + date.getHours() + seperator2 + date.getMinutes() + seperator2 + date.getSeconds();
        return currentdate;
    }

    /**
     * 给Array类追加prototype的方法
     * @param fn 迭代方法
     * @param element 指定元素
     * @param a 数组a
     * @param b 数组b
     * @return mixed
     */
    Array.prototype.each = function(fn) { // 数组迭代器
        fn = fn || Function.K;
        var a = [ ];
        var args = Array.prototype.slice.call(arguments, 1);
        for (var i = 0; i < this.length; i++) {
            var res = fn.apply(this, [ this[i], i ].concat(args));
            if (res != null) {
                a.push(res);
            }
        }
        return a;
    }
    Array.prototype.contains = function(element) { // 是否包含指定元素
        var self = this;
        for (var i = 0; i < self.length; i++) {
            if (self[i] == element) {
                return true;
            }
        }
        return false;
    }
    Array.prototype.uniquelize = function() { // 数组去重
        var ra = new Array();
        for (var i = 0; i < this.length; i++) {
            if (!ra.contains(this[i])) {
                ra.push(this[i]);
            }
        }
        return ra;
    }
    Array.complement = function(a, b) { // 数组补集
        return Array.minus(Array.union(a, b), Array.intersect(a, b));
    }
    Array.intersect = function(a, b) { // 数组交集
        return a.uniquelize().each(function(o) {
            return b.contains(o) ? o : null;
        });
    }
    Array.minus = function(a, b) { // 数组差集
        return a.uniquelize().each(function(o) {
            return b.contains(o) ? null : o;
        });
    }
    Array.union = function(a, b) { // 数组并集
        return a.concat(b).uniquelize();
    }

    /**
     * @author mjf 过滤html标签
     * @param html为输入的内容
     * @return 返回过滤后的内容
     */
    $.filterHtml = function(html) {
        html = html.replace(/<[^>]*>/g, '') // 去除HTML tag
        .replace(/[ | ]*\n/g, '\n') // 去除行尾空白
        .replace(/\n[\s| | ]*\r/g, '\n') // 去除多余空行
        .replace('&nbsp;', '') // 去除多余空格
        .replace(' ', '') // 去除多余空格
        return html;
    };

    /**
     * md5加密
     * @param string 要加密的字符串
     * @param full 是否完整(32位)，默认false(16位)
     * @param upper 是否大写，默认false
     * @return string
     */
    $.md5 = function(string, full, upper) {
        string = string.toString();
        if (typeof full == 'undefined')
            full = false;
        if (typeof upper == 'undefined')
            upper = false;
        var rotateLeft = function(lValue, iShiftBits) {
            return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
        }
        var addUnsigned = function(lX, lY) {
            var lX4, lY4, lX8, lY8, lResult;
            lX8 = (lX & 0x80000000);
            lY8 = (lY & 0x80000000);
            lX4 = (lX & 0x40000000);
            lY4 = (lY & 0x40000000);
            lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF);
            if (lX4 & lY4)
                return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
            if (lX4 | lY4) {
                if (lResult & 0x40000000)
                    return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
                else
                    return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
            } else {
                return (lResult ^ lX8 ^ lY8);
            }
        }
        var F = function(x, y, z) {
            return (x & y) | ((~x) & z);
        }
        var G = function(x, y, z) {
            return (x & z) | (y & (~z));
        }
        var H = function(x, y, z) {
            return (x ^ y ^ z);
        }
        var I = function(x, y, z) {
            return (y ^ (x | (~z)));
        }
        var FF = function(a, b, c, d, x, s, ac) {
            a = addUnsigned(a, addUnsigned(addUnsigned(F(b, c, d), x), ac));
            return addUnsigned(rotateLeft(a, s), b);
        }
        var GG = function(a, b, c, d, x, s, ac) {
            a = addUnsigned(a, addUnsigned(addUnsigned(G(b, c, d), x), ac));
            return addUnsigned(rotateLeft(a, s), b);
        }
        var HH = function(a, b, c, d, x, s, ac) {
            a = addUnsigned(a, addUnsigned(addUnsigned(H(b, c, d), x), ac));
            return addUnsigned(rotateLeft(a, s), b);
        }
        var II = function(a, b, c, d, x, s, ac) {
            a = addUnsigned(a, addUnsigned(addUnsigned(I(b, c, d), x), ac));
            return addUnsigned(rotateLeft(a, s), b);
        }
        var convertToWordArray = function(string) {
            var lWordCount;
            var lMessageLength = string.length;
            var lNumberOfWordsTempOne = lMessageLength + 8;
            var lNumberOfWordsTempTwo = (lNumberOfWordsTempOne - (lNumberOfWordsTempOne % 64)) / 64;
            var lNumberOfWords = (lNumberOfWordsTempTwo + 1) * 16;
            var lWordArray = Array(lNumberOfWords - 1);
            var lBytePosition = 0;
            var lByteCount = 0;
            while (lByteCount < lMessageLength) {
                lWordCount = (lByteCount - (lByteCount % 4)) / 4;
                lBytePosition = (lByteCount % 4) * 8;
                lWordArray[lWordCount] = (lWordArray[lWordCount] | (string.charCodeAt(lByteCount) << lBytePosition));
                lByteCount++;
            }
            lWordCount = (lByteCount - (lByteCount % 4)) / 4;
            lBytePosition = (lByteCount % 4) * 8;
            lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
            lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
            lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
            return lWordArray;
        }
        var wordToHex = function(lValue) {
            var WordToHexValue = '', WordToHexValueTemp = '', lByte, lCount;
            for (lCount = 0; lCount <= 3; lCount++) {
                lByte = (lValue >>> (lCount * 8)) & 255;
                WordToHexValueTemp = '0' + lByte.toString(16);
                WordToHexValue = WordToHexValue + WordToHexValueTemp.substr(WordToHexValueTemp.length - 2, 2);
            }
            return WordToHexValue;
        }
        var uTF8Encode = function(string) {
            string = string.replace(/\x0d\x0a/g, '\x0a');
            var output = '';
            for (var n = 0; n < string.length; n++) {
                var c = string.charCodeAt(n);
                if (c < 128) {
                    output += String.fromCharCode(c);
                } else if ((c > 127) && (c < 2048)) {
                    output += String.fromCharCode((c >> 6) | 192);
                    output += String.fromCharCode((c & 63) | 128);
                } else {
                    output += String.fromCharCode((c >> 12) | 224);
                    output += String.fromCharCode(((c >> 6) & 63) | 128);
                    output += String.fromCharCode((c & 63) | 128);
                }
            }
            return output;
        }
        var md5 = function(string) {
            var x = Array();
            var k, AA, BB, CC, DD, a, b, c, d;
            var S11 = 7, S12 = 12, S13 = 17, S14 = 22;
            var S21 = 5, S22 = 9, S23 = 14, S24 = 20;
            var S31 = 4, S32 = 11, S33 = 16, S34 = 23;
            var S41 = 6, S42 = 10, S43 = 15, S44 = 21;
            string = uTF8Encode(string);
            x = convertToWordArray(string);
            a = 0x67452301;
            b = 0xEFCDAB89;
            c = 0x98BADCFE;
            d = 0x10325476;
            for (k = 0; k < x.length; k += 16) {
                AA = a;
                BB = b;
                CC = c;
                DD = d;
                a = FF(a, b, c, d, x[k + 0], S11, 0xD76AA478);
                d = FF(d, a, b, c, x[k + 1], S12, 0xE8C7B756);
                c = FF(c, d, a, b, x[k + 2], S13, 0x242070DB);
                b = FF(b, c, d, a, x[k + 3], S14, 0xC1BDCEEE);
                a = FF(a, b, c, d, x[k + 4], S11, 0xF57C0FAF);
                d = FF(d, a, b, c, x[k + 5], S12, 0x4787C62A);
                c = FF(c, d, a, b, x[k + 6], S13, 0xA8304613);
                b = FF(b, c, d, a, x[k + 7], S14, 0xFD469501);
                a = FF(a, b, c, d, x[k + 8], S11, 0x698098D8);
                d = FF(d, a, b, c, x[k + 9], S12, 0x8B44F7AF);
                c = FF(c, d, a, b, x[k + 10], S13, 0xFFFF5BB1);
                b = FF(b, c, d, a, x[k + 11], S14, 0x895CD7BE);
                a = FF(a, b, c, d, x[k + 12], S11, 0x6B901122);
                d = FF(d, a, b, c, x[k + 13], S12, 0xFD987193);
                c = FF(c, d, a, b, x[k + 14], S13, 0xA679438E);
                b = FF(b, c, d, a, x[k + 15], S14, 0x49B40821);
                a = GG(a, b, c, d, x[k + 1], S21, 0xF61E2562);
                d = GG(d, a, b, c, x[k + 6], S22, 0xC040B340);
                c = GG(c, d, a, b, x[k + 11], S23, 0x265E5A51);
                b = GG(b, c, d, a, x[k + 0], S24, 0xE9B6C7AA);
                a = GG(a, b, c, d, x[k + 5], S21, 0xD62F105D);
                d = GG(d, a, b, c, x[k + 10], S22, 0x2441453);
                c = GG(c, d, a, b, x[k + 15], S23, 0xD8A1E681);
                b = GG(b, c, d, a, x[k + 4], S24, 0xE7D3FBC8);
                a = GG(a, b, c, d, x[k + 9], S21, 0x21E1CDE6);
                d = GG(d, a, b, c, x[k + 14], S22, 0xC33707D6);
                c = GG(c, d, a, b, x[k + 3], S23, 0xF4D50D87);
                b = GG(b, c, d, a, x[k + 8], S24, 0x455A14ED);
                a = GG(a, b, c, d, x[k + 13], S21, 0xA9E3E905);
                d = GG(d, a, b, c, x[k + 2], S22, 0xFCEFA3F8);
                c = GG(c, d, a, b, x[k + 7], S23, 0x676F02D9);
                b = GG(b, c, d, a, x[k + 12], S24, 0x8D2A4C8A);
                a = HH(a, b, c, d, x[k + 5], S31, 0xFFFA3942);
                d = HH(d, a, b, c, x[k + 8], S32, 0x8771F681);
                c = HH(c, d, a, b, x[k + 11], S33, 0x6D9D6122);
                b = HH(b, c, d, a, x[k + 14], S34, 0xFDE5380C);
                a = HH(a, b, c, d, x[k + 1], S31, 0xA4BEEA44);
                d = HH(d, a, b, c, x[k + 4], S32, 0x4BDECFA9);
                c = HH(c, d, a, b, x[k + 7], S33, 0xF6BB4B60);
                b = HH(b, c, d, a, x[k + 10], S34, 0xBEBFBC70);
                a = HH(a, b, c, d, x[k + 13], S31, 0x289B7EC6);
                d = HH(d, a, b, c, x[k + 0], S32, 0xEAA127FA);
                c = HH(c, d, a, b, x[k + 3], S33, 0xD4EF3085);
                b = HH(b, c, d, a, x[k + 6], S34, 0x4881D05);
                a = HH(a, b, c, d, x[k + 9], S31, 0xD9D4D039);
                d = HH(d, a, b, c, x[k + 12], S32, 0xE6DB99E5);
                c = HH(c, d, a, b, x[k + 15], S33, 0x1FA27CF8);
                b = HH(b, c, d, a, x[k + 2], S34, 0xC4AC5665);
                a = II(a, b, c, d, x[k + 0], S41, 0xF4292244);
                d = II(d, a, b, c, x[k + 7], S42, 0x432AFF97);
                c = II(c, d, a, b, x[k + 14], S43, 0xAB9423A7);
                b = II(b, c, d, a, x[k + 5], S44, 0xFC93A039);
                a = II(a, b, c, d, x[k + 12], S41, 0x655B59C3);
                d = II(d, a, b, c, x[k + 3], S42, 0x8F0CCC92);
                c = II(c, d, a, b, x[k + 10], S43, 0xFFEFF47D);
                b = II(b, c, d, a, x[k + 1], S44, 0x85845DD1);
                a = II(a, b, c, d, x[k + 8], S41, 0x6FA87E4F);
                d = II(d, a, b, c, x[k + 15], S42, 0xFE2CE6E0);
                c = II(c, d, a, b, x[k + 6], S43, 0xA3014314);
                b = II(b, c, d, a, x[k + 13], S44, 0x4E0811A1);
                a = II(a, b, c, d, x[k + 4], S41, 0xF7537E82);
                d = II(d, a, b, c, x[k + 11], S42, 0xBD3AF235);
                c = II(c, d, a, b, x[k + 2], S43, 0x2AD7D2BB);
                b = II(b, c, d, a, x[k + 9], S44, 0xEB86D391);
                a = addUnsigned(a, AA);
                b = addUnsigned(b, BB);
                c = addUnsigned(c, CC);
                d = addUnsigned(d, DD);
            }
            var tempValue = wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d);
            return tempValue.toLowerCase();
        }
        var md5string = md5(string);
        md5string = full ? md5string : md5string.substr(8, 16);
        return upper ? md5string.toLocaleUpperCase() : md5string;
    };

    /**
     * 获取变量json的长度
     * @param json 要计算长度的json数据
     * @return int
     */
    $.jsonLen = function(json) {
        var length = 0;
        $.each(json, function() {
            length++;
        });
        return length;
    };

    /**
     * json转string
     * @param json json对象
     * @return string
     */
    $.jsonToString = function(json) {
        if (!$.ie() && JSON != 'undefined') {
            return JSON.stringify(json);
        } else {
            var arr = [ ];
            $.each(json, function(key, val) {
                var next = '\'' + key + '\':\'';
                // $.isPlainObject jQuery方式测试对象是否是纯粹的对象（通过 "{}" 或者 "new Object"
                // 创建的）
                next += $.isPlainObject(val) ? jsonToString(val) : val;
                next += '\'';
                arr.push(next);
            });
            return '{' + arr.join(', ') + '}';
        }
    };

    /**
     * 弹出对象 - 测试专用
     * @param val 测试变量
     * @param old 是否使用传统alert
     * @return void
     */
    $.dump = function(val, old) {
        if (typeof old == 'undefined') {
            old = true;
        }
        if ($._isObject(val)) {
            if (!$.ie() && typeof JSON != 'undefined') {
                val = JSON.stringify(val);
            } else {
                var arr = [ ];
                $.each(val, function(key, val) {
                    var next = key + ':';
                    next += $.isPlainObject(val) ? $.jsonToString(val) : val;
                    arr.push(next);
                });
                val = '{' + arr.join(',') + '}';
            }
        }
        old ? alert(val) : $.showAlert(val);
    };

    /**
     * 绑定键盘keydown事件
     * @param num 绑定键对应的键码数值
     * @param fn 回调函数
     * @param obj 绑定的对象元素
     * @param ctrl 是否需要回车键支持
     * @return void
     */
    $.keyBind = function(num, fn, obj, ctrl) {
        if (!obj) {
            obj = $(document);
        }
        obj.unbind('keydown').bind('keydown', function(event) {
            if (ctrl) {
                if (event.keyCode == num && event.ctrlKey && fn) {
                    fn($);
                }
            } else {
                if (event.keyCode == num && fn) {
                    fn($);
                }
            }
        });
    };

    /**
     * 根据值删除数组中的指定元素
     * @param arr 进行操作的数组原型
     * @param value 要删除的值
     * @return array
     */
    $.delArray = function(arr, value) {
        var result = [ ];
        $.each(arr, function(k, v) {
            if (v != value) {
                result.push(v);
            }
        });
        return result;
    };

    /**
     * 元素是否在数组中
     */
    $.isInArray = function(value, arr) {
        var flag = false;
        $.each(arr, function(k, v) {
            if (v == value) {
                flag = true;
                return false;
            }
        });
        return flag;
    };

    /**
     * 计算两数的百分比
     * @param member 分子
     * @param deno 分母
     * @param pass 是否可以超过100%
     * @param format 保留小数点后几位
     * @return int
     */
    $.getScale = function(member, deno, pass, format) {
        if (deno == 0) {
            return 0;
        }
        var num = (member / deno * 100);
        return num > 100 ? (pass ? num.toFixed(format) : 100) : num.toFixed(format);
    };

    /**
     * 获取cookie
     * @param name 要获取的cookie名
     * @return mixed - false | string
     */
    $.cookie = function(name) {
        var cookieArray = document.cookie.split('; ');
        for (var i = 0; i < cookieArray.length; i++) {
            var arr = cookieArray[i].split('=');
            if (arr[0] == name) {
                return unescape(arr[1]);
            }
        }
        return false;
    };

    /**
     * 获取全部的cookie
     */
    $.cookieAll = function() {
        var data = new Array();
        var cookieArray = document.cookie.split('; ');
        for (var i = 0; i < cookieArray.length; i++) {
            var obj = { };
            var arr = cookieArray[i].split('=');
            obj.name = arr[0];
            obj.value = unescape(arr[1]);
            data.push(obj);
        }
        return data;
    }

    /**
     * 删除cookie
     * @param name 要删除的cookie名
     * @return void
     */
    $.delCookie = function(name) {
        document.cookie = name + '=;expires=' + (new Date(0)).toGMTString() + '; path=/';
    };

    /**
     * 设置cookie
     * @param name 要添加的cookie名
     * @param value 要添加的cookie值
     * @param time cookie的存活时间 (单位：秒)
     * @return void
     */
    $.addCookie = function(name, value, time) {
        var expires = new Date();
        if (!time) {
            time = 3600 * 1; // 1小时
        }
        expires.setTime(expires.getTime() + time * 1000);
        document.cookie = name + '=' + escape(value) + '; expires=' + expires.toGMTString() + '; path=/';
    };

    /**
     * 获取鼠标当前的坐标
     * @param e 当前对象
     * @return json
     */
    $.mousePos = function(e) {
        var e = e || window.event;
        return {
            x : e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft,
            y : e.clientY + document.body.scrollTop + document.documentElement.scrollTop
        }
    };

    /**
     * 仅允许输入数字
     * @param 输入框对象
     * @return void
     */
    $.allowNumOnly = function(obj) {
        if (!c.keyCode) {
            c.keyCode = '';
        }
        obj.data('value', obj.val());
        obj.unbind('keydown').bind('keydown', function(e) {
            var key = e.keyCode;
            console.log(key);
            if (key == 17 || key == 86 || key == 67) {
                return true;
            }
            if ((key > 95 && key < 106) || (key > 47 && key < 58) || $.inArray(key, [ 8, 9, 13, 110, 190 ]) != -1) {
                return true;
            }
            return false;
        });
        obj.unbind('input propertychange').bind('input propertychange', function() {
            var value = $(this).val();
            if (!$._isNumeric(value)) {
                obj.val(obj.data('value'));
            } else {
                obj.data('value', value);
            }
        });
    };

    /**
     * 动态加载css文件
     * @param cssfile 需要加载的css文件路径
     * @return void
     */
    $.loadCss = function(cssfile) {
        if ($._isString(cssfile)) {
            cssfile = [ cssfile ];
        }
        $.each(cssfile, function(k, v) {
            $('<link>').attr({
                rel : 'stylesheet',
                type : 'text/css',
                href : v
            }).appendTo('head');
        });
    };

    /**
     * 动态加载js文件
     * @param jsfile 需要加载的js文件路径
     * @param fn 加载完后的回调
     * @return void
     */
    $.loadJs = function(jsfile, fn) {
        $.getScript(jsfile, function() {
            if (fn) {
                fn($);
            }
        });
    };

    /**
     * ajax上传文件
     * @param inputObj 提交按钮对象
     * @param url php端处理的url地址
     * @param completefn 完成后的回调函数
     * @param submitfn 提交后的回调函数
     * @param fileName $_FILES['fileName']
     * @param data 额外数据
     * @param accept 允许的文件类型 如：image/jpeg;image/png
     * @param uploadChange 选中上传文件开始上传时执行
     * @return void
     */
    $.ajaxUpload = function(inputObj, url, completefn, submitfn, fileName, data, accept, uploadChange, responseType) {
        // 先加载ajax类库
        $.loadJs('/plugins/ajaxupload.js');
        if (!data) {
            data = { };
        }
        if (!fileName) {
            fileName = 'ajaxupload';
        }
        if (!responseType) {
            responseType = 'json';
        }
        new AjaxUpload(inputObj[0], {
            action : url,
            name : fileName,
            autoSubmit : true,
            responseType : responseType,
            accept : accept,
            data : data,
            onSubmit : function(file, extend) {
                if (submitfn) {
                    submitfn(extend, file, $);
                }
            },
            onComplete : function(file, response) {
                if (completefn) {
                    completefn(response, file, $);
                }
            },
            onChange : function() {
                if (uploadChange) {
                    $.isFunction(uploadChange) ? uploadChange() : '';
                }
            }
        });
    };

    /**
     * 弹出黑色背景遮罩
     * @param obj 在指定对象上加遮罩
     * @param time 展现动画时间
     * @param opacity 透明度 0-100
     * @return array | boolean
     */
    $.openBack = function(obj, time, opacity) {
        if (obj === false || c.showBack != true) {
            return false;
        }
        if (!obj || obj.length == 0) {
            obj = $('body');
        }
        var key = $.md5(obj.selector);
        if ($('#back-' + key).length == 0) {
            if (!time) {
                time = 0;
            }
            if (!opacity)
                opacity = c.opacity;
            var zindex = $.getMaxZindex();
            if (obj.selector == 'body') {
                c.zindex.openBack = zindex;
                var position = 'fixed';
            } else {
                zindex -= 1;
                var position = 'absolute';
            }
            var px = { };
            if (obj.selector == 'body') {
                px.width = $(document).width();
                px.height = $(window).height();
                px.left = px.top = 0;
            } else {
                px.width = obj.width() + parseInt(obj.css('padding-left')) + parseInt(obj.css('padding-right'));
                px.height = obj.height() + parseInt(obj.css('padding-top')) + parseInt(obj.css('padding-bottom'));
                var xy = $.getPos(obj);
                px.left = xy.x;
                px.top = xy.y;
            }
            var back = document.createElement('div');
            back.id = 'back-' + key;
            back.className = 'black_shade_h';
            var style = 'top:' + px.top + 'px;left:' + px.left + 'px;z-index:' + zindex + ';position:' + position + ';background:#000;width:' + px.width + 'px;height:' + px.height + 'px;display:none;';
            style += ($.ie()) ? 'filter:alpha(opacity=' + (opacity * 100) + ');' : 'opacity:' + opacity + ';';
            back.style.cssText = style;

            $('body').append(back);
            var obj = $('body #back-' + key);
            obj.fadeIn(time);
            if (obj.selector == 'body') {
                $.elementResize(obj);
            }

            return px;
        }
        return false;
    };

    /**
     * 关闭黑色背景遮罩
     * @param obj 指定对象（关闭该对象上方的遮罩）
     * @param time 关闭动画时间
     * @return void
     */
    $.closeBack = function(obj, time) {
        if (!obj || obj.length == 0) {
            obj = $('body');
        }
        var key = $.md5(obj.selector);
        var remove = function(backObj) {
            if (!time) {
                time = 0;
            }
            backObj.fadeOut(time, function() {
                $(this).remove();
            });
        }
        if (obj.selector == 'body') {
            delete c.zindex.openBack;
            if ($('#alert-div').length == 0) {
                remove($('#back-' + key));
            }
        } else {
            remove($('#back-' + key));
        }
    };

    /**
     * 获取元素的坐标
     * @param obj 对象元素
     * @return json
     */
    $.getPos = function(obj) {
        if (!obj.offset()) {
            return {
                x : 0,
                y : 0
            };
        }
        return {
            x : obj.offset().left,
            y : obj.offset().top
        }
    };

    /**
     * 加载进度条 当前正在播放则移除 否则播放
     * @param obj 指定使用loading的元素对象
     * @param topPercent 垂直定位百分比 默认黄金比例
     * @param time 黑布、loading图的展现和隐藏时长
     * @return mixed
     */
    $.loading = function(obj, topPercent, time) {
        if (obj === false) {
            return false;
        }
        if (!obj || obj.length == 0) {
            obj = $('body');
        }
        if (typeof time == 'undefined') {
            time = 0;
        }
        var picSize = {
            width : 60,
            height : 60
        };
        var key = $.md5(obj.selector);
        if ($('#loading-' + key).length == 0) {
            // 显示幕布
            if (c.showLoading != true) {
                return false;
            }
            var px = false;
            px = $.openBack(obj, time); // 打开黑背景
            var zindex = $.getMaxZindex();
            if (obj.selector == 'body') {
                c.zindex.loading = zindex;
                var position = 'fixed';
                topPercent = topPercent ? topPercent : c.goldenRatio;
            } else {
                var zindex = $.getMaxZindex();
                if (!px) {
                    var xy = $.getPos(obj); // 元素坐标
                    px = {
                        width : obj.width(),
                        height : obj.height(),
                        left : xy.x,
                        top : xy.y
                    }
                }
                var position = 'absolute';
                topPercent = topPercent ? topPercent : .5;
            }
            // 加载图
            $('body').prepend('<img src="' + RESOURCEURL + '/img/loading-1.gif" class="loading" id="loading-' + key + '">');
            if (px) {
                $('#loading-' + key).css({
                    position : position,
                    left : px.left + px.width / 2 - picSize.width / 2,
                    top : px.top + px.height * topPercent - picSize.height / 2,
                    zIndex : zindex
                }).fadeIn(time);
            } else {
                $('#loading-' + key).css({
                    position : position,
                    left : $(document).width() / 2 - picSize.width / 2,
                    top : $(window).height() * topPercent - picSize.height / 2,
                    zIndex : zindex
                }).fadeIn(time);
            }
        } else {
            // 移除幕布
            $('#loading-' + key).fadeOut(time, function() {
                $(this).remove();
                $.closeBack(obj, time);
                if (obj.selector == 'body') {
                    delete c.zindex.loading;
                }
            });
        }
    };

    /**
     * 鼠标经过图片显示大图 1.class 样式 默认bigImg 2.大图来源url为 data-original
     */
    $.showBigImg = function(cls, url, width, height) {
        xOffset = 10;
        yOffset = 10;
        if (!cls) {
            cls = 'bigImg';
        }
        if (!url) {
            if ($(this).data('original')) {
                url = $(this).data('original');
            } else {
                return false;
            }
        }
        if (!width)
            width = c.img.width;
        if (!height)
            height = c.img.height;
        $("img." + cls).hover(function(e) {
            $("body").append("<div id='preview'><img width=" + width + " height=" + height + " src='" + url + "' id='new_preview' " + "onerror=\"javascript:$('#new_preview').attr('src','" + RESOURCEURL + "/img/loading-spinner-blue.gif')\"/></div>");
            $("#preview").css({
                "position" : "absolute",
                "border" : "1px solid #ccc",
                "background" : "#FFFFFF",
                "padding" : "5px",
                "display" : "none",
                "color" : "#fff",
                "z-index" : "9999"
            }).css("top", (e.pageY - xOffset) + "px").css("left", (e.pageX + yOffset) + "px").fadeIn("fast");
        }, function() {
            $("#preview").remove();
        });

        $("img." + cls).mousemove(function(e) {
            $("#preview").css("top", (e.pageY + xOffset) + "px").css("left", (e.pageX + yOffset) + "px");
        });
    };

    /**
     * 获取当前zindex最大值
     * @return int
     */
    $.getMaxZindex = function() {
        var max = 0;
        $.each(c.zindex, function(key, val) {
            if (val > max) {
                max = val;
            }
        });
        
      
            if ($('.modal').length) {
                var modalZindex = $('.modal').css('zIndex');
                if (modalZindex > max) {
                    max = modalZindex;
                }
            }
     
        return Number(max) + 1;
    };

    /**
     * 信息确认提示框 - 基于dialog
     * @param type 类型 success error warning
     * @param msg 提示信息
     * @param okfn 点击确定后的回调函数
     * @param cancelfn 点击取消后的回调函数 - 不常用
     * @param okValue 确定按钮字样 - 不常用
     * @param cancelValue 取消按钮字样 - 不常用
     * @param statusbar 不在提醒
     * @return void
     */
    $.showConfirm = function(type, msg, okfn, cancelfn, okValue, cancelValue, statusbar) {
        var zindex = $.getMaxZindex();
        // 设置层级数目
        c.zindex.showConfirm = zindex;
        if (!okValue)
            okValue = '确定';
        if (!cancelValue)
            cancelValue = '取消';
        if (!msg)
            msg = '';
        if ($.inArray(type, [ 'success', 'error', 'warning' ]) === -1) {
            $.showAlert('提示类型错误');
            return false;
        }
        var title = {
            success : '成功',
            error : '失败',
            warning : '警告'
        };
        if (!okfn) {
            okfn = function() {
            };
        }
        if (statusbar === true) {
            statusbar = '' + '<div class="checkbox"><label><input type="checkbox" id="not_confirm_again">不在提醒</label></div>';
        }
        var d = dialog({
            fixed : true,
            //backdropOpacity : c.opacity,
            backdropOpacity : 0.2,
            title : title[type],
            skin : 'dialog-' + type + ' show_confirm_layer',
            content : '<span>' + msg + '</span>',
            width : 500,
            height : c.artDialog.height,
            zIndex : zindex,
            statusbar : statusbar,
            okValue : okValue,
            ok : function() {
                var result = true;
                if (okfn) {
                    result = okfn(this, $);
                }
                if (result !== false) {
                    delete c.zindex.showConfirm;
                }
                return result;
            },
            cancelValue : cancelValue,
            cancel : function() {
                delete c.zindex.showConfirm;
                if (cancelfn) {
                    return cancelfn(this, $);
                }
            }
        });
        d.showModal();
        return d;
    };

    /**
     * 信息弹出提示框标准版 - 基于dialog
     * @param type 类型 success error warning
     * @param msg 提示信息
     * @param okValue 确定按钮字样
     * @param okfn 提交后的回调函数
     * @return void
     */
    $.showAlertNormal = function(type, msg, okfn, okValue) {
        var zindex = $.getMaxZindex();
        c.zindex.showAlertNormal = zindex;
        if (!okValue)
            okValue = '确定';
        if (!msg)
            msg = '';
        if ($.inArray(type, [ 'success', 'error', 'warning' ]) === -1) {
            $.showAlert('提示类型错误');
            return false;
        }
        var title = {
            success : '成功',
            error : '失败',
            warning : '警告'
        };
        var d = dialog({
            fixed : true,
            backdropOpacity : c.opacity,
            title : title[type],
            skin : 'dialog-' + type + ' show_alert_normal_layer',
            content : '<span>' + msg + '</span>',
            width : 500,
            height : c.artDialog.height,
            zIndex : zindex,
            cancel : false,
            okValue : okValue,
            ok : function() {
                var result = true;
                if (okfn) {
                    result = okfn(this, $);
                }
                if (result !== false) {
                    delete c.zindex.showAlertNormal;
                }
                return result;
            }
        });
        d.showModal();
        return d;
    };

    /**
     * 信息弹出提示框 - 基于dialog
     * @param msg 提示内容
     * @param showtime 停留时间 默认3秒
     * @return void
     */
    $.showAlert = function(msg, showTime) {
        if ($('.show_alert_layer').length > 0 || !$._isString(msg) || msg.trim() == '') {
            return false;
        }
        var zindex = $.getMaxZindex();
        c.zindex.showAlert = zindex;
        if (!showTime)
            showTime = 3000;
        var d = dialog({
            topPercent : .25,
            fixed : true,
            align : 'bottom',
            skin : 'show_alert_layer',
            content : msg,
            quickClose : false,
            zIndex : zindex
        });
        d.show();
        setTimeout(function() {
            d.close().remove();
            delete c.zindex.showAlert;
        }, showTime);
    };

    /**
     * 弹出输入框 - 基于dialog
     * @param title 标题
     * @param okfn 提交后的回调函数 - 返回输入的信息
     * @param defaultValue 默认值
     * @param type 输入框类型
     * @param okValue 确定按钮字样 - 不常用
     * @param cancelValue 确定取消按钮字样 - 不常用
     * @param name 输入框的name
     * @return void
     */
    $.showInput = function(title, okfn, type, myclass, name, defaultValue, okValue, cancelValue) {
        var zindex = $.getMaxZindex();
        c.zindex.showInput = zindex;
        if ($.trim(title) == '')
            title = '请输入';
        if (!defaultValue)
            defaultValue = '';
        if (!type)
            type = 'text';
        if (!okValue)
            okValue = '提交';
        if (!cancelValue)
            cancelValue = '取消';
        if (!myclass)
            myclass = '';
        if (!name)
            name = '';
        var d = dialog({
            fixed : true,
            backdropOpacity : c.opacity,
            title : title,
            skin : 'show_input_layer',
            content : '<input class="form-control xiaoquan-dialog-input ' + myclass + '" type="' + type + '" name="' + name + '" value="' + $.trim(defaultValue) + '" autofocus />',
            cancel : function() {
                delete c.zindex.showInput;
            },
            okValue : okValue,
            cancelValue : cancelValue,
            zIndex : zindex,
            width : c.artDialog.width,
            height : c.artDialog.height,
            ok : function() {
                var value = $('.xiaoquan-dialog-input').val();
                var result = okfn(value, $);
                if (result !== false) {
                    delete c.zindex.showInput;
                }
                return result;
            }
        });
        d.showModal();
        return d;
    };

    /**
     * 默认弹出textarea,还以弹出其他内容
     * @param title 标题
     * @param okfn 提交后的回调函数 - 返回输入的信息
     * @param height 高
     * @param width 宽
     * @param defaultValue 默认值
     * @param okValue 确定按钮字样 - 不常用
     * @param cancelValue 确定取消按钮字样 - 不常用
     * @param name 输入框的name
     * @param content 要弹出的内容
     * @param loadfn 对话框打开执行的方法
     * @return void 弹窗关闭之后立即执行改事件 artDilogHide
     */
    $.showContent = function(title, defaultValue, name, content, okfn, width, height, okValue, cancelValue, cancelfn, loadfn) {
        var zindex = $.getMaxZindex();
        c.zindex.showContent = zindex;
        if ($.trim(title) == '')
            title = '请输入';
        if (!defaultValue)
            defaultValue = '';
        if (!okValue)
            okValue = '提交';
        if (!cancelValue)
            cancelValue = '取消';
        if (!name)
            name = '';
        if (!height)
            height = c.artDialog.height;
        if (!width)
            width = c.artDialog.width;
        if (typeof content == 'undefined') {
            content = '<textarea class="form-control xiaoquan-dialog-input" name="' + name + '">' + defaultValue + '</textarea>';
        }
        if (content.jquery) {
            content = content[0];
        }
        var d = dialog({
            fixed : true,
            backdropOpacity : c.opacity,
            title : title,
            skin : 'show_content_layer',
            content : content,
            cancel : function() {
                if (cancelfn) {
                    cancelfn();
                }
                delete c.zindex.showContent;
            },
            okValue : okValue,
            cancelValue : cancelValue,
            zIndex : zindex,
            width : width,
            height : height,
            onshow : loadfn,
            ok : function() {
                var result = okfn(this, $);
                if (result !== false) {
                    delete c.zindex.showContent;
                }
                return result;
            }
        });

        d.showModal();
        return d;
    };

    /**
     * 默认弹出textarea,还以弹出其他内容
     * @param title 标题
     * @param content 要弹出的内容
     * @param okfn 提交后的回调函数 ,如果不传则不显示
     * @param height 高
     * @param width 宽
     * @param loadfn 对话框打开执行的方法
     * @return void 弹窗关闭之后立即执行改事件 artDilogHide
     */

    $.showContent2 = function(title, content, okfn, width, height, loadfn) {
        var zindex = $.getMaxZindex();
        c.zindex.showContent2 = zindex;
        if ($.trim(title) == '')
            title = '';
        if (!height)
            height = c.artDialog.height;
        if (!width)
            width = c.artDialog.width;
        if (typeof content == 'undefined') {
            content = '';
        }
        if (content.jquery) {
            content = content[0];
        }
        var button = [ {
            value : '取消',
            callback : function() {
                delete c.zindex.showContent2;
            }
        } ];
        if (okfn)
            button.push({
                value : '确定',
                callback : function() {
                    var result = okfn(this, $);
                    if (result !== false) {
                        delete c.zindex.showContent2;
                    }
                    return result;
                },
                autofocus : true,
            });

        var d = dialog({
            fixed : true,
            backdropOpacity : c.opacity,
            title : title,
            skin : 'show_content_layer',
            content : content,
            zIndex : zindex,
            width : width,
            height : height,
            onshow : loadfn,
            button : button,
        });

        d.showModal();
        return d;
    };
    $.showContent3 = function(title, content, okfn, width, height, loadfn) {
        var zindex = $.getMaxZindex();
        c.zindex.showContent2 = zindex;
        if ($.trim(title) == '')
            title = '';
        if (!height)
            height = c.artDialog.height;
        if (!width)
            width = c.artDialog.width;
        if (typeof content == 'undefined') {
            content = '';
        }
        if (content.jquery) {
            content = content[0];
        }
        var button = [ {
            value : '取消',
            callback : function() {
                delete c.zindex.showContent2;
            }
        } ];
        var button1 = [ {
            value : '确定',
        } ];
        if (okfn)
            button.push({
                value : '确定',
                callback : function() {
                    var result = okfn(this, $);
                    if (result !== false) {
                        delete c.zindex.showContent2;
                    }
                    return result;
                },
                autofocus : true,
            });

        var d = dialog({
            fixed : true,
            backdropOpacity : c.opacity,
            title : title,
            skin : 'show_content_layer',
            content : content,
            zIndex : zindex,
            width : width,
            height : height,
            onshow : loadfn,
        });

        d.showModal();
        return d;
    };

    /**
     * 弹框可无button按钮
     * @param title 标题
     * @param content 要弹出的内容
     * @param height 高
     * @param width 宽
     * @param loadfn 对话框打开执行的方法
     * @return void 弹窗关闭之后立即执行改事件 artDilogHide
     */

    $.showContentNoButton = function(title, content, button, width, height, loadfn) {
        var zindex = $.getMaxZindex();
        c.zindex.showContentNoButton = zindex;
        if ($.trim(title) == '')
            title = '';
        if (!height)
            height = c.artDialog.height;
        if (!width)
            width = c.artDialog.width;
        if (typeof content == 'undefined') {
            content = '';
        }
        if (content.jquery) {
            content = content[0];
        }
        var d = dialog({
            fixed : true,
            backdropOpacity : c.opacity,
            title : title,
            skin : 'show_content_layer',
            content : content,
            zIndex : zindex,
            width : width,
            height : height,
            onshow : loadfn,
            button : button,
        });

        d.showModal();
        return d;
    };

    /**
     * 气泡提示 - 基于dialog
     * @param msg tip提示的内容
     * @param obj 定位到指定对象 - jquery对象
     * @param align 定位 供选参数 'top left'、'top'、'top right'、'right
     * top'、'right'、'right bottom'、'bottom right'、'bottom'、'bottom left'、'left
     * bottom'、'left'、'left top'
     * @param showTime 停留时间
     * @return void
     */
    $.showTip = function(msg, obj, align, showTime) {
        if ($('.show_tip_layer').length > 0) {
            return false;
        }
        if (!msg)
            msg = '';
        var zindex = $.getMaxZindex();
        c.zindex.showTip = zindex;
        if (!align)
            align = 'bottom left';
        if (!showTime)
            showTime = 3000;
        var d = dialog({
            align : align,
            skin : 'show_tip_layer',
            content : msg,
            zIndex : zindex,
            quickClose : true
        });
        d.show(obj[0]);
        setTimeout(function() {
            d.close().remove();
            delete c.zindex.showTip;
        }, showTime);
    };

    /**
     * 删除自定义的对话框
     */
    $.deleteDialog = function(obj) {
        obj.close().remove();
        delete c.zindex.obj;
    };

    /**
     * 绑定验证码相关事件
     */
    $.verify = function() {
        $('img#verifyImg').css({
            cursor : 'pointer'
        }).click(function() {
            var url = $(this).attr('src').replace(/\?time=\d{13}$/, '').replace(/\&time=\d{13}$/, '');
            if (url.indexOf('?') !== -1) {
                url += '&time=' + $.time();
            } else {
                url += '?time=' + $.time();
            }
            $(this).attr('src', url);
        });
    };

    /**
     * 获取当前时间戳
     * @param sec 为真返回10位数(秒)数时间戳 否则返回13位数(微秒)
     * @return int
     */
    $.time = function(sec) {
        var time = new Date().getTime();
        return sec ? Math.ceil(time / 1000) : time;
    };

    /**
     * url处理，添加ajaxtime后缀请求
     * @param url 需要处理的url
     * @return string
     */
    $.handleUrl = function(url) {
        if (url.indexOf('&ajaxtime') !== -1 || url.indexOf('?ajaxtime') !== -1) {
            var tmpstr = url.substr(url.indexOf('ajaxtime') - 1, 20);
            url = url.replace(tmpstr, '');
        }
        url += (url.indexOf('?') !== -1 ? '&ajaxtime=' : '?ajaxtime=') + $.time();
        url = encodeURI(url);
        return url;
    };

    /**
     * 远程ajax异步GET
     * @param url 请求地址
     * @param fn 请求完成的回调函数
     * @return mixed
     */
    $.sendGet = function(url, fn) {
        var questurl = $.handleUrl(url);
        $.get(questurl, function(result) {
            if (fn) {
                fn(result, $);
            }
        });
    };

    /**
     * 远程ajax同步GET
     * @param url 请求地址
     * @param timeoutfn 超时回调
     * @return mixed
     */
    $.sendGetSync = function(url, timeoutfn, timeout) {
        var questurl = $.handleUrl(url);
        if (!timeout)
            timeout = c.timeout;
        var htmlobj = $.ajax({
            url : questurl,
            async : false, // 同步
            timeout : timeout
        });
        var result = htmlobj.responseText;

        if (!result) {
            if (timeoutfn) {
                timeoutfn('请求超时', $);
            } else {
                $.showAlert('请求超时!');
                return;
            }
        } else {
            return result;
        }
    };

    /**
     * 远程ajax异步POST
     * @param url 请求地址
     * @param post 请求提交的数据
     * @param fn 请求成功的回调函数
     * @param timeoutfn 超时回调
     * @return mixed
     */
    $.sendPost = function(url, post, okfn, timeoutfn, timeout) {
        if (($._isJson(post) && $.jsonLen(post) == 0) || !post) {
            post = {
                ajaxtime : $.time()
            };
        }
        if (!timeout)
            timeout = c.timeout;
        var questurl = $.handleUrl(url);
        $.ajax({
            type : 'POST',
            url : questurl,
            async : true,
            data : post,
            timeout : timeout,
            success : function(result) {
                if (okfn) {
                    okfn(result, $);
                }
            },
            error : function(obj) {
                if (obj.responseText) {
                    $.showAlert('error: 请求出现错误!');
                } else {
                    if (timeoutfn) {
                        timeoutfn('请求超时', $);
                    } else {
                        $.showAlert('请求超时!');
                    }
                }
            }
        });
    };

    /**
     * 远程AJAX可以跨域cookie请求
     * @param url 请求url
     * @param fn 请求成功的回调
     * @param jsonpCallback jsonp函数名
     * @param timeoutfn 请求超时的回调
     * @return void
     */
    $.sendJsonp = function(url, fn, jsonpCallback, timeoutfn, timeout) {
        var questurl = $.handleUrl(url);
        if (!timeout)
            timeout = c.timeout;
        $.ajax({
            type : 'get',
            async : false, // 同步
            url : questurl,
            timeout : timeout,
            dataType : "jsonp",
            jsonpCallback : jsonpCallback,
            success : function(data) {
                if (fn) {
                    fn(data, $);
                }
            },
            error : function(obj) {
                if (obj.responseText) {
                    $.showAlert('error: 请求出现错误!');
                } else {
                    if (timeoutfn) {
                        timeoutfn('请求超时', $);
                    } else {
                        $.showAlert('请求超时!');
                    }
                }
            }
        });
    };

    /**
     * JS验证
     * @param data 验证的变量
     * @param rule 验证的规则 如{'intro':'标题','len':'1~20~个字符','type':'string'}
     * @param errorfn 错误回调函数
     * @param successfn 正确回调函数
     * @param compatible 是否为兼容模式(空则不验证，非空则验证)
     * @return mixed - boolean | string
     */
    $.JSCheck = function(data, rule, errorfn, successfn, compatible) {
        if (!compatible) {
            compatible = false;
        }
        if (compatible && $._isEmpty(data, true)) {
            return true;
        }
        // 验证失败回调
        var fail = function(str) {
            if ($._isFunction(errorfn)) {
                errorfn(str, $);
                return false;
            } else {
                return str;
            }
        }
        // 固定验证
        if ($._isString(rule)) {
            var intro = '';
            if (rule.indexOf(':') !== -1) {
                rule = rule.split(':');
                intro = rule[0];
                rule = rule[1];
            }
            var rules = {
                email : {
                    reg : /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/,
                    error : '邮箱地址格式错误'
                },
                idcard : {
                    reg : /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/,
                    error : '身份证号格式错误'
                },
                post_code : {
                    reg : /^\d{6}$/,
                    error : '邮编格式错误'
                },
                phone : {
                    reg : /^13[0-9]{9}$|14[0-9]{9}|15[0-9]{9}$|17[0-9]{9}$|18[0-9]{9}$/,
                    error : '手机号格式错误'
                },
                qq : {
                    reg : /^[1-9][0-9]{4,}$/,
                    error : 'QQ格式错误'
                },
                ipv4 : {
                    reg : /^((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){3}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})$/,
                    error : 'ipv4格式错误'
                },
                zh : {
                    reg : /^[\u4e00-\u9fa5]+$/,
                    error : '非中文格式'
                },
                num : {
                    reg : /^\d+$/,
                    error : '非数字格式'
                },
                url : {
                    reg : /^(https?:\/\/)([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-?]*)*\/?$/,
                    error : 'URL格式错误'
                },
                en : {
                    reg : /^[a-zA-Z]+$/,
                    error : '非英文格式'
                },
                special : {
                    reg : /^(.*?[\~\`\·\！\!@\#\￥\$%\……\^\&\*\(\)\（\）\_\-\——\+\=\【\】\[\]\{\}\|\、\\\：\:\;\；\"\”\“\’\'\'\<;\>;\《\》\,\，\。\.\?\？\/]).*$/,
                    error : '非特殊符号'
                }
            };
            if ($._isEmpty(data)) {
                return fail(intro + '不可为空');
            }
            if (!rules[rule]) {
                return fail('[' + rule + ']' + '类型判断不存在');
            } else {
                rule = rules[rule];
                var result = (rule.reg.test(data) === true);
                if (result) {
                    if ($._isFunction(successfn)) {
                        successfn($);
                        return true;
                    } else {
                        return true;
                    }
                } else {
                    return fail(rule.error ? rule.error : '格式错误');
                }
            }
        } else {
            var type = {
                'array' : '$._isArray(data);',
                'string' : '$._isString(data);',
                'number' : '$._isNumeric(data);'
            };
            if (!rule)
                rule = { };
            if (!rule.type)
                rule.type = 'string';
            rule.intro = !rule.intro ? '参数' : rule.intro + '参数';
            if (rule.type == 'string') {
                data = !data ? '' : data.replace(/[ ]/g, '');
            }
            if (data.length < 1) {
                return fail(rule.intro + '不可为空');
            }
            if (!eval(type[rule.type])) {
                return fail(rule.intro + '类型不存在' + '[:允许类型' + rule.type + ']');
            }
            if (rule.len) {
                var lens = rule.len.split('~');
                lens[0] = parseInt(lens[0]);
                lens[1] = parseInt(lens[1]);
                if (lens[0] > lens[1]) {
                    var tem = lens[1];
                    lens[1] = lens[0];
                    lens[0] = tem;
                }
                var scope = (lens[0] == lens[1]) ? lens[0] : (lens[0] + '~' + lens[1]);
                if (rule.type == 'number') {
                    var result = data < lens[0] || data > lens[1];
                    if (result) {
                        return fail(rule.intro + '输入错误' + '[' + scope + (lens[2] ? lens[2] : '') + ']');
                    }
                } else if (rule.type == 'string' || rule.type == 'array') {
                    var result = data.length < lens[0] || data.length > lens[1];
                    if (result) {
                        return fail(rule.intro + '长度错误' + '[' + scope + (lens[2] ? lens[2] : '') + ']');
                    }
                }
            }
            if ($._isFunction(successfn)) {
                successfn($);
                return true;
            } else {
                return true;
            }
        }
    };

    /**
     * 密码校验 包含大小写字母、数字、特殊字符
     */
    $.passCheck = function(pass) {
        var en = /[a-z]+/;
        var EN = /[A-Z]+/;
        var num = /[0-9]+/;
        var reg = /[\^\~\`\·\！\!@\#\￥\$%\……\^\&\*\(\)\（\）\_\-\——\+\=\【\】\[\]\{\}\|\、\\\：\:\;\；\"\”\“\’\'\'\<;\>;\《\》\,\，\。\.\?\？\/]+/;
        if (!en.test(pass)) {
            console.log('未包含小写英文字母');
            return false;
        }
        if (!EN.test(pass)) {
            console.log('未包含大写英文字母');
            return false;
        }
        if (!num.test(pass)) {
            console.log('未包含数字');
            return false;
        }
        if (!reg.test(pass)) {
            console.log('未包含特殊字符');
            return false;
        }
        return true;
    };

    /**
     * 元素闪动效果
     * @param obj 需要闪动的对象元素
     * @param times 闪动的次数
     * @param fn 该动画完成后的回调函数
     * @param time 闪动时长
     * @return void
     */
    $.flashing = function(obj, times, fn, time) {
        if (!time) {
            time = 250;
        }
        if (typeof times == 'undefined') {
            times = 3;
        }
        if (times == 0) {
            if (fn) {
                fn($);
            }
            return false;
        }
        obj.fadeOut(time, function() {
            $(this).fadeIn(time, function() {
                $.flashing($(this), --times, fn, time);
            });
        });
    };

    /**
     * checkbox全选反选
     * @param switchObj 全选/反向对象
     * @parma obj checkbox对象
     * @param fn 选完后的回调函数
     * @param type true-全选或取消选中 false-反选
     * @return void
     */
    $.actionAllCheckbox = function(switchObj, obj, fn, type) {
        if (typeof type == 'undefined') {
            type = true;
        }
        var setChecked = function(_obj, value) {
            _obj.prop('checked', value);
            _obj.attr('checked', value);
            if (fn) {
                fn($);
            }
        }

        if (type) {
            var _type = switchObj.is(':checked');
            if (_type) {
                setChecked(obj, true);
            } else {
                setChecked(obj, false);
            }
        } else {
            $.each(obj, function() {
                var _type = $(this).is(':checked');
                if (_type) {
                    setChecked($(this), false);
                } else {
                    setChecked($(this), true);
                }
            });
        }
    };

    /**
     * 获取选中的checkbox的值
     * @param checkbox的name名 如:name='userinfo' 填写userinfo即可
     * @param obj 指定对象下遍历
     * @returns array
     */
    $.getCheckboxValues = function(name, obj) {
        var values = [ ];
        obj = !obj ? $('input[name="' + name + '"]') : obj.find('input[name="' + name + '"]');
        $.each(obj, function() {
            if ($(this).is(':checked')) {
                values.push($(this).val());
            }
        });
        return values.uniquelize();
    };

    /**
     * 截取图片
     * @param imgObj 截取原图对象
     * @param previewObj 预览截取对象数组 如：[ obj1, obj2 ]
     * @param fn 截取完毕后的回调函数 - 返回一个参数
     * @param minSize 最小尺寸 - 数组[宽,高]
     * @param maxSize 最大尺寸 - 数组[宽,高]
     * @return void
     */
    $.jcrop = function(imgObj, previewObj, fn, minSize, maxSize) {
        if (!minSize)
            minSize = [ 0, 0 ];
        if (!maxSize)
            maxSize = [ 0, 0 ];
        var jcrop_obj, bound_x, // x轴边界值
        bound_y, // y轴边界值
        preview = [ ], // 预览对象
        pimg = [ ], xysize = [ ];

        $.each(previewObj, function(key, val) {
            pimg.push(val.find('img'));
            preview.push(val);
            xysize.push({
                xsize : val.width(),
                ysize : val.height()
            });
        });
        var backParam = [ 0, 0, xysize[0].xsize, xysize[0].ysize ];

        imgObj.Jcrop({
            allowSelect : true, // 允许重选
            bgFade : true, // 是否开启背景遮罩
            bgOpacity : .4, // 背景遮罩透明度
            keySupport : false, // 是否支持键盘操作
            setSelect : backParam,
            onChange : updatePreview,
            onSelect : returnParam,
            minSize : minSize,
            maxSize : maxSize,
            aspectRatio : xysize[0].xsize / xysize[0].ysize // 选取比例
        }, function() {
            var bounds = this.getBounds();
            bound_x = bounds[0];
            bound_y = bounds[1];
            jcrop_obj = this;
            $.each(preview, function(key, val) {
                val.appendTo(jcrop_obj.ui.holder);
            });
        });

        // 选定后的回调函数
        function returnParam() {
            if (fn) {
                fn({
                    x1 : parseInt(backParam[0]), // 起点x轴
                    y1 : parseInt(backParam[1]), // 起点y轴
                    x2 : parseInt(backParam[2]), // 终点x轴
                    y2 : parseInt(backParam[3])
                // 终点y轴
                }, $);
            }
        }

        // 更新截取预览
        function updatePreview(c) {
            if (parseInt(c.w) > 0) {
                $.each(xysize, function(key, val) {
                    var rx = val.xsize / c.w;
                    var ry = val.ysize / c.h;
                    pimg[key].css({
                        width : Math.round(rx * bound_x) + 'px',
                        height : Math.round(ry * bound_y) + 'px',
                        marginLeft : '-' + Math.round(rx * c.x) + 'px',
                        marginTop : '-' + Math.round(ry * c.y) + 'px'
                    });
                });
                backParam = [ c.x, c.y, c.x2, c.y2 ];
            }
        }
    };

    /**
     * 设置全局csrf_token
     */
    $.ajaxSetup({
        headers : {
            'X-CSRF-TOKEN' : $('meta[name="csrf-token"]').attr('content')
        }
    });

    /**
     * gritter 弹层消息框
     */
    $.gritterMsg = function(title, msg) {
        if (!title)
            title = '';
        if (!msg)
            msg = '';
        $.loadCss('/plugins/gritter/css/jquery.gritter.css');
        $.loadJs('/plugins/gritter/js/jquery.gritter.js', function() {
            $.gritter.add({
                title : title,
                text : msg,
                position : c.gritter.position,
                class_name : c.gritter.class_name,
                fade_in_speed : c.gritter.fade_in_speed,
                fade_out_speed : c.gritter.fade_out_speed,
                time : c.gritter.time
            });
        });
    }

    /**
     * ambiance 弹出层消息框 | message : "test!", | title : 'Success !', | type :
     * "success", //"default", "success", "error" 默认default,你也可以自己定义类型，并修改CSS |
     * fade : true, //是否淡出视图 | width : 300, //通知框宽度，默认300 | timeout : 2
     * //通知框显示时间，0则永久显示
     */
    $.ambianceMsg = function(obj) {
        if (obj && !$._isObject(obj)) {
            console.log('$.ambianceMsg method param type error');
            return;
        }
        if (!obj) {
            obj = { };
            if (!obj.type) {
                obj.title = 'default';
            }
            if (!obj.title)
                obj.title = '';
            if (!obj.message)
                obj.message = '';
            if (!obj.fade)
                obj.fade = true;
            if (!obj.width)
                obj.width = 300;
            if (!obj.timeout)
                obj.timeout = 2;
        }
        $.loadCss('/plugins/jquery-ambiance/jquery.ambiance.css');
        $.loadJs('/plugins/jquery-ambiance/jquery.ambiance.js', function() {
            $.ambiance({
                title : obj.title,
                message : obj.message,
                type : obj.type,
                fade : obj.fade,
                width : obj.width,
                timeout : obj.timeout,
            });
        });
    };

})(jQuery);

//短日期格式检查，形如 (2017-09-13)
function check_strDateTime(str) {
            var r = str.match(/^(\d{1,4})(-|\/)(\d{1,2})\2(\d{1,2})$/);
            if(r==null)return false;
            var d= new Date(r[1], r[3]-1, r[4]);
            return (d.getFullYear()==r[1]&&(d.getMonth()+1)==r[3]&&d.getDate()==r[4]);
}


/**
 * Ajax POST请求
 * @param url 请求地址
 * @param data 传输数据
 * @param cb 回调
 * @param timeoutfn 超时回调
 */
function httpPost(url, data, cb, timeoutfn, timeout) {
    var questurl = $.handleUrl(url);
    if (!timeout)
        timeout = c.timeout;
    $.ajax({
        url : questurl,
        type : "POST",
        data : data,
        timeout : timeout,
        success : cb,
        error : function(obj) {
            if (obj.responseText) {
                $.showAlert('error: 请求出现错误!');
            } else {
                if (timeoutfn) {
                    timeoutfn('请求超时', $);
                } else {
                    $.showAlert('请求超时!');
                }
            }
        }
    });
}

/**
 * Ajax GET 请求
 * @param url 请求地址
 * @param cb 回回调
 * @param timeoutfn 超时回调
 */
function httpGet(url, cb, timeoutfn, timeout) {
    var questurl = $.handleUrl(url);
    if (!timeout)
        timeout = c.timeout;
    $.ajax({
        url : questurl,
        type : "GET",
        timeout : timeout,
        success : cb,
        error : function(obj) {
            if (obj.responseText) {
                $.showAlert('error: 请求出现错误!');
            } else {
                if (timeoutfn) {
                    timeoutfn('请求超时', $);
                } else {
                    $.showAlert('请求超时!');
                }
            }
        }
    });
}
Date.prototype.format = function (format) {
    var o = {
        "M+": this.getMonth() + 1, //month
        "d+": this.getDate(), //day
        "h+": this.getHours(), //hour
        "m+": this.getMinutes(), //minute
        "s+": this.getSeconds(), //second
        "q+": Math.floor((this.getMonth() + 3) / 3), //quarter
        "S": this.getMilliseconds() //millisecond
    }

    if (/(y+)/.test(format)) {
        format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    }

    for (var k in o) {
        if (new RegExp("(" + k + ")").test(format)) {
            format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
        }
    }
    return format;
}