$(document).ready(function () {
    //hide popover button on page load
    $('#newsPopover').hide();

    //fetch industries on page load
    getIndustries();

    $(".nav-item").click(function () {
        $(".nav-item").removeClass("active");
        $(this).addClass("active");
    });

    //get news on clicking button
    $('#getNewsBtn').on('click', function (e) {
        if ($("#news-form").valid()) {
            buttonLoader(true);
            getFinanceNews();
        }
    });

    //news popover
      $('#newsPopover').popover({
        trigger: 'focus',
        content: "Click on the table row to view more details on your chosen newsfeed"
      })

      
      function getFinanceNews() {
        //Get Finance News
        var params = {
            api_token: 'OODbiGvCRN4EehklJBIjiyTkl1dHoOFJ39sb2IIs',
            countries: `${$("#country").val()}`,
            industries: `${$("#industry").val()}`,
            filter_entities: true,
            limit: '3'
        };
        return GetMethod("https://api.marketaux.com/v1/news/all?", params)
        .then(result =>{
            buttonLoader(false);
            $('#newsPopover').show();
            console.log(result);
            console.log("data:", result.data);
             var entityArr = [];
            for(var i = 0; i < result.data.length; i++){
                for(var j = 0; j < result.data[i].entities.length; j++){
                    
                    console.log(result.data[i].entities[j])
                    var loadedData = result.data[i].entities[j];
                    console.log("loaded data:", loadedData);
                    entityArr.push(loadedData);
                    
                }
            }
            loadtable(entityArr);
            // $.each(result.data, function (i) {
                
            //     $.each(result.data[i], function (key, val) {
            //         //console.log(key + ": " + val);
            //         console.log(result.data[i].entities)
            //     //   loadtable(result.data[i].entities)


            //     });
            // });


        }).catch(error => {
            buttonLoader(false);
            console.log('error', error);
            //get error messages, if any
            error.json().then((jsonErr) => {
                console.log("error message", jsonErr);
                Swal.fire(`Error ${error.status}`, jsonErr.error.message, "error");
            })
        });
      }
    

      function getIndustries(){
        var params = {
            api_token: 'OODbiGvCRN4EehklJBIjiyTkl1dHoOFJ39sb2IIs'
        };
        return GetMethod("https://api.marketaux.com/v1/entity/industry/list?", params)
        .then(result => {
            $("#industrySpinner").hide();
            console.log("data:", result);
            console.log("industries", result.data);
            var industriesResult = result.data;

            $.each(industriesResult, function(key, value) {   
                console.log("key:", key + " val:", value);
                $('#industry')
                    .append($("<option></option>")
                    .attr("value", value)
                    .text(value)); 
           });


        })
        .catch(error => {
            $("#industrySpinner").hide(); 
            console.log('error', error);
            //get error messages, if any
            error.json().then((jsonErr) => {
                console.log("error message", jsonErr);
                Swal.fire(`Error ${error.status}`, jsonErr.error.message, "error");
            })
        });
      }

    //validation
    initFormValidator($("#news-form"), {
        country: "required",
        industry: "required"
    });

    
    function GetMethod(url, params){
        var requestOptions = {
            method: 'GET'
        };
        var esc = encodeURIComponent;
        var query = Object.keys(params)
            .map(function(k) {return esc(k) + '=' + esc(params[k]);})
            .join('&');
        
        return fetch(`${url}` + query, requestOptions)
        .then(response => {
            if (response.ok) {
                return response.json();
              }
              return Promise.reject(response); 
        })
    }

    function loadtable(tableData) {

        //checks if datatable has already been initialized
        if (!$.fn.DataTable.isDataTable('#newsTable')) {
            var t = $("#newsTable").DataTable({
                autoWidth: false,
                processing: true,
                data: tableData,
                info: true,
                processing: true,
                aoColumns: [
                    { mData: null },
                    { mData: "name" },
                    { mData: "symbol" },
                    { mData: "type" },
                    { mData: "exchange" }

                ],
            });
            t.on('order.dt search.dt', function () {
                t.column(0, { search: 'applied', order: 'applied' }).nodes().each(function (cell, i) {
                    cell.innerHTML = i + 1;
                });
            }).columns.adjust().draw();
            t.on('click', 'tbody tr', function () {
                var data = t.row(this).data(); //get data from a particular row
                console.log("tableData:", data);
                SingleNewsRecord(data);

                $('#newsModal').modal({
                    backdrop: 'static',
                    keyboard: false
                });
            });
            

        }
        else {
            var rt = $('#newsTable').DataTable();
            rt.clear();
            rt.rows.add(tableData);
            rt.draw();
        }


    }

    function SingleNewsRecord(data){
        $('#exchangeLong').html(data.exchange_long);
        $('#entityName').html(data.name);
        $('#entityIndustry').html(data.industry);
        $('#entityCountry').html(`${$('#country option:selected').text()}`);

        var highlights = data.highlights.map(el => {
            return `<li class="card-container">
                <div class="card text-white mb-3">
                <div class="card-body highlightCards">
                <p class="card-text highlightText">${el.highlight}</p>
                </div>
            </div>
            </li>`
        }).join('');
        $('.list-container').html(highlights);
    }

    function initFormValidator(formElement, formrules, formmessages, errplacement) {
        $(formElement).validate({
            ignore: "input[type=hidden]"
            , focusCleanup: true
            , errorClass: "text-danger"
            , successClass: "text-success"
            , highlight: function (element, errorClass) {
                $(element).removeClass(errorClass);
            }
            , unhighlight: function (element, errorClass) {
                $(element).removeClass(errorClass);
            }
            , rules: formrules || {}
            , messages: formmessages || {}
            , errorPlacement: errplacement || function (error, element) {
                error.insertAfter(element);
            },
            showErrors: function (errorMap, errorList) {
                console.log("errorMap", errorMap);
                console.log("errorList", errorList);
                this.defaultShowErrors();
            }
    
        });
    }

    //show loader
    function buttonLoader(show) {
        if (show) {
            $('#getNewsBtn').html('<span class="spinner-grow spinner-grow-sm"></span>Loading...');
            $('#getNewsBtn').prop('disabled', true);
        }
        else {
            $('#getNewsBtn').html('Get News');
            $('#getNewsBtn').prop('disabled', false);
        }
    }

});