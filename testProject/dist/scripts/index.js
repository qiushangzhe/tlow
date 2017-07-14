~ function(window, undefined) {

    var IO = {}
    var toString = Object.prototype.toString

    // Iterator
    function forEach(obj, iterator, context) {
        if (!obj) return
        if (obj.length && obj.length === +obj.length) {
            for (var i = 0; i < obj.length; i++) {
                if (iterator.call(context, obj[i], i, obj) === true) return
            }
        } else {
            for (var k in obj) {
                if (iterator.call(context, obj[k], k, obj) === true) return
            }
        }
    }

    // IO.isArray, IO.isBoolean, ...
    forEach(['Array', 'Boolean', 'Function', 'Object', 'String', 'Number'], function(name) {
        IO['is' + name] = function(obj) {
            return toString.call(obj) === '[object ' + name + ']'
        }
    })

    // Object to queryString
    function serialize(obj) {
        var a = []
        forEach(obj, function(val, key) {
            if (IO.isArray(val)) {
                forEach(val, function(v, i) {
                    a.push(key + '=' + encodeURIComponent(v))
                })
            } else {
                a.push(key + '=' + encodeURIComponent(val))
            }
        })
        return a.join('&')
    }

    // Parse json string
    function parseJSON(str) {
        try {
            return JSON.parse(str)
        } catch (e) {
            try {
                return (new Function('return ' + str))()
            } catch (e) {}
        }
    }

    // Empty function
    function noop() {}


    /**
     *  Ajax API
     *     IO.ajax, IO.get, IO.post, IO.text, IO.json, IO.xml
     *
     */
    ~ function(IO) {

        var createXHR = window.XMLHttpRequest ?
            function() {
                return new XMLHttpRequest()
            } :
            function() {
                return new window.ActiveXObject('Microsoft.XMLHTTP')
            }

        function ajax(url, options) {
            if (IO.isObject(url)) {
                options = url
                url = options.url
            }
            var xhr, isTimeout, timer, options = options || {}
            var async = options.async !== false,
                method = options.method || 'GET',
                type = options.type || 'text',
                encode = options.encode || 'UTF-8',
                timeout = options.timeout || 0,
                credential = options.credential,
                data = options.data,
                scope = options.scope,
                success = options.success || noop,
                failure = options.failure || noop

            // 大小写都行，但大写是匹配HTTP协议习惯
            method = method.toUpperCase()

            // 对象转换成字符串键值对
            if (IO.isObject(data)) {
                data = serialize(data)
            }
            if (method === 'GET' && data) {
                url += (url.indexOf('?') === -1 ? '?' : '&') + data
            }

            xhr = createXHR()
            if (!xhr) {
                return
            }

            isTimeout = false
            if (async && timeout > 0) {
                timer = setTimeout(function() {
                    // 先给isTimeout赋值，不能先调用abort
                    isTimeout = true
                    xhr.abort()
                }, timeout)
            }
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    if (isTimeout) {
                        failure(xhr, 'request timeout')
                    } else {
                        onStateChange(xhr, type, success, failure, scope)
                        clearTimeout(timer)
                    }
                }
            }
            xhr.open(method, url, async)
            if (credential) {
                xhr.withCredentials = true
            }
            if (method == 'POST') {
                xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded;charset=' + encode)
            }
            xhr.send(data)
            return xhr
        }

        function onStateChange(xhr, type, success, failure, scope) {
            var s = xhr.status,
                result
            if (s >= 200 && s < 300) {
                switch (type) {
                    case 'text':
                        result = xhr.responseText
                        break
                    case 'json':
                        result = parseJSON(xhr.responseText)
                        break
                    case 'xml':
                        result = xhr.responseXML
                        break
                }
                // text, 返回空字符时执行success
                // json, 返回空对象{}时执行suceess，但解析json失败，函数没有返回值时默认返回undefined
                result !== undefined && success.call(scope, result, s, xhr)

            } else {
                failure(xhr, xhr.status)
            }
            xhr = null
        }

        // exports to IO
        var api = {
            method: ['get', 'post'],
            type: ['text', 'json', 'xml'],
            async: ['sync', 'async']
        }

        // Low-level Interface: IO.ajax
        IO.ajax = ajax

        // Shorthand Methods: IO.get, IO.post, IO.text, IO.json, IO.xml
        forEach(api, function(val, key) {
            forEach(val, function(item, index) {
                IO[item] = function(key, item) {
                    return function(url, opt, success) {
                        if (IO.isObject(url)) {
                            opt = url
                        }
                        if (IO.isFunction(opt)) {
                            opt = {
                                success: opt
                            }
                        }
                        if (IO.isFunction(success)) {
                            opt = {
                                data: opt
                            }
                            opt.success = success
                        }
                        if (key === 'async') {
                            item = item === 'async' ? true : false
                        }
                        opt = opt || {}
                        opt[key] = item
                        return ajax(url, opt)
                    }
                }(key, item)
            })
        })

    }(IO)

    /**
     *  JSONP API
     *  IO.jsonp
     *
     */
    ~ function(IO) {

        var ie678 = !-[1, ]
        var win = window
        var opera = win.opera
        var doc = win.document
        var head = doc.head || doc.getElementsByTagName('head')[0]
        var timeout = 3000
        var done = false

        // Thanks to Kevin Hakanson
        // http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript/873856#873856
        function generateRandomName() {
            var uuid = ''
            var s = []
            var i = 0
            var hexDigits = '0123456789ABCDEF'
            for (i = 0; i < 32; i++) {
                s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1)
            }
            // bits 12-15 of the time_hi_and_version field to 0010
            s[12] = '4'
                // bits 6-7 of the clock_seq_hi_and_reserved to 01
            s[16] = hexDigits.substr((s[16] & 0x3) | 0x8, 1)
            uuid = 'jsonp_' + s.join('')
            return uuid
        }

        function jsonp(url, options) {
            if (IO.isObject(url)) {
                options = url;
                url = options.url;
            }
            var options = options || {}
            var me = this
            var url = url.indexOf('?') === -1 ? (url + '?') : (url + '&')
            var data = options.data
            var charset = options.charset
            var success = options.success || noop
            var failure = options.failure || noop
            var scope = options.scope || win
            var timestamp = options.timestamp
            var jsonpName = options.jsonpName || 'callback'
            var callbackName = options.jsonpCallback || generateRandomName()

            if (IO.isObject(data)) {
                data = serialize(data)
            }
            var script = doc.createElement('script')

            function callback(isSucc) {
                if (isSucc) {
                    done = true
                } else {
                    failure.call(scope)
                }
                // Handle memory leak in IE
                script.onload = script.onerror = script.onreadystatechange = null
                if (head && script.parentNode) {
                    head.removeChild(script)
                    script = null
                    win[callbackName] = undefined
                }
            }

            function fixOnerror() {
                setTimeout(function() {
                    if (!done) {
                        callback()
                    }
                }, timeout)
            }
            if (ie678) {
                script.onreadystatechange = function() {
                    var readyState = this.readyState
                    if (!done && (readyState == 'loaded' || readyState == 'complete')) {
                        callback(true)
                    }
                };

            } else {
                script.onload = function() {
                    callback(true)
                }
                script.onerror = function() {
                    callback()
                }
                if (opera) {
                    fixOnerror()
                }
            }

            url += jsonpName + '=' + callbackName

            if (charset) {
                script.charset = charset
            }
            if (data) {
                url += '&' + data
            }
            if (timestamp) {
                url += '&ts='
                url += (new Date).getTime()
            }

            win[callbackName] = function(json) {
                success.call(scope, json)
            };

            script.src = url
            head.insertBefore(script, head.firstChild)
        }

        // exports to IO
        IO.jsonp = function(url, opt, success) {

            if (IO.isObject(url)) {
                opt = url
            }
            if (IO.isFunction(opt)) {
                opt = {
                    success: opt
                }
            }
            if (IO.isFunction(success)) {
                opt = {
                    data: opt
                }
                opt.success = success
            }

            return jsonp(url, opt)
        }

    }(IO)


    // Expose IO to the global object or as AMD module
    if (typeof define === 'function' && define.amd) {
        define('IO', [], function() {
            return IO
        })
    } else {
        window.IO = IO
    }
}(this);

