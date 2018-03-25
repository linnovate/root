'use strict';

angular.module('mean.icu.data.filesservice', [])
    .service('FilesService', function($http, ApiUri, $stateParams) {
        var EntityPrefix = '/files';

        function getByPath() {

            return $http({
                method: 'GET',
                cache: false,
                url: ApiUri + EntityPrefix + '/' + $stateParams.y + '/' + $stateParams.m + '/' + $stateParams.d + '/' + $stateParams.n + '.' + $stateParams.f,
                responseType: 'arraybuffer',
                headers: {
                    'Content-Type': 'application/json; charset=utf-8'
                }
            }).success(function(data, status, headers) {
                var octetStreamMime = 'application/octet-stream';
                var success = false;

                // Get the headers
                headers = headers();
                // Get the filename from the x-filename header or default to "download.bin"
                var filename = headers['x-filename'] || $stateParams.n + '.' + $stateParams.f;

                // Determine the content type from the header or default to "application/octet-stream"
                var contentType = headers['content-type'] || octetStreamMime;
                if ($stateParams.view) {
                    // Prepare a blob URL
                    var blob = new Blob([data], {
                        type: contentType
                    });
                    var objectUrl = URL.createObjectURL(blob);
                    window.open(objectUrl, "_self");
                    return;
                }

                try {
                    // Try using msSaveBlob if supported
                    var blob = new Blob([data], {
                        type: contentType
                    });
                    if (navigator.msSaveBlob)
                        navigator.msSaveBlob(blob, filename);
                    else {
                        // Try using other saveBlob implementations, if available
                        var saveBlob = navigator.webkitSaveBlob || navigator.mozSaveBlob || navigator.saveBlob;
                        if (saveBlob === undefined) throw "Not supported";
                        saveBlob(blob, filename);
                    }
                    success = true;
                } catch (ex) {
                    console.log("saveBlob method failed with the following exception:");
                    console.log(ex);
                }

                if (!success) {

                    // Get the blob url creator
                    var urlCreator = window.URL || window.webkitURL || window.mozURL || window.msURL;
                    if (urlCreator) {
                        // Try to use a download link
                        var link = document.createElement('a');
                        if ('download' in link) {
                            // Try to simulate a click
                            try {
                                // Prepare a blob URL
                                var blob = new Blob([data], {
                                    type: contentType
                                });
                                var url = urlCreator.createObjectURL(blob);
                                link.setAttribute('href', url);

                                // Set the download attribute (Supported in Chrome 14+ / Firefox 20+)
                                link.setAttribute("download", filename);

                                // Simulate clicking the download link
                                var event = document.createEvent('MouseEvents');
                                event.initMouseEvent('click', true, true, window, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
                                link.dispatchEvent(event);
                                success = true;

                            } catch (ex) {
                                console.log("Download link method with simulated click failed with the following exception:");
                                console.log(ex);
                            }
                        }

                        if (!success) {
                            // Fallback to window.location method
                            try {
                                // Prepare a blob URL
                                // Use application/octet-stream when using window.location to force download
                                var blob = new Blob([data], {
                                    type: octetStreamMime
                                });
                                var url = urlCreator.createObjectURL(blob);
                                window.location = url;
                                success = true;
                            } catch (ex) {
                                console.log("Download link method with window.location failed with the following exception:");
                                console.log(ex);
                            }
                        }

                    }
                }

                if (!success) {
                    // Fallback to window.open method
                    window.open(httpPath, '_blank', '');
                }
                /******************/


            }).error(function(data, status) {
                
                // Unauthorized page
                //window.open('/404', '_self', '');
                window.open('/401', '_self', '');

                // Optionally write the error out to scope
                //$scope.errorDetails = "Request failed with status: " + status;
            });
        }

        return {
            getByPath: getByPath
        };
    });