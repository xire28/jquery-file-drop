/**
/* ===================================================
 *  jquery-file-drop.js v1.0.1
 *  https://github.com/xire28/jquery-file-drop
 * ===================================================
 * 
 * Easy to use and unopinionated file drag and drop jquery plugin with graceful degradation
 *
 * Requires
 *   - JQuery 1.8.0 or later (https://github.com/jquery/jquery)
 *
 * Recommended
 *   - JQuery-remote-js-scope latest (https://github.com/xire28/jquery-remote-js-scope)
 *        Access request scope containing files and upload request from the remote JS response
 *
 * Released under the MIT license
 *
 */
(function($, window) {
    $.fileDropContainer = function(el, options) {
        var base = this,
            stopEventBehavior = function(e) {
                e.preventDefault()
                e.stopPropagation()
            }

        base.generateOptions = function(userBaseOptions) {
            // Retrieve nodes and function
            var baseOptions = $.extend(true, {}, $.fileDropContainer.defaultBaseOptions, userBaseOptions),
                $el = base.$el,
                $parentForm = $el.closest('form'),
                parentForm = $parentForm[0],
                $tokenInput = $parentForm.find('input[name="' + baseOptions.tokenName + '"]'),
                trigger = $el.trigger

            // Throw on critical exceptions
            if (!baseOptions.url) throw 'Cannot create file drop container, upload url is not defined'
            if (!parentForm) throw 'Cannot create file drop container, parent `form` not found for:\n' + base.el.outerHTML

            // Default generated options that can be overriden
            var defautGeneratedOptions = {
                beforeSend: trigger.bind($el, 'ajax:beforeSend'),
                complete: trigger.bind($el, 'ajax:complete'),
                success: trigger.bind($el, 'ajax:success'),
                error: trigger.bind($el, 'ajax:error'),
                data: {},
                info: {
                    data: {}
                }
            }

            // Add authentification token if present
            if ($tokenInput[0]) defautGeneratedOptions.data[baseOptions.tokenName] = $tokenInput.val()
            if (baseOptions.info.url) {
                if ($tokenInput[0]) defautGeneratedOptions.info.data[baseOptions.tokenName] = $tokenInput.val()

                // Add triggers for info request
                $.extend(defautGeneratedOptions.info, {
                    beforeSend: trigger.bind($el, 'info:ajax:beforeSend'),
                    success: trigger.bind($el, 'info:ajax:success'),
                    complete: trigger.bind($el, 'info:ajax:complete'),
                    error: trigger.bind($el, 'info:ajax:error')
                })
            }

            return $.extend(true, {}, defautGeneratedOptions, baseOptions)
        }

        base.acceptFiles = function(files, acceptPattern) {
            // Filter using files using accept attribute format
            var $el = base.$el,
                deniedFiles = [],
                acceptedFiles = $.grep(files, function(file) {
                    var accept = new window.RegExp((acceptPattern || '*').replace('*', '.*').replace('+', '\+').replace('.', '\.')).test(file.type)
                    if (!accept) deniedFiles.push(file)
                    return accept
                })

            // Trigger DOM event to allow implementation for denied files
            $el.trigger('files:deny', [deniedFiles])

            return acceptedFiles
        }

        base.processFiles = function(files, accept) {
            // Transform FileList to an Array to be able to apply filter using jQuery
            return base.acceptFiles($.makeArray(files), accept)
        }

        base.sendFileInfos = function(name, files, options) {
            if (!options.scopeOnly) {
                // JQuery serialization don't work on File instances, so transform them to plain objects
                var dataEntry = {},
                    fileInfos = $.map(files, function(file) {
                        return {
                            name: file.name,
                            size: file.size,
                            type: file.type,
                            last_modified: file.lastModified
                        }
                    })

                dataEntry[name] = fileInfos

                $.extend(options, {
                    data: dataEntry
                })
            }

            $.ajax(options)
        }

        base.sendFiles = function(name, files, options) {
            var formData = new window.FormData()

            $.each(files, function(_, file) {
                formData.append(name, file)
            })

            // Copy authentification token from options into the formData instance
            if (options.data[options.tokenName]) formData.append(options.tokenName, options.data[options.tokenName])

            return $.ajax($.extend({}, options, {
                data: formData
            }))
        }

        base.listener = function($fileInput, e) {
            stopEventBehavior(e)

            var name = $fileInput.attr('name'),
                // Remove array notation from input name, is be automatically added by jQuery serialization
                baseName = name.replace(/\[\]$/, ''),
                files = base.processFiles(e.originalEvent.dataTransfer ? e.originalEvent.dataTransfer.files : e.target.files, $fileInput.attr('accept')),
                options = base.options

            if (files.length) {
                var uploadRequest = base.sendFiles(name, files, options)

                // Trigger DOM event to allow implementation for uploading files (e.g. listen to progress event to update progressbar, generate thumbnail using file data URI, etc.)
                base.$el.trigger('files:upload', [files, uploadRequest])

                if (options.info.url) {
                    // Create local variable for js response to access upload request and files (requires jquery-remote-js-scope plugin to be processed)
                    $.extend(options.info.scope, {
                        files: files,
                        uploadRequest: uploadRequest
                    })
                    base.sendFileInfos(baseName, files, options.info)
                }
            }
        }

        base.init = function(options) {
            if (window.File && window.FileList && window.FileReader) {
                var $el = base.$el,
                    $fileInput = $el.find('input[type="file"]').first(),
                    listenerWithInput = base.listener.bind(base, $fileInput)

                base.options = base.generateOptions(options)

                $el
                    .on('drop', listenerWithInput)
                    .on('dragover dragenter', stopEventBehavior)
                    .on('click', function() {
                        $fileInput.click()
                    })

                $fileInput
                    .on('click', function(e) {
                        e.stopPropagation()
                    })
                    .on('change', listenerWithInput)
                    .detach()
            }
        }

        base.$el = $(el)
        base.el = el
        base.$el.data('fileDropContainer', base)
        base.init(options)
    }

    // Default options that can be overriden
    $.fileDropContainer.defaultBaseOptions = {
        contentType: 'multipart/form-data; charset=UTF-8',
        method: 'post',
        processData: false,
        tokenName: 'authenticity_token',
        info: {
            method: 'post',
            scope: {},
            scopeOnly: false
        }
    }

    $.fn.fileDropContainer = function(options) {
        return this.each(function() {
            (new $.fileDropContainer(this, options))
        })
    }

    $.fn.getfileDropContainer = function() {
        this.data('fileDropContainer')
    }

})(jQuery, window)