(function () {
    var video = document.getElementById('camera__video'),
        canvas = document.getElementById('camera__canvas'),
        filterControl = document.getElementById('controls__filter');
    var filterName;
    var imageData;
    var i, len, r, g, b, v;
    var filters = {
        invert: function (data, ind) {
            data[ind] = 255 - data[ind];
            data[ind + 1] = 255 - data[ind + 1];
            data[ind + 2] = 255 - data[ind + 2];
        },
        grayscale: function (data, ind) {
            r = data[ind];
            g = data[ind + 1];
            b = data[ind + 2];
            v = 0.2126 * r + 0.7152 * g + 0.0722 * b;

            data[ind] = data[ind + 1] = data[ind + 2] = v;
        },
        threshold: function (data, ind) {
            r = data[ind];
            g = data[ind + 1];
            b = data[ind + 2];
            v = (0.2126 * r + 0.7152 * g + 0.0722 * b >= 128) ? 255 : 0;
            data[ind] = data[ind + 1] = data[ind + 2] = v;
        }
    };

    var getVideoStream = function (callback) {
        navigator.getUserMedia = navigator.getUserMedia ||
            navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia;

        if (navigator.getUserMedia) {
            navigator.getUserMedia({video: true},
                function (stream) {
                    video.src = window.URL.createObjectURL(stream);
                    video.onloadedmetadata = function (e) {
                        video.play();

                        callback();
                    };
                },
                function (err) {
                    console.log("The following error occured: " + err.name);
                }
            );
        } else {
            console.log("getUserMedia not supported");
        }
    };

    /**
     *
     * @param imageData ImageData
     * @param ind Pixel position
     * @param filterName Filter name [ invert | grayscale | threshold ]
     */
    var applyFilterToPixel = function (imageData, ind, filterName) {
        filterName = filterName || 'invert';
        filters[filterName](imageData.data, ind);
    };

    /**
     *
     * @param imageData ImageData
     * @param filterName Filter name [ invert | grayscale | threshold ]
     */
    var applyFilterToImageData = function (imageData, filterName) {
        for (i = 0, len = imageData.data.length; i < len; i += 4) {
            applyFilterToPixel(imageData, i, filterName);
        }
    };

    /**
     *
     * @param filterName Filter name [ invert | grayscale | threshold ]
     */
    var applyFilter = function (filterName) {
        imageData = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
        applyFilterToImageData(imageData, filterName);
        canvas.getContext('2d').putImageData(imageData, 0, 0);
    };

    var captureFrame = function () {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        filterName = filterControl.value;

        canvas.getContext('2d').drawImage(video, 0, 0);
        applyFilter(filterName);
    };

    getVideoStream(function () {
        captureFrame();
        setInterval(captureFrame, 16);
    });
})();
