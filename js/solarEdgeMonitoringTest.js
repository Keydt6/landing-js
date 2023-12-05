$(function () {
    API_URL = 'https://restapi.getthereferral.com/api/';
    TOKEN = 'Basic Z3RydjVhZG1pbkBhZG1pbi5jb206MTU5QDM1Nw==';
});

function getSiteDetail(user_id) {
    $.ajax({
        type: "POST",
        url: API_URL + "getSiteDetail",
        data: $.param({user_id: user_id}),
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': TOKEN
        },
        success: function (response) {
            $('.objectview').preloader('remove');
            if (response.success == 0) {
                $('#solarmonitoring').hide();
                $('.alert-failure-div > p').html(response.message);
                $('.alert-failure-div').show();
                return;
            }
            var siteDetail = response.result.site;
            var overview = response.result.overview;
            var envBenefits = response.result.envBenefits;
            var location = '';
            if (siteDetail.location.address != '') {
                location = location + siteDetail.location.address + ', ';
            }
            if (siteDetail.location.address2 != '') {
                location = location + siteDetail.location.address2 + ', ';
            }

            if (siteDetail.location.city != '') {
                location = location + siteDetail.location.city + ', ';
            }

            if (siteDetail.location.state != '') {
                location = location + siteDetail.location.state + ', ';
            }

            if (siteDetail.location.country != '') {
                location = location + siteDetail.location.country;
            }

            sessionStorage.setItem("site_id", response.result.site.id);
            sessionStorage.setItem("endDate", response.result.dataPeriod.endDate);
            sessionStorage.setItem("startDate", response.result.dataPeriod.startDate);

            $('#name').html(siteDetail.name);
            $('#location').html(location);
            $('#peakPower').html(siteDetail.peakPower);
            $('#currentPower').html(overview.currentPower.power);
            $('#lastDayData').html(overview.lastDayData.energy);
            $('#lastMonthData').html((overview.lastMonthData.energy / 1000).toFixed(3));
            $('#lifeTimeData').html((overview.lifeTimeData.energy / 1000).toFixed(3));
            $('#lastUpdateTime').html(overview.lastUpdateTime);
            $('#co2').html(envBenefits.gasEmissionSaved.co2);
            $('#gasEmissionSavedunits').html(envBenefits.gasEmissionSaved.units);
            $('#treesPlanted').html(envBenefits.treesPlanted);
            var device = getMobileOperatingSystem();
            var browser = detectBrowser();
            //alert(device);

            $.each(response.result.powerPerHour.values, function (i, item) {
                if (device == 'iOS' || browser == 'Safari')
                    var d = new Date(item.iOSdate);
                else
                    var d = new Date(item.date);

                // var d = new Date(item.date.replace(' ', 'T'));
                /*if (device == 'iOS') {
                    item.date = d.getUTCHours() + ':00';
                } else {
                    item.date = d.getHours() + ':00';
                }*/

                item.date = d.getHours() + ':00';

                //alert(item.date);
                item.value = (item.value / 1000).toFixed(3);
            });
            $.each(response.result.energyPerYear.values, function (i, item) {
                if (device == 'iOS' || browser == 'Safari')
                    var d = new Date(item.iOSdate);
                else
                    var d = new Date(item.date);

                // var d = new Date(item.date.replace(' ', 'T'));
                item.date = d.getFullYear();
                item.value = (item.value / 1000).toFixed(3);
            });
            // powerenergy chart
            createPowerAndEnergyChart("day", response.result.powerPerHour.values, "");
            // comparative Energy Chart
            createPowerAndEnergyChart("compare_year", response.result.energyPerYear.values, "");

        }, error: function (e) {
            $('#Loader').remove();
        }
    });

}

function getMobileOperatingSystem() {
    var userAgent = navigator.userAgent || navigator.vendor || window.opera;

    if (/android/i.test(userAgent)) {
        return "Android";
    }

    // iOS detection from: http://stackoverflow.com/a/9039885/177710
    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
        return "iOS";
    }

    return "unknown";
}