var doc = document;

var $ = function(selector, parent) {
    return (parent || document).querySelector(selector);
};

var $$ = function(selector, parent) {
    return (parent || document).querySelectorAll(selector);
};

var url = '//api.wanyagame.com'; //线上


//banner图用屏宽计算高度
var banner_height = doc.documentElement.clientWidth * 264 / 640 + "px"; //用屏宽乘以比例

//取某个标签style的height的函数
var setHeight = function(ele, height) {
    ele.style.height = height;
};

//取某个标签sytle设置宽度值
var setWidth = function(ele, width) {
    ele.style.width = width;
};

//改变某个标签显示还是隐藏
var setDisplay = function(ele, display) {
    ele.style.display = display;
};

//取地址栏参数函数
var posObj = function() {

    var str = location.search,

        obj = {},

        ary = [];

    if (!str) return obj;

    ary = str.substr(1).split('&');

    ary.forEach(function(item) {

        var subary = item.split('=');

        obj[subary[0]] = subary[1];
    });

    return obj;
}();


var uid = posObj.uid;
var access_token = posObj.access_token;
var game_id = posObj.game_id;
var location_href = window.location.href;


//等待加载动画
window.onload = function() {
    if (access_token) {
        setDisplay($('.spinner_mask'), 'none');
    } else {
        doc.body.innerHTML = ' <div class="no_uid_accesstoken">' +
            '<img src="http://static.2144.cn/danmu/picture/images/timg.jpg">' +
            '<p>没有访问权限！</p>'
        '</div>';
    }
    if (!game_id) {
        doc.body.innerHTML = ' <div class="no_uid_accesstoken">' +
            '<img src="http://static.2144.cn/danmu/picture/images/timg.jpg">' +
            '<p>没有访问权限！</p>'
        '</div>';
    }
};



