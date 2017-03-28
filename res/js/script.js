/**
 * Created by May on 2017/2/20.
 */

var jsonData = [
    {
        "ID": "1",
        "NO": "1",
        "CustomerName": "张三",
        "Address": "-"
    },
    {
        "ID": "2",
        "NO": "2",
        "CustomerName": "李四",
        "Address": "沈阳市南屏中路6号沈阳理工大学"
    },
    {
        "ID": "3",
        "NO": "3",
        "CustomerName": "王五",
        "Address": "沈阳市奥体中心"
    },
    {
        "ID": "4",
        "NO": "4",
        "CustomerName": "张三",
        "Address": "-"
    }
];

var lisNum = jsonData.length;
var txtNo = "当前序号：";
var txtName = "客户姓名：";
var txtAdd = "客户地址：";
var markerArray = [];

function loadScript() {
    var scriptDom = document.createElement("script");
    scriptDom.src = "http://api.map.baidu.com/api?ak=xHWHML1rRKPBN2dvWEiUbjVK4lpx605Z&v=2.0&callback=initialize";
    document.body.appendChild(scriptDom);
    pageFu();
}
window.onload = loadScript;
// 百度地图API功能
function initialize() {
    /*var jsonData=eval('('+returnData+')');*/
    var map = new BMap.Map("allmap");
    map.enableScrollWheelZoom(true);     //开启鼠标滚轮缩放

    var pointArray = [];
    var p = 0;
    var myGeo = new BMap.Geocoder();
    for (var i = 0; i < lisNum; i++) {
        (function (e) {
            var add = jsonData[e].Address == "" ? "-" : jsonData[e].Address;
            myGeo.getPoint(add, function (point) {
                if (point) {
                    /*map.centerAndZoom(point, 16);*/
                    var marker = new BMap.Marker(point);
                    marker.addEventListener("mouseover", markerActive);
                    marker.addEventListener("mouseout", markerOut);
                    map.addOverlay(marker);
                    pointArray[p] = point;
                    var label = new BMap.Label(jsonData[e].NO,
                        {offset: new BMap.Size(5, 2)});
                    label.setStyle({color: "#ffffff", border: "none", backgroundColor: "#ed2d2d"});
                    marker.setLabel(label);
                    markerArray.push(marker);
                    marker.setTitle(jsonData[e].NO);
                    p++;
                    map.setViewport(pointArray);
                }
            });
        })(i);
    }
}

function pageFu() {
    var ol = document.getElementById("taskList");
    var lis = [];
    for (var i = 0; i < lisNum; i++) {
        // 构建任务li
        var newLi = setList(i);
        ol.appendChild(newLi);
        // 注册onmousemove onmouseout事件
        newLi.onmousemove = function () {
            addClass(this, "activeList");
        };
        newLi.onmouseout = function () {
            removeClass(this, "activeList");
        };
    }
    changeNo();
    var btnSave = document.getElementById("btn-box").getElementsByTagName("div")[0];
    btnSave.onclick = function () {
        var data = "[";
        var ol = document.getElementById("taskList");
        var lis = getChildren(ol);
        for (var i in lis) {
            var id = lis[i].getElementsByClassName("list-id")[0].innerHTML;
            var no = lis[i].getElementsByClassName("list-no")[0].innerHTML;
            var d = '{"id":' + id + ',"no":' + no + '},';
            data += d;
        }
        data = data.substr(0, data.length - 1);
        data += "]";
        console.log(data);
        ajax.get("../res/data/Data.json", {'data': data}, function (result, xml) {
            var canvas = document.getElementById("Canvas");
            fadeIn(canvas);
            setTimeout("fadeOut(document.getElementById('Canvas'))", 1000);
        }, function (status) {
            alert(status);
        })
    }
}

function markerActive(e) {
    var p = e.target;
    var title = p.getTitle();
    var idList = document.getElementsByClassName("list-no");
    for (var i = 0; i < idList.length; i++) {
        var id = idList[i].innerText;
        if (id == title) {
            addClass(idList[i].parentNode.parentNode.parentNode, "activeList");
        }
    }
}

