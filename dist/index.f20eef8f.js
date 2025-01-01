/*
 Input Mask plugin binding
 http://github.com/RobinHerbots/jquery.inputmask
 Copyright (c) Robin Herbots
 Licensed under the MIT license
 */ (function(factory) {
    factory(jQuery, window.Inputmask, window);
})(function($, Inputmask, window1) {
    $(window1.document).ajaxComplete(function(event, xmlHttpRequest, ajaxOptions) {
        if ($.inArray("html", ajaxOptions.dataTypes) !== -1) $(".inputmask, [data-inputmask], [data-inputmask-mask], [data-inputmask-alias], [data-inputmask-regex]").each(function(ndx, lmnt) {
            if (lmnt.inputmask === undefined) Inputmask().mask(lmnt);
        });
    }).ready(function() {
        $(".inputmask, [data-inputmask], [data-inputmask-mask], [data-inputmask-alias],[data-inputmask-regex]").each(function(ndx, lmnt) {
            if (lmnt.inputmask === undefined) Inputmask().mask(lmnt);
        });
    });
});

//# sourceMappingURL=index.f20eef8f.js.map