setHeight($('.up-btn'), banner_height);

var ua = navigator.userAgent;

var ios = function() {
    if (!(ua.indexOf('Android') > -1 || ua.indexOf('Linux') > -1)) {
        doc.body.clientName = 'ios';
        $('.top_bar').className = 'top_bar ios';
        $('.tb_goback').className = 'tb_goback ios';

    };
};

var android = function() {
    if ((ua.indexOf('Android') > -1 || ua.indexOf('Linux') > -1)) {
        $('.top_bar').className = 'top_bar';
    };
};



var top_upimg = function(image_src) {
    IO.post(url + '/v2/discussion-base64image', {
        uid: uid,
        access_token: access_token,
        image: image_src
    }, function(data) {

        var data = JSON.parse(data);
        // console.log(data);
        if (data.code == 200) {
            $('.up-btn img').src = data.data.url;
            $('.up-btn img').setAttribute('img_id', data.data.id);
            return;
        }
        setDisplay($('.wrong_pop'), 'block');
        $('.wrong_pop').innerHTML = data.message;
        setTimeout(setDisplay($('.wrong_pop'), 'none'), 3000);
    });
};

var udeitor = doc.getElementById('udeitor');


var upimg = function(e) {


    var canvas_img = doc.createElement('canvas');

    var canvas_img_box = doc.createElement('img');

    canvas_img_box.className = 'canvas_img_box';

    var file = $('.upload').files[0];

    var file_type = file.type;

    var file_size = file.size;

    var big_filesize = 1500000;

    var max_width = 640;

    var lastEditRange;

    var qualityLevel;


    var getimg = function(dataUrl) {

        IO.post(url + '/v2/discussion-base64image', {
            uid: uid,
            access_token: access_token,
            image: dataUrl
        }, function(data) {
            var data = JSON.parse(data);


            if (data.code == 200) {
                var img = doc.createElement('img');
                img.src = data.data.url;
                img.setAttribute('img_id', data.data.id);
                udeitor.focus();
                var selection = getSelection();
                var range = selection.getRangeAt(0);
                if (lastEditRange) {
                    // 存在最后光标对象，选定对象清除所有光标并添加最后光标还原之前的状态
                    selection.removeAllRanges()
                    selection.addRange(lastEditRange)
                }
                range.insertNode(img);
                range.collapse(false);
                selection.removeAllRanges();
                selection.addRange(range);
                lastEditRange = selection.getRangeAt(0);
                $('.upimg_bottom').innerHTML = '<input type="file" accept="image/gif,image/jpeg,image/jpg,image/png,image/svg" id="upload" class="upload" name="image" onchange="upimg()">';

            } else {

                if (data.code == 400) {
                    setDisplay($('.wrong_pop'), 'block');
                    $('.wrong_pop').innerHTML = '上传图片大小不能超过1.5MB';
                    setTimeout(function() {
                        setDisplay($('.wrong_pop'), 'none');
                        $('.wrong_pop').innerHTML = '';
                    }, 2000);
                } else {
                    setDisplay($('.wrong_pop'), 'block');
                    $('.wrong_pop').innerHTML = data.message;
                    setTimeout(function() {
                        setDisplay($('.wrong_pop'), 'none');
                        $('.wrong_pop').innerHTML = '';
                    }, 2000);
                }


            }
        });
    };


    if (file_size > big_filesize) {

        qualityLevel = big_filesize / file_size;

        //压缩图片
        //如果图片是png格式的
        URL = window.URL || window.webkitURL;
        var imgURL = URL.createObjectURL(file);
        canvas_img_box.src = imgURL;

        canvas_img_box.onload = function() {
            if (canvas_img_box.width > max_width) {

                var width = canvas_img_box.width;
                var height = canvas_img_box.height;
                var context = canvas_img.getContext('2d');

                if (canvas_img_box.width > 640) {

                    scale = 640 / width;

                    canvas_img.width = canvas_img_box.width * scale;

                    canvas_img.height = canvas_img_box.height * scale;

                    context.drawImage(canvas_img_box, 0, 0, canvas_img.width, canvas_img.height);


                    if (file_type == 'image/png') {
                        var dataUrl = canvas_img.toDataURL('image/png', qualityLevel);


                        getimg(dataUrl);
                    } else {


                        var dataUrl = canvas_img.toDataURL('image/jpeg', qualityLevel);


                        getimg(dataUrl);
                    }


                } else { //如果图片宽度小于640

                    canvas_img.width = canvas_img_box.width;

                    canvas_img.height = canvas_img_box.height;

                    context.drawImage(canvas_img_box, 0, 0, canvas_img.width, canvas_img.height);

                    if (file_type == 'image/png') {
                        var dataUrl = canvas_img.toDataURL('image/png', qualityLevel);

                        getimg(dataUrl);
                    } else {
                        var dataUrl = canvas_img.toDataURL('image/jpeg', qualityLevel);

                        getimg(dataUrl);
                    }

                }

            }
        };

    } else {

        var fileObj = file;
        var FileController = url + '/v2/discussion-image';
        var form = new FormData();
        var xhr = new XMLHttpRequest();
        var lastEditRange;


        handleStateChange = function() {
            if (xhr.readyState == 4) {

                if (xhr.status == 200 || xhr.status == 0) {
                    var data = JSON.parse(xhr.responseText);

                    if (data.code == 200) {
                        var img = doc.createElement('img');

                        img.src = data.data.url;
                        img.setAttribute('img_id', data.data.id);
                        udeitor.focus();
                        var selection = getSelection();
                        var range = selection.getRangeAt(0);
                        if (lastEditRange) {
                            // 存在最后光标对象，选定对象清除所有光标并添加最后光标还原之前的状态
                            selection.removeAllRanges()
                            selection.addRange(lastEditRange)
                        }
                        range.insertNode(img);
                        range.collapse(false);
                        selection.removeAllRanges();
                        selection.addRange(range);
                        lastEditRange = selection.getRangeAt(0);
                        $('.upimg_bottom').innerHTML = '<input type="file" accept="image/gif,image/jpeg,image/jpg,image/png,image/svg" id="upload" class="upload" name="image" onchange="upimg()">';
                    } else {
                        var data = JSON.parse(xhr.responseText);


                        if (data.code == 400) {
                            setDisplay($('.wrong_pop'), 'block');
                            $('.wrong_pop').innerHTML = '上传图片大小不能超过1.5MB';
                            setTimeout(function() {
                                setDisplay($('.wrong_pop'), 'none');
                                $('.wrong_pop').innerHTML = '';
                            }, 2000);
                        } else {
                            setDisplay($('.wrong_pop'), 'block');
                            $('.wrong_pop').innerHTML = data.message;
                            setTimeout(function() {
                                setDisplay($('.wrong_pop'), 'none');
                                $('.wrong_pop').innerHTML = '';
                            }, 2000);
                        }


                    }

                }

            }
        };

        form.append("uid", uid);

        form.append("access_token", access_token);

        form.append("image", fileObj);

        xhr.onreadystatechange = handleStateChange;

        xhr.open("post", FileController, true);

        xhr.send(form);

        return;

    }

};