function markerOut(e) {
    var p = e.target;
    var title = p.getTitle();
    var idList = document.getElementsByClassName("list-no");
    for (var i = 0; i < idList.length; i++) {
        var id = idList[i].innerText;
        if (id == title) {
            removeClass(idList[i].parentNode.parentNode.parentNode, "activeList");
        }
    }
}

function removeClass(obj, cls) {
    if (hasClass(obj, cls)) {
        var reg = new RegExp('(\\s|^)' + cls + '(\\s|$)');
        obj.className = obj.className.replace(reg, "");
    }
}

function hasClass(obj, cls) {
    return obj.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'));
}

function addClass(obj, cls) {
    if (!this.hasClass(obj, cls)) obj.className += " " + cls;
}

function changeNo() {
    var ol = document.getElementById("taskList");
    var lis = getChildren(ol);
    var top = 110;
    for (var i = 0; i < lis.length; i++) {
        var li = lis[i];
        li.style.top = top + "px";
        top += li.offsetHeight;
        li.index = i;
        var div = li.getElementsByTagName("div");
        var l = div[0].getElementsByTagName("li");
        l[0].onclick = swpUp;
        l[1].onclick = swpDn;
    }
    check(0, i - 1);
    function swpUp(evt) {
        var p = evt ? evt.target : event.srcElement;
        p = p.parentNode.parentNode.parentNode;
        swap(p, lis[p.index - 1]);
    }

    function swpDn(evt) {
        var p = evt ? evt.target : event.srcElement;
        p = p.parentNode.parentNode.parentNode;
        swap(p, lis[p.index + 1]);
    }

    function check() {
        for (var i = 0; i < arguments.length; i++) {
            var x = arguments[i];
            var div = lis[x].getElementsByTagName("div");
            var l = div[0].getElementsByTagName("li");
            l[0].style.visibility = x == 0 ? "hidden" : "visible";
            l[1].style.visibility = x == lis.length - 1 ? "hidden" : "visible";
            lis[x].index = x;
        }
    }

    function swap(p1, p2) {
        var N = 10;
        var INTV = 200;
        var no1, no2;
        var arr1, arr2;
        no1 = p1.getElementsByClassName("list-no")[0].innerHTML;
        no2 = p2.getElementsByClassName("list-no")[0].innerHTML;
        p1.getElementsByClassName("list-no")[0].innerHTML = no2;
        p2.getElementsByClassName("list-no")[0].innerHTML = no1;
        changeLab(no1, no2);
        var t1 = parseInt(p1.style.top), t2 = parseInt(p2.style.top);
        var h1 = p1.offsetHeight, h2 = p2.offsetHeight;
        arr1 = makeArr(t1, t1 < t2 ? h2 : -h2);
        arr2 = makeArr(t2, t1 < t2 ? -h1 : h1);
        for (var i = 0; i < N; i++)(function () {
            var j = i;
            setTimeout(function () {
                p1.style.top = arr1[j] + "px";
                p2.style.top = arr2[j] + "px";
                if (j == N - 1) {
                    lis[p1.index] = p2;
                    lis[p2.index] = p1;
                    check(p1.index, p2.index);
                }
            }, (j + 1) * INTV / N);
        })();
        function makeArr(f, x) {
            var ret = [];
            for (var i = 0; i < N; i++)
                ret[i] = Math.round(f + i * x / (N - 1));
            return ret;
        }

        function changeLab(a, b) {
            var m;
            for (var i = 0; i < markerArray.length; i++) {
                var label1, label2;
                if (markerArray[i].getTitle() == a) {
                    label1 = new BMap.Label(b,
                        {offset: new BMap.Size(5, 2)});
                    label1.setStyle({color: "#ffffff", border: "none", backgroundColor: "#ed2d2d"});
                    markerArray[i].setLabel(label1);
                    markerArray[i].setTitle(b);
                    continue;
                }
                if (markerArray[i].getTitle() == b) {
                    label2 = new BMap.Label(a,
                        {offset: new BMap.Size(5, 2)});
                    label2.setStyle({color: "#ffffff", border: "none", backgroundColor: "#ed2d2d"});
                    markerArray[i].setLabel(label2);
                    markerArray[i].setTitle(a);
                }
            }
        }
    }
}

