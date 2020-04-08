window.app = {};
var sidebar = new ol.control.Sidebar({
    element: 'sidebar',
    position: 'right'
});

var projection = ol.proj.get('EPSG:3857');
var projectionExtent = projection.getExtent();
var size = ol.extent.getWidth(projectionExtent) / 256;
var resolutions = new Array(20);
var matrixIds = new Array(20);
var clickedCoordinate, populationLayer, gPopulation;
for (var z = 0; z < 20; ++z) {
    // generate resolutions and matrixIds arrays for this WMTS
    resolutions[z] = size / Math.pow(2, z);
    matrixIds[z] = z;
}
var pyramidChart, popChart;

var layerYellow = new ol.style.Style({
    stroke: new ol.style.Stroke({
        color: 'rgba(0,0,0,1)',
        width: 1
    }),
    fill: new ol.style.Fill({
        color: 'rgba(255,255,0,0.1)'
    }),
    text: new ol.style.Text({
        font: 'bold 16px "Open Sans", "Arial Unicode MS", "sans-serif"',
        placement: 'point',
        fill: new ol.style.Fill({
            color: 'blue'
        })
    })
});

var town = new ol.layer.Vector({
    source: new ol.source.Vector({
        url: 'data/town.json',
        format: new ol.format.GeoJSON()
    }),
    style: function(f) {
        var fStyle = layerYellow.clone();
        fStyle.getText().setText(f.get('COUNTYNAME') + f.get('TOWNNAME'));
        return fStyle;
    }
});

var baseLayer = new ol.layer.Tile({
    source: new ol.source.WMTS({
        matrixSet: 'EPSG:3857',
        format: 'image/png',
        url: 'http://wmts.nlsc.gov.tw/wmts',
        layer: 'EMAP',
        tileGrid: new ol.tilegrid.WMTS({
            origin: ol.extent.getTopLeft(projectionExtent),
            resolutions: resolutions,
            matrixIds: matrixIds
        }),
        style: 'default',
        wrapX: true,
        attributions: '<a href="http://maps.nlsc.gov.tw/" target="_blank">國土測繪圖資服務雲</a>'
    }),
    opacity: 0.3
});

var appView = new ol.View({
    center: ol.proj.fromLonLat([120.521115, 22.964407]),
    zoom: 10
});

var map = new ol.Map({
    layers: [baseLayer, town],
    target: 'map',
    view: appView
});
map.addControl(sidebar);

var birthGroup = 'high';
var selectedTown = '';
map.on('singleclick', function(evt) {
    clickedCoordinate = evt.coordinate;
    var featureClicked = false;
    map.forEachFeatureAtPixel(evt.pixel, function(feature) {
        if (false === featureClicked) {
            featureClicked = true;
            var p = feature.getProperties();
            selectedTown = p.COUNTYNAME + p.TOWNNAME;
            loadCharts();
            map.getView().fit(feature.getGeometry());
        }
    });
    featureClicked = false;
});

function loadCharts() {
    var uriTown = encodeURI(selectedTown);
    $('#sidebar-title').html(selectedTown);
    $('#book-town').html(selectedTown);
    var birthGroupLabel = '';
    switch (birthGroup) {
        case 'high':
            birthGroupLabel = '高出生預估';
            break;
        case 'medium':
            birthGroupLabel = '中出生預估';
            break;
        case 'low':
            birthGroupLabel = '低出生預估';
            break;
    }
    $('#birth-town').html(birthGroupLabel);

    pyramidChart.dataSource.url = 'data/csv/' + uriTown + '/' + birthGroup + '.csv';
    pyramidChart.dataSource.load();
    popChart.dataSource.url = 'data/csv/' + uriTown + '/years.csv';
    popChart.dataSource.load();
    sidebar.open('home');
}

$('#btnHigh').click(function() {
    birthGroup = 'high';
    loadCharts();
    return false;
});

$('#btnMedium').click(function() {
    birthGroup = 'medium';
    loadCharts();
    return false;
});

$('#btnLow').click(function() {
    birthGroup = 'low';
    loadCharts();
    return false;
});