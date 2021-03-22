        document.addEventListener("DOMContentLoaded", function() {

            tinymce && tinymce.on('AddEditor', function (e) {

                e.editor.ui.registry.addButton('medialibrary', {
                    icon: 'gallery',
                    tooltip: "{{ __('Media Library') }}",
                    onAction: function (_) {
                        //editor.insertContent(toDateHtml(new Date()));

                        tinyMCE.activeEditor.windowManager.open({
                            title: "{{ __('Media Library') }}",
                            size: 'large',
                            body: {
                                type: 'panel', 
                                items: [
                                    {
                                        type: 'htmlpanel', // A HTML panel component
                                        html: '<div class="gallery-div"><input type="hidden" id="image"/>Your Gallery Items Html</div>'
                                    }
                                ]
                            },
                            buttons: [
                                {
                                    type: 'cancel',
                                    name: 'closeButton',
                                    text: "{{ __('Cancel') }}"
                                },
                                {
                                    type: 'submit',
                                    name: 'submitButton',
                                    text: "{{ __('Select') }}",
                                    primary: true
                                }
                            ],
                            onSubmit: function (api) {
                                var data = api.getData();
                                let source = $('#image').val();

                                if(source != ''){
                                    editor.focus();
                                    editor.selection.setContent('<img src="'+ source +'" />');
                                    api.close();
                                }else{
                                    alert("Please select an image.");
                                }
                            }
                        });
                    },
                    onSetup: function (buttonApi) {
                        /**
                        var editorEventCallback = function (eventApi) {
                            buttonApi.setDisabled(eventApi.element.nodeName.toLowerCase() === 'time');
                        };
                        editor.on('NodeChange', editorEventCallback);
                        return function (buttonApi) {
                            editor.off('NodeChange', editorEventCallback);
                        }**/
                    }
                });
            });
        }, false);
