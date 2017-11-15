;(function($){
    $.fn.AjaxUpload = function(opt, isClick) {
        var $cfg = {
            Upload_Url: null,
            Api: {
                processSucceed: function (el, response) {},
                processFailed: function (el) {},
                finish: function (el, totalSucceed, totalFailed) {},
            }
        }

        if (opt) {
            $.extend($cfg, opt);
        };

        var AjaxUpload = function (inputFileEl) {
            this.countFileUpload = 0;
            this.uploadSucceed = 0;
            this.uploadFailed = 0;
            this.uploadProgressEl = inputFileEl.parent();
            if (!inputFileEl.prop('multiple')) {
                this.uploadProgressEl.find('.puja-ajaxupload-progress').remove();
            }

            var $fileList = inputFileEl.prop('files');
            this.totalFileUpload = $fileList.length;

            this.ajaxFileUpload = function(file, idx, params) {
                var $this = this;
                var formData = new FormData();
                formData.append('file', file);
                if (params) {
                    formData.append('params', params);
                }
                var xhr = new XMLHttpRequest();
                xhr.open('POST', $cfg.Upload_Url);
                xhr.responseType = 'json';
                xhr.onreadystatechange = function() {
                    this.uploadFinish = function () {
                        if ($this.countFileUpload >= $this.totalFileUpload) {
                            if (typeof($cfg.Api.finish) == 'function') {
                                $cfg.Api.finish($this.uploadProgressEl, $this.uploadSucceed, $this.uploadFailed);
                            }
                        }
                    }
                    this.uploadSuccess = function (responseData) {
                        var processBarEl = $this.uploadProgressEl.find('.progressbar-' + idx);
                        if (typeof($cfg.Api.processSucceed) == 'function') {
                            $cfg.Api.processSucceed(processBarEl, responseData);
                        }
                        processBarEl.addClass('succeed');
                        $this.countFileUpload += 1;
                        $this.uploadSucceed += 1;
                        this.uploadFinish();
                        return true;
                    }
                    this.uploadFail = function () {
                        var processBarEl = $this.uploadProgressEl.find('.progressbar-' + idx);
                        if (typeof($cfg.Api.processFailed) == 'function') {
                            $cfg.Api.processFailed(processBarEl, idx);
                        }
                        processBarEl.addClass('failed');
                        $this.countFileUpload += 1;
                        $this.uploadFailed += 1;
                        this.uploadFinish();
                        return false;
                    }

                    if (xhr.readyState == 4) {
                        if (xhr.status != 200) {
                            return this.uploadFail();
                        }

                        if (null === xhr.response) {
                            return this.uploadFail();
                        }

                        if(xhr.response.status) {
                            return this.uploadSuccess(xhr.response);
                        }

                        return this.uploadFail();
                    }
                    return false;
                };

                xhr.upload.onprogress = function (event) {
                    /*if (event.lengthComputable) {
                     var complete = (event.loaded / event.total * 70 | 0);
                     $mmt.window.selector.find('.progress-bar-' + idx).css('width', complete + '%');
                     }*/
                };
                xhr.send(formData);
            }

            for (var i = 0; i < $fileList.length; i++) {
                this.uploadProgressEl.append(
                    '<div class="puja-ajaxupload-progress">{name}[{filesize} byte(s)] <div class="puja-ajaxupload-progressbar progressbar-{idx}"></div><span class="puja-ajaxupload-delete-btn"></span></div>'
                        .replace('{name}', $fileList[i].name)
                        .replace('{filesize}', $fileList[i].size)
                        .replace('{idx}', i)
                );
                this.ajaxFileUpload($fileList[i], i, inputFileEl.data('params'));
            }
        };

        $(this).on('click', '.puja-ajaxupload-delete-btn', function () {
            $(this).parents('.puja-ajaxupload-progress').remove();
        });

        $(this).on('change', 'input[type="file"]',  function(){
            new AjaxUpload($(this));
            return;
        });





    };

    $.MMT = function (obj, opt) {
        $(obj).MMT(opt, true);
    };
})(jQuery);