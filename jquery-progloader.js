/*!
 * progLoader
 *
 * no copyright. use and abuse at will
 * also, no warranty of any kind. If it doesn't fit your needs don't whine,
 * or even better fork and fix.
 *
 * http://github.com/edfuh/progLoader
 */
(function ($) {
    var progLoader = {
        getImgs : function () {
            var doc = document,
                rexp = /^url(\(['"]?(.*?)['"]?\))/i,
                images = [],
                $all = $("*"),
                docSheets = doc.styleSheets;

            // Find images in DOM nodes
            $all.each(function () {
                var bgMatch = this.style.backgroundImage.match(rexp);

                if (this.nodeName === "IMG" && this.src) {
                    images.push(this.src);
                }

                if (bgMatch) {
                    images.push(bgMatch[2]);
                }
            });

            // Find images in stylesheets
            for (var i = 0, l = docSheets.length; i < l; i++) {
                var sheet = docSheets[i],
                    rules = sheet[sheet.cssRules ? 'cssRules' : 'rules'];

                ruleLoop: for (var j = 0, rl = rules.length; j < rl; j++) {
                    var rule = rules[j];
                    if (!rule.style) {
                        continue ruleLoop;
                    }
                    var bg = rule.style.backgroundImage;
                    var bgMatch = bg.match(rexp);
                    if (bg !== "" && bg !== 'none' && bgMatch) {
                        images.push(bgMatch[2]);
                    }
                }
            }
            return images;
        },
        init : function (opts) {
            var $tempDiv = $('<div />'),
                imgsLoaded = 0,
                imgsTimedOut = 0,
                imgCount = 0,
                progress = {
                    loaded : 0,
                    timedOut : 0,
                    total : 0,
                    update : function () {
                        this.loaded   = imgsLoaded;
                        this.timedOut = imgsTimedOut;
                        this.total    = imgCount;

                        return this;
                    }
                };

            // Hide offscreen
            $tempDiv.css({
                position : 'absolute',
                height   : 1,
                width    : 1,
                left     : -1,
                top      : -1,
                overflow : 'hidden'
            }).appendTo('body');

            function checkProgress() {
                if ((imgsLoaded + imgsTimedOut) === imgCount) {
                    if (typeof opts.onDone === 'function') {
                        opts.onDone(progress);
                    }
                    $tempDiv.remove();
                }
            }

            function createImage(src) {
                var $img = $('<img />'),
                    timer;

                function fireChange() {
                    if (opts.timeout !== 0) {
                        clearTimeout(timer);
                    }

                    $img.remove();

                    progress.update();

                    if (imgCount > 0 && typeof opts.onChange === 'function') {
                        opts.onChange(progress);
                    }

                    checkProgress();
                }

                if (opts.timeout !== 0) {
                    timer = setTimeout(function () {
                        imgsTimedOut += 1;
                        fireChange();
                    }, opts.timeout);
                }


                $img.appendTo($tempDiv).load(function () {
                    imgsLoaded += 1;
                    fireChange();
                }).attr('src', src);

            }

            for (var i = 0, j = opts.imgs.length; i < j; i++) {
                if (opts.imgs[i] !== null) {
                    createImage(opts.imgs[i]);
                    imgCount++;
                }
            }

            if (typeof opts.onStart === 'function') {
                opts.onStart.call();
            }

            checkProgress();
        }
    };

    $.progLoader = function (opts) {
        var defaults = {
                timeout    : 0,
                imgs       : [],
                onStart    : function () {},
                onChange   : function () {},
                onDone     : function () {},
                findImages : true
            };

        opts = $.extend(defaults, opts);

        if (opts.findImages) {
            opts.imgs = $.merge(progLoader.getImgs(), opts.imgs);
        }
        progLoader.init(opts);
    };
})(this.jQuery);