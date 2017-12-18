$(document).ready(function() {
    //图标颜色的设置
    var colorOfButton = new Array("-1", "-1", "#F49C9C", "#EA9DF6", "-1", "-1", "#ACF5F6", "#ADF9B6", "#E2EF96");
    for (var i = 2; i <= 8; i++) {
        if (i != 4 && i != 5) {
            $("#btn_" + i.toString()).on("mouseover mouseout", { i: i }, function(e) {
                if (e.type == "mouseover") {
                    $("#btn_" + e.data.i.toString()).css("background-color", colorOfButton[e.data.i]);
                } else {
                    $("#btn_" + e.data.i.toString()).css("background-color", "#706050");
                }
            })
        }
    }

    //多个canvas的实现
    var numOfCanvas = 0,
        indexOfCanvas = 0; //需要一个设置显示哪个canvas的函数
    var hasShown = 0;
    var ctx = new Array("-1"),
        nowX = new Array("-1"),
        nowY = new Array("-1"),
        lastX = new Array("-1"),
        lastY = new Array("-1"),
        mouseFlag = new Array("-1"),
        colorX = new Array("-1"),
        colorY = new Array("-1"),
        offsetX = new Array("-1"),
        offsetY = new Array("-1"),
        isInDrag = new Array("-1"),
        lastT = new Array("-1");

    //模式选择的实现
    $("#stl_0").css({ "border": "solid", "border-width": "2px", "width": "36px", "height": "36px" });
    for (var i = 0; i < 4; i++) {
        $("#stl_" + i.toString()).on("click", { i: i }, function(e) {
            p = e.data.i;
            lstSlt = p;
            for (var j = 0; j < 4; j++) {
                $("#stl_" + j.toString()).css({ "border": "none", "width": "40px", "height": "40px" });
            }
            $("#stl_" + p.toString()).css({ "border": "solid", "border-width": "2px", "width": "36px", "height": "36px" });
        });
    }

    // lstSlt记忆上次选择的模式
    var lstSlt = 0;

    $("#over_2").toggle();
    $("#over_2").css("top", "-83px");
    $("#over_7").toggle();
    $("#over_7").css("top", "50px");

    //新建的实现
    $(".new_brd").hide();
    $(".new_brd").css({ "left": "30vw", "top": "20vh" });
    $("#btn_2").click(function() {
        if ($("#over_2").is(":hidden") && hasShown == 1) {
            return;
        }
        $("#over_2").toggle();
        if (hasShown == 0) {
            hasShown = 1;
        } else {
            hasShown = 0;
        }
    });
    $("#setC").click(function() {
        if (numOfCanvas > 7) {
            return;
        }
        setCanvas();
        switchCanvas(numOfCanvas);
    });

    //关闭的实现
    $("#btn_3").click(function() {
        if (numOfCanvas == 1) {
            return;
        }
        ctx.splice(indexOfCanvas, 1);
        nowX.splice(indexOfCanvas, 1);
        nowY.splice(indexOfCanvas, 1);
        lastX.splice(indexOfCanvas, 1);
        lastY.splice(indexOfCanvas, 1);
        mouseFlag.splice(indexOfCanvas, 1);
        colorX.splice(indexOfCanvas, 1);
        colorY.splice(indexOfCanvas, 1);
        offsetX.splice(indexOfCanvas, 1);
        offsetY.splice(indexOfCanvas, 1);
        isInDrag.splice(indexOfCanvas, 1);
        lastT.splice(indexOfCanvas, 1);
        $("#canvas_" + indexOfCanvas.toString()).remove();
        $("#slt_" + indexOfCanvas.toString()).remove();
        for (var i = indexOfCanvas + 1; i <= numOfCanvas; i++) {
            $("#canvas_" + i.toString()).attr("id", "canvas_" + (i - 1).toString());
            $("#slt_" + i.toString()).off("click");
            $("#slt_" + i.toString()).on("click", { i: i }, function(event) {
                switchCanvas(event.data.i - 1);
            });
            $("#slt_" + i.toString()).attr("id", "slt_" + (i - 1).toString());
        }
        numOfCanvas--;
        switchCanvas(1);
    });

    //  撤销与恢复的实现 老子不做这个功能了

    //全体拖拽的实现 可扩展 需要增加请修改numOfDrag及clickItems和dragItems和dragState三个数组
    var numOfDrag = 1;
    var clickItems = new Array("#btn_1");
    var dragItems = new Array(".tl_bar");
    var dragState = new Array(false, false); //记录是否处在被拖拽的状态 顺序：侧边栏、设置
    var lastBarX = new Array(numOfDrag),
        lastBarY = new Array(numOfDrag); //任务栏鼠标按下时的位置
    for (var i = 0; i < numOfDrag; i++) {
        $(clickItems[i]).on("mousedown", { i: i }, function(event) {
            var p = event.data.i;
            dragState[p] = true;
            lastBarX[p] = event.pageX - $(clickItems[p]).offset().left;
            lastBarY[p] = event.pageY - $(clickItems[p]).offset().top;
        });
        $(clickItems[i]).on("mouseup", { i: i }, function(event) {
            var p = event.data.i;
            dragState[p] = false;
        });
        $(document).on("mousemove", { i: i }, function(event) {
            var p = event.data.i;
            if (dragState[p] == true) {
                var barOffsetX = event.pageX - $(clickItems[p]).offset().left,
                    barOffsetY = event.pageY - $(clickItems[p]).offset().top;
                var oldBarX = $(dragItems[p]).css("left"),
                    oldBarY = $(dragItems[p]).css("top");
                $(dragItems[p]).css({
                    "left": (parseInt(oldBarX.split("px")[0]) + barOffsetX - lastBarX[p]).toString() + "px",
                    "top": (parseInt(oldBarY.split("px")[0]) + barOffsetY - lastBarY[p]).toString() + "px"
                });
            }
        });
    }

    // 弹出设置的实现
    $(".set_bar").css({ "left": "40vw", "top": "22vh" });
    $(".set_bar").toggle();
    $("#btn_7").click(function() {
        if ($("#over_7").is(":hidden") && hasShown == 1) {
            return;
        }
        $("#over_7").toggle();
        if (hasShown == 0) {
            hasShown = 1;
        } else {
            hasShown = 0;
        }
    });

    //随机颜色的实现
    $(".rnd_clr").click(function() {
        document.getElementById("clr_pkr_A").value = colorRGB2Hex(getRand(255), getRand(255), getRand(255));
        document.getElementById("clr_pkr_B").value = colorRGB2Hex(getRand(255), getRand(255), getRand(255));
    });

    //帮助的实现
    $("#btn_8").click(function() {
        window.open("help.html");
    });

    //设置选项卡隐藏后两个 可扩展 需修改numOfArea
    var numOfArea = 2,
        nowShownArea = 0;
    for (var i = 1; i < numOfArea; i++) {
        $("#area_" + i.toString()).hide();
    }
    for (var i = 0; i < numOfArea; i++) {
        $("#hd_" + i.toString()).on("click", { i: i }, function(event) {
            var p = event.data.i;
            $("#area_" + p.toString()).toggle();
            $("#area_" + nowShownArea.toString()).toggle();
            nowShownArea = p;
        });
    }

    //保存的实现
    $("#btn_6").click(function() {
        var image = document.getElementById("canvas_" + indexOfCanvas.toString()).toDataURL("image/png").replace("image/png", "image/octet-stream");
        var save_link = document.createElementNS('http://www.w3.org/1999/xhtml', 'a');
        save_link.href = image;
        save_link.download = "symmetry.png";
        //感谢http://blog.csdn.net/qq547276542/article/details/51906741中的方法
        var event = document.createEvent('MouseEvents');
        event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
        save_link.dispatchEvent(event);
    });

    setCanvas();
    switchCanvas(1);

    //切换当前canvas
    function switchCanvas(index) {
        indexOfCanvas = index;
        for (var i = 1; i <= numOfCanvas; i++) {
            if (i != index) {
                $(".pnt_area #canvas_" + i.toString()).hide();
                $("#slt_" + i.toString()).css("background-color", "#ACA2AD");
            } else {
                $(".pnt_area #canvas_" + i.toString()).show();
                $("#slt_" + i.toString()).css("background-color", "#F29B7C");
            }
        }
    }

    //新建canvas与绘图实现
    function setCanvas() {
        // 以上内容多个canvas公用
        numOfCanvas++;
        nowX.push(document.getElementById("widthOfCanvas").value);
        nowY.push(document.getElementById("heightOfCanvas").value);
        $(".pnt_area").append("<canvas id='canvas_" + numOfCanvas.toString() + "' width=" + (nowX[numOfCanvas] * 4).toString() + " height=" + (nowY[numOfCanvas] * 4).toString() + "></canvas>");
        $(".pnt_area #canvas_" + numOfCanvas.toString()).css("width", nowX[numOfCanvas].toString());
        $(".pnt_area #canvas_" + numOfCanvas.toString()).css("height", nowY[numOfCanvas].toString());
        $(".pnt_area #canvas_" + numOfCanvas.toString()).trigger("create");
        switchCanvas(numOfCanvas);
        ctx.push(document.getElementById("canvas_" + numOfCanvas.toString()).getContext("2d"));

        lastX.push(new Array("-1", "-1"));
        lastY.push(new Array("-1", "-1"));
        lastT.push(0);
        ctx[numOfCanvas].lineWidth = 3;
        ctx[numOfCanvas].lineJoin = "round";
        ctx[numOfCanvas].fillStyle = document.getElementById("clr_pkr_C").value;
        ctx[numOfCanvas].fillRect(0, 0, nowX[numOfCanvas] * 4, nowY[numOfCanvas] * 4);
        ctx[numOfCanvas].globalAlpha = 0.3;
        ctx[numOfCanvas].translate(nowX[numOfCanvas] * 2, nowY[numOfCanvas] * 2);
        mouseFlag.push(false);
        colorX.push(document.getElementById("clr_pkr_A").value);
        colorY.push(document.getElementById("clr_pkr_B").value);
        offsetX.push(0);
        offsetY.push(0);
        isInDrag.push(false);
        $(".area_lst").append("<div class='area_slt' id='slt_" + numOfCanvas.toString() + "'></div>");
        $("#slt_" + numOfCanvas.toString()).on("click", { q: numOfCanvas }, function(event) {
            switchCanvas(event.data.q);
        });
        $(".area_lst").trigger("create");

        $(document).mousedown(function(e) {
            mouseFlag[indexOfCanvas] = true;
            lastX[indexOfCanvas][0] = "-1";
            lastX[indexOfCanvas][1] = "-1";
            lastY[indexOfCanvas][0] = "-1";
            lastY[indexOfCanvas][1] = "-1";
            colorX[indexOfCanvas] = document.getElementById("clr_pkr_A").value;
            colorY[indexOfCanvas] = document.getElementById("clr_pkr_B").value;
        });
        $(document).mouseup(function(e) {
            mouseFlag[indexOfCanvas] = false;
        });
        $(document).mousemove(function(e) {
            offsetX[indexOfCanvas] = (e.pageX - $("#canvas_" + indexOfCanvas.toString()).offset().left - nowX[indexOfCanvas] / 2) * 4;
            offsetY[indexOfCanvas] = (e.pageY - $("#canvas_" + indexOfCanvas.toString()).offset().top - nowY[indexOfCanvas] / 2) * 4;
            if (Math.abs(offsetX[indexOfCanvas]) >= nowX[indexOfCanvas] * 2 || Math.abs(offsetY[indexOfCanvas]) >= nowY[indexOfCanvas] * 2 || !$("#over_2").is(":hidden") || !$("#over_7").is(":hidden")) {
                return;
            }
            isInDrag[indexOfCanvas] = false;
            for (var i = 0; i < numOfDrag; i++) {
                isInDrag[indexOfCanvas] = isInDrag[indexOfCanvas] || dragState[i];
            }
            if (isInDrag[indexOfCanvas] == false && mouseFlag[indexOfCanvas] == true && lastX[indexOfCanvas][0] != "-1" && lastY[indexOfCanvas][0] != "-1" && lastX[indexOfCanvas][1] != "-1" && lastY[indexOfCanvas][1] != "-1") {
                if (lstSlt == 0) {
                    var lg = ctx[indexOfCanvas].createLinearGradient(0, 0, offsetX[indexOfCanvas], offsetY[indexOfCanvas]);
                    lg.addColorStop(0, colorX[indexOfCanvas]);
                    lg.addColorStop(1, colorY[indexOfCanvas]);

                    ctx[indexOfCanvas].beginPath();
                    ctx[indexOfCanvas].moveTo(lastX[indexOfCanvas][0] / 3, 0);
                    ctx[indexOfCanvas].lineTo(lastX[indexOfCanvas][0], lastY[indexOfCanvas][0]);
                    ctx[indexOfCanvas].quadraticCurveTo(lastX[indexOfCanvas][1], lastY[indexOfCanvas][1], offsetX[indexOfCanvas], offsetY[indexOfCanvas]);
                    ctx[indexOfCanvas].lineTo(offsetX[indexOfCanvas] / 3, 0);
                    ctx[indexOfCanvas].closePath();
                    ctx[indexOfCanvas].fillStyle = lg;
                    ctx[indexOfCanvas].fill();

                    var lg = ctx[indexOfCanvas].createLinearGradient(0, 0, offsetX[indexOfCanvas], offsetY[indexOfCanvas]);
                    lg.addColorStop(0, colorX[indexOfCanvas]);
                    lg.addColorStop(1, colorY[indexOfCanvas]);

                    ctx[indexOfCanvas].beginPath();
                    ctx[indexOfCanvas].moveTo(lastX[indexOfCanvas][0] / 3, 0);
                    ctx[indexOfCanvas].lineTo(lastX[indexOfCanvas][0], -lastY[indexOfCanvas][0]);
                    ctx[indexOfCanvas].quadraticCurveTo(lastX[indexOfCanvas][1], -lastY[indexOfCanvas][1], offsetX[indexOfCanvas], -offsetY[indexOfCanvas]);
                    ctx[indexOfCanvas].lineTo(offsetX[indexOfCanvas] / 3, 0);
                    ctx[indexOfCanvas].closePath();
                    ctx[indexOfCanvas].fillStyle = lg;
                    ctx[indexOfCanvas].fill();
                } else if (lstSlt == 1) {
                    var lg = ctx[indexOfCanvas].createLinearGradient(0, 0, offsetX[indexOfCanvas], offsetY[indexOfCanvas]);
                    lg.addColorStop(0, colorX[indexOfCanvas]);
                    lg.addColorStop(1, colorY[indexOfCanvas]);

                    ctx[indexOfCanvas].beginPath();
                    ctx[indexOfCanvas].moveTo(0, lastY[indexOfCanvas][0] / 3);
                    ctx[indexOfCanvas].lineTo(lastX[indexOfCanvas][0], lastY[indexOfCanvas][0]);
                    ctx[indexOfCanvas].quadraticCurveTo(lastX[indexOfCanvas][1], lastY[indexOfCanvas][1], offsetX[indexOfCanvas], offsetY[indexOfCanvas]);
                    ctx[indexOfCanvas].lineTo(0, offsetY[indexOfCanvas] / 3);
                    ctx[indexOfCanvas].closePath();
                    ctx[indexOfCanvas].fillStyle = lg;
                    ctx[indexOfCanvas].fill();

                    var lg = ctx[indexOfCanvas].createLinearGradient(0, 0, offsetX[indexOfCanvas], offsetY[indexOfCanvas]);
                    lg.addColorStop(0, colorX[indexOfCanvas]);
                    lg.addColorStop(1, colorY[indexOfCanvas]);

                    ctx[indexOfCanvas].beginPath();
                    ctx[indexOfCanvas].moveTo(0, lastY[indexOfCanvas][0] / 3);
                    ctx[indexOfCanvas].lineTo(-lastX[indexOfCanvas][0], lastY[indexOfCanvas][0]);
                    ctx[indexOfCanvas].quadraticCurveTo(-lastX[indexOfCanvas][1], lastY[indexOfCanvas][1], -offsetX[indexOfCanvas], offsetY[indexOfCanvas]);
                    ctx[indexOfCanvas].lineTo(0, offsetY[indexOfCanvas] / 3);
                    ctx[indexOfCanvas].closePath();
                    ctx[indexOfCanvas].fillStyle = lg;
                    ctx[indexOfCanvas].fill();
                } else if (lstSlt == 2) {
                    var lg = ctx[indexOfCanvas].createLinearGradient(0, 0, offsetX[indexOfCanvas], offsetY[indexOfCanvas]);
                    lg.addColorStop(0, colorX[indexOfCanvas]);
                    lg.addColorStop(1, colorY[indexOfCanvas]);

                    ctx[indexOfCanvas].beginPath();
                    ctx[indexOfCanvas].moveTo(0, 0);
                    ctx[indexOfCanvas].lineTo(lastX[indexOfCanvas][0], lastY[indexOfCanvas][0]);
                    ctx[indexOfCanvas].quadraticCurveTo(lastX[indexOfCanvas][1], lastY[indexOfCanvas][1], offsetX[indexOfCanvas], offsetY[indexOfCanvas]);
                    ctx[indexOfCanvas].lineTo(0, 0);
                    ctx[indexOfCanvas].closePath();
                    ctx[indexOfCanvas].fillStyle = lg;
                    ctx[indexOfCanvas].fill();

                    var lg = ctx[indexOfCanvas].createLinearGradient(0, 0, offsetX[indexOfCanvas], offsetY[indexOfCanvas]);
                    lg.addColorStop(0, colorX[indexOfCanvas]);
                    lg.addColorStop(1, colorY[indexOfCanvas]);

                    ctx[indexOfCanvas].beginPath();
                    ctx[indexOfCanvas].moveTo(0, 0);
                    ctx[indexOfCanvas].lineTo(-lastX[indexOfCanvas][0], -lastY[indexOfCanvas][0]);
                    ctx[indexOfCanvas].quadraticCurveTo(-lastX[indexOfCanvas][1], -lastY[indexOfCanvas][1], -offsetX[indexOfCanvas], -offsetY[indexOfCanvas]);
                    ctx[indexOfCanvas].lineTo(0, 0);
                    ctx[indexOfCanvas].closePath();
                    ctx[indexOfCanvas].fillStyle = lg;
                    ctx[indexOfCanvas].fill();
                } else if (lstSlt == 3) {
                    var lg = ctx[indexOfCanvas].createLinearGradient(0, 0, offsetX[indexOfCanvas], offsetY[indexOfCanvas]);
                    lg.addColorStop(0, colorX[indexOfCanvas]);
                    lg.addColorStop(1, colorY[indexOfCanvas]);

                    ctx[indexOfCanvas].beginPath();
                    ctx[indexOfCanvas].moveTo(0, 0);
                    ctx[indexOfCanvas].lineTo(lastX[indexOfCanvas][0], lastY[indexOfCanvas][0]);
                    ctx[indexOfCanvas].quadraticCurveTo(lastX[indexOfCanvas][1], lastY[indexOfCanvas][1], offsetX[indexOfCanvas], offsetY[indexOfCanvas]);
                    ctx[indexOfCanvas].lineTo(0, 0);
                    ctx[indexOfCanvas].closePath();
                    ctx[indexOfCanvas].fillStyle = lg;
                    ctx[indexOfCanvas].fill();
                }

                lastX[indexOfCanvas][1] = offsetX[indexOfCanvas];
                lastY[indexOfCanvas][1] = offsetY[indexOfCanvas];
                lastX[indexOfCanvas][0] = "-1";
                lastY[indexOfCanvas][0] = "-1";
                nowT = lastT[indexOfCanvas];
            } else {
                lastX[indexOfCanvas][0] = lastX[indexOfCanvas][1];
                lastY[indexOfCanvas][0] = lastY[indexOfCanvas][1];
                lastX[indexOfCanvas][1] = offsetX[indexOfCanvas];
                lastY[indexOfCanvas][1] = offsetY[indexOfCanvas];
            }

        });
    }

    function getRand(maxv) {
        return (Math.floor(Math.random() * maxv));
    }

    function colorRGB2Hex(r, g, b) {
        var hex = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
        return hex;
    }
});