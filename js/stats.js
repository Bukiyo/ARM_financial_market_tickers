$(document).ready(function () {
    //fetch industries on page load
    getIndustries();

    $(".nav-item").click(function () {
        $(".nav-item").removeClass("active");
        $(this).addClass("active");
    });

    //get stats on clicking button
    $('#getStatsBtn').on('click', function (e) {
        if ($("#stats-form").valid()) {
            buttonLoader(true);
            getStats();
        }
    });

      function getStats() {
        //Get Market Stats
        var params = {
            api_token: 'OODbiGvCRN4EehklJBIjiyTkl1dHoOFJ39sb2IIs',
            countries: `${$("#countryStats").val()}`,
            industries: `${$("#industryStats").val()}`,
            limit: '3'
        };
        return GetMethod("https://api.marketaux.com/v1/entity/stats/intraday?", params)
        .then(result =>{
            buttonLoader(false);
            console.log(result);
            console.log("data:", result.data);
            //  var entityArr = [];
            // for(var i = 0; i < result.data.length; i++){
            //     for(var j = 0; j < result.data[i].entities.length; j++){
                    
            //         console.log(result.data[i].entities[j])
            //         var loadedData = result.data[i].entities[j];
            //         console.log("loaded data:", loadedData);
            //         entityArr.push(loadedData);
                    
            //     }
            // }
            // loadtable(entityArr);


        }).catch(error => {
            buttonLoader(false);
            console.log('error', error);
            //get error messages, if any
            error.json().then((jsonErr) => {
                console.log("error message", jsonErr);
                Swal.fire(`Error ${error.status}`, jsonErr.error.message, "error");
                // Swal.fire("Error", jsonErr.error.message, "error").then(res => {
                //     if (res.value) {
                //         window.location.reload(true);
                //     }
                // });
            })
        });
      }
    

      function getIndustries(){
        var params = {
            api_token: 'OODbiGvCRN4EehklJBIjiyTkl1dHoOFJ39sb2IIs'
        };
        return GetMethod("https://api.marketaux.com/v1/entity/industry/list?", params)
        .then(result => {
            $("#industryStatsSpinner").hide();
            console.log("data:", result);
            console.log("industries", result.data);
            var industriesResult = result.data;

            $.each(industriesResult, function(key, value) {   
                console.log("key:", key + " val:", value);
                $('#industryStats')
                    .append($("<option></option>")
                    .attr("value", value)
                    .text(value)); 
           });


        })
        .catch(error => {
            $("#industryStatsSpinner").hide(); 
            console.log('error', error);
            //get error messages, if any
            error.json().then((jsonErr) => {
                console.log("error message", jsonErr);
                Swal.fire(`Error ${error.status}`, jsonErr.error.message, "error");
            })
        });
      }

    //validation
    initFormValidator($("#stats-form"), {
        countryStats: "required",
        industryStats: "required"
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
            $('#getStatsBtn').html('<span class="spinner-grow spinner-grow-sm"></span>Loading...');
            $('#getStatsBtn').prop('disabled', true);
        }
        else {
            $('#getStatsBtn').html('Get Stats');
            $('#getStatsBtn').prop('disabled', false);
        }
    }

});