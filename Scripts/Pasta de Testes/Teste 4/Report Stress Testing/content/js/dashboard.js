/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 99.92857142857143, "KoPercent": 0.07142857142857142};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.1846875, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.025, 500, 1500, "https://paa.sit.sdlc-quattrus.com/2311"], "isController": false}, {"data": [0.04, 500, 1500, "https://paa.sit.sdlc-quattrus.com/2311-1"], "isController": false}, {"data": [0.21, 500, 1500, "https://paa.sit.sdlc-quattrus.com/-1"], "isController": false}, {"data": [0.47, 500, 1500, "https://paa.sit.sdlc-quattrus.com/-0"], "isController": false}, {"data": [0.56, 500, 1500, "https://paa.sit.sdlc-quattrus.com/2311-0"], "isController": false}, {"data": [0.06, 500, 1500, "https://paa.sit.sdlc-quattrus.com/login"], "isController": false}, {"data": [0.1125, 500, 1500, "https://paa.sit.sdlc-quattrus.com/"], "isController": false}, {"data": [0.0, 500, 1500, "Test Stress"], "isController": true}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 1400, 1, 0.07142857142857142, 3912.9592857142907, 169, 11981, 3280.0, 8907.5, 10020.65, 11386.64, 12.518442348102115, 227.89052370680022, 8.345372088344437], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["https://paa.sit.sdlc-quattrus.com/2311", 200, 0, 0.0, 5637.719999999996, 772, 11464, 5161.0, 9870.4, 10355.95, 11292.100000000004, 5.4890767372927876, 140.087858462441, 5.730295929849599], "isController": false}, {"data": ["https://paa.sit.sdlc-quattrus.com/2311-1", 200, 0, 0.0, 4802.84, 601, 9706, 4200.5, 8084.300000000001, 9094.899999999998, 9687.220000000001, 5.5274576458557885, 140.21451609699307, 2.8878807036453584], "isController": false}, {"data": ["https://paa.sit.sdlc-quattrus.com/-1", 200, 0, 0.0, 5151.064999999998, 318, 10744, 6069.5, 9597.9, 9753.0, 10238.580000000002, 5.930846331771543, 150.44532894883162, 3.097940513611292], "isController": false}, {"data": ["https://paa.sit.sdlc-quattrus.com/-0", 200, 0, 0.0, 1064.9650000000001, 453, 3527, 931.0, 1905.5, 2032.85, 3525.130000000001, 7.77332970577947, 1.1994004819464419, 4.022394477049244], "isController": false}, {"data": ["https://paa.sit.sdlc-quattrus.com/2311-0", 200, 0, 0.0, 834.7449999999995, 169, 2173, 709.5, 1560.6, 1851.35, 2144.970000000001, 5.8906691800188495, 0.9089118461357211, 3.0718919356738925], "isController": false}, {"data": ["https://paa.sit.sdlc-quattrus.com/login", 200, 1, 0.5, 3683.199999999998, 620, 5804, 4197.5, 4853.0, 5026.599999999999, 5604.1500000000015, 8.653138926145461, 219.3268195928698, 4.318119132090166], "isController": false}, {"data": ["https://paa.sit.sdlc-quattrus.com/", 200, 0, 0.0, 6216.180000000001, 776, 11981, 7101.0, 11045.5, 11477.55, 11894.82, 5.850861539361671, 149.31915741194453, 6.083753254541731], "isController": false}, {"data": ["Test Stress", 200, 1, 0.5, 15537.1, 2572, 21669, 18458.5, 20549.9, 20951.65, 21553.940000000002, 5.273149124657245, 402.8084462666105, 13.61934949114111], "isController": true}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["502/Bad Gateway", 1, 100.0, 0.07142857142857142], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 1400, 1, "502/Bad Gateway", 1, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["https://paa.sit.sdlc-quattrus.com/login", 200, 1, "502/Bad Gateway", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