function getChildren(e) {
    var ret = [];
    for (var i = 0, c = e.childNodes; i < c.length; i++)
        if (c[i].nodeType == 1)
            ret.push(c[i]);
    return ret;
}

function setList(j) {
    var htmStr = "";
    htmStr += "<ul><li>" + txtNo + "<span class='list-no'>" + jsonData[j].NO + "</span></li>";
    htmStr += "<li hidden = 'hidden'><span class='list-id'>" + jsonData[j].ID + "</span></li>";
    htmStr += "<li>" + txtName + jsonData[j].CustomerName + "</li>";
    htmStr += "<li>" + txtAdd + jsonData[j].Address + "</li></ul>";
    htmStr += "<div class='up-down-box'><ul>";
    htmStr += "<li class='btn-up' title='上移'>&and;</li>";
    htmStr += "<li class='btn-down' title='下移'>&or;</li>";
    htmStr += "</ul></div>";
    var li = document.createElement("li");
    li.innerHTML = htmStr;
    li.className = "task-list";
    return li;
}

var ajax = {};
ajax.x = function () {
    if (typeof XMLHttpRequest !== 'undefined') {
        return new XMLHttpRequest();
    }
    var versions = [
        "MSXML2.XmlHttp.6.0",
        "MSXML2.XmlHttp.5.0",
        "MSXML2.XmlHttp.4.0",
        "MSXML2.XmlHttp.3.0",
        "MSXML2.XmlHttp.2.0",
        "Microsoft.XmlHttp"
    ];

    var xhr;
    for (var i = 0; i < versions.length; i++) {
        try {
            xhr = new ActiveXObject(versions[i]);
            break;
        } catch (e) {
        }
    }
    return xhr;
};

ajax.send = function (url, method, data, success, fail, async) {
    if (async === undefined) {
        async = true;
    }
    var x = ajax.x();
    x.open(method, url, async);
    x.onreadystatechange = function () {
        if (x.readyState == 4) {
            var status = x.status;
            if (status >= 200 && status < 300) {
                success && success(x.responseText, x.responseXML)
            } else {
                fail && fail(status);
            }
        }
    };
    if (method == 'POST') {
        x.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    }
    x.send(data)
};

ajax.get = function (url, data, callback, fail, async) {
    var query = [];
    for (var key in data) {
        query.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
    }
    ajax.send(url + (query.length ? '?' + query.join('&') : ''), 'GET', null, callback, fail, async)
};

ajax.post = function (url, data, callback, fail, async) {
    var query = [];
    for (var key in data) {
        query.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
    }
    ajax.send(url, 'POST', query.join('&'), callback, fail, async)
};

function SetOpacity(ev, v) {
    ev.filters ? ev.style.filter = 'alpha(opacity=' + v + ')' : ev.style.opacity = v / 100;
}

function fadeIn(elem, speed, opacity) {
    speed = speed || 20;
    opacity = opacity || 100;
    //显示元素,并将元素值为0透明度(不可见)
    elem.style.display = 'block';
    SetOpacity(elem, 0);
    //初始化透明度变化值为0
    var val = 0;
    //循环将透明值以5递增,即淡入效果
    (function () {
        SetOpacity(elem, val);
        val += 5;
        if (val <= opacity) {
            setTimeout(arguments.callee, speed);
        }
    })();
}

function fadeOut(elem, speed, opacity) {
    speed = speed || 20;
    opacity = opacity || 0;
    //初始化透明度变化值为0
    var val = 100;
    //循环将透明值以5递减,即淡出效果
    (function () {
        SetOpacity(elem, val);
        val -= 2;
        if (val >= opacity) {
            setTimeout(arguments.callee, speed);
        } else if (val < 0) {
            //元素透明度为0后隐藏元素
            elem.style.display = 'none';
        }
    })();
}
