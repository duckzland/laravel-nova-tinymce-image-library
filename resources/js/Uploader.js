import React from 'react';
import { Upload } from 'antd';
import { LazyLoadImage } from 'react-lazy-load-image-component';

import Api from 'api/index';

import Local from './Selector';
import Library from './imageLibrary';
import Cropper from './crop';
import Manipulate from './manipulate';

import Language from 'modules/Language';
import Loading from 'loaders/egloader';

import { cloneDeep } from 'lodash';

const { Dragger } = Upload;



export default class Uploader extends React.PureComponent {

    state = {
        images: [],
        uploading: false,
    }


    constructor(props) {
        super(props);
        this.state.images = props.value
            ? Array.isArray(props.value) ? props.value.filter(e => e) : [ props.value ]
            : []
    }


    handleChange = (e) => {
        const { onChange } = this.props;
        const { name, value } = e.target || {};
        const id = name.split(':').pop();
        const images = cloneDeep(this.state.images);

        images[id] = value;

        this.setState({
            images: images
        });

        onChange && onChange({
            target: {
                name: this.props.name,
                value: images
            }
        });
    }


    handleUpload = (file, context) => {

        const { uploadAllowed, uploadMaxSize, uploadChunkSize } = this.props;

        this.setState({
            uploading: true,
        });

        Api.media.upload(
            file, 
            {
                filesize: uploadMaxSize || 2 * 1024 * 1024, // 2MB
                chunksize: uploadChunkSize || 1024 * 1024,
                allowed: uploadAllowed || ['image/jpeg', 'image/gif', 'image/png', 'image/jpg'],
            },

            // Complete
            (json) => {
                context.pop();

                this.handleMediaAdd({
                    target: {
                        name: 'images',
                        value: json.data[0].url,
                    }
                });
                
                Api.imageLibs.clear('engage');
                Api.panel.notify(Language.t('Upload Complete'));

                if (context.length === 0) {
                    this.setState({
                        uploading: false,
                    });
                }
            },

            // Error
            () => {
                this.setState({
                    uploading: false,
                });
            },

            // Validation
            () => {
                // Slow the script a bit to fire at next cycle
                setTimeout(() => {
                    this.setState({
                        uploading: false,
                    });
                }, 1);
            }
        )

        this.setState({
            uploading: true
        });

        // This is needed to stop antd to process upload using their logic.
        return false;
    }


    handleRemove = (weight) => {
        const { onChange } = this.props;
        const images = cloneDeep(this.state.images);

        images.splice(weight, 1);

        this.setState({
            images: images
        });
        
        onChange && onChange({
            target: {
                name: this.props.name,
                value: images
            }
        });
    }


    handleMediaDelete = (src, event) => {

        const { onMediaDelete } = this.props;
        
        if (event === 'after') {

            const images = cloneDeep(this.state.images);
            const weight = images.indexOf(src);

            images.splice(weight, 1);

            this.setState({
                images: images
            });
        }

        onMediaDelete && onMediaDelete(src, event);
    }





    render() {
        const { name, multiple, showCropper, showManipulate, showLocal, showLibrary } = this.props;
        const { images, uploading } = this.state;
        const { handleChange, handleRemove, handleUpload, handleMediaDelete, handleMediaAdd } = this;
        const canUpload = !multiple
            ? images.length === 0
            : true;

        return (
            <div className="eg-element-uploader">
                    <div className="uploader-box"> 
                        { !uploading
                            ? <div className="box">
                                <Dragger className="uploader" 
                                        multiple={ multiple } 
                                        showUploadList={ false } 
                                        beforeUpload={ handleUpload }
                                        accept=".jpg,.jpeg,.png,image/jpeg,image/png,image/jpg">
                                        <div className="message">
                                            <i className="fal fa-cloud-upload"></i> { Language.t('Upload File')}
                                        </div>
                                </Dragger>
                            </div>
                            : <Loading /> }
                    </div>
            </div>
        )
    }
}