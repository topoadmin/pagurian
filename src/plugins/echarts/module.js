define(function(require, exports, module) {

    //直接在页面中引入,因为Grunt uglify 执行太慢了
    //require("plugins/echarts/loader"); //基础包（不含map）
    //require("plugins/echarts/loader-map"); //完整包

    var g = window;
    var languages = {
        zh_CN: require('./locale/zh_CN'),
        en_US: require('./locale/en_US')
    };
    var lang = pagurian.language || "zh_CN";
    var locale = languages[lang];

    var cities;

    var chartOptions = {
        line: require('./chart/line'),
        pie: require('./chart/pie'),
        bar: require('./chart/bar'),
        map: require('./chart/map'),
    };

    function Echarts(seletor, options) {

        this.version = "0.1.1208";
        this.options = {
            backgroundColor: '#f5f5f5',
            color: ['#fe8463', '#9bca63', '#fad860', '#60c0dd', '#0084c6', '#d7504b', '#c6e579', '#26c0c0', '#f0805a', '#f4e001', '#b5c334'],
        };

        var nameMapCity = {};
        var nameMapProvince = {};
        var options_all;

        this.init = function() {

            //当地域信息不为空,初始化nameMap;
            if ($p.locale.echarts) {

                var chinaProvinceLocale = $p.locale.echarts[lang].china_province;
                var chinaProvince_zh_CN = $p.locale.echarts.zh_CN.china_province;
                var chinaCityLocale = $p.locale.echarts[lang].china_city;
                var chinaCity_zh_CN = $p.locale.echarts.zh_CN.china_city;

                for (var key in chinaCity_zh_CN) {
                    nameMapCity[chinaCity_zh_CN[key]] = chinaCityLocale[key];
                }

                for (key in chinaProvinceLocale) {
                    nameMapProvince[chinaProvinceLocale[key]] = chinaProvince_zh_CN[key];
                }
            }

            $.extend(true, this.options, options);
            this.id = seletor;
            this.chart = echarts.init(document.getElementById(seletor));
            this.showLoading();

            return this;
        };

        this.showLoading = function(effect) {
            this.chart.showLoading({
                effect: effect || "spin",
                textStyle: {
                    color: "#fff"
                },
                effectOption: {
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                },
                text: locale.loading
            });
            return this;
        };

        this.hideLoading = function() {
            this.chart.hideLoading();
            return this;
        };

        this.message = function(status, message) {

            this.hideLoading();
            this.chart.clear();
            var icon = "icon-info icon-big";
            var msg = message || locale.empty;

            if (status === "timeout") {
                icon = "icon-exclamation-circle icon-big red";
                msg += "<br/><a class='btn btn-default' id='btn_reload'>" + locale.search_reset + "</a>";
            } else if (status === "error") {
                icon = "icon-exclamation-circle icon-big red";
            }

            if ($("#" + seletor + ".chart-message").length > 0) {
                $(".chart-message").html("<h3><i class='icon " + icon + "' ></i> " + msg + "</h3>");
                return;
            }

            $("#" + this.id).append("<div class='chart-message'><h3><i class='icon " + icon + "' ></i> " + msg + "</h3></div>");

            return this;
        };


        this.load = function(data, options) {
            $("#" + seletor + " .chart-message").remove();

            //如果没有 type 参数，
            //则直接setOption 采用Echart自己的参数
            if (!this.options.type) {
                this.chart.hideLoading();
                this.chart.clear();
                $.extend(true, this.options, data);
                this.chart.setOption(this.options);
                return;
            }

            var type = this.options.type;
            var _options = $.extend(true, {}, chartOptions[type](data), this.options);


            if ($.isFunction(options)) {
                options_all = options(_options);
            } else {
                options_all = $.extend(true, _options, options || {});
            }

            this.hideLoading();
            this.chart.clear();
            this.chart.setOption(options_all);

            return this;
        };


        /**
         * 外部接口绑定事件
         * @param {Object} eventName 事件名称
         * @param {Object} eventListener 事件响应函数
         */
        this.on = function(eventName, eventListener) {
            this.chart.on(eventName, eventListener);
            return this;
        };

        /**
         * 设置属性
         * @param {Object} options
         */
        this.set = function(options) {
            this.chart.setOption($.extend(true, options_all, options), true);
        };

        /**
         * 点击中国全国地图-进入省市地图
         */
        this.onMapSelectedByChina = function(params) {


            var mapType = "china";
            var count = 0;
            for (var k in params.selected) {
                count++;
            }

            if (count === 1) {
                mapType = "china";
            } else if (nameMapProvince[params.target]) {
                mapType = nameMapProvince[params.target];
            }

            this.set({
                series: [{
                    mapType: mapType,
                    nameMap: nameMapCity,
                }]
            });

            this.selected = mapType;
        };

    }


    g[PagurianAlias].echarts = function(seletor, options) {
        return new Echarts(seletor, options).init();
    };

});
