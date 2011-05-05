/*!
 * progLoader
 *
 * no copyright. use and abuse at will
 * also, no warranty of any kind. If it doesn't fit your needs don't whine,
 * or even better fork and fix.
 *
 *
 *
 */
(function ($) {
    var _ = {
        getImgs : function () {
            var doc = document,
                rexp = /^url(\(['"]?(.*?)['"]?\))/i,
                images = [],
                $all = $("*"),
                docSheets = doc.styleSheets;

            $all.each(function () {
                var bgMatch = this.style.backgroundImage.match(rexp);

                if (this.tagName.toUpperCase() === "IMG") {
                    images.push(this.src);
                }

                if (bgMatch) {
                    images.push(bgMatch[2]);
                }
            });

            for (var i = 0, l = docSheets.length; i < l; i++) {
                var sheet = docSheets[i],
                    rules = sheet[sheet.cssRules ? 'cssRules' : 'rules'],
                    ll = rules.length;

                for (var j = 0; j < ll; j++) {
                    var rule = rules[j];
                    if (!rule.style) {
                        continue;
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
        preload : function (opts) {
            var $tempDiv = $('<div />'),
                imgsLoaded = 0,
                imgsTimedOut = 0,
                imgCount = 0;

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
                        opts.onDone.call();
                    }
                    $tempDiv.remove();
                }
            }

            function createImage(src) {
                var $img = $('<img />'),
                    timer;

                function triggerChange() {
                    if (opts.timeout !== 0) {
                        clearTimeout(timer);
                    }

                    $img.remove();

                    if (imgCount > 0 && typeof opts.onChange === 'function') {
                        opts.onChange.call();
                    }

                    checkProgress();
                }

                if (opts.timeout !== 0) {
                    timer = setTimeout(function () {
                        imgsTimedOut += 1;
                        triggerChange();
                    }, opts.timeout);
                }


                $img.appendTo($tempDiv).load(function () {
                    imgsLoaded += 1;
                    triggerChange();
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
                findImages    : true
            };

        opts = $.extend(defaults, opts);

        if (opts.findImages) {
            opts.imgs = $.merge(_.getImgs(), opts.imgs);
        }
        _.preload(opts);
    };
})(this.jQuery);