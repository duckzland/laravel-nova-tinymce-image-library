<script type="text/javascript" src="{{ url('/vendor/tinymce-imagelibrary/js/tinyplugin.js') }}"></script>
<link rel="stylesheet" href="{{ url('/vendor/tinymce-imagelibrary/css/tinyplugin.css') }}"></link>
<script>

    document.addEventListener("DOMContentLoaded", function() {

        function bootTinyPlugin() {
            let token = "{{ csrf_token() }}";
            let urls = {
                load: "{{ url(config('tinymce-imagelibrary.load_url')) }}",
                upload: "{{ url(config('tinymce-imagelibrary.upload_url')) }}",
                delete: "{{ url(config('tinymce-imagelibrary.delete_url')) }}"
            };

            let labels = {
                tabLocalFile: "{{ __('Local File') }}",
                tabPexelsFile: "{{ __('Pexels') }}",
                tabUnsplashFile: "{{ __('Unsplash') }}",
                attributionText: "{{ __('Photo by %{author} on %{source}') }}",
                searchPlaceholder: "{{ __('Search Image...') }}",
                searchText: "{{ __('Search') }}",
                uploadingText: "{{ __('Uploading...') }}",
                uploadText: "{{ __('Upload') }}",
                uploadError: "{{ __('Failed to upload file') }}",
                uploadNotAllowed: "{{ __('File type not allowed') }}",
                uploadTooLarge: "{{ __('File size too large') }}"
            };

            let uploads = {
                allowed: "{{ config('tinymce-imagelibrary.upload_allowed') }}",
                max_size: "{{ config('tinymce-imagelibrary.upload_max_size') }}",
                chunk_size: "{{ config('tinymce-imagelibrary.upload_chunk_size') }}"
            };

            let pexels = "{{ config('tinymce-imagelibrary.api_key_pexels', false) }}";
            let unsplash = "{{ config('tinymce-imagelibrary.api_key_unsplash', false) }}";

            tinymce && tinymce.on('AddEditor', function (e) {

                e.editor.ui.registry.addButton('imagelibrary', {
                    icon: 'gallery',
                    tooltip: '{{ __("Image Library") }}',
                    onAction: function (_) {

                        tinyMCE.activeEditor.windowManager.open({
                            title: '{{ __("Image Library") }}',
                            size: 'large',
                            body: {
                                type: 'panel', 
                                items: [
                                    {
                                        type: 'htmlpanel', // A HTML panel component
                                        html: '<div class="tinymce-imagelibrary-root"></div>'
                                    }
                                ]
                            },
                            buttons: [
                                {
                                    type: 'cancel',
                                    name: 'closeButton',
                                    text: '{{ __("Cancel") }}'
                                },
                                {
                                    type: 'submit',
                                    name: 'submitButton',
                                    text: '{{ __("Select") }}',
                                    primary: true
                                }
                            ],
                            onSubmit: function (api) {
                                let source = e.value;
    
                                if (source && source !== '') {
                                    e.editor.focus();
                                    e.editor.selection.setContent('<img src="'+ source +'" />');
                                    api.close();
                                }
                                
                                else {
                                    alert('{{ __("Please select an Image") }}');
                                }
                            }

                        });

                        tinymce.dom.DomQuery(".tox-dialog").addClass("tinymce-imagelibrary-dialog");

                        // Boot the react part
                        setTimeout(() => {
                            window.tinymceBoot && window.tinymceBoot(token, e, urls, labels, uploads, pexels, unsplash);
                        }, 100);
                    }
                });
            });
        }

        if (window.tinymce) {
            bootTinyPlugin();
        }
    }, false);
</script>