function detectBrowser() {
    // Opera 8.0+
    var isOpera = (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;

    // Firefox 1.0+
    var isFirefox = typeof InstallTrigger !== 'undefined';

    // Safari 3.0+ "[object HTMLElementConstructor]"
    var isSafari = /constructor/i.test(window.HTMLElement) || (function (p) {
        return p.toString() === "[object SafariRemoteNotification]";
    })(!window['safari'] || (typeof safari !== 'undefined' && safari.pushNotification));

    // Internet Explorer 6-11
    var isIE = /*@cc_on!@*/false || !!document.documentMode;

    // Edge 20+
    var isEdge = !isIE && !!window.StyleMedia;

    // Chrome 1 - 79
    var isChrome = !!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime);

    // Edge (based on chromium) detection
    var isEdgeChromium = isChrome && (navigator.userAgent.indexOf("Edg") != -1);

    // Blink engine detection
    var isBlink = (isChrome || isOpera) && !!window.CSS;

    if (isFirefox == true)
        return "Firefox";
    else if (isChrome == true)
        return "Chrome";
    else if (isSafari == true)
        return "Safari";
    else if (isOpera == true)
        return "Opera";
    else if (isIE == true)
        return "IE";
    else if (isEdge == true)
        return "Edge";
    else if (isEdgeChromium == true)
        return "EdgeChromium";
    else
        return "web";
}

function getPowerAndEnergy(user_id, type, date) {
    var month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
    var endDate = '';
    if (date == '') {
        endDate = sessionStorage.getItem('endDate');
    } else {
        endDate = date;
    }

    $.ajax({
        type: "POST",
        url: API_URL + "getPowerAndEnergy",
        data: $.param({
            user_id: user_id, type: type, site_id: sessionStorage.getItem('site_id'), endDate: endDate,
            startDate: sessionStorage.getItem('startDate')
        }),
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': TOKEN
        },
        success: function (response) {
            var device = getMobileOperatingSystem();
            var browser = detectBrowser();
            if (type == 'week' || type == 'day' || type == 'month' || type == 'year') {
                $.each(response.result.powerPerHour.values, function (i, item) {
                    // var d = new Date(item.date.replace(' ', 'T'));
                    if (device == 'iOS' || browser == 'Safari')
                        var d = new Date(item.iOSdate);
                    else
                        var d = new Date(item.date);

                    if (type == "week") {
                        item.date = d.getDate() + ' ' + month[d.getMonth()];
                    }
                    if (type == "day") {
                        item.date = d.getHours() + ':00';
                        /*if (device == 'iOS') {
                            item.date = d.getUTCHours() + ':00';
                        } else {
                            item.date = d.getHours() + ':00';
                        }*/
                    }
                    if (type == "month") {
                        item.date = d.getDate() + ' ' + month[d.getMonth()];
                    }
                    if (type == "year") {
                        item.date = month[d.getMonth()];
                    }
                    item.value = (item.value / 1000).toFixed(3);
                });

                createPowerAndEnergyChart(type, response.result.powerPerHour.values, "");
            } else if (type == 'compare_month') {
                var dataArray = new Array();
                var years = new Array;
                var index1 = 0;
                dataArray[index1] = new Array();
                var index = 0;
                $.each(response.result.powerPerHour.values, function (i, item) {
                    // var d = new Date(item.date.replace(' ', 'T'));
                    if (device == 'iOS' || browser == 'Safari')
                        var d = new Date(item.iOSdate);
                    else
                        var d = new Date(item.date);

                    item.date = month[d.getMonth()];
                    item.value = (item.value / 1000).toFixed(3);
                    if (index >= 12) {
                        index = 0;
                        index1++;
                        dataArray[index1] = new Array();
                    }
                    index++;
                    dataArray[index1].push(item);
                    if (item.date == "Jan") {
                        years.push(d.getFullYear());
                    }

                });
                //console.log(graphs);
                createPowerAndEnergyChart(type, dataArray, years);
            } else if (type == 'compare_year') {
                $.each(response.result.powerPerHour.values, function (i, item) {
                    // var d = new Date(item.date.replace(' ', 'T'));
                    if (device == 'iOS' || browser == 'Safari')
                        var d = new Date(item.iOSdate);
                    else
                        var d = new Date(item.date);

                    item.date = d.getFullYear();
                    item.value = (item.value / 1000).toFixed(3);
                });

                createPowerAndEnergyChart(type, response.result.powerPerHour.values, "");
            }
            // console.log(response.result.powerPerHour.values);
        }, error: function (e) {

        }
    });

}


