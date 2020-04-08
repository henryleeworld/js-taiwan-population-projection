am4core.ready(function() {

    am4core.useTheme(am4themes_animated);

    var container = am4core.create("chartdiv", am4core.Container);
    container.width = am4core.percent(100);
    container.height = am4core.percent(100);
    container.layout = "vertical";

    popChart = container.createChild(am4charts.XYChart);
    popChart.marginLeft = 15;
    popChart.data = [{}];

    var popSubtitle = popChart.titles.create();
    popSubtitle.text = "(滑鼠游標滑過可以看到數字)";

    var popTitle = popChart.titles.create();
    popTitle.text = "人口資料";
    popTitle.fontSize = 20;

    popChart.dateFormatter.dateFormat = "yyyy";

    var popXAxis = popChart.xAxes.push(new am4charts.DateAxis());
    popXAxis.renderer.minGridDistance = 40;

    var popYAxis = popChart.yAxes.push(new am4charts.ValueAxis());
    popYAxis.renderer.opposite = true;

    var popSeriesMale = popChart.series.push(new am4charts.LineSeries());
    popSeriesMale.dataFields.dateX = "year";
    popSeriesMale.dataFields.valueY = "male";
    popSeriesMale.propertyFields.strokeDasharray = "dash";
    popSeriesMale.propertyFields.fillOpacity = "opacity";
    popSeriesMale.stacked = true;
    popSeriesMale.strokeWidth = 2;
    popSeriesMale.fillOpacity = 0.5;
    popSeriesMale.name = "男";

    var popSeriesFemale = popChart.series.push(new am4charts.LineSeries());
    popSeriesFemale.dataFields.dateX = "year";
    popSeriesFemale.dataFields.valueY = "female";
    popSeriesFemale.propertyFields.strokeDasharray = "dash";
    popSeriesFemale.propertyFields.fillOpacity = "opacity";
    popSeriesFemale.stacked = true;
    popSeriesFemale.strokeWidth = 2;
    popSeriesFemale.fillOpacity = 0.5;
    popSeriesFemale.tooltipText = "[bold]{dateX}人口[/]\n[font-size: 20]總計: {total}\n男: {male}\n女: {female}";
    popSeriesFemale.name = "女";

    popChart.dataSource.parser = new am4core.CSVParser();
    popChart.dataSource.parser.options.useColumnNames = true;
    popChart.dataSource.parser.options.numberFields = ["male", "female", "total"];
    popChart.dataSource.adapter.add("parsedData", function(data) {
        am4core.array.each(data, function(item) {
            if (item.year.getFullYear() == currentYear) {
                item.dash = "3,3";
                item.opacity = 0.3;
            }
        });
        return data;
    });

    popChart.cursor = new am4charts.XYCursor();
    popChart.snapToSeries = popSeriesFemale;
    popChart.cursor.events.on("cursorpositionchanged", function(ev) {
        currentYear = popXAxis.positionToDate(popXAxis.toAxisPosition(ev.target.xPosition)).getFullYear().toString();
        updateData();
    });

    popChart.cursor.events.on("hidden", function(ev) {
        currentYear = new Date().getFullYear().toString();
        updateData();
    });

    pyramidChart = container.createChild(am4charts.XYChart);

    pyramidChart.cursor = new am4charts.XYCursor();
    pyramidChart.cursor.behavior = "none";

    pyramidChart.dataSource.parser = new am4core.CSVParser();
    pyramidChart.dataSource.parser.options.useColumnNames = true;
    pyramidChart.dataSource.parser.options.numberFields = ["male", "female", "total"];
    pyramidChart.dataSource.events.on("parseended", function(ev) {
        sourceData = ev.target.data;
        ev.target.data = getCurrentData();
    });

    function getCurrentData() {
        var currentData = [];
        am4core.array.each(sourceData, function(row, i) {
            if (row.year == currentYear) {
                currentData.push(row);
            }
        });
        currentData.sort(function(a, b) {
            var a1 = Number(a.year.replace(/[^0-9]+.*$/, ""));
            var b1 = Number(b.year.replace(/[^0-9]+.*$/, ""));
            if (a1 > b1) {
                return 1;
            } else if (a1 < b1) {
                return -1;
            }
            return 0;
        });
        return currentData;
    }

    function updateData() {
        var data = getCurrentData();
        if (data.length == 0) {
            return;
        }
        am4core.array.each(pyramidChart.data, function(row, i) {
            if (!data[i]) {
                pyramidChart.data[i].male = 0;
                pyramidChart.data[i].female = 0;
            } else {
                pyramidChart.data[i].male = data[i].male;
                pyramidChart.data[i].female = data[i].female;
            }
        });
        pyramidChart.invalidateRawData();

        // Set title
        pyramidChart.titles.getIndex(0).text = currentYear;
    }

    // An adapter which filters data for the current year
    var currentYear = '2019';
    var sourceData = [];

    var pyramidXAxisMale = pyramidChart.xAxes.push(new am4charts.ValueAxis());
    pyramidXAxisMale.strictMinMax = true;

    var maleRange = pyramidXAxisMale.axisRanges.create();
    maleRange.label.text = "男";
    maleRange.label.align = "left";
    maleRange.label.fontSize = 20;
    maleRange.label.fill = pyramidChart.colors.getIndex(0);

    var pyramidXAxisFemale = pyramidChart.xAxes.push(new am4charts.ValueAxis());
    pyramidXAxisFemale.renderer.inversed = true;
    pyramidXAxisFemale.strictMinMax = true;

    var maleRange = pyramidXAxisFemale.axisRanges.create();
    maleRange.label.text = "女";
    maleRange.label.align = "right";
    maleRange.label.fontSize = 20;
    maleRange.label.fill = pyramidChart.colors.getIndex(1);

    pyramidChart.bottomAxesContainer.layout = "horizontal";

    var pyramidYAxis = pyramidChart.yAxes.push(new am4charts.CategoryAxis());
    pyramidYAxis.dataFields.category = "age_range";
    pyramidYAxis.renderer.minGridDistance = 10;
    pyramidYAxis.renderer.grid.template.location = 0;
    pyramidYAxis.renderer.inside = true;
    pyramidYAxis.title.text = "年齡";

    var pyramidSeriesMale = pyramidChart.series.push(new am4charts.ColumnSeries());
    pyramidSeriesMale.dataFields.categoryY = "age_range";
    pyramidSeriesMale.dataFields.valueX = "male";
    pyramidSeriesMale.tooltipText = "{valueX}";
    pyramidSeriesMale.name = "男";
    pyramidSeriesMale.xAxis = pyramidXAxisMale;
    pyramidSeriesMale.clustered = false;
    pyramidSeriesMale.columns.template.strokeOpacity = 0;

    var pyramidSeriesFemale = pyramidChart.series.push(new am4charts.ColumnSeries());
    pyramidSeriesFemale.dataFields.categoryY = "age_range";
    pyramidSeriesFemale.dataFields.valueX = "female";
    pyramidSeriesFemale.tooltipText = "{valueX}";
    pyramidSeriesFemale.name = "女";
    pyramidSeriesFemale.xAxis = pyramidXAxisFemale;
    pyramidSeriesFemale.clustered = false;
    pyramidSeriesFemale.columns.template.strokeOpacity = 0;

    var pyramidTitle = pyramidChart.titles.create();
    pyramidTitle.text = currentYear;
    pyramidTitle.fontSize = 20;
    pyramidTitle.marginBottom = 22;

    var note = pyramidChart.tooltipContainer.createChild(am4core.Label);
    note.text = "* 預估資料參數取自國家發展委員會 - https://pop-proj.ndc.gov.tw/"
    note.fontSize = 10;
    note.valign = "bottom";
    note.align = "center";
});