var sendmessage_click = false;

$('.bk_sendmessage').addEventListener('click', function() {

    if (sendmessage_click) {
        return;
    }
    sendmessage_click = true;
    setTimeout(function() {
        sendmessage_click = false;
    }, 2000);

    var img_src = [];
    img_src = doc.getElementsByTagName('img');
    var title_img = img_src[0]; //封面图
    var ude_innerHTML = udeitor.innerHTML;
    var reg = /<img[^>]*img_id=['"]([^'"]+)[^>]*>/gi;
    ude_innerHTML = ude_innerHTML.replace(reg, "[img]$1[/img]");
    var title = $('.title_input').value;
    if (title == '') {
        setDisplay($('.wrong_pop'), 'block');
        $('.wrong_pop').innerHTML = '请输入标题';
        setTimeout(function() {
            setDisplay($('.wrong_pop'), 'none');
            $('.wrong_pop').innerHTML = '';
        }, 2000);
        return;
    }

    var hascontent = title_img.getAttribute('img_id');
    var content = ude_innerHTML;

    if (!content) {

        setTimeout(function() {
            setDisplay($('.wrong_pop'), 'none');
            $('.wrong_pop').innerHTML = '';
        }, 2000);
        return;
    }

    var image_id = '';

    var image = [];

    var imgstrid = '';

    for (var i = 1; i < img_src.length; i++) {
        imgstrid += img_src[i].getAttribute('img_id') + ',';
    }
    imgstrid = imgstrid.substring(0, imgstrid.length - 1)
    if (!hascontent) {

        IO.post(url + '/v2/discussion', {
            uid: uid,
            access_token: access_token,
            game_id: game_id,
            title: title,
            content: content,
            // cover_image:cover_image,
            image_id: imgstrid
        }, function(data) {

            var data = JSON.parse(data);

            if (data.code == 200) {

                if (ua.indexOf('Android') > -1 || ua.indexOf('Linux') > -1) {
                    document.location = 'wanya://www.wanyagame.com/wanya_picture/game_id=' + game_id;
                } else {
                    window.location.href = 'wanya://www.wanyagame.com/wanya_picture/game_id=' + game_id;
                }
            } else {
                setDisplay($('.spinner_mask'), 'none');
                setDisplay($('.wrong_pop'), 'block');
                $('.wrong_pop').innerHTML = data.message;
                setTimeout(function() {
                    setDisplay($('.wrong_pop'), 'none');
                    $('.wrong_pop').innerHTML = '';
                }, 2000);
                return;
            }

        });

    } else {

        var cover_image = title_img.getAttribute('img_id');
        IO.post(url + '/v2/discussion', {
            uid: uid,
            access_token: access_token,
            game_id: game_id,
            title: title,
            content: content,
            cover_image: cover_image,
            image_id: imgstrid
        }, function(data) {

            var data = JSON.parse(data);
            if (data.code == 200) {

                if (ua.indexOf('Android') > -1 || ua.indexOf('Linux') > -1) {
                    document.location = 'wanya://www.wanyagame.com/wanya_picture/game_id=' + game_id;
                } else {
                    window.location.href = 'wanya://www.wanyagame.com/wanya_picture/game_id=' + game_id;
                }
            } else {
                setDisplay($('.spinner_mask'), 'none');
                setDisplay($('.wrong_pop'), 'block');
                $('.wrong_pop').innerHTML = data.message;
                setTimeout(function() {
                    setDisplay($('.wrong_pop'), 'none');
                    $('.wrong_pop').innerHTML = '';
                }, 2000);
                return;
            }

        });
    }


});


android(); //判断是不是安卓加类名
ios(); //判断是不是ios加类名


var bk_keyset_onfocus1 = false; //btn
var bk_keyset_onfocus2 = false;


doc.body.addEventListener('click', function(e) {



    var target = e.target;

    // alert(target);

    if (target.className == 'udeitor_outbox' || target.id == 'udeitor') {
        return;
    }

    if (target.className.indexOf('bk_keyset') >= 0) {

        // alert('11111');
        if (!bk_keyset_onfocus1) { //0
            bk_keyset_onfocus1 = true;
            udeitor.focus();
            return;
        }
    }

    bk_keyset_onfocus1 = false;

});

udeitor.onblur = function() {
    if (!bk_keyset_onfocus2) {
        return;
    }
    $('.bk_keyset').className = 'bk_keyset';
    bk_keyset_onfocus2 = false;
    $('.main').scrollTop = 0;
};

udeitor.onfocus = function() {
    if (bk_keyset_onfocus2) {
        return;
    }
    $('.bk_keyset').className = 'bk_keyset cur';
    bk_keyset_onfocus2 = true;
};







var pop_box = function(event) {
    setDisplay($('.wrong_pop'), 'block');
    $('.wrong_pop').innerHTML = event;
    setTimeout(function() {
        setDisplay($('.wrong_pop'), 'none');
        $('.wrong_pop').innerHTML = '';
    }, 2000);
}


var up_btn_click = false;
var cut = new ImgClip({
    canvas: $('.up-canvas canvas'), // canvas id
    fileObj: $('.up-file'), // file id
    cutBtn: $('.up-ok'), // cut btn id
    resultObj: $('.up-btn img'), // result img i
    cutScale: 0.4125, // 1:1、3:4
    cutW: 'winW',
    events: {
        onReady: function() {

            $('.up-btn').addEventListener('click', function() {
                $('.up-file').click();
            }, false);

            $('.up-ok').addEventListener('click', function() {
                $('.upload-poster').classList.remove('cur');
                $('.up-btn').classList.add('cur');
                var image_src = cut.resultObj.src;
                top_upimg(image_src);
                doc.body.className = '';
                $('.up-file').value = '';

            }, false);

            $('.up-cancel').addEventListener('click', function() {
                $('.upload-poster').classList.remove('cur');
            }, false);
        },
        onFirstDrawed: function() {
            doc.body.className = 'over';
            $('.upload-poster').classList.add('cur');
        }
    }
});

$('.top_bar').innerHTML = '<a class="tb_goback" href="//www.wanyagame.com/wanya_picture/go_back/game_id=' + game_id + '"></a>创建图文';




doc.addEventListener("touchstart", function() {
    if (bk_keyset_onfocus2) {


        var scrollTop = doc.documentElement.scrollTop || doc.body.scrollTop;

        console.log(scrollTop);

        var bottomHeight = .6 + 'rem';

        $('.bottom_keyset').style.height = .6 + 'rem';

        window.onresize = function() {

            var top = window.innerHeight + scrollTop - bottomHeight;

            $('.bottom_keyset').style.top = 0;

            alert(111111);
        }

    } else {

        console.log(2222, 'start');

    }
}, false);

doc.addEventListener("touchend", function() {
    if (bk_keyset_onfocus2) {
        console.log(111111, 'end');
    } else {
        console.log(22222, 'end');
    }
}, false);