function createPowerAndEnergyChart(type, data, years) {

    var chartType = "serial";
    var startDuration = 1;
    var graphs = new Array();
    var dataArray = new Array();
    var chartId = "chartdiv";
    var graph = {
        balloonText: "[[title]] in [[date]]:[[value]] KW",
        fillAlphas: 0,
        id: "AmGraph-2",
        lineAlpha: 1,
        title: "Solar Production (KW)",
        valueField: "value"
    };
    var graphs = new Array(graph);

    var valueAxes = {
        id: "ValueAxis-1",
        title: "Power in KW"
    };
    var titles = {
        id: "Title-1",
        size: 15,
        text: "Power"
    };
    var dataProvider = data;

    if (type == "week") {
        startDuration = 0;
    }
    if (type == "month" || type == "year") {
        startDuration = 2;
        graph.balloonText = "[[title]] on [[date]]:[[value]] KWh";
        graph['type'] = "column";
        graph.fillAlphas = 1;
        titles.text = "Energy";
        valueAxes.title = "Energy in KWh";
    }

    if (type == "compare_month") {
        chartId = "chartdiv1";
        graphs = new Array();
        $.each(data, function (i, item) {
            var graph = {
                balloonText: "Energy in [[date]] [[title]]:[[value-" + i + "]] KW",
                fillAlphas: 1,
                id: "AmGraph-" + i,
                type: 'column',
                lineAlpha: 0,
                title: years[i],
                valueField: "value-" + i
            };
            graphs.push(graph);

        });

        $.each(data[0], function (i, obj) {
            var dataObject = new Object;
            $.each(data, function (j, item) {
                dataObject['date'] = data[j][i].date;
                dataObject['value-' + j] = data[j][i].value;
            });
            dataArray.push(dataObject);
        });
        valueAxes.title = "Energy in KWh";
        titles.text = "Comparative Energy";
        dataProvider = dataArray;
    }
    if (type == "compare_year") {
        dataProvider = data;
        chartId = "chartdiv1";
        graphs = new Array();
        var graph = {
            balloonText: "Energy in [[date]]:[[value]] KW",
            fillAlphas: 1,
            id: "AmGraph-1",
            type: 'column',
            lineAlpha: 0,
            title: "Solar Production (KWh)",
            valueField: "value"
        };
        graphs.push(graph);
        valueAxes.title = "Energy in KWh";
        titles.text = "Comparative Energy";
    }

    AmCharts.makeChart(chartId,
        {
            "type": chartType,
            "categoryField": "date",
            "startDuration": startDuration,
            "categoryAxis": {
                "gridPosition": "start"
            },
            "chartCursor": {
                "enabled": true
            },
            "trendLines": [],
            "graphs": graphs,
            "guides": [],
            "valueAxes": [valueAxes],
            "allLabels": [],
            "balloon": {},
            "legend": {
                "enabled": true,
            },
            "titles": [titles],
            "dataProvider": dataProvider
        }
    );
}

/*function createComparativeEnergyChart(type="compare_month", data, years=''){
    var chartType = "serial";
    var startDuration = 1;
    var graphs = new Array();
    var dataArray = new Array();
      if(type == "compare_month"){
            $.each(data, function (i, item) {
                  var graph = {
                    balloonText: "Energy in [[date]] [[title]]:[[value-"+i+"]] KW",
                    fillAlphas: 1,
                    id: "AmGraph-"+i,
                    type:'column',
                    lineAlpha: 0,
                    title: years[i],
                    valueField: "value-"+i
                  };
                  graphs.push(graph);

              });

             $.each(data[0], function (i, obj) {
              var dataObject = new Object;
                 $.each(data, function (j, item) {
                   dataObject['date'] = data[j][i].date;
                    dataObject['value-'+j] = data[j][i].value;
                         });
                   dataArray.push(dataObject);
              });
      }
      if (type == "compare_year") {
        dataArray = data;
        var graph = {
                  balloonText: "Energy in [[date]]:[[value]] KW",
                  fillAlphas: 1,
                  id: "AmGraph-1",
                  type:'column',
                  lineAlpha: 0,
                  title: "Solar Production (KWh)",
                  valueField: "value"
                };
        graphs.push(graph);
      }


    var valueAxes = {
        id: "ValueAxis-E1",
        title: "Energy in KWh"
    };

    var titles =  {
                id: "Title-1",
                size: 15,
                text: "Comparative Energy"
            };

    var dataProvider = dataArray;  
     
     AmCharts.makeChart("chartdiv1",
                {
                    "type": "serial",
                    "categoryField": "date",
                    "startDuration": 1,
                    "categoryAxis": {
                        "gridPosition": "start"
                    },
                    "trendLines": [],
                    "graphs": graphs,
                    "guides": [],
                     "valueAxes": [valueAxes],
                    "allLabels": [],
                    "balloon": {},
                    "legend": {
                        "enabled": true,
                        "useGraphSettings": true
                    },
                    "titles": [titles],
                    "dataProvider": dataProvider
                });
} */
